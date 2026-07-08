import type { GameAction } from "./actions";
import type { TurnPhase } from "./turn-phase";
import type { TimerStatus } from "./timer";

/**
 * Events emitted during gameplay for UI updates, logging, and replay.
 * Each event is timestamped with a monotonic sequence number.
 * Only `ActionEvent` contains the triggering action; other events
 * carry domain-specific payloads.
 */
export type GameEvent =
  | ActionEvent
  | PhaseChangeEvent
  | TurnChangeEvent
  | ShieldBreakEvent
  | CreatureDestroyedEvent
  | BattleEvent
  | EffectEvent
  | GameOverEvent
  | TimerWarningEvent;

/** A battle between two creatures resolved. */
export interface BattleEvent extends BaseEvent {
  type: "battle";
  attackerInstanceId: string;
  defenderInstanceId: string;
  /** Which side's creature survived. */
  outcome: "attackerWins" | "defenderWins" | "bothDestroyed";
}

/** A card effect resolved (draw, destroy, tap, …). */
export interface EffectEvent extends BaseEvent {
  type: "effect";
  /** Player controlling the effect. */
  controller: 1 | 2;
  /** Name of the source card. */
  sourceName: string;
  /** Human-readable description of what happened. */
  description: string;
}

/** Common fields shared by all game events. */
export interface BaseEvent {
  /** Monotonic event sequence number. */
  seq: number;
  /** Timestamp in ms (Date.now()). */
  timestamp: number;
}

/** A player action was successfully processed. */
export interface ActionEvent extends BaseEvent {
  type: "action";
  action: GameAction;
}

/** The turn phase changed. */
export interface PhaseChangeEvent extends BaseEvent {
  type: "phaseChange";
  from: TurnPhase;
  to: TurnPhase;
  activePlayer: 1 | 2;
}

/** The active turn changed to the other player. */
export interface TurnChangeEvent extends BaseEvent {
  type: "turnChange";
  turnNumber: number;
  activePlayer: 1 | 2;
}

/** A shield was broken. */
export interface ShieldBreakEvent extends BaseEvent {
  type: "shieldBreak";
  /** Player whose shield was broken. */
  defendingPlayer: 1 | 2;
  /** Instance ID of the card that was a shield (now goes to hand). */
  shieldCardInstanceId: string;
  /** Instance ID of the creature that broke the shield. */
  attackerInstanceId: string;
}

/** A creature was destroyed in battle. */
export interface CreatureDestroyedEvent extends BaseEvent {
  type: "creatureDestroyed";
  /** Instance ID of the destroyed creature. */
  creatureInstanceId: string;
  /** Owner of the destroyed creature. */
  owner: 1 | 2;
  /** What destroyed it. */
  cause: "battle" | "effect";
}

/** The game ended. */
export interface GameOverEvent extends BaseEvent {
  type: "gameOver";
  winner: 1 | 2;
  loser: 1 | 2;
  reason: GameOverReason;
}

/** Timer threshold crossed. Reuses TimerStatus to stay in sync with timer.ts. */
export interface TimerWarningEvent extends BaseEvent {
  type: "timerWarning";
  player: 1 | 2;
  remainingMs: number;
  severity: Exclude<TimerStatus, TimerStatus.Normal>;
}

/** Reasons a game can end. */
export type GameOverReason =
  | "directAttack"
  | "deckOut"
  | "timerExpired"
  | "surrender";
