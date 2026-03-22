/**
 * Match timer state.
 * Timer counts down only for the active player.
 */
export interface MatchTimer {
  /** Total match duration in ms (from config). */
  totalTimeMs: number;
  /** Remaining time for player 1 in ms. */
  player1RemainingMs: number;
  /** Remaining time for player 2 in ms. */
  player2RemainingMs: number;
  /** Timestamp (Date.now()) when the current player's timer started ticking. null if paused. */
  lastTickTimestamp: number | null;
  /** Which player's timer is currently running. null if game hasn't started or is paused. */
  activeTimerPlayer: 1 | 2 | null;
}

export enum TimerStatus {
  /** More than 3 minutes remaining. */
  Normal = "normal",
  /** 3 minutes or less remaining. */
  Warning = "warning",
  /** 1 minute or less remaining. */
  Critical = "critical",
  /** Time has expired. */
  Expired = "expired",
}

/** Threshold constants in milliseconds. */
export const TIMER_WARNING_MS = 3 * 60 * 1000;
export const TIMER_CRITICAL_MS = 1 * 60 * 1000;

/** Get the timer status for a given remaining time. */
export function getTimerStatus(remainingMs: number): TimerStatus {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return TimerStatus.Expired;
  if (remainingMs <= TIMER_CRITICAL_MS) return TimerStatus.Critical;
  if (remainingMs <= TIMER_WARNING_MS) return TimerStatus.Warning;
  return TimerStatus.Normal;
}
