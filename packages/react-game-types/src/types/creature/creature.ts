import type { Civilization } from "../civilization";
import type { Rarity } from "../rarity";
import type { Race } from "../race";

/**
 * Represents a Duel Masters creature card
 * with all gameplay-relevant attributes.
 */
export interface Creature {
  /** Unique identifier */
  id: string;
  /** Display name of the creature */
  name: string;
  /** Civilization the creature belongs to */
  civilization: Civilization;
  /** Mana cost to summon */
  manaCost: number;
  /** Creature's power stat */
  power: number;
  /** Creature's toughness stat */
  toughness: number;
  /** Race/tribe of the creature */
  race: Race;
  /** Card rarity */
  rarity: Rarity;
  /** Card text / abilities */
  abilities?: string[];
  /** Flavor text */
  flavorText?: string;
}
