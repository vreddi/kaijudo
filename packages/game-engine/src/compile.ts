import { Civilization, Rarity } from "@kaijudo/react-game-types";
import type {
  Ability,
  Aura,
  CardData,
  CardDefinition,
  CreatureFilter,
  EffectOp,
  Keywords,
  PlayableCardType,
  TargetSide,
} from "./types/ability";

/**
 * Compiles raw card database records into CardDefinitions the engine can
 * execute. Rules text is matched against a library of clause templates
 * covering the most common Duel Masters effects; text that doesn't match
 * any template is recorded in `unimplementedText` and the card simply
 * plays without that line (the full text is always shown to players).
 */

const CIV_MAP: Record<string, Civilization> = {
  light: Civilization.Light,
  water: Civilization.Water,
  darkness: Civilization.Darkness,
  fire: Civilization.Fire,
  nature: Civilization.Nature,
};

const RARITY_MAP: Record<string, Rarity> = {
  Common: Rarity.Common,
  Uncommon: Rarity.Uncommon,
  Rare: Rarity.Rare,
  "Very Rare": Rarity.VeryRare,
  "Super Rare": Rarity.SuperRare,
};

export function normalizeCivs(civ: string | string[]): Civilization[] {
  const arr = Array.isArray(civ) ? civ : [civ];
  return arr
    .map((c) => CIV_MAP[c.toLowerCase()])
    .filter((c): c is Civilization => c !== undefined);
}

export function normalizeRarity(rarity: string): Rarity {
  return RARITY_MAP[rarity] ?? Rarity.None;
}

const PLAYABLE_TYPES: Record<string, PlayableCardType> = {
  Creature: "Creature",
  "Evolution Creature": "Evolution Creature",
  Spell: "Spell",
};

/** Strip reminder text in parentheses and normalize whitespace/quotes. */
function cleanLine(line: string): string {
  return line
    .replace(/\([^)]*\)/g, "")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const NUM_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
};

function parseCount(s: string): number {
  const n = Number.parseInt(s, 10);
  if (Number.isFinite(n)) return n;
  return NUM_WORDS[s.toLowerCase()] ?? 1;
}

/** Parse a creature qualifier like `that has power 3000 or less` / `untapped` / `that has "blocker"`. */
function parseFilter(text: string): CreatureFilter | undefined {
  const f: CreatureFilter = {};
  const power = text.match(/power (\d+) or (less|more)/i);
  if (power) {
    if (power[2] === "less") f.maxPower = Number.parseInt(power[1], 10);
    else f.minPower = Number.parseInt(power[1], 10);
  }
  if (/untapped/i.test(text)) f.untapped = true;
  else if (/\btapped\b/i.test(text)) f.tapped = true;
  if (/"blocker"/i.test(text)) f.blocker = true;
  const civ = text.match(/\b(light|water|darkness|fire|nature)\b/i);
  if (civ) f.civilization = CIV_MAP[civ[1].toLowerCase()];
  if (/evolution creature/i.test(text)) f.evolution = true;
  return Object.keys(f).length > 0 ? f : undefined;
}

interface ClauseResult {
  effects?: EffectOp[];
  keywords?: Keywords;
  auras?: Aura[];
  evolutionRace?: string;
}

type ClauseRule = {
  re: RegExp;
  build: (m: RegExpMatchArray) => ClauseResult | null;
};

function side(owner: string): TargetSide {
  const o = owner.toLowerCase();
  if (o.includes("opponent")) return "opponent";
  if (o.includes("your") || o.includes("his") || o.includes("their")) return "own";
  return "any";
}

/**
 * Effect clause templates. Applied to a clause after any trigger prefix
 * has been stripped. Order matters — more specific patterns first.
 */
const EFFECT_RULES: ClauseRule[] = [
  // ---- draw ----
  {
    re: /^(?:you may )?draw (?:up to )?(\w+) cards?\.?$/i,
    build: (m) => ({ effects: [{ op: "draw", who: "self", count: parseCount(m[1]) }] }),
  },
  {
    re: /^(?:you may )?draw (?:up to )?(\w+) cards?\. then discard (\w+) cards? from your hand\.?$/i,
    build: (m) => ({
      effects: [
        { op: "draw", who: "self", count: parseCount(m[1]) },
        { op: "discard", who: "self", count: parseCount(m[2]), random: false },
      ],
    }),
  },
  // ---- destroy all ----
  {
    re: /^destroy all (your opponent's |your )?creatures(?: in the battle zone)?(?: that have (.+?))?\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "destroyAll",
          side: m[1] ? side(m[1]) : "any",
          filter: m[2] ? parseFilter(m[2]) : undefined,
        },
      ],
    }),
  },
  // ---- destroy one ----
  {
    re: /^(?:you may )?destroy (?:up to )?(\w+) of your opponent's (.*?)creatures(?: in the battle zone)?( that has .+?| with .+?)?\.?$/i,
    build: (m) => {
      const qualifier = `${m[2] ?? ""} ${m[3] ?? ""}`;
      return {
        effects: [
          {
            op: "destroy",
            target: {
              side: "opponent",
              count: parseCount(m[1]),
              filter: parseFilter(qualifier),
              optional: false,
            },
          },
        ],
      };
    },
  },
  {
    re: /^destroy (\w+) of your creatures\.?$/i,
    build: (m) => ({
      effects: [
        { op: "destroy", target: { side: "own", count: parseCount(m[1]) } },
      ],
    }),
  },
  {
    re: /^choose (?:one|a) (?:of your opponent's )?creatures? in the battle zone and destroy it\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "destroy",
          target: {
            side: /opponent/i.test(m[0]) ? "opponent" : "any",
            count: 1,
          },
        },
      ],
    }),
  },
  // ---- tap / untap ----
  {
    re: /^(?:you may )?(?:choose (?:up to )?(\w+) of your opponent's creatures?(?: in the battle zone)?(.*?) and tap (?:it|them)|tap all your opponent's creatures(?: in the battle zone)?(?: that have (.+?))?)\.?$/i,
    build: (m) => {
      if (m[1]) {
        return {
          effects: [
            {
              op: "tap",
              target: {
                side: "opponent",
                count: parseCount(m[1]),
                filter: parseFilter(m[2] ?? ""),
              },
            },
          ],
        };
      }
      return {
        effects: [
          {
            op: "tap",
            target: {
              side: "opponent",
              count: 99,
              filter: m[3] ? parseFilter(m[3]) : undefined,
            },
          },
        ],
      };
    },
  },
  {
    re: /^(?:you may )?choose one of your opponent's creatures in the battle zone and tap it\.?$/i,
    build: () => ({
      effects: [{ op: "tap", target: { side: "opponent", count: 1 } }],
    }),
  },
  {
    re: /^untap (?:up to )?(\w+) of your creatures\.?$/i,
    build: (m) => ({
      effects: [
        { op: "untap", target: { side: "own", count: parseCount(m[1]) } },
      ],
    }),
  },
  {
    re: /^untap all (?:your|of your) creatures(?: in the battle zone)?\.?$/i,
    build: () => ({
      effects: [{ op: "untap", target: { side: "own", count: 99 } }],
    }),
  },
  // ---- bounce ----
  {
    re: /^(?:you may )?choose (?:a|one|up to (\w+)) creatures? in the battle zone and return (?:it|them) to (?:its|their) owner'?s'? hands?\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "bounce",
          target: { side: "any", count: m[1] ? parseCount(m[1]) : 1 },
        },
      ],
    }),
  },
  {
    re: /^(?:you may )?(?:choose (?:one|up to (\w+)) of your opponent's creatures(?: in the battle zone)?(.*?) and return (?:it|them) to (?:his|its owner'?s|their owners'?) hands?|return (?:one|up to (\w+)) of your opponent's creatures(.*?) to (?:his|its owner's) hand)\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "bounce",
          target: {
            side: "opponent",
            count: parseCount(m[1] ?? m[3] ?? "one"),
            filter: parseFilter(`${m[2] ?? ""} ${m[4] ?? ""}`),
          },
        },
      ],
    }),
  },
  {
    re: /^return all creatures(?: in the battle zone)? that have (.+?) to (?:its|their) owner'?s'? hands?\.?$/i,
    build: (m) => ({
      effects: [{ op: "bounceAll", side: "any", filter: parseFilter(m[1]) }],
    }),
  },
  // ---- discard ----
  {
    re: /^your opponent discards (?:a|(\w+)) cards? at random from (?:his|their) hand\.?$/i,
    build: (m) => ({
      effects: [
        { op: "discard", who: "opponent", count: parseCount(m[1] ?? "a"), random: true },
      ],
    }),
  },
  {
    re: /^your opponent chooses (?:a|one|(\w+)) cards? from (?:his|their) hand and discards (?:it|them)\.?$/i,
    build: (m) => ({
      effects: [
        { op: "discard", who: "opponent", count: parseCount(m[1] ?? "a"), random: true },
      ],
    }),
  },
  {
    re: /^discard (?:a|(\w+)) cards? from your hand\.?$/i,
    build: (m) => ({
      effects: [
        { op: "discard", who: "self", count: parseCount(m[1] ?? "a"), random: false },
      ],
    }),
  },
  // ---- mana ----
  {
    re: /^(?:you may )?put the top (?:card|(\w+) cards) of your deck into your mana zone\.?$/i,
    build: (m) => ({
      effects: [
        { op: "manaCharge", who: "self", count: m[1] ? parseCount(m[1]) : 1 },
      ],
    }),
  },
  {
    re: /^(?:you may )?return (?:a|one|up to (\w+)) cards? from your mana zone to your hand\.?$/i,
    build: (m) => ({
      effects: [{ op: "manaToHand", count: m[1] ? parseCount(m[1]) : 1 }],
    }),
  },
  // ---- shields ----
  {
    re: /^(?:you may )?add the top (?:card|(\w+) cards) of your deck to your shields face down\.?$/i,
    build: (m) => ({
      effects: [{ op: "addShield", count: m[1] ? parseCount(m[1]) : 1 }],
    }),
  },
  // ---- power mods ----
  {
    re: /^(?:one|(\w+)) of your creatures(?: in the battle zone)? gets \+(\d+) power until the end of the turn\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "powerMod",
          target: { side: "own", count: parseCount(m[1] ?? "one") },
          amount: Number.parseInt(m[2], 10),
        },
      ],
    }),
  },
  {
    re: /^each of your creatures(?: in the battle zone)? gets \+(\d+) power until the end of the turn\.?$/i,
    build: (m) => ({
      effects: [
        { op: "powerModAll", side: "own", amount: Number.parseInt(m[1], 10) },
      ],
    }),
  },
  {
    re: /^choose one of your opponent's (.*?)creatures(?: in the battle zone)?\. that creature gets -(\d+) power until the end of the turn\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "powerMod",
          target: { side: "opponent", count: 1, filter: parseFilter(m[1] ?? "") },
          amount: -Number.parseInt(m[2], 10),
        },
      ],
    }),
  },
  {
    re: /^this creature gets \+(\d+) power until the end of the turn\.?$/i,
    build: (m) => ({
      effects: [{ op: "powerModSelf", amount: Number.parseInt(m[1], 10) }],
    }),
  },
  // ---- deck search ----
  {
    re: /^search your deck\. you may take a (creature|spell|card) from your deck(?:, show (?:that \w+|it) to your opponent,?)? and put it into your hand\. then shuffle your deck\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "searchDeck",
          what: m[1].toLowerCase() === "card" ? "any" : (m[1].toLowerCase() as "creature" | "spell"),
        },
      ],
    }),
  },
  // ---- graveyard recursion ----
  {
    re: /^(?:you may )?return (?:a|one|up to (\w+)) (creature|spell|card)s? from your graveyard to your hand\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "graveToHand",
          what: (m[2].toLowerCase() === "card" ? "any" : m[2].toLowerCase()) as "creature" | "spell" | "any",
          count: m[1] ? parseCount(m[1]) : 1,
          optional: /^you may/i.test(m[0]),
        },
      ],
    }),
  },
  // ---- shield manipulation ----
  {
    re: /^choose one of your shields and put it into your graveyard\.?$/i,
    build: () => ({ effects: [{ op: "shieldToGrave", side: "own" }] }),
  },
  {
    re: /^choose one of your opponent's shields and put it into (?:his|their) graveyard\.?$/i,
    build: () => ({ effects: [{ op: "shieldToGrave", side: "opponent" }] }),
  },
  {
    re: /^choose one of your shields and put it into your hand\.?(?: you can't use the "shield trigger" ability of that shield\.?)?$/i,
    build: () => ({ effects: [{ op: "shieldToHand", side: "own" }] }),
  },
  // ---- mana zone manipulation ----
  {
    re: /^put (\w+) cards? from your mana zone into your graveyard\.?$/i,
    build: (m) => ({ effects: [{ op: "manaToGrave", count: parseCount(m[1]) }] }),
  },
  {
    re: /^(you may )?put (?:a|one|(\w+)) cards? from your hand into your mana zone\.?$/i,
    build: (m) => ({
      effects: [
        { op: "handToMana", count: m[2] ? parseCount(m[2]) : 1, optional: Boolean(m[1]) },
      ],
    }),
  },
  {
    re: /^(?:you may )?choose one of your opponent's creatures in the battle zone and put it into (?:his|their) mana zone\.?$/i,
    build: () => ({ effects: [{ op: "toMana", target: { side: "opponent", count: 1 } }] }),
  },
  {
    re: /^put (\w+) of your creatures from the battle zone into your mana zone\.?$/i,
    build: (m) => ({ effects: [{ op: "toMana", target: { side: "own", count: parseCount(m[1]) } }] }),
  },
  // ---- deck top ----
  {
    re: /^(?:you may )?choose one of your opponent's creatures in the battle zone and put it on top of (?:his|their) deck\.?$/i,
    build: () => ({ effects: [{ op: "bounceToDeckTop", target: { side: "opponent", count: 1 } }] }),
  },
  // ---- temporary keyword grants ----
  {
    re: /^(?:one|(\w+)) of your creatures(?: in the battle zone)? gets "power attacker \+(\d+)"( and "double breaker")? until the end of the turn\.?$/i,
    build: (m) => {
      const effects: EffectOp[] = [
        {
          op: "grantKeyword",
          target: { side: "own", count: parseCount(m[1] ?? "one") },
          keyword: "powerAttacker",
          value: Number.parseInt(m[2], 10),
        },
      ];
      if (m[3]) {
        effects.push({
          op: "grantKeyword",
          target: { side: "own", count: parseCount(m[1] ?? "one") },
          keyword: "breaker",
          value: 2,
        });
      }
      return { effects };
    },
  },
  {
    re: /^(?:one|(\w+)) of your creatures(?: in the battle zone)? gets "(slayer|speed attacker)" until the end of the turn\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "grantKeyword",
          target: { side: "own", count: parseCount(m[1] ?? "one") },
          keyword: m[2].toLowerCase() === "slayer" ? "slayer" : "speedAttacker",
        },
      ],
    }),
  },
  {
    re: /^choose (?:one|up to (\w+)) of your creatures in the battle zone\. (?:it|they) can't be blocked this turn\.?$/i,
    build: (m) => ({
      effects: [
        {
          op: "grantKeyword",
          target: { side: "own", count: m[1] ? parseCount(m[1]) : 1 },
          keyword: "cantBeBlocked",
        },
      ],
    }),
  },
];

/** Keyword-only lines. */
const KEYWORD_RULES: ClauseRule[] = [
  { re: /^double breaker$/i, build: () => ({ keywords: { breaker: 2 } }) },
  { re: /^triple breaker$/i, build: () => ({ keywords: { breaker: 3 } }) },
  { re: /^blocker$/i, build: () => ({ keywords: { blocker: true } }) },
  { re: /^shield trigger$/i, build: () => ({ keywords: { shieldTrigger: true } }) },
  { re: /^speed attacker$/i, build: () => ({ keywords: { speedAttacker: true } }) },
  { re: /^slayer$/i, build: () => ({ keywords: { slayer: true } }) },
  {
    re: /^power attacker \+(\d+)$/i,
    build: (m) => ({ keywords: { powerAttacker: Number.parseInt(m[1], 10) } }),
  },
  {
    re: /^this creature can't attack players\.?$/i,
    build: () => ({ keywords: { cantAttackPlayers: true } }),
  },
  {
    re: /^this creature can't attack\.?$/i,
    build: () => ({ keywords: { cantAttack: true } }),
  },
  {
    re: /^this creature can't attack creatures\.?$/i,
    build: () => ({ keywords: { cantAttackCreatures: true } }),
  },
  {
    re: /^this creature can't be blocked\.?$/i,
    build: () => ({ keywords: { cantBeBlocked: true } }),
  },
  {
    re: /^this creature can attack untapped creatures\.?$/i,
    build: () => ({ keywords: { canAttackUntapped: true } }),
  },
  {
    re: /^this creature attacks each turn if able\.?$/i,
    build: () => ({ keywords: { mustAttack: true } }),
  },
  {
    re: /^this creature wins all battles\.?$/i,
    build: () => ({ keywords: { winsAllBattles: true } }),
  },
  {
    re: /^when this creature would be destroyed, return it to your hand instead\.?$/i,
    build: () => ({ keywords: { destroyedToHand: true } }),
  },
  {
    re: /^when this creature would be destroyed, put it into your mana zone instead\.?$/i,
    build: () => ({ keywords: { destroyedToMana: true } }),
  },
  {
    re: /^when this creature wins a battle, destroy it\.?$/i,
    build: () => ({ keywords: { destroyAfterWinningBattle: true } }),
  },
  {
    re: /^when this creature battles, destroy it after the battle\.?$/i,
    build: () => ({ keywords: { destroyAfterBattle: true } }),
  },
  { re: /^charger$/i, build: () => ({ keywords: { charger: true } }) },
  {
    re: /^this creature can't be blocked by any creature that has power (\d+) or less\.?$/i,
    build: (m) => ({ keywords: { unblockablePowerLE: Number.parseInt(m[1], 10) } }),
  },
  {
    re: /^this creature can't be blocked by (light|water|darkness|fire|nature)(?: or (light|water|darkness|fire|nature))? creatures\.?$/i,
    build: (m) => ({
      keywords: {
        cantBeBlockedByCivs: [m[1], m[2]]
          .filter((c): c is string => Boolean(c))
          .map((c) => CIV_MAP[c.toLowerCase()]),
      },
    }),
  },
  {
    re: /^this creature is put into the battle zone tapped\.?$/i,
    build: () => ({ keywords: { entersTapped: true } }),
  },
];

/** Continuous aura lines. */
const AURA_RULES: ClauseRule[] = [
  {
    re: /^(?:each of your other|your other) (.*?)creatures(?: in the battle zone)? get(?:s)? \+(\d+) power\.?$/i,
    build: (m) => ({
      auras: [
        {
          side: "own",
          filter: parseFilter(m[1] ?? ""),
          includeSelf: false,
          grants: { powerBonus: Number.parseInt(m[2], 10) },
        },
      ],
    }),
  },
  {
    re: /^(?:each of your|all your) (.*?)creatures(?: in the battle zone)? get(?:s)? \+(\d+) power\.?$/i,
    build: (m) => ({
      auras: [
        {
          side: "own",
          filter: parseFilter(m[1] ?? ""),
          includeSelf: true,
          grants: { powerBonus: Number.parseInt(m[2], 10) },
        },
      ],
    }),
  },
];

const TRIGGER_PREFIXES: Array<{ re: RegExp; trigger: Ability["trigger"] }> = [
  { re: /^when you put this creature into the battle zone,\s*/i, trigger: "onSummon" },
  { re: /^when this creature is destroyed,\s*/i, trigger: "onDestroyed" },
  { re: /^whenever this creature attacks,\s*/i, trigger: "onAttack" },
  { re: /^when this creature attacks,\s*/i, trigger: "onAttack" },
];

const END_OF_TURN_RULES: ClauseRule[] = [
  {
    re: /^at the end of your turn, return this creature to your hand\.?$/i,
    build: () => ({
      effects: [{ op: "bounceSelf" }],
    }),
  },
  {
    re: /^at the end of each of your turns, you may untap this creature\.?$/i,
    build: () => ({ effects: [{ op: "untapSelf" }] }),
  },
];

function tryEffectClause(clause: string): EffectOp[] | null {
  for (const rule of EFFECT_RULES) {
    const m = clause.match(rule.re);
    if (m) {
      const res = rule.build(m);
      if (res?.effects) return res.effects;
    }
  }
  return null;
}

/** Compile one card. */
export function compileCard(data: CardData): CardDefinition | null {
  const type = PLAYABLE_TYPES[data.type];
  if (!type) return null;

  const civilizations = normalizeCivs(data.civilization);
  const keywords: Keywords = {};
  const abilities: Ability[] = [];
  const auras: Aura[] = [];
  const unimplemented: string[] = [];
  let evolutionRace: string | undefined;

  const lines = (data.rulesText ?? []).map(cleanLine).filter(Boolean);

  for (const line of lines) {
    // Evolution requirement
    const evo = line.match(/^Evolution—Put on one of your (.+?)\.$/i);
    if (evo) {
      evolutionRace = evo[1].replace(/s$/, "").trim();
      continue;
    }

    let matched = false;
    for (const rule of [...KEYWORD_RULES, ...AURA_RULES]) {
      const m = line.match(rule.re);
      if (m) {
        const res = rule.build(m);
        if (res?.keywords) Object.assign(keywords, res.keywords);
        if (res?.auras) auras.push(...res.auras);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // End-of-turn self effects
    for (const rule of END_OF_TURN_RULES) {
      const m = line.match(rule.re);
      if (m) {
        const res = rule.build(m);
        if (res?.effects) abilities.push({ trigger: "onEndOfTurn", effects: res.effects });
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Triggered abilities
    const prefix = TRIGGER_PREFIXES.find((p) => p.re.test(line));
    if (prefix) {
      const clause = line.replace(prefix.re, "");
      const effects = tryEffectClause(clause);
      if (effects) {
        abilities.push({ trigger: prefix.trigger, effects });
      } else {
        unimplemented.push(line);
      }
      continue;
    }

    // Spell effect lines
    if (type === "Spell") {
      const effects = tryEffectClause(line);
      if (effects) {
        abilities.push({ trigger: "spell", effects });
        continue;
      }
    }

    unimplemented.push(line);
  }

  // Default breaker for creatures: 1 shield.
  if (type !== "Spell" && keywords.breaker === undefined) keywords.breaker = 1;

  return {
    cardId: data.id,
    name: data.name,
    civilizations,
    cost: data.cost,
    type,
    race: data.race || undefined,
    power: type === "Spell" ? undefined : data.power,
    rulesText: data.rulesText ?? [],
    rarity: data.rarity,
    set: data.set,
    collectorNum: data.collectorNum,
    imageSrc: data.imageSrc,
    keywords,
    abilities,
    auras,
    evolutionRace,
    unimplementedText: unimplemented,
  };
}

/** Lookup table of compiled cards, keyed by cardId. */
export type CardRegistry = ReadonlyMap<string, CardDefinition>;

/**
 * Compile the full card database. Cards with unplayable types
 * (Cross Gear, Castle, …) are omitted — they are not deck-legal.
 */
export function buildCardRegistry(cards: CardData[]): CardRegistry {
  const map = new Map<string, CardDefinition>();
  for (const data of cards) {
    const def = compileCard(data);
    if (def) map.set(def.cardId, def);
  }
  return map;
}
