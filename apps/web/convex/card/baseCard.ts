import { v } from "convex/values";
import { civilization } from "./civilization";
import { rarity } from "./rarity";

export const baseCardFields = {
  /**
   * The name of the card.
   */
  name: v.string(),

  /**
   * The key of the image of the card.
   */
  imageKey: v.optional(v.string()),

  /**
   * The cost of the card.
   */
  cost: v.number(),

  /**
   * The type of the card.
   */
  type: v.union(v.literal("creature"), v.literal("spell")),

  /**
   * The mana number of the card.
   */
  manaNumber: v.number(),

  /**
   * The civilizations of the card.
   */
  civilizations: v.array(civilization),

  /**
   * The rules text of the card.
   */
  rulesText: v.optional(v.array(v.string())),

  /**
   * The set ID of the card.
   */
  setId: v.optional(v.string()),

  /**
   * The collector number of the card.
   */
  collectorNumber: v.optional(v.string()),

  /**
   * The flavor text of the card.
   */
  flavorText: v.optional(v.string()),

  /**
   * The illustrator of the card.
   */
  illustrator: v.optional(v.string()),

  /**
   * The copyright of the card.
   */
  copyright: v.optional(v.string()),

  /**
   * The rarity of the card.
   */
  rarity: rarity,
};
