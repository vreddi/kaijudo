import {
  buildCardRegistry,
  type CardData,
  createEngine,
  type GameAction,
  type GameState,
  GameStatus,
  IllegalActionError,
} from "@kaijudo/game-engine";
import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, type MutationCtx, query } from "./_generated/server";
import allCards from "./data/all-cards.json";

// Compile the card database once at module scope — shared by every function
// in this module for the lifetime of the isolate.
const registry = buildCardRegistry(allCards as unknown as CardData[]);
const engine = createEngine(registry);

/** Join-code alphabet without ambiguous characters (no I, L, O, 0, 1). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueCode(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (!existing) {
      return code;
    }
  }
  throw new ConvexError("Could not generate a unique game code, try again");
}

function assertValidDeck(deckCardIds: string[]): void {
  const problems = engine.validateDeck(deckCardIds);
  if (problems.length > 0) {
    throw new ConvexError(`Invalid deck: ${problems.join("; ")}`);
  }
}

type Role = "host" | "guest";

function roleFor(game: Doc<"games">, userId: string): Role | null {
  if (game.hostUserId === userId) {
    return "host";
  }
  if (game.guestUserId === userId) {
    return "guest";
  }
  return null;
}

export const createLobby = mutation({
  args: {
    playerName: v.string(),
    deckCardIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    assertValidDeck(args.deckCardIds);

    const code = await generateUniqueCode(ctx);
    const now = Date.now();
    const gameId = await ctx.db.insert("games", {
      code,
      status: "waiting",
      hostUserId: identity.tokenIdentifier,
      hostName: args.playerName,
      hostDeck: args.deckCardIds,
      createdAt: now,
      updatedAt: now,
    });

    return { gameId, code };
  },
});

export const join = mutation({
  args: {
    code: v.string(),
    playerName: v.string(),
    deckCardIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (!game || game.status !== "waiting") {
      throw new ConvexError("No open game found for that code");
    }
    if (game.hostUserId === identity.tokenIdentifier) {
      throw new ConvexError("You cannot join your own game");
    }

    assertValidDeck(args.deckCardIds);

    const now = Date.now();
    const state = engine.createGame({
      gameId: game._id,
      seed: `${game.code}:${game.createdAt}`,
      players: [
        { name: game.hostName, deckCardIds: game.hostDeck },
        { name: args.playerName, deckCardIds: args.deckCardIds },
      ],
      now,
    });

    await ctx.db.patch(game._id, {
      status: "inProgress",
      guestUserId: identity.tokenIdentifier,
      guestName: args.playerName,
      guestDeck: args.deckCardIds,
      state: JSON.stringify(state),
      updatedAt: now,
    });

    return { gameId: game._id };
  },
});

export const submitAction = mutation({
  args: {
    gameId: v.id("games"),
    action: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new ConvexError("Game not found");
    }
    const role = roleFor(game, identity.tokenIdentifier);
    if (!role) {
      throw new ConvexError("You are not a player in this game");
    }
    if (game.status !== "inProgress" || !game.state) {
      throw new ConvexError("Game is not in progress");
    }

    const myPlayerId: 1 | 2 = role === "host" ? 1 : 2;
    const raw = args.action as GameAction;
    if (typeof raw !== "object" || raw === null || typeof raw.type !== "string") {
      throw new ConvexError("Malformed action");
    }
    if (raw.playerId !== undefined && raw.playerId !== myPlayerId) {
      throw new ConvexError("Action playerId does not match your seat");
    }
    const action = { ...raw, playerId: myPlayerId } as GameAction;

    const state = JSON.parse(game.state) as GameState;
    let nextState: GameState;
    try {
      nextState = engine.applyAction(state, action, Date.now());
    } catch (error) {
      if (error instanceof IllegalActionError) {
        throw new ConvexError(`Illegal action: ${error.message}`);
      }
      throw error;
    }

    const completed = nextState.status === GameStatus.Completed;
    await ctx.db.patch(game._id, {
      state: JSON.stringify(nextState),
      updatedAt: Date.now(),
      ...(completed
        ? { status: "completed" as const, winner: nextState.result?.winner }
        : {}),
    });
  },
});

export const get = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      return null;
    }
    const role = roleFor(game, identity.tokenIdentifier);
    if (!role) {
      // Spectating is not supported — non-participants get nothing.
      return null;
    }

    const myPlayerId: 1 | 2 = role === "host" ? 1 : 2;
    let view: string | null = null;
    if (game.state) {
      const state = JSON.parse(game.state) as GameState;
      view = JSON.stringify(engine.getVisibleState(state, myPlayerId));
    }

    return {
      role,
      myPlayerId,
      status: game.status,
      code: game.code,
      hostName: game.hostName,
      guestName: game.guestName ?? null,
      winner: game.winner ?? null,
      view,
    };
  },
});

export const cancelLobby = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const game = await ctx.db.get(args.gameId);
    if (!game || game.hostUserId !== identity.tokenIdentifier) {
      throw new ConvexError("Game not found");
    }
    if (game.status !== "waiting") {
      throw new ConvexError("Only waiting games can be cancelled");
    }

    await ctx.db.delete(game._id);
  },
});

export const myActiveGames = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const [hosted, joined] = await Promise.all([
      ctx.db
        .query("games")
        .withIndex("by_hostUserId", (q) =>
          q.eq("hostUserId", identity.tokenIdentifier)
        )
        .collect(),
      ctx.db
        .query("games")
        .withIndex("by_guestUserId", (q) =>
          q.eq("guestUserId", identity.tokenIdentifier)
        )
        .collect(),
    ]);

    return [...hosted, ...joined]
      .filter((game) => game.status !== "completed")
      .map((game) => ({
        gameId: game._id,
        code: game.code,
        status: game.status,
        role: (game.hostUserId === identity.tokenIdentifier
          ? "host"
          : "guest") as Role,
        hostName: game.hostName,
        guestName: game.guestName ?? null,
        createdAt: game.createdAt,
      }));
  },
});
