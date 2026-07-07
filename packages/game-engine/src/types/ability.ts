import type { Civilization } from "@kaijudo/react-game-types";

/**
 * Raw card record as stored in all-cards.json.
 * The engine compiles these into CardDefinitions at startup.
 */
export interface CardData {
  id: string;
  name: string;
  civilization: string | string[];
  cost: number;
  type: string;
  race: string;
  power: number;
  rarity: string;
  collectorNum: string;
  set: string;
  imageSrc: string;
  rulesText?: string[];
}

/** Card types the engine can play. Other types (Cross Gear, Castle) are not deck-legal. */
export type PlayableCardType = "Creature" | "Evolution Creature" | "Spell";

/**
 * Static keyword abilities compiled from rules text.
 * All fields are optional; absence means the keyword does not apply.
 */
export interface Keywords {
  /** Can block attacks. */
  blocker?: boolean;
  /** Blockers with "This creature can't attack." */
  cantAttack?: boolean;
  /** "This creature can't attack players." */
  cantAttackPlayers?: boolean;
  /** May be cast/summoned for free when broken as a shield. */
  shieldTrigger?: boolean;
  /** Number of shields broken per attack (1 = normal, 2 = double, 3 = triple). */
  breaker?: number;
  /** Destroys any creature it battles, regardless of power. */
  slayer?: boolean;
  /** No summoning sickness. */
  speedAttacker?: boolean;
  /** Extra power while attacking. */
  powerAttacker?: number;
  /** "This creature can't be blocked." */
  cantBeBlocked?: boolean;
  /** "This creature can't be blocked by creatures with power N or more/less" — simplified to unblockable when set. */
  /** Can attack untapped enemy creatures. */
  canAttackUntapped?: boolean;
  /** Must attack each turn if able. */
  mustAttack?: boolean;
  /** Doesn't untap at the start of your turn. */
  doesntUntap?: boolean;
  /** Wins all battles ("This creature wins all battles."). */
  winsAllBattles?: boolean;
  /** "This creature can't attack creatures." */
  cantAttackCreatures?: boolean;
  /** "When this creature would be destroyed, return it to your hand instead." */
  destroyedToHand?: boolean;
  /** "When this creature would be destroyed, put it into your mana zone instead." */
  destroyedToMana?: boolean;
  /** "When this creature battles, destroy it after the battle." */
  destroyAfterBattle?: boolean;
  /** "When this creature wins a battle, destroy it." */
  destroyAfterWinningBattle?: boolean;
  /** Charger spells go to the mana zone instead of the graveyard after casting. */
  charger?: boolean;
  /** "This creature can't be blocked by any creature that has power N or less." */
  unblockablePowerLE?: number;
  /** "This creature can't be blocked by <civ> creatures." */
  cantBeBlockedByCivs?: Civilization[];
  /** "This creature is put into the battle zone tapped." */
  entersTapped?: boolean;
}

/** Filter describing which creatures an effect can target. */
export interface CreatureFilter {
  /** Max power (inclusive), e.g. "destroy a creature with power 3000 or less". */
  maxPower?: number;
  /** Min power (inclusive). */
  minPower?: number;
  /** Only tapped creatures. */
  tapped?: boolean;
  /** Only untapped creatures. */
  untapped?: boolean;
  /** Only blockers. */
  blocker?: boolean;
  /** Restrict to a civilization. */
  civilization?: Civilization;
  /** Restrict to a race (substring match on the card's race). */
  race?: string;
  /** Only evolution / non-evolution creatures. */
  evolution?: boolean;
}

/** Whose battle zone an effect selects from, relative to the effect's controller. */
export type TargetSide = "own" | "opponent" | "any";

/** A selection of creatures required by an effect. */
export interface TargetSpec {
  side: TargetSide;
  count: number;
  filter?: CreatureFilter;
  /** "You may…" effects can be declined / target fewer. */
  optional?: boolean;
}

/** One-shot effect operations. Executed in order within an ability. */
export type EffectOp =
  | { op: "draw"; who: "self" | "opponent"; count: number }
  | { op: "destroy"; target: TargetSpec }
  | { op: "destroyAll"; side: TargetSide; filter?: CreatureFilter }
  | { op: "bounce"; target: TargetSpec }
  | { op: "tap"; target: TargetSpec }
  | { op: "untap"; target: TargetSpec }
  | { op: "powerMod"; target: TargetSpec; amount: number }
  | { op: "powerModAll"; side: TargetSide; filter?: CreatureFilter; amount: number }
  | { op: "discard"; who: "self" | "opponent"; count: number; random: boolean }
  | { op: "manaCharge"; who: "self" | "opponent"; count: number }
  | { op: "manaToHand"; count: number }
  | { op: "addShield"; count: number }
  | { op: "bounceToDeckTop"; target: TargetSpec }
  | { op: "bounceAll"; side: TargetSide; filter?: CreatureFilter }
  | { op: "powerModSelf"; amount: number }
  | { op: "bounceSelf" }
  | { op: "untapSelf" }
  | { op: "destroySelf" }
  /** Search your deck for a card and put it into your hand, then shuffle. */
  | { op: "searchDeck"; what: "creature" | "spell" | "any" }
  /** Return card(s) from your graveyard to your hand. */
  | { op: "graveToHand"; what: "creature" | "spell" | "any"; count: number; optional?: boolean }
  /** Put one of a player's (face-down, random) shields into their graveyard/hand. */
  | { op: "shieldToGrave"; side: "own" | "opponent" }
  | { op: "shieldToHand"; side: "own" | "opponent" }
  /** Put card(s) from your mana zone into your graveyard (random — they're equivalent picks for the engine). */
  | { op: "manaToGrave"; count: number }
  /** Put card(s) from your hand into your mana zone. */
  | { op: "handToMana"; count: number; optional?: boolean }
  /** Move a creature from the battle zone to its owner's mana zone. */
  | { op: "toMana"; target: TargetSpec }
  /** Grant a temporary keyword until end of turn. */
  | {
      op: "grantKeyword";
      target: TargetSpec;
      keyword: "powerAttacker" | "slayer" | "speedAttacker" | "breaker" | "cantBeBlocked";
      value?: number;
    };

/** When an ability fires. */
export type AbilityTrigger =
  /** "When you put this creature into the battle zone…" */
  | "onSummon"
  /** "When this creature is destroyed…" */
  | "onDestroyed"
  /** "Whenever this creature attacks…" */
  | "onAttack"
  /** Spell effect (resolves on cast). */
  | "spell"
  /** "At the end of your turn…" (rare; used for suicide effects). */
  | "onEndOfTurn";

/** A compiled triggered ability or spell effect. */
export interface Ability {
  trigger: AbilityTrigger;
  effects: EffectOp[];
}

/** Continuous effect active while the source creature is in the battle zone. */
export interface Aura {
  /** Which creatures it affects, relative to the controller. */
  side: TargetSide;
  filter?: CreatureFilter;
  /** Whether the source itself is included. */
  includeSelf?: boolean;
  grants: {
    powerBonus?: number;
    blocker?: boolean;
    speedAttacker?: boolean;
  };
}

/**
 * A fully compiled card the engine can reason about.
 */
export interface CardDefinition {
  cardId: string;
  name: string;
  civilizations: Civilization[];
  cost: number;
  type: PlayableCardType;
  race?: string;
  power?: number;
  rulesText: string[];
  /** Display metadata carried through to GameCards. */
  rarity: string;
  set: string;
  collectorNum: string;
  imageSrc: string;
  keywords: Keywords;
  abilities: Ability[];
  auras: Aura[];
  /** For evolution creatures: race the base creature must have. */
  evolutionRace?: string;
  /** Sentences of rules text the compiler could not translate (card plays as vanilla for those lines). */
  unimplementedText: string[];
}
