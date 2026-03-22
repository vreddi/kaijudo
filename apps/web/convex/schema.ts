import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { baseCardFields } from "./card/baseCard";
import { race } from "./card/race";

export default defineSchema({
  cards: defineTable(
    v.union(
      v.object({
        ...baseCardFields,
        type: v.literal("creature"),
        power: v.number(),
        races: v.array(race),
      }),
      v.object({
        ...baseCardFields,
        type: v.literal("spell"),
      })
    )
  ).index("by_name", ["name"]),

  userSettings: defineTable({
    userId: v.string(),
    musicVolume: v.number(),
    sfxVolume: v.number(),
    musicEnabled: v.boolean(),
    animationSpeed: v.union(
      v.literal("normal"),
      v.literal("fast"),
      v.literal("off")
    ),
    cardArtQuality: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    reducedMotion: v.boolean(),
    autoPassPriority: v.boolean(),
    confirmBeforeAttacking: v.boolean(),
    showCardTooltips: v.boolean(),
  }).index("by_userId", ["userId"]),
});
