/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as card_baseCard from "../card/baseCard.js";
import type * as card_civilization from "../card/civilization.js";
import type * as card_race from "../card/race.js";
import type * as card_rarity from "../card/rarity.js";
import type * as decks from "../decks.js";
import type * as games from "../games.js";
import type * as userSettings from "../userSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "card/baseCard": typeof card_baseCard;
  "card/civilization": typeof card_civilization;
  "card/race": typeof card_race;
  "card/rarity": typeof card_rarity;
  decks: typeof decks;
  games: typeof games;
  userSettings: typeof userSettings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
