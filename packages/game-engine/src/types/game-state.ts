import type { PlayerState } from "./player-state";
import type { TurnPhase } from "./turn-phase";
import type { MatchTimer } from "./timer";
import type { GameEvent, GameOverReason } from "./events";
import type { GameConfig } from "./config";

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
  eventLog: GameEvent[];
  /** Monotonic counter for event sequence numbers. */
  nextEventSeq: number;
  /** Result if game is completed, null otherwise. */
  result: MatchResult | null;
  /** Timestamp when the game started. */
  startedAt: number;
}

/**
 * A view of the game state visible to a specific player.
 * Hides opponent's hand and deck contents.
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
    graveyardCount: number;
    graveyard: PlayerState["graveyard"];
    hasChargedMana: boolean;
  };
  activePlayer: 1 | 2;
  turnNumber: number;
  currentPhase: TurnPhase;
  timer: MatchTimer;
  result: MatchResult | null;
}
