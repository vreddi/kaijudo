import type { Civilization, Rarity } from "@kaijudo/react-game-types";

/**
 * A card as it exists in the game with a unique instance ID.
 * Based on the card database schema (all-cards.json) rather than the
 * Creature interface, since game cards come from the JSON data.
 */
export interface GameCard {
  /** Unique instance ID for this card in this game (e.g., "p1-0", "p2-39"). */
  instanceId: string;
  /** Original card ID from the database. */
  cardId: string;
  /** Display name. */
  name: string;
  /** Card civilizations. Multi-civ cards have multiple. */
  civilizations: Civilization[];
  /** Mana cost to summon/cast. */
  cost: number;
  /** Card type: "Creature" or "Spell". */
  type: "Creature" | "Spell";
  /** Creature race (undefined for spells). */
  race?: string;
  /** Creature power (undefined for spells). */
  power?: number;
  /** Card rarity. */
  rarity: Rarity;
  /** Set identifier. */
  set: string;
  /** Collector number within the set. */
  collectorNum: string;
  /** Path to card image. */
  imageSrc: string;
}

/**
 * A card that is currently in the battle zone with
 * zone-specific gameplay state.
 */
export interface CreatureInBattle extends GameCard {
  type: "Creature";
  power: number;
  /** Whether this creature is tapped (turned sideways). */
  tapped: boolean;
  /** Whether this creature was summoned this turn (can't attack). */
  summoningSick: boolean;
  /** The turn number this creature was summoned on. */
  summonedOnTurn: number;
}

/**
 * A card in the mana zone.
 */
export interface CardInMana extends GameCard {
  /** Whether this mana card is tapped (used to pay costs this turn). */
  tapped: boolean;
}

/** Type guard: is this GameCard a creature in battle? */
export function isCreatureInBattle(card: unknown): card is CreatureInBattle {
  if (typeof card !== "object" || card === null) return false;
  const obj = card as Record<string, unknown>;
  return obj["type"] === "Creature" && "tapped" in obj && "summoningSick" in obj;
}

/** Type guard: is this card in the mana zone? */
export function isCardInMana(card: unknown): card is CardInMana {
  if (typeof card !== "object" || card === null) return false;
  const obj = card as Record<string, unknown>;
  return "tapped" in obj && !("summoningSick" in obj);
}
