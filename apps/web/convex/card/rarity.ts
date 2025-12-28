import { v } from "convex/values";

export const rarity = v.optional(
  v.union(
    v.literal("common"),
    v.literal("uncommon"),
    v.literal("rare"),
    v.literal("veryRare"),
    v.literal("superRare")
  )
);
