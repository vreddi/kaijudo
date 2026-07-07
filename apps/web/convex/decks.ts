import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("decks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();
  },
});

export const save = mutation({
  args: {
    deckId: v.optional(v.id("decks")),
    name: v.string(),
    cardIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (args.deckId) {
      const deck = await ctx.db.get(args.deckId);
      if (!deck || deck.userId !== identity.tokenIdentifier) {
        throw new Error("Deck not found");
      }
      await ctx.db.patch(args.deckId, {
        name: args.name,
        cardIds: args.cardIds,
        updatedAt: Date.now(),
      });
      return args.deckId;
    }

    return await ctx.db.insert("decks", {
      userId: identity.tokenIdentifier,
      name: args.name,
      cardIds: args.cardIds,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== identity.tokenIdentifier) {
      throw new Error("Deck not found");
    }

    await ctx.db.delete(args.deckId);
  },
});
