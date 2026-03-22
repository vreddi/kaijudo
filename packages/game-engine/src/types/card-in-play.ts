import type { Civilization, Rarity, Race } from "@kaijudo/react-game-types";

/**
 * A card as it exists in the game with a unique instance ID.
 * Based on the card database schema (all-cards.json) rather than the
 * Creature interface, since game cards come from the JSON data.
 */
export interface GameCard {
  /** Unique instance ID for this card in this game (e.g., "p1-0", "p2-39"). */
  readonly instanceId: string;
  /** Original card ID from the database. */
  readonly cardId: string;
  /** Display name. */
  readonly name: string;
  /** Card civilizations. Multi-civ cards have multiple. */
  readonly civilizations: readonly Civilization[];
  /** Mana cost to summon/cast. */
  readonly cost: number;
  /** Card type: "Creature" or "Spell". */
  readonly type: "Creature" | "Spell";
  /** Creature race (undefined for spells). */
  readonly race?: Race;
  /** Creature power (undefined for spells). */
  readonly power?: number;
  /** Card rarity. */
  readonly rarity: Rarity;
  /** Set identifier. */
  readonly set: string;
  /** Collector number within the set. */
  readonly collectorNum: string;
  /** Path to card image. */
  readonly imageSrc: string;
}

/**
 * A card that is currently in the battle zone with
 * zone-specific gameplay state.
 */
export interface CreatureInBattle extends GameCard {
  readonly type: "Creature";
  readonly power: number;
  /** Whether this creature is tapped (turned sideways). */
  readonly tapped: boolean;
  /** Whether this creature was summoned this turn (can't attack). */
  readonly summoningSick: boolean;
  /** The turn number this creature was summoned on. */
  readonly summonedOnTurn: number;
}

/**
 * A card in the mana zone.
 */
export interface CardInMana extends GameCard {
  /** Whether this mana card is tapped (used to pay costs this turn). */
  readonly tapped: boolean;
}

/**
 * Type guard: is this GameCard a creature in battle?
 * Assumes the input is already a valid GameCard — checks zone-specific fields.
 */
export function isCreatureInBattle(card: GameCard): card is CreatureInBattle {
  return card.type === "Creature"
    && "tapped" in card
    && "summoningSick" in card;
}

/**
 * Type guard: is this GameCard in the mana zone?
 * Assumes the input is already a valid GameCard — checks zone-specific fields.
 */
export function isCardInMana(card: GameCard): card is CardInMana {
  return "tapped" in card && !("summoningSick" in card);
}
