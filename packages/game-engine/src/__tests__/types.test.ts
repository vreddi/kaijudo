import { describe, it, expect } from "vitest";
import {
  Zone,
  TurnPhase,
  TURN_PHASE_ORDER,
  GameStatus,
  TimerStatus,
  getTimerStatus,
  TIMER_WARNING_MS,
  TIMER_CRITICAL_MS,
  DEFAULT_GAME_CONFIG,
  isCreatureInBattle,
  isCardInMana,
} from "../index";
import type {
  GameState,
  PlayerState,
  GameCard,
  CreatureInBattle,
  CardInMana,
  GameAction,
  MatchTimer,
  VisibleGameState,
} from "../index";
import { Civilization, Rarity } from "@kaijudo/react-game-types";

describe("Zone enum", () => {
  it("has all 6 zones", () => {
    expect(Object.values(Zone)).toHaveLength(6);
    expect(Zone.Deck).toBe("deck");
    expect(Zone.Hand).toBe("hand");
    expect(Zone.BattleZone).toBe("battleZone");
    expect(Zone.ManaZone).toBe("manaZone");
    expect(Zone.ShieldZone).toBe("shieldZone");
    expect(Zone.Graveyard).toBe("graveyard");
  });
});

describe("TurnPhase", () => {
  it("has all 6 phases", () => {
    expect(Object.values(TurnPhase)).toHaveLength(6);
  });

  it("TURN_PHASE_ORDER is in correct sequence", () => {
    expect(TURN_PHASE_ORDER).toEqual([
      TurnPhase.Untap,
      TurnPhase.Draw,
      TurnPhase.ChargeMana,
      TurnPhase.Main,
      TurnPhase.Attack,
      TurnPhase.End,
    ]);
  });
});

describe("GameStatus enum", () => {
  it("has 3 statuses", () => {
    expect(GameStatus.Waiting).toBe("waiting");
    expect(GameStatus.InProgress).toBe("inProgress");
    expect(GameStatus.Completed).toBe("completed");
  });
});

describe("DEFAULT_GAME_CONFIG", () => {
  it("has standard Duel Masters values", () => {
    expect(DEFAULT_GAME_CONFIG.deckSize).toBe(40);
    expect(DEFAULT_GAME_CONFIG.startingShields).toBe(5);
    expect(DEFAULT_GAME_CONFIG.openingHandSize).toBe(5);
    expect(DEFAULT_GAME_CONFIG.matchTimerMs).toBe(1_200_000);
    expect(DEFAULT_GAME_CONFIG.maxCopiesPerCard).toBe(4);
    expect(DEFAULT_GAME_CONFIG.skipFirstDraw).toBe(true);
  });
});

describe("Timer", () => {
  it("getTimerStatus returns correct status for thresholds", () => {
    expect(getTimerStatus(10 * 60 * 1000)).toBe(TimerStatus.Normal);
    expect(getTimerStatus(TIMER_WARNING_MS)).toBe(TimerStatus.Warning);
    expect(getTimerStatus(2 * 60 * 1000)).toBe(TimerStatus.Warning);
    expect(getTimerStatus(TIMER_CRITICAL_MS)).toBe(TimerStatus.Critical);
    expect(getTimerStatus(30 * 1000)).toBe(TimerStatus.Critical);
    expect(getTimerStatus(0)).toBe(TimerStatus.Expired);
    expect(getTimerStatus(-1000)).toBe(TimerStatus.Expired);
  });

  it("timer constants are correct", () => {
    expect(TIMER_WARNING_MS).toBe(180_000);
    expect(TIMER_CRITICAL_MS).toBe(60_000);
  });
});

describe("GameCard and type guards", () => {
  const baseCard: GameCard = {
    instanceId: "p1-0",
    cardId: "0001",
    name: "Hanusa, Radiance Elemental",
    civilizations: [Civilization.Light],
    cost: 7,
    type: "Creature",
    race: "Angel Command",
    power: 9500,
    rarity: Rarity.SuperRare,
    set: "DM-01",
    collectorNum: "S1/S10",
    imageSrc: "/data/card-images/0001.webp",
  };

  it("isCreatureInBattle identifies battle zone creatures", () => {
    const creature: CreatureInBattle = {
      ...baseCard,
      type: "Creature",
      power: 9500,
      tapped: false,
      summoningSick: true,
      summonedOnTurn: 4,
    };
    expect(isCreatureInBattle(creature)).toBe(true);
  });

  it("isCreatureInBattle rejects non-battle cards", () => {
    expect(isCreatureInBattle(baseCard)).toBe(false);
  });

  it("isCardInMana identifies mana zone cards", () => {
    const manaCard: CardInMana = {
      ...baseCard,
      tapped: false,
    };
    expect(isCardInMana(manaCard)).toBe(true);
  });

  it("isCardInMana rejects battle zone creatures", () => {
    const creature: CreatureInBattle = {
      ...baseCard,
      type: "Creature",
      power: 9500,
      tapped: false,
      summoningSick: true,
      summonedOnTurn: 4,
    };
    expect(isCardInMana(creature)).toBe(false);
  });
});

describe("GameAction discriminated union", () => {
  it("can create all action types", () => {
    const actions: GameAction[] = [
      { type: "drawCard", playerId: 1 },
      { type: "chargeMana", playerId: 1, cardInstanceId: "p1-5" },
      { type: "summonCreature", playerId: 1, cardInstanceId: "p1-3", manaTapIds: ["p1-m0", "p1-m1"] },
      { type: "castSpell", playerId: 1, cardInstanceId: "p1-7", manaTapIds: ["p1-m0"] },
      { type: "attackCreature", playerId: 1, attackerInstanceId: "p1-b0", targetInstanceId: "p2-b1" },
      { type: "attackPlayer", playerId: 1, attackerInstanceId: "p1-b0" },
      { type: "endPhase", playerId: 1 },
      { type: "endTurn", playerId: 1 },
      { type: "surrender", playerId: 2 },
    ];
    expect(actions).toHaveLength(9);
    actions.forEach((action) => {
      expect(action.type).toBeDefined();
      expect(action.playerId).toBeDefined();
    });
  });
});

describe("Type shapes (compile-time checks)", () => {
  it("PlayerState has all required zones", () => {
    const player: PlayerState = {
      playerId: 1,
      name: "Player 1",
      deck: [],
      hand: [],
      battleZone: [],
      manaZone: [],
      shieldZone: [],
      graveyard: [],
      hasChargedMana: false,
    };
    expect(player.playerId).toBe(1);
    expect(player.deck).toEqual([]);
    expect(player.hand).toEqual([]);
    expect(player.battleZone).toEqual([]);
    expect(player.manaZone).toEqual([]);
    expect(player.shieldZone).toEqual([]);
    expect(player.graveyard).toEqual([]);
  });

  it("GameState can be fully constructed", () => {
    const state: GameState = {
      gameId: "test-game-1",
      config: DEFAULT_GAME_CONFIG,
      status: GameStatus.InProgress,
      player1: {
        playerId: 1,
        name: "Player 1",
        deck: [],
        hand: [],
        battleZone: [],
        manaZone: [],
        shieldZone: [],
        graveyard: [],
        hasChargedMana: false,
      },
      player2: {
        playerId: 2,
        name: "Player 2",
        deck: [],
        hand: [],
        battleZone: [],
        manaZone: [],
        shieldZone: [],
        graveyard: [],
        hasChargedMana: false,
      },
      activePlayer: 1,
      turnNumber: 1,
      currentPhase: TurnPhase.Untap,
      timer: {
        totalTimeMs: DEFAULT_GAME_CONFIG.matchTimerMs,
        player1RemainingMs: DEFAULT_GAME_CONFIG.matchTimerMs,
        player2RemainingMs: DEFAULT_GAME_CONFIG.matchTimerMs,
        lastTickTimestamp: null,
        activeTimerPlayer: null,
      },
      eventLog: [],
      nextEventSeq: 0,
      result: null,
      startedAt: Date.now(),
    };
    expect(state.gameId).toBe("test-game-1");
    expect(state.status).toBe(GameStatus.InProgress);
    expect(state.activePlayer).toBe(1);
  });

  it("VisibleGameState hides opponent details", () => {
    const visible: VisibleGameState = {
      gameId: "test-game-1",
      config: DEFAULT_GAME_CONFIG,
      status: GameStatus.InProgress,
      me: {
        playerId: 1,
        name: "Player 1",
        deck: [],
        hand: [],
        battleZone: [],
        manaZone: [],
        shieldZone: [],
        graveyard: [],
        hasChargedMana: false,
      },
      opponent: {
        playerId: 2,
        name: "Player 2",
        deckCount: 30,
        handCount: 5,
        battleZone: [],
        manaZone: [],
        shieldCount: 5,
        graveyardCount: 0,
        graveyard: [],
        hasChargedMana: false,
      },
      activePlayer: 1,
      turnNumber: 1,
      currentPhase: TurnPhase.Untap,
      timer: {
        totalTimeMs: DEFAULT_GAME_CONFIG.matchTimerMs,
        player1RemainingMs: DEFAULT_GAME_CONFIG.matchTimerMs,
        player2RemainingMs: DEFAULT_GAME_CONFIG.matchTimerMs,
        lastTickTimestamp: null,
        activeTimerPlayer: null,
      },
      result: null,
    };
    expect(visible.opponent.handCount).toBe(5);
    expect(visible.opponent.deckCount).toBe(30);
    // Opponent hand and deck arrays are not accessible
    expect("hand" in visible.opponent).toBe(false);
    expect("deck" in visible.opponent).toBe(false);
  });
});

describe("MatchTimer", () => {
  it("can represent initial timer state", () => {
    const timer: MatchTimer = {
      totalTimeMs: 1_200_000,
      player1RemainingMs: 1_200_000,
      player2RemainingMs: 1_200_000,
      lastTickTimestamp: null,
      activeTimerPlayer: null,
    };
    expect(timer.totalTimeMs).toBe(1_200_000);
    expect(timer.activeTimerPlayer).toBeNull();
  });

  it("can represent active timer state", () => {
    const now = Date.now();
    const timer: MatchTimer = {
      totalTimeMs: 1_200_000,
      player1RemainingMs: 900_000,
      player2RemainingMs: 1_200_000,
      lastTickTimestamp: now,
      activeTimerPlayer: 1,
    };
    expect(timer.activeTimerPlayer).toBe(1);
    expect(timer.lastTickTimestamp).toBe(now);
    expect(timer.player1RemainingMs).toBeLessThan(timer.totalTimeMs);
  });
});
