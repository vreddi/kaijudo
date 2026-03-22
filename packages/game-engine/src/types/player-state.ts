import type { GameCard, CreatureInBattle, CardInMana } from "./card-in-play";

/**
 * Complete state for one player during a game.
 * Each zone contains the appropriate card representation.
 */
export interface PlayerState {
  /** Player identifier (1 or 2). */
  playerId: 1 | 2;
  /** Player display name. */
  name: string;
  /** Cards remaining in the deck (top = index 0). */
  deck: GameCard[];
  /** Cards in hand. */
  hand: GameCard[];
  /** Creatures in the battle zone. */
  battleZone: CreatureInBattle[];
  /** Cards in the mana zone. */
  manaZone: CardInMana[];
  /** Shield cards (face-down). */
  shieldZone: GameCard[];
  /** Cards in the graveyard (most recent = last index). */
  graveyard: GameCard[];
  /** Whether this player has charged mana this turn. */
  hasChargedMana: boolean;
}
