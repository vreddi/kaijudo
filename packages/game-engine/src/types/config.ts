/**
 * Configuration for a game session.
 * All values have sensible defaults matching standard Duel Masters rules.
 */
export interface GameConfig {
  /** Maximum cards in a deck. Default: 40 */
  deckSize: number;
  /** Number of shields each player starts with. Default: 5 */
  startingShields: number;
  /** Number of cards in opening hand. Default: 5 */
  openingHandSize: number;
  /** Total match timer in milliseconds. Default: 1_200_000 (20 minutes) */
  matchTimerMs: number;
  /** Maximum copies of a single card per deck. Default: 4 */
  maxCopiesPerCard: number;
  /** Whether player 1 skips their first draw. Default: true (standard rule) */
  skipFirstDraw: boolean;
}

/** Standard Duel Masters game configuration. */
export const DEFAULT_GAME_CONFIG: Readonly<GameConfig> = {
  deckSize: 40,
  startingShields: 5,
  openingHandSize: 5,
  matchTimerMs: 20 * 60 * 1000,
  maxCopiesPerCard: 4,
  skipFirstDraw: true,
} as const;
