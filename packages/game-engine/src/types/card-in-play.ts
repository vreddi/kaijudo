import type { Civilization, Rarity } from "@kaijudo/react-game-types";
import type { PlayableCardType } from "./ability";

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
  /** Card type. */
  readonly type: PlayableCardType;
  /**
   * Creature race (undefined for spells). Kept as a free-form string —
   * the database has hundreds of races, including multi-race cards.
   */
  readonly race?: string;
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
  /** Rules text lines, for display. */
  readonly rulesText: readonly string[];
}

/**
 * A card that is currently in the battle zone with
 * zone-specific gameplay state.
 */
export interface CreatureInBattle extends GameCard {
  readonly type: "Creature" | "Evolution Creature";
  readonly power: number;
  /** Whether this creature is tapped (turned sideways). */
  readonly tapped: boolean;
  /** Whether this creature was summoned this turn (can't attack). */
  readonly summoningSick: boolean;
  /** The turn number this creature was summoned on. */
  readonly summonedOnTurn: number;
  /** Cards underneath an evolution creature (go to grave with it). */
  readonly evolutionSources?: readonly GameCard[];
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
  return (
    (card.type === "Creature" || card.type === "Evolution Creature") &&
    "tapped" in card &&
    "summoningSick" in card
  );
}

/**
 * Type guard: is this GameCard in the mana zone?
 * Assumes the input is already a valid GameCard — checks zone-specific fields.
 */
export function isCardInMana(card: GameCard): card is CardInMana {
  return "tapped" in card && !("summoningSick" in card);
}
