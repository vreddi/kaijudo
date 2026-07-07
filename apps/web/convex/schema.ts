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

  decks: defineTable({
    userId: v.string(),
    name: v.string(),
    cardIds: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  games: defineTable({
    code: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("inProgress"),
      v.literal("completed")
    ),
    hostUserId: v.string(),
    hostName: v.string(),
    hostDeck: v.array(v.string()),
    guestUserId: v.optional(v.string()),
    guestName: v.optional(v.string()),
    guestDeck: v.optional(v.array(v.string())),
    /** JSON.stringify(GameState) — the engine state stored here is authoritative. */
    state: v.optional(v.string()),
    winner: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_hostUserId", ["hostUserId"])
    .index("by_guestUserId", ["guestUserId"]),
});
