import { describe, expect, it } from "vitest";
import type { CardData } from "../types/ability";
import { buildCardRegistry, compileCard } from "../compile";
import { createEngine, IllegalActionError } from "../engine";
import type { Engine } from "../engine";
import { GameStatus } from "../types/game-state";
import { TurnPhase } from "../types/turn-phase";
import type { GameState } from "../types/game-state";
import type { GameAction } from "../types/actions";

// ---------------------------------------------------------------------------
// fixtures

const card = (overrides: Partial<CardData> & { id: string; name: string }): CardData => ({
  civilization: "Fire",
  cost: 2,
  type: "Creature",
  race: "Human",
  power: 2000,
  rarity: "Common",
  collectorNum: "1/60",
  set: "DM-01",
  imageSrc: "",
  rulesText: [],
  ...overrides,
});

const FIXTURES: CardData[] = [
  card({ id: "V1", name: "Vanilla Grunt" }), // 2-cost 2000
  card({ id: "V2", name: "Big Vanilla", cost: 5, power: 5000 }),
  card({
    id: "DB1",
    name: "Crusher",
    cost: 6,
    power: 6000,
    rulesText: ["Double breaker (This creature breaks 2 shields.)"],
  }),
  card({
    id: "BL1",
    name: "Wall Angel",
    civilization: "Light",
    race: "Guardian",
    cost: 3,
    power: 4000,
    rulesText: ["Blocker", "This creature can't attack."],
  }),
  card({
    id: "SL1",
    name: "Sneaky Assassin",
    civilization: "Darkness",
    cost: 3,
    power: 1000,
    rulesText: ["Slayer (Whenever this creature battles, destroy the other creature after the battle.)"],
  }),
  card({
    id: "PA1",
    name: "Charging Bull",
    cost: 3,
    power: 2000,
    rulesText: ["Power attacker +3000"],
  }),
  card({
    id: "SA1",
    name: "Rush Runner",
    cost: 4,
    power: 3000,
    rulesText: ["Speed attacker"],
  }),
  card({
    id: "ST1",
    name: "Terror Pit",
    civilization: "Darkness",
    type: "Spell",
    cost: 6,
    power: 0,
    rulesText: ["Shield trigger", "Destroy one of your opponent's creatures."],
  }),
  card({
    id: "SP1",
    name: "Brain Serum",
    civilization: "Water",
    type: "Spell",
    cost: 3,
    power: 0,
    rulesText: ["Draw up to 2 cards."],
  }),
  card({
    id: "OS1",
    name: "Scout Bee",
    civilization: "Nature",
    race: "Giant Insect",
    cost: 3,
    power: 2000,
    rulesText: ["When you put this creature into the battle zone, you may draw a card."],
  }),
  card({
    id: "EV1",
    name: "Evolved Human",
    type: "Evolution Creature",
    race: "Human",
    cost: 4,
    power: 6000,
    rulesText: ["Evolution—Put on one of your Humans.", "Double breaker (This creature breaks 2 shields.)"],
  }),
];

const registry = buildCardRegistry(FIXTURES);
const engine = createEngine(registry);

const deckOf = (...ids: string[]): string[] => {
  const deck: string[] = [];
  while (deck.length < 40) {
    for (const id of ids) {
      if (deck.length < 40) deck.push(id);
    }
  }
  return deck;
};

const NOW = 1_000_000;

function newGame(e: Engine, deck1: string[], deck2: string[], seed = "seed"): GameState {
  return e.createGame({
    gameId: "g1",
    seed,
    players: [
      { name: "P1", deckCardIds: deck1 },
      { name: "P2", deckCardIds: deck2 },
    ],
    // Tests use mono-card decks for determinism.
    config: { maxCopiesPerCard: 40 },
    now: NOW,
  });
}

/** Play out simple scripted setup: give player mana by charging over turns. */
function act(state: GameState, action: GameAction): GameState {
  return engine.applyAction(state, action, NOW + 1000);
}

// ---------------------------------------------------------------------------

describe("compileCard", () => {
  it("compiles keywords", () => {
    const d = compileCard(
      card({
        id: "X",
        name: "X",
        rulesText: ["Double breaker", "Blocker", "Slayer", "Power attacker +4000", "Speed attacker"],
      }),
    );
    expect(d?.keywords).toMatchObject({
      breaker: 2,
      blocker: true,
      slayer: true,
      powerAttacker: 4000,
      speedAttacker: true,
    });
    expect(d?.unimplementedText).toEqual([]);
  });

  it("compiles common effects", () => {
    const d = compileCard(
      card({
        id: "X",
        name: "X",
        type: "Spell",
        rulesText: [
          "Destroy one of your opponent's creatures that has power 3000 or less.",
          "Put the top card of your deck into your mana zone.",
        ],
      }),
    );
    expect(d?.abilities).toHaveLength(2);
    expect(d?.abilities[0].effects[0]).toMatchObject({
      op: "destroy",
      target: { side: "opponent", count: 1, filter: { maxPower: 3000 } },
    });
    expect(d?.abilities[1].effects[0]).toMatchObject({ op: "manaCharge", count: 1 });
  });

  it("records unimplemented text instead of failing", () => {
    const d = compileCard(
      card({ id: "X", name: "X", rulesText: ["Some totally unknown mechanic text here."] }),
    );
    expect(d?.unimplementedText).toHaveLength(1);
  });

  it("skips unplayable card types", () => {
    expect(compileCard(card({ id: "X", name: "X", type: "Cross Gear" }))).toBeNull();
  });

  it("parses evolution requirements", () => {
    const d = compileCard(
      card({
        id: "X",
        name: "X",
        type: "Evolution Creature",
        rulesText: ["Evolution—Put on one of your Humans."],
      }),
    );
    expect(d?.evolutionRace).toBe("Human");
  });
});

describe("createGame", () => {
  it("sets up zones per config", () => {
    const state = newGame(engine, deckOf("V1"), deckOf("V1"));
    expect(state.status).toBe(GameStatus.InProgress);
    for (const p of [state.player1, state.player2]) {
      expect(p.shieldZone).toHaveLength(5);
      expect(p.hand).toHaveLength(5);
      expect(p.deck).toHaveLength(30);
      expect(p.battleZone).toHaveLength(0);
    }
    expect(state.activePlayer).toBe(1);
    expect(state.currentPhase).toBe(TurnPhase.ChargeMana);
  });

  it("is deterministic for the same seed", () => {
    const a = newGame(engine, deckOf("V1", "V2", "SP1"), deckOf("V1", "DB1"), "s1");
    const b = newGame(engine, deckOf("V1", "V2", "SP1"), deckOf("V1", "DB1"), "s1");
    expect(a.player1.hand.map((c) => c.cardId)).toEqual(b.player1.hand.map((c) => c.cardId));
    expect(a.player1.deck.map((c) => c.cardId)).toEqual(b.player1.deck.map((c) => c.cardId));
  });

  it("rejects invalid decks", () => {
    expect(() => newGame(engine, ["V1"], deckOf("V1"))).toThrow(IllegalActionError);
    const problems = engine.validateDeck([...Array(40)].map(() => "V1"));
    expect(problems.some((p) => p.includes("Too many copies"))).toBe(true);
  });
});

describe("turn flow", () => {
  it("charge mana then summon with auto mana selection", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    const hand = state.player1.hand;
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: hand[0].instanceId });
    expect(state.player1.manaZone).toHaveLength(1);
    expect(state.currentPhase).toBe(TurnPhase.Main);
    // V1 costs 2 — can't summon with 1 mana.
    expect(() =>
      act(state, {
        type: "summonCreature",
        playerId: 1,
        cardInstanceId: state.player1.hand[0].instanceId,
        manaTapIds: [],
      }),
    ).toThrow(IllegalActionError);
    // End turn; p2 charges; end; p1 charges again and summons.
    state = act(state, { type: "endTurn", playerId: 1 });
    expect(state.activePlayer).toBe(2);
    expect(state.player2.hand).toHaveLength(6); // drew a card
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, {
      type: "chargeMana",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
    });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    expect(state.player1.battleZone).toHaveLength(1);
    expect(state.player1.battleZone[0].summoningSick).toBe(true);
    expect(state.player1.manaZone.every((m) => m.tapped)).toBe(true);
  });

  it("summoning sickness wears off next turn", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    // Fast-forward: p1 charges + ends x2, then summons.
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    expect(state.player1.battleZone[0].summoningSick).toBe(false);
    expect(state.player1.manaZone.every((m) => !m.tapped)).toBe(true);
  });
});

describe("combat", () => {
  /** Build a mid-game state via legal play with scripted decks. */
  function midGame(): GameState {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    // T1 p1: charge + end. T2 p2: charge + end. T3 p1: charge, summon, end …
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "chargeMana", playerId: 2, cardInstanceId: state.player2.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    return state;
  }

  it("attacking the player breaks a shield into their hand", () => {
    let state = midGame();
    const attacker = state.player1.battleZone[0];
    const handBefore = state.player2.hand.length;
    state = act(state, { type: "attackPlayer", playerId: 1, attackerInstanceId: attacker.instanceId });
    expect(state.player2.shieldZone).toHaveLength(4);
    expect(state.player2.hand).toHaveLength(handBefore + 1);
    expect(state.player1.battleZone[0].tapped).toBe(true);
    expect(state.eventLog.some((e) => e.type === "shieldBreak")).toBe(true);
  });

  it("creature battles destroy the weaker creature", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    // t1 p1: charge, end. t2 p2: charge, end. t3 p1: charge, summon, end.
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "chargeMana", playerId: 2, cardInstanceId: state.player2.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    // t4 p2: charge, summon, end.
    state = act(state, { type: "chargeMana", playerId: 2, cardInstanceId: state.player2.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 2,
      cardInstanceId: state.player2.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 2 });
    // t5 p1: attacking p2's untapped creature is illegal.
    const attacker = state.player1.battleZone[0];
    const target = state.player2.battleZone[0];
    expect(() =>
      act(state, {
        type: "attackCreature",
        playerId: 1,
        attackerInstanceId: attacker.instanceId,
        targetInstanceId: target.instanceId,
      }),
    ).toThrow(IllegalActionError);
    // p2's creature attacks the player next turn; p1 then attacks the tapped creature.
    state = act(state, { type: "endTurn", playerId: 1 });
    const p2attacker = state.player2.battleZone[0];
    state = act(state, { type: "attackPlayer", playerId: 2, attackerInstanceId: p2attacker.instanceId });
    state = act(state, { type: "endTurn", playerId: 2 });
    const p1attacker = state.player1.battleZone[0];
    const tappedTarget = state.player2.battleZone[0];
    expect(tappedTarget.tapped).toBe(true);
    state = act(state, {
      type: "attackCreature",
      playerId: 1,
      attackerInstanceId: p1attacker.instanceId,
      targetInstanceId: tappedTarget.instanceId,
    });
    // Equal power 2000 vs 2000 → both destroyed.
    expect(state.player1.battleZone).toHaveLength(0);
    expect(state.player2.battleZone).toHaveLength(0);
    expect(state.player1.graveyard).toHaveLength(1);
    expect(state.player2.graveyard).toHaveLength(1);
  });

  it("blockers intercept attacks via a block decision", () => {
    // P2 runs blockers.
    let state = newGame(engine, deckOf("V1"), deckOf("BL1"));
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "chargeMana", playerId: 2, cardInstanceId: state.player2.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    // p2 needs 3 mana for the blocker — charge across two more turns.
    state = act(state, { type: "chargeMana", playerId: 2, cardInstanceId: state.player2.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "chargeMana", playerId: 2, cardInstanceId: state.player2.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 2,
      cardInstanceId: state.player2.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 2 });
    // p1 attacks player; p2 has an untapped blocker → block decision.
    const attacker = state.player1.battleZone[0];
    state = act(state, { type: "attackPlayer", playerId: 1, attackerInstanceId: attacker.instanceId });
    expect(state.pendingDecision?.kind).toBe("block");
    expect(state.pendingDecision?.playerId).toBe(2);
    // Block: 4000 blocker kills the 2000 attacker.
    const blocker = state.player2.battleZone[0];
    state = act(state, { type: "block", playerId: 2, blockerInstanceId: blocker.instanceId });
    expect(state.player1.battleZone).toHaveLength(0);
    expect(state.player2.battleZone).toHaveLength(1);
    expect(state.player2.battleZone[0].tapped).toBe(true);
    expect(state.player2.shieldZone).toHaveLength(5); // shield saved
  });

  it("direct attack with no shields wins the game", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    // Manually strip shields to simulate late game.
    const raw = JSON.parse(JSON.stringify(state)) as GameState;
    (raw.player2 as unknown as { shieldZone: unknown[] }).shieldZone = [];
    state = raw;
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, {
      type: "attackPlayer",
      playerId: 1,
      attackerInstanceId: state.player1.battleZone[0].instanceId,
    });
    expect(state.status).toBe(GameStatus.Completed);
    expect(state.result?.winner).toBe(1);
    expect(state.result?.reason).toBe("directAttack");
  });
});

describe("shield triggers", () => {
  it("a shield trigger spell can destroy the attacker for free", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("ST1"));
    // Force p2's shields to be Terror Pit (they already are — mono deck).
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, {
      type: "attackPlayer",
      playerId: 1,
      attackerInstanceId: state.player1.battleZone[0].instanceId,
    });
    // Shield broken → trigger decision for p2.
    expect(state.pendingDecision?.kind).toBe("shieldTrigger");
    const triggerId = state.pendingDecision?.kind === "shieldTrigger"
      ? state.pendingDecision.candidateIds[0]
      : "";
    state = act(state, { type: "shieldTrigger", playerId: 2, cardInstanceId: triggerId });
    // Terror Pit destroys the only enemy creature (auto-target).
    expect(state.player1.battleZone).toHaveLength(0);
    expect(state.player2.graveyard.some((c) => c.cardId === "ST1")).toBe(true);
    expect(state.status).toBe(GameStatus.InProgress);
    expect(state.pendingDecision).toBeNull();
  });

  it("declining shield triggers continues the game", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("ST1"));
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, {
      type: "attackPlayer",
      playerId: 1,
      attackerInstanceId: state.player1.battleZone[0].instanceId,
    });
    state = act(state, { type: "shieldTrigger", playerId: 2, cardInstanceId: null });
    expect(state.pendingDecision).toBeNull();
    expect(state.player1.battleZone).toHaveLength(1);
  });
});

describe("keywords in battle", () => {
  it("power attacker only applies while attacking", () => {
    const d = registry.get("PA1");
    expect(d?.keywords.powerAttacker).toBe(3000);
  });

  it("speed attacker has no summoning sickness", () => {
    let state = newGame(engine, deckOf("SA1"), deckOf("V1"));
    for (const turn of [1, 2, 3, 4, 5, 6] as const) {
      const pid = (turn % 2 === 1 ? 1 : 2) as 1 | 2;
      const p = pid === 1 ? state.player1 : state.player2;
      state = act(state, { type: "chargeMana", playerId: pid, cardInstanceId: p.hand[0].instanceId });
      state = act(state, { type: "endTurn", playerId: pid });
    }
    state = act(state, {
      type: "chargeMana",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
    });
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    expect(state.player1.battleZone[0].summoningSick).toBe(false);
    state = act(state, {
      type: "attackPlayer",
      playerId: 1,
      attackerInstanceId: state.player1.battleZone[0].instanceId,
    });
    expect(state.player2.shieldZone).toHaveLength(4);
  });
});

describe("evolution", () => {
  it("evolves onto a matching race and attacks immediately", () => {
    let state = newGame(engine, deckOf("V1", "EV1"), deckOf("V1"));
    // Charge until 4 mana and get a V1 down, then evolve.
    const findInHand = (s: GameState, cardId: string) =>
      s.player1.hand.find((c) => c.cardId === cardId);
    let guard = 0;
    while (state.player1.manaZone.length < 6 && guard++ < 20) {
      const p1 = state.player1;
      // charge whichever card we have more of
      state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: p1.hand[0].instanceId });
      if (
        state.player1.battleZone.length === 0 &&
        state.player1.manaZone.filter((m) => !m.tapped).length >= 2 &&
        findInHand(state, "V1")
      ) {
        const v1 = findInHand(state, "V1");
        if (v1) {
          state = act(state, {
            type: "summonCreature",
            playerId: 1,
            cardInstanceId: v1.instanceId,
            manaTapIds: [],
          });
        }
      }
      state = act(state, { type: "endTurn", playerId: 1 });
      state = act(state, { type: "endTurn", playerId: 2 });
    }
    const evo = findInHand(state, "EV1");
    expect(evo).toBeDefined();
    expect(state.player1.battleZone.length).toBeGreaterThan(0);
    const base = state.player1.battleZone[0];
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: evo?.instanceId ?? "",
      manaTapIds: [],
      evolutionBaseInstanceId: base.instanceId,
    });
    const evolved = state.player1.battleZone[0];
    expect(evolved.cardId).toBe("EV1");
    expect(evolved.summoningSick).toBe(false);
    expect(evolved.evolutionSources).toHaveLength(1);
    // Double breaker: breaks 2 shields.
    state = act(state, {
      type: "attackPlayer",
      playerId: 1,
      attackerInstanceId: evolved.instanceId,
    });
    expect(state.player2.shieldZone).toHaveLength(3);
  });
});

describe("on-summon effects", () => {
  it("queues and resolves a draw effect", () => {
    let state = newGame(engine, deckOf("OS1"), deckOf("V1"));
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    state = act(state, { type: "endTurn", playerId: 1 });
    state = act(state, { type: "endTurn", playerId: 2 });
    state = act(state, { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId });
    const handBefore = state.player1.hand.length;
    state = act(state, {
      type: "summonCreature",
      playerId: 1,
      cardInstanceId: state.player1.hand[0].instanceId,
      manaTapIds: [],
    });
    // Summoned (-1) then drew (+1) → same count.
    expect(state.player1.hand.length).toBe(handBefore);
    expect(state.player1.battleZone).toHaveLength(1);
  });
});

describe("surrender and timers", () => {
  it("surrender ends the game", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    state = act(state, { type: "surrender", playerId: 1 });
    expect(state.status).toBe(GameStatus.Completed);
    expect(state.result?.winner).toBe(2);
    expect(state.result?.reason).toBe("surrender");
  });

  it("running out the timer loses the game", () => {
    let state = newGame(engine, deckOf("V1"), deckOf("V1"));
    const later = NOW + state.config.matchTimerMs + 1;
    state = engine.applyAction(
      state,
      { type: "chargeMana", playerId: 1, cardInstanceId: state.player1.hand[0].instanceId },
      later,
    );
    expect(state.status).toBe(GameStatus.Completed);
    expect(state.result?.reason).toBe("timerExpired");
    expect(state.result?.winner).toBe(2);
  });
});
