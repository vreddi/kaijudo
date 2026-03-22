/**
 * Phases within a single turn, executed in order.
 *
 * A player progresses through these phases each turn:
 * Untap → Draw → ChargeMana → Main → Attack → End
 */
export enum TurnPhase {
  /** Untap all tapped creatures in the active player's battle zone. */
  Untap = "untap",
  /** Draw one card from the deck. Skipped on player 1's very first turn. */
  Draw = "draw",
  /** Optionally place one card from hand into the mana zone. */
  ChargeMana = "chargeMana",
  /** Summon creatures or cast spells by paying mana costs. */
  Main = "main",
  /** Declare attacks with creatures that are able to attack. */
  Attack = "attack",
  /** Turn cleanup and pass to opponent. */
  End = "end",
}

/** Ordered list of phases for iteration. */
export const TURN_PHASE_ORDER: readonly TurnPhase[] = [
  TurnPhase.Untap,
  TurnPhase.Draw,
  TurnPhase.ChargeMana,
  TurnPhase.Main,
  TurnPhase.Attack,
  TurnPhase.End,
] as const;
