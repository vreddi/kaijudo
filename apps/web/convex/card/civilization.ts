import { v } from "convex/values";

export const civilization = v.union(
  v.literal("light"),
  v.literal("water"),
  v.literal("darkness"),
  v.literal("fire"),
  v.literal("nature")
);
