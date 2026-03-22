import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const DEFAULT_SETTINGS = {
  musicVolume: 0.5,
  sfxVolume: 0.5,
  musicEnabled: true,
  animationSpeed: "normal" as const,
  cardArtQuality: "high" as const,
  reducedMotion: false,
  autoPassPriority: false,
  confirmBeforeAttacking: true,
  showCardTooltips: true,
};

export type UserSettings = typeof DEFAULT_SETTINGS;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return DEFAULT_SETTINGS;
    }

    const row = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (!row) {
      return DEFAULT_SETTINGS;
    }

    const { _id, _creationTime, userId, ...settings } = row;
    return settings;
  },
});

export const update = mutation({
  args: {
    musicVolume: v.optional(v.number()),
    sfxVolume: v.optional(v.number()),
    musicEnabled: v.optional(v.boolean()),
    animationSpeed: v.optional(
      v.union(v.literal("normal"), v.literal("fast"), v.literal("off"))
    ),
    cardArtQuality: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    reducedMotion: v.optional(v.boolean()),
    autoPassPriority: v.optional(v.boolean()),
    confirmBeforeAttacking: v.optional(v.boolean()),
    showCardTooltips: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("userSettings", {
        userId: identity.tokenIdentifier,
        ...DEFAULT_SETTINGS,
        ...args,
      });
    }
  },
});
