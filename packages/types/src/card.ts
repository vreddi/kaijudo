import type { CardType } from "./cardType";
import type { Rarity } from "./rarity";
import type { Set } from "./set";

export type Card = {
  /**
   * Type of the card
   */
  type: CardType;

  cost: number;

  rarity: Rarity;

  collectionNumber: number;

  set: Set;
};
