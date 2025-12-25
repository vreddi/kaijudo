/**
 * Civilization is a gameplay characteristic
 * indicating the powers.
 */
export enum Civilization {
  /**
   * Defense, control, and order -
   * blockers, shields, tapping/stun effects,
   * and defensive utility; stabilizes the
   * game and wins through inevitability.
   * @docs https://duelmasters.fandom.com/wiki/Light_Civilization
   */
  Light = "light",

  /**
   * Card advantage and tempo - draws cards,
   * bounces threats, manipulates hand/board,
   * and wins by out-resourcing and out-positioning
   * opponents.
   * @docs https://duelmasters.fandom.com/wiki/Water_Civilization
   */
  Water = "water",

  /**
   * Discard and sacrifice - graveyard synergy,
   * removal via destruction, hand disruption,
   * and risky power plays; trades life/board
   * for brutal advantage.
   * @docs https://duelmasters.fandom.com/wiki/Darkness_Civilization
   */
  Darkness = "darkness",

  /**
   * Fast, aggressive, and explosive -
   * rush creatures, speed attacker, power
   * spikes, and burn-style removal; wins
   * by pressuring early and finishing hard.
   * @docs https://duelmasters.fandom.com/wiki/Fire_Civilization
   */
  Fire = "fire",

  /**
   * Mana acceleration and big bodies - ramps
   * resources quickly, cheats out large creatures,
   * and overwhelms with efficient stats and
   * board presence.
   * @docs https://duelmasters.fandom.com/wiki/Nature_Civilization
   */
  Nature = "nature",
}
