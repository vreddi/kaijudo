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
});
