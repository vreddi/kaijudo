import type { EffectOp, TargetSpec } from "./ability";

/**
 * An effect waiting to resolve. Effects queue up (e.g. an on-summon
 * ability with two operations) and resolve in order; ops that need a
 * player choice surface as a PendingDecision.
 */
export interface QueuedEffect {
  /** Player controlling the effect (chooses targets). */
  controller: 1 | 2;
  /** Instance ID of the source card (creature or spell). */
  sourceInstanceId: string;
  /** Source card name, for the event log. */
  sourceName: string;
  op: EffectOp;
}

/**
 * A decision the game is blocked on. Exactly one player must act
 * (via BlockAction / ShieldTriggerAction / ChooseTargetsAction)
 * before any other action is legal.
 */
export type PendingDecision =
  | BlockDecision
  | ShieldTriggerDecision
  | ChooseTargetsDecision
  | DiscardDecision;

/** Defending player may block with an untapped blocker. */
export interface BlockDecision {
  kind: "block";
  /** Player who decides (the defender). */
  playerId: 1 | 2;
  attackerInstanceId: string;
  /** "player" for a direct/shield attack, else defender creature instance id. */
  attackTarget: "player" | string;
  /** Untapped blockers able to block. */
  candidateIds: string[];
}

/** Defender may use broken shields with the shield trigger keyword. */
export interface ShieldTriggerDecision {
  kind: "shieldTrigger";
  playerId: 1 | 2;
  /** Instance IDs (now in hand) that can be played for free. */
  candidateIds: string[];
}

/** Effect controller must choose targets for a queued effect op. */
export interface ChooseTargetsDecision {
  kind: "chooseTargets";
  playerId: 1 | 2;
  sourceInstanceId: string;
  sourceName: string;
  /** Description of the effect for the UI. */
  description: string;
  target: TargetSpec;
  /** Legal creature instance ids to pick from. */
  candidateIds: string[];
  /** How many must be chosen (min(count, candidates); 0 allowed if optional). */
  count: number;
  optional: boolean;
}

/** Player must choose card(s) from their own hand to discard. */
export interface DiscardDecision {
  kind: "discard";
  playerId: 1 | 2;
  count: number;
  candidateIds: string[];
}
