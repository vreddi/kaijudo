/**
 * All possible game actions a player can take.
 * Uses a discriminated union on the `type` field.
 */
export type GameAction =
  | DrawCardAction
  | ChargeManaAction
  | SummonCreatureAction
  | CastSpellAction
  | AttackCreatureAction
  | AttackPlayerAction
  | EndPhaseAction
  | EndTurnAction
  | SurrenderAction;

/** Draw a card from the deck (automatic during Draw phase). */
export interface DrawCardAction {
  type: "drawCard";
  playerId: 1 | 2;
}

/** Place a card from hand into the mana zone. */
export interface ChargeManaAction {
  type: "chargeMana";
  playerId: 1 | 2;
  /** Instance ID of the card to place in mana zone. */
  cardInstanceId: string;
}

/** Summon a creature from hand to the battle zone. */
export interface SummonCreatureAction {
  type: "summonCreature";
  playerId: 1 | 2;
  /** Instance ID of the creature card to summon. */
  cardInstanceId: string;
  /** Instance IDs of mana cards to tap for payment. */
  manaTapIds: string[];
}

/** Cast a spell from hand (goes to graveyard after resolving). */
export interface CastSpellAction {
  type: "castSpell";
  playerId: 1 | 2;
  /** Instance ID of the spell card. */
  cardInstanceId: string;
  /** Instance IDs of mana cards to tap for payment. */
  manaTapIds: string[];
}

/** Attack an opponent's creature in the battle zone. */
export interface AttackCreatureAction {
  type: "attackCreature";
  playerId: 1 | 2;
  /** Instance ID of the attacking creature. */
  attackerInstanceId: string;
  /** Instance ID of the target creature. */
  targetInstanceId: string;
}

/** Attack the opponent directly (breaks a shield or wins). */
export interface AttackPlayerAction {
  type: "attackPlayer";
  playerId: 1 | 2;
  /** Instance ID of the attacking creature. */
  attackerInstanceId: string;
}

/** Skip/end the current phase (e.g., skip ChargeMana, skip Attack). */
export interface EndPhaseAction {
  type: "endPhase";
  playerId: 1 | 2;
}

/** End the current turn entirely. */
export interface EndTurnAction {
  type: "endTurn";
  playerId: 1 | 2;
}

/** Surrender/concede the game. */
export interface SurrenderAction {
  type: "surrender";
  playerId: 1 | 2;
}
