import type { PlayerState } from "./player-state";
import type { TurnPhase } from "./turn-phase";
import type { MatchTimer } from "./timer";
import type { GameEvent, GameOverReason } from "./events";
import type { GameConfig } from "./config";
import type { PendingDecision, QueuedEffect } from "./decision";

/** State of the attack currently being resolved, if any. */
export interface CombatState {
  /** Attacking player. */
  attackerPlayer: 1 | 2;
  attackerInstanceId: string;
  /** "player" for direct/shield attacks, else defending creature instance id. */
  target: "player" | string;
  /** Blocker that intercepted the attack, if any. */
  blockerInstanceId: string | null;
}

/** A temporary power modification, cleared at end of turn. */
export interface PowerMod {
  instanceId: string;
  amount: number;
}

/** A temporary keyword grant, cleared at end of turn. */
export interface KeywordMod {
  instanceId: string;
  keyword: "powerAttacker" | "slayer" | "speedAttacker" | "breaker" | "cantBeBlocked";
  value?: number;
}

/** Overall status of a game session. */
export enum GameStatus {
  /** Game created but not yet started. */
  Waiting = "waiting",
  /** Game is actively being played. */
  InProgress = "inProgress",
  /** Game has ended. */
  Completed = "completed",
}

/** Result of a completed game. */
export interface MatchResult {
  winner: 1 | 2;
  loser: 1 | 2;
  reason: GameOverReason;
  /** Total turns played. */
  totalTurns: number;
  /** Duration of the match in ms. */
  durationMs: number;
}

/**
 * Complete snapshot of a game at any point in time.
 * This is the single source of truth — all game logic operates on this.
 * State is treated as immutable; every action produces a new GameState.
 */
export interface GameState {
  /** Unique game/session identifier. */
  gameId: string;
  /** Game configuration. */
  config: GameConfig;
  /** Current game status. */
  status: GameStatus;
  /** Player 1 state. */
  player1: PlayerState;
  /** Player 2 state. */
  player2: PlayerState;
  /** Which player's turn it is (1 or 2). */
  activePlayer: 1 | 2;
  /** Current turn number (starts at 1). */
  turnNumber: number;
  /** Current phase within the turn. */
  currentPhase: TurnPhase;
  /** Match timer state. */
  timer: MatchTimer;
  /** Ordered event log for replay and UI. */
  eventLog: readonly GameEvent[];
  /** Monotonic counter for event sequence numbers. */
  nextEventSeq: number;
  /** Result if game is completed, null otherwise. */
  result: MatchResult | null;
  /** Timestamp when the game started. null if status is Waiting. */
  startedAt: number | null;
  /** Seeded RNG state — advances on every shuffle/random pick. */
  rngState: number;
  /** Decision the game is blocked on, if any. */
  pendingDecision: PendingDecision | null;
  /** Effects queued for resolution (FIFO). */
  effectQueue: readonly QueuedEffect[];
  /** Attack currently being resolved, if any. */
  combat: CombatState | null;
  /** Temporary power modifications, cleared at end of turn. */
  powerMods: readonly PowerMod[];
  /** Temporary keyword grants, cleared at end of turn. */
  keywordMods: readonly KeywordMod[];
  /**
   * Shield trigger cards (now in hand) the defender may still play for
   * free. Surfaced as a shieldTrigger decision once the effect queue drains.
   */
  pendingShieldTriggers: { playerId: 1 | 2; candidateIds: readonly string[] } | null;
  /** The queued effect awaiting target selection (paired with a chooseTargets decision). */
  pendingOp?: QueuedEffect | null;
}

/**
 * A view of the game state visible to a specific player.
 * Hides opponent's hand and deck contents.
 * Event log and startedAt are included since they are public information.
 */
export interface VisibleGameState {
  gameId: string;
  config: GameConfig;
  status: GameStatus;
  /** The requesting player's full state. */
  me: PlayerState;
  /** Opponent state with hand/deck hidden (only counts visible). */
  opponent: {
    playerId: 1 | 2;
    name: string;
    deckCount: number;
    handCount: number;
    battleZone: PlayerState["battleZone"];
    manaZone: PlayerState["manaZone"];
    shieldCount: number;
    /** Graveyard is public information in Duel Masters. */
    graveyard: PlayerState["graveyard"];
    hasChargedMana: boolean;
  };
  activePlayer: 1 | 2;
  turnNumber: number;
  currentPhase: TurnPhase;
  timer: MatchTimer;
  /** Ordered event log — public information for both players. */
  eventLog: readonly GameEvent[];
  /** Timestamp when the game started. null if status is Waiting. */
  startedAt: number | null;
  result: MatchResult | null;
  /** Decision the game is blocked on, if any (public — UI shows prompts). */
  pendingDecision: PendingDecision | null;
  /** Attack currently being resolved, if any. */
  combat: CombatState | null;
  /** Temporary power modifications (public). */
  powerMods: readonly PowerMod[];
}
