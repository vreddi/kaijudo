import type { Civilization } from "./civilization";
import type { Race } from "./race";

export type Creature = {
  /**
   * Name of the creature
   */
  name: string;
  /**
   * Power of the creature
   */
  power: number;
  /**
   * Toughness of the creature
   */
  toughness: number;
  /**
   * Civilization of the creature
   */
  civilization: Civilization;
  /**
   * Race of the creature
   */
  race: Race;
};
