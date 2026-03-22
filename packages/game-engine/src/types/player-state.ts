import type { GameCard, CreatureInBattle, CardInMana } from "./card-in-play";

/**
 * Complete state for one player during a game.
 * Each zone contains the appropriate card representation.
 * All arrays are readonly to enforce immutable state updates.
 */
export interface PlayerState {
  /** Player identifier (1 or 2). */
  readonly playerId: 1 | 2;
  /** Player display name. */
  readonly name: string;
  /** Cards remaining in the deck (top = index 0). */
  readonly deck: readonly GameCard[];
  /** Cards in hand. */
  readonly hand: readonly GameCard[];
  /** Creatures in the battle zone. */
  readonly battleZone: readonly CreatureInBattle[];
  /** Cards in the mana zone. */
  readonly manaZone: readonly CardInMana[];
  /** Shield cards (face-down). */
  readonly shieldZone: readonly GameCard[];
  /** Cards in the graveyard (most recent = last index). */
  readonly graveyard: readonly GameCard[];
  /** Whether this player has charged mana this turn. */
  readonly hasChargedMana: boolean;
}
