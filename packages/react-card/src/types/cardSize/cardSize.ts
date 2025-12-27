/**
 * CardSize enum defines the size of a card based on its game zone.
 * Cards automatically transition between sizes when moving between zones.
 *
 * Size reference (approximate dimensions):
 * - Small: ~175px × 245px (50% of standard)
 * - Medium: ~262px × 367px (75% of standard)
 * - Large: ~350px × 490px (100% standard size)
 */
export enum CardSize {
  /**
   * Generic small size - Used for compact displays
   * Size: ~175px × 245px
   */
  Small = "small",
  /**
   * Generic medium size - Used for intermediate displays
   * Size: ~262px × 367px
   */
  Medium = "medium",
  /**
   * Generic large size - Used for detailed displays
   * Size: ~350px × 490px (standard card size)
   */
  Large = "large",
  /**
   * Hand zone - Cards held in player's hand
   * Size: ~175px × 245px (small, fanning out)
   * Cards are smaller to fit multiple in hand view
   */
  Hand = "hand",
  /**
   * Deck zone - Cards in the deck stack
   * Size: ~140px × 196px (very small, just showing top card)
   * Only the top card is visible, rest are stacked
   */
  Deck = "deck",
  /**
   * Graveyard zone - Discarded/destroyed cards
   * Size: ~175px × 245px (small, stacked)
   * Cards are stacked showing only the top card
   */
  Graveyard = "graveyard",
  /**
   * Library zone - Cards in the library
   * Size: ~175px × 245px (small, stacked)
   * Similar to deck, showing top card of library
   */
  Library = "library",
  /**
   * Exile zone - Removed from game cards
   * Size: ~175px × 245px (small, stacked)
   * Cards removed from the game
   */
  Exile = "exile",
  /**
   * Stack zone - Cards on the stack (resolving spells/abilities)
   * Size: ~262px × 367px (medium)
   * Cards are larger when resolving to show details
   */
  Stack = "stack",
  /**
   * ManaZone - Cards in the mana zone (tapped/untapped)
   * Size: ~262px × 367px (medium)
   * Cards are medium size, can be tapped/untapped
   */
  ManaZone = "mana-zone",
  /**
   * Battlefield - Cards in play on the battlefield
   * Size: ~350px × 490px (large, standard size)
   * Cards are full size when in play for maximum visibility
   */
  Battlefield = "battlefield",
}
