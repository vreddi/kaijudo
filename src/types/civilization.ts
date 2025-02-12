/**
 * Civilization is a gameplay characteristic indicating
 * the 5 powers in the Duel Masters Trading Card Game.
 * @link https://duelmasters.fandom.com/wiki/Civilization
 */
export enum Civilization {
  /**
   * The Light Civilization is distinguished by a yellow color
   * frame and is represented by 3 circles composed of several
   * smaller circles. Abilities unique to Light involve adding
   * cards to the shield zone, tapping others' creatures while
   * untapping its own, and getting spells from the mana zone,
   * graveyard, or deck. Light is also known for having the best
   * creatures with the Blocker ability, with the only restriction
   * that they are usually unable to attack players.
   */
  Light = "Light",

  /**
   * The Water Civilization is distinguished by a blue color frame
   * and is represented by a cylinder with electronic design.
   * Abilities unique to water involve drawing cards, looking at
   * cards in the shield zone, hand, and the opponent's deck,
   * returning cards from the battle zone or mana zone to the hand,
   * and unblockable creatures. Water is also known for having
   * expensive creatures that have low power, usually in exchange
   * for a useful effect. They are the second-best at blocking,
   * having blockers that can attack both players and creatures,
   * and blockers that cannot attack at all.
   */
  Water = "Water",

  /**
   * The Darkness Civilization is distinguished by a black color
   * frame and is represented by a color-coded black and white mask
   * with horns. Abilities unique to darkness involve discarding
   * cards from the hand, destroying other creatures, "slayer",
   * and recovering creatures from the graveyard. Most Darkness
   * creatures also have side effects, like self-destruction when
   * it battles or wins a battle, in exchange for its high power.
   * They are the third-best at blocking, as they have few blockers
   * and most have drawbacks with high power or low power in
   * exchange for an ability like "slayer".
   */
  Darkness = "Darkness",

  /**
   * The Fire Civilization is distinguished by a red color frame
   * and is represented by the icon of a gear. Abilities unique to
   * Fire involve "speed attacker", power-limited destruction, mana
   * and shield destruction, attacking untapped creatures, and the
   * need to attack each turn if able.
   */
  Fire = "Fire",

  /**
   * The Nature Civilization is distinguished by a green color frame
   * and is represented by 2 overlapping zigzags. Abilities unique
   * to Nature involve increasing cards in one's mana zone,
   * power-limited unblockability, and getting creatures from one's
   * deck.
   */
  Nature = "Nature",
}
