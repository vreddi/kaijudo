import type {
  CardDefinition,
  CreatureFilter,
  EffectOp,
  TargetSide,
  TargetSpec,
} from "./types/ability";
import type { CardRegistry } from "./compile";
import { normalizeRarity } from "./compile";
import type {
  GameAction,
  SummonCreatureAction,
  CastSpellAction,
} from "./types/actions";
import type {
  CardInMana,
  CreatureInBattle,
  GameCard,
} from "./types/card-in-play";
import type { GameConfig } from "./types/config";
import { DEFAULT_GAME_CONFIG } from "./types/config";
import type { PendingDecision, QueuedEffect } from "./types/decision";
import type { GameEvent, GameOverReason } from "./types/events";
import type {
  GameState,
  MatchResult,
  VisibleGameState,
} from "./types/game-state";
import { GameStatus } from "./types/game-state";
import type { PlayerState } from "./types/player-state";
import { TurnPhase } from "./types/turn-phase";
import { randomIndex, seedFromString, shuffle } from "./rng";

/** Thrown when an action is illegal in the current state. */
export class IllegalActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalActionError";
  }
}

export interface NewGamePlayer {
  name: string;
  /** 40 card ids (duplicates allowed up to config.maxCopiesPerCard). */
  deckCardIds: string[];
}

export interface NewGameParams {
  gameId: string;
  /** Any string; hashed into the RNG seed. */
  seed: string;
  players: [NewGamePlayer, NewGamePlayer];
  config?: Partial<GameConfig>;
  /** Timestamp for startedAt/events (Date.now() of the caller). */
  now: number;
}

export interface Engine {
  registry: CardRegistry;
  createGame(params: NewGameParams): GameState;
  /** Apply an action. Throws IllegalActionError on invalid input. */
  applyAction(state: GameState, action: GameAction, now: number): GameState;
  /** All legal actions for a player in the current state. */
  getLegalActions(state: GameState, playerId: 1 | 2): GameAction[];
  /** Player-scoped view with hidden information masked. */
  getVisibleState(state: GameState, playerId: 1 | 2): VisibleGameState;
  /** Validate a deck; returns a list of problems (empty = valid). */
  validateDeck(deckCardIds: string[], config?: Partial<GameConfig>): string[];
}

// ---------------------------------------------------------------------------
// helpers

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> };
type Draft = Mutable<GameState>;

function clone(state: GameState): Draft {
  return JSON.parse(JSON.stringify(state)) as Draft;
}

function other(id: 1 | 2): 1 | 2 {
  return id === 1 ? 2 : 1;
}

function playerOf(state: Draft, id: 1 | 2): Mutable<PlayerState> {
  return id === 1 ? state.player1 : state.player2;
}

/** Create the engine for a compiled card registry. */
export function createEngine(registry: CardRegistry): Engine {
  const def = (cardId: string): CardDefinition => {
    const d = registry.get(cardId);
    if (!d) throw new IllegalActionError(`Unknown card: ${cardId}`);
    return d;
  };

  // -- events ---------------------------------------------------------------

  function emit(state: Draft, now: number, event: Omit<GameEvent, "seq" | "timestamp">): void {
    (state.eventLog as GameEvent[]).push({
      ...(event as GameEvent),
      seq: state.nextEventSeq,
      timestamp: now,
    });
    state.nextEventSeq += 1;
  }

  // -- card lookup ----------------------------------------------------------

  function findCreature(
    state: Draft,
    instanceId: string,
  ): { owner: 1 | 2; creature: Mutable<CreatureInBattle>; index: number } | null {
    for (const id of [1, 2] as const) {
      const p = playerOf(state, id);
      const index = p.battleZone.findIndex((c) => c.instanceId === instanceId);
      if (index >= 0) return { owner: id, creature: p.battleZone[index], index };
    }
    return null;
  }

  function isMulticolored(card: GameCard): boolean {
    return card.civilizations.length > 1;
  }

  // -- power / keywords -----------------------------------------------------

  function effectivePower(
    state: Draft,
    creature: CreatureInBattle,
    owner: 1 | 2,
    opts: { attacking?: boolean } = {},
  ): number {
    const d = def(creature.cardId);
    let power = creature.power;
    if (opts.attacking && d.keywords.powerAttacker) power += d.keywords.powerAttacker;
    for (const mod of state.powerMods) {
      if (mod.instanceId === creature.instanceId) power += mod.amount;
    }
    if (opts.attacking) {
      for (const mod of state.keywordMods) {
        if (mod.instanceId === creature.instanceId && mod.keyword === "powerAttacker") {
          power += mod.value ?? 0;
        }
      }
    }
    // Auras from creatures in the same battle zone (and opposing, side="opponent").
    for (const srcOwner of [1, 2] as const) {
      for (const src of playerOf(state, srcOwner).battleZone) {
        const sd = registry.get(src.cardId);
        if (!sd) continue;
        for (const aura of sd.auras) {
          if (!aura.grants.powerBonus) continue;
          const affectsOwn = aura.side === "own" || aura.side === "any";
          const affectsOpp = aura.side === "opponent" || aura.side === "any";
          const sameSide = srcOwner === owner;
          if (sameSide && !affectsOwn) continue;
          if (!sameSide && !affectsOpp) continue;
          if (src.instanceId === creature.instanceId && !aura.includeSelf) continue;
          if (!matchesFilter(state, creature, owner, aura.filter)) continue;
          power += aura.grants.powerBonus;
        }
      }
    }
    return power;
  }

  function matchesFilter(
    state: Draft,
    creature: CreatureInBattle,
    owner: 1 | 2,
    filter?: CreatureFilter,
  ): boolean {
    if (!filter) return true;
    const d = def(creature.cardId);
    if (filter.blocker && !d.keywords.blocker) return false;
    if (filter.tapped && !creature.tapped) return false;
    if (filter.untapped && creature.tapped) return false;
    if (filter.civilization && !creature.civilizations.includes(filter.civilization)) return false;
    if (filter.race && !(creature.race ?? "").toLowerCase().includes(filter.race.toLowerCase()))
      return false;
    if (filter.evolution !== undefined && (creature.type === "Evolution Creature") !== filter.evolution)
      return false;
    if (filter.maxPower !== undefined || filter.minPower !== undefined) {
      const p = effectivePower(state, creature, owner);
      if (filter.maxPower !== undefined && p > filter.maxPower) return false;
      if (filter.minPower !== undefined && p < filter.minPower) return false;
    }
    return true;
  }

  // -- zone moves -----------------------------------------------------------

  function drawCards(state: Draft, now: number, playerId: 1 | 2, count: number): void {
    const p = playerOf(state, playerId);
    for (let i = 0; i < count; i++) {
      if (p.deck.length === 0) {
        endGame(state, now, other(playerId), "deckOut");
        return;
      }
      const card = p.deck.shift();
      if (card) p.hand.push(card);
    }
  }

  /**
   * Destroy a creature, honoring replacement keywords.
   * Queues its onDestroyed abilities.
   */
  function destroyCreature(
    state: Draft,
    now: number,
    owner: 1 | 2,
    instanceId: string,
    cause: "battle" | "effect",
  ): void {
    const found = findCreature(state, instanceId);
    if (!found || found.owner !== owner) return;
    const p = playerOf(state, owner);
    const creature = found.creature;
    p.battleZone.splice(found.index, 1);
    state.powerMods = state.powerMods.filter((m) => m.instanceId !== instanceId);

    const base: Mutable<GameCard> = { ...creature };
    delete (base as Partial<Mutable<CreatureInBattle>>).tapped;
    delete (base as Partial<Mutable<CreatureInBattle>>).summoningSick;
    delete (base as Partial<Mutable<CreatureInBattle>>).summonedOnTurn;
    const sources = creature.evolutionSources ?? [];
    delete (base as Partial<Mutable<CreatureInBattle>>).evolutionSources;

    const d = def(creature.cardId);
    if (d.keywords.destroyedToHand) {
      p.hand.push(base, ...sources);
      emit(state, now, {
        type: "effect",
        controller: owner,
        sourceName: creature.name,
        description: `${creature.name} returned to hand instead of being destroyed`,
      } as Omit<GameEvent, "seq" | "timestamp">);
      return;
    }
    if (d.keywords.destroyedToMana) {
      p.manaZone.push({ ...base, tapped: false }, ...sources.map((s) => ({ ...s, tapped: false })));
      emit(state, now, {
        type: "effect",
        controller: owner,
        sourceName: creature.name,
        description: `${creature.name} was put into the mana zone instead of being destroyed`,
      } as Omit<GameEvent, "seq" | "timestamp">);
      return;
    }

    p.graveyard.push(base, ...sources);
    emit(state, now, {
      type: "creatureDestroyed",
      creatureInstanceId: instanceId,
      owner,
      cause,
    } as Omit<GameEvent, "seq" | "timestamp">);

    for (const ability of d.abilities) {
      if (ability.trigger === "onDestroyed") {
        for (const op of ability.effects) {
          (state.effectQueue as QueuedEffect[]).push({
            controller: owner,
            sourceInstanceId: instanceId,
            sourceName: creature.name,
            op: op as Mutable<EffectOp>,
          } as Mutable<QueuedEffect>);
        }
      }
    }
  }

  function endGame(state: Draft, now: number, winner: 1 | 2, reason: GameOverReason): void {
    if (state.status === GameStatus.Completed) return;
    state.status = GameStatus.Completed;
    state.pendingDecision = null;
    state.effectQueue = [];
    state.combat = null;
    state.pendingShieldTriggers = null;
    state.timer.activeTimerPlayer = null;
    state.timer.lastTickTimestamp = null;
    const result: MatchResult = {
      winner,
      loser: other(winner),
      reason,
      totalTurns: state.turnNumber,
      durationMs: state.startedAt ? now - state.startedAt : 0,
    };
    state.result = result as Mutable<MatchResult>;
    emit(state, now, {
      type: "gameOver",
      winner,
      loser: other(winner),
      reason,
    } as Omit<GameEvent, "seq" | "timestamp">);
  }

  // -- effect queue ---------------------------------------------------------

  function queueAbilities(
    state: Draft,
    controller: 1 | 2,
    sourceInstanceId: string,
    sourceName: string,
    trigger: "onSummon" | "onAttack" | "spell" | "onEndOfTurn",
    cardId: string,
  ): void {
    const d = def(cardId);
    for (const ability of d.abilities) {
      if (ability.trigger !== trigger) continue;
      for (const op of ability.effects) {
        (state.effectQueue as QueuedEffect[]).push({
          controller,
          sourceInstanceId,
          sourceName,
          op: op as Mutable<EffectOp>,
        } as Mutable<QueuedEffect>);
      }
    }
  }

  function creatureCandidates(
    state: Draft,
    controller: 1 | 2,
    side: TargetSide,
    filter?: CreatureFilter,
  ): string[] {
    const ids: string[] = [];
    const sides: Array<1 | 2> =
      side === "own" ? [controller] : side === "opponent" ? [other(controller)] : [1, 2];
    for (const s of sides) {
      for (const c of playerOf(state, s).battleZone) {
        if (matchesFilter(state, c, s, filter)) ids.push(c.instanceId);
      }
    }
    return ids;
  }

  function describeOp(op: EffectOp): string {
    switch (op.op) {
      case "destroy":
        return "Choose a creature to destroy";
      case "bounce":
        return "Choose a creature to return to its owner's hand";
      case "tap":
        return "Choose a creature to tap";
      case "untap":
        return "Choose a creature to untap";
      case "powerMod":
        return op.amount >= 0
          ? `Choose a creature to get +${op.amount} power`
          : `Choose a creature to get ${op.amount} power`;
      case "bounceToDeckTop":
        return "Choose a creature to put on top of its owner's deck";
      case "manaToHand":
        return "Choose a card in your mana zone to return to your hand";
      default:
        return "Choose a target";
    }
  }

  /** Apply a single-target op to one card (battle zone, mana, hand, deck, or graveyard). */
  function applyOpTo(state: Draft, now: number, eff: QueuedEffect, instanceId: string): void {
    const op = eff.op;
    if (op.op === "manaToHand") {
      const p = playerOf(state, eff.controller);
      const i = p.manaZone.findIndex((c) => c.instanceId === instanceId);
      if (i >= 0) {
        const [card] = p.manaZone.splice(i, 1);
        const { tapped: _tapped, ...rest } = card;
        p.hand.push(rest as Mutable<GameCard>);
      }
      return;
    }
    if (op.op === "manaToGrave") {
      const p = playerOf(state, eff.controller);
      const i = p.manaZone.findIndex((c) => c.instanceId === instanceId);
      if (i >= 0) {
        const [card] = p.manaZone.splice(i, 1);
        const { tapped: _tapped, ...rest } = card;
        p.graveyard.push(rest as Mutable<GameCard>);
      }
      return;
    }
    if (op.op === "handToMana") {
      const p = playerOf(state, eff.controller);
      const i = p.hand.findIndex((c) => c.instanceId === instanceId);
      if (i >= 0) {
        const [card] = p.hand.splice(i, 1);
        p.manaZone.push({ ...card, tapped: false });
      }
      return;
    }
    if (op.op === "searchDeck") {
      const p = playerOf(state, eff.controller);
      const i = p.deck.findIndex((c) => c.instanceId === instanceId);
      if (i >= 0) {
        const [card] = p.deck.splice(i, 1);
        p.hand.push(card);
      }
      const [nextRng, shuffled] = shuffle(state.rngState, p.deck);
      state.rngState = nextRng;
      p.deck = shuffled as Mutable<PlayerState["deck"]>;
      return;
    }
    if (op.op === "graveToHand") {
      const p = playerOf(state, eff.controller);
      const i = p.graveyard.findIndex((c) => c.instanceId === instanceId);
      if (i >= 0) {
        const [card] = p.graveyard.splice(i, 1);
        p.hand.push(card);
      }
      return;
    }
    if (op.op === "grantKeyword") {
      (state.keywordMods as Mutable<GameState["keywordMods"]>).push({
        instanceId,
        keyword: op.keyword,
        value: op.value,
      });
      return;
    }
    if (op.op === "toMana") {
      const found = findCreature(state, instanceId);
      if (!found) return;
      const p = playerOf(state, found.owner);
      p.battleZone.splice(found.index, 1);
      const { tapped: _t, summoningSick: _s, summonedOnTurn: _o, evolutionSources, ...rest } =
        found.creature;
      p.manaZone.push(
        { ...(rest as Mutable<GameCard>), tapped: false },
        ...((evolutionSources ?? []) as Mutable<GameCard>[]).map((s) => ({ ...s, tapped: false })),
      );
      state.powerMods = state.powerMods.filter((m) => m.instanceId !== instanceId);
      return;
    }
    const found = findCreature(state, instanceId);
    if (!found) return;
    switch (op.op) {
      case "destroy":
        destroyCreature(state, now, found.owner, instanceId, "effect");
        break;
      case "bounce": {
        const p = playerOf(state, found.owner);
        p.battleZone.splice(found.index, 1);
        const { tapped: _t, summoningSick: _s, summonedOnTurn: _o, evolutionSources, ...rest } =
          found.creature;
        p.hand.push(rest as Mutable<GameCard>, ...((evolutionSources ?? []) as Mutable<GameCard>[]));
        state.powerMods = state.powerMods.filter((m) => m.instanceId !== instanceId);
        break;
      }
      case "bounceToDeckTop": {
        const p = playerOf(state, found.owner);
        p.battleZone.splice(found.index, 1);
        const { tapped: _t, summoningSick: _s, summonedOnTurn: _o, evolutionSources, ...rest } =
          found.creature;
        p.deck.unshift(rest as Mutable<GameCard>, ...((evolutionSources ?? []) as Mutable<GameCard>[]));
        state.powerMods = state.powerMods.filter((m) => m.instanceId !== instanceId);
        break;
      }
      case "tap":
        found.creature.tapped = true;
        break;
      case "untap":
        found.creature.tapped = false;
        break;
      case "powerMod": {
        (state.powerMods as Mutable<GameState["powerMods"]>).push({
          instanceId,
          amount: op.amount,
        });
        // -N power effects destroy creatures reduced to 0 or less.
        if (effectivePower(state, found.creature, found.owner) <= 0) {
          destroyCreature(state, now, found.owner, instanceId, "effect");
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Resolve queued effects until a decision is required, the queue drains,
   * or the game ends. Then surface pending shield triggers if any.
   */
  function processQueue(state: Draft, now: number): void {
    while (
      state.status === GameStatus.InProgress &&
      !state.pendingDecision &&
      state.effectQueue.length > 0
    ) {
      const eff = (state.effectQueue as QueuedEffect[]).shift();
      if (!eff) break;
      const op = eff.op;
      const controller = eff.controller;
      const opponent = other(controller);

      switch (op.op) {
        case "draw": {
          const who = op.who === "self" ? controller : opponent;
          drawCards(state, now, who, op.count);
          emit(state, now, {
            type: "effect",
            controller,
            sourceName: eff.sourceName,
            description: `${eff.sourceName}: player ${who} drew ${op.count} card${op.count > 1 ? "s" : ""}`,
          } as Omit<GameEvent, "seq" | "timestamp">);
          break;
        }
        case "destroyAll":
        case "bounceAll": {
          const ids = creatureCandidates(state, controller, op.side, op.filter);
          for (const id of ids) {
            applyOpTo(state, now, {
              ...eff,
              op: op.op === "destroyAll"
                ? ({ op: "destroy", target: { side: op.side, count: ids.length } } as EffectOp)
                : ({ op: "bounce", target: { side: op.side, count: ids.length } } as EffectOp),
            } as QueuedEffect, id);
          }
          emit(state, now, {
            type: "effect",
            controller,
            sourceName: eff.sourceName,
            description: `${eff.sourceName}: affected ${ids.length} creature${ids.length === 1 ? "" : "s"}`,
          } as Omit<GameEvent, "seq" | "timestamp">);
          break;
        }
        case "powerModAll": {
          const ids = creatureCandidates(state, controller, op.side, op.filter);
          for (const id of ids) {
            applyOpTo(state, now, {
              ...eff,
              op: { op: "powerMod", target: { side: op.side, count: ids.length }, amount: op.amount } as EffectOp,
            } as QueuedEffect, id);
          }
          break;
        }
        case "destroy":
        case "bounce":
        case "bounceToDeckTop":
        case "tap":
        case "untap":
        case "powerMod":
        case "toMana":
        case "grantKeyword": {
          const target: TargetSpec = op.target;
          const ids = creatureCandidates(state, controller, target.side, target.filter);
          if (ids.length === 0) break;
          if (target.count >= ids.length && !target.optional) {
            // No real choice — auto-apply to all matching.
            for (const id of ids) applyOpTo(state, now, eff as QueuedEffect, id);
            break;
          }
          state.pendingDecision = {
            kind: "chooseTargets",
            playerId: controller,
            sourceInstanceId: eff.sourceInstanceId,
            sourceName: eff.sourceName,
            description: describeOp(op),
            target: target as Mutable<TargetSpec>,
            candidateIds: ids,
            count: Math.min(target.count, ids.length),
            optional: target.optional ?? false,
          } as Draft["pendingDecision"];
          // Stash the op so the decision handler can re-run it.
          (state as DraftWithPendingOp).pendingOp = eff as QueuedEffect;
          break;
        }
        case "manaToHand":
        case "manaToGrave": {
          const p = playerOf(state, controller);
          if (p.manaZone.length === 0) break;
          state.pendingDecision = {
            kind: "chooseTargets",
            playerId: controller,
            sourceInstanceId: eff.sourceInstanceId,
            sourceName: eff.sourceName,
            description: describeOp(op),
            target: { side: "own", count: op.count } as Mutable<TargetSpec>,
            candidateIds: p.manaZone.map((c) => c.instanceId),
            count: Math.min(op.count, p.manaZone.length),
            optional: false,
          } as Draft["pendingDecision"];
          (state as DraftWithPendingOp).pendingOp = eff as QueuedEffect;
          break;
        }
        case "handToMana": {
          const p = playerOf(state, controller);
          if (p.hand.length === 0) break;
          state.pendingDecision = {
            kind: "chooseTargets",
            playerId: controller,
            sourceInstanceId: eff.sourceInstanceId,
            sourceName: eff.sourceName,
            description: "Choose a card from your hand to put into your mana zone",
            target: { side: "own", count: op.count, optional: op.optional } as Mutable<TargetSpec>,
            candidateIds: p.hand.map((c) => c.instanceId),
            count: Math.min(op.count, p.hand.length),
            optional: op.optional ?? false,
          } as Draft["pendingDecision"];
          (state as DraftWithPendingOp).pendingOp = eff as QueuedEffect;
          break;
        }
        case "searchDeck": {
          const p = playerOf(state, controller);
          const candidates = p.deck.filter((c) => {
            if (op.what === "any") return true;
            if (op.what === "spell") return c.type === "Spell";
            return c.type === "Creature" || c.type === "Evolution Creature";
          });
          if (candidates.length === 0) {
            // Still shuffle (the deck was searched).
            const [nextRng, shuffled] = shuffle(state.rngState, p.deck);
            state.rngState = nextRng;
            p.deck = shuffled as Mutable<PlayerState["deck"]>;
            break;
          }
          state.pendingDecision = {
            kind: "chooseTargets",
            playerId: controller,
            sourceInstanceId: eff.sourceInstanceId,
            sourceName: eff.sourceName,
            description: `Search your deck for a ${op.what === "any" ? "card" : op.what}`,
            target: { side: "own", count: 1, optional: true } as Mutable<TargetSpec>,
            candidateIds: candidates.map((c) => c.instanceId),
            count: 1,
            optional: true,
          } as Draft["pendingDecision"];
          (state as DraftWithPendingOp).pendingOp = eff as QueuedEffect;
          break;
        }
        case "graveToHand": {
          const p = playerOf(state, controller);
          const candidates = p.graveyard.filter((c) => {
            if (op.what === "any") return true;
            if (op.what === "spell") return c.type === "Spell";
            return c.type === "Creature" || c.type === "Evolution Creature";
          });
          if (candidates.length === 0) break;
          if (candidates.length <= op.count && !op.optional) {
            for (const c of candidates) applyOpTo(state, now, eff as QueuedEffect, c.instanceId);
            break;
          }
          state.pendingDecision = {
            kind: "chooseTargets",
            playerId: controller,
            sourceInstanceId: eff.sourceInstanceId,
            sourceName: eff.sourceName,
            description: `Return a ${op.what === "any" ? "card" : op.what} from your graveyard to your hand`,
            target: { side: "own", count: op.count, optional: op.optional } as Mutable<TargetSpec>,
            candidateIds: candidates.map((c) => c.instanceId),
            count: Math.min(op.count, candidates.length),
            optional: op.optional ?? false,
          } as Draft["pendingDecision"];
          (state as DraftWithPendingOp).pendingOp = eff as QueuedEffect;
          break;
        }
        case "shieldToGrave":
        case "shieldToHand": {
          const who = op.side === "own" ? controller : opponent;
          const p = playerOf(state, who);
          if (p.shieldZone.length === 0) break;
          const [nextRng, idx] = randomIndex(state.rngState, p.shieldZone.length);
          state.rngState = nextRng;
          const [shield] = p.shieldZone.splice(idx, 1);
          if (op.op === "shieldToGrave") p.graveyard.push(shield);
          else p.hand.push(shield);
          emit(state, now, {
            type: "effect",
            controller,
            sourceName: eff.sourceName,
            description: `${eff.sourceName}: a shield was put into the ${op.op === "shieldToGrave" ? "graveyard" : "hand"}`,
          } as Omit<GameEvent, "seq" | "timestamp">);
          break;
        }
        case "discard": {
          const who = op.who === "self" ? controller : opponent;
          const p = playerOf(state, who);
          if (p.hand.length === 0) break;
          if (op.random || who !== controller) {
            for (let i = 0; i < op.count && p.hand.length > 0; i++) {
              const [nextState, idx] = randomIndex(state.rngState, p.hand.length);
              state.rngState = nextState;
              const [card] = p.hand.splice(idx, 1);
              p.graveyard.push(card);
              emit(state, now, {
                type: "effect",
                controller,
                sourceName: eff.sourceName,
                description: `${eff.sourceName}: player ${who} discarded ${card.name}`,
              } as Omit<GameEvent, "seq" | "timestamp">);
            }
          } else {
            state.pendingDecision = {
              kind: "discard",
              playerId: who,
              count: Math.min(op.count, p.hand.length),
              candidateIds: p.hand.map((c) => c.instanceId),
            } as Draft["pendingDecision"];
          }
          break;
        }
        case "manaCharge": {
          const who = op.who === "self" ? controller : opponent;
          const p = playerOf(state, who);
          for (let i = 0; i < op.count && p.deck.length > 0; i++) {
            const card = p.deck.shift();
            if (card) p.manaZone.push({ ...card, tapped: false });
          }
          emit(state, now, {
            type: "effect",
            controller,
            sourceName: eff.sourceName,
            description: `${eff.sourceName}: put top of deck into mana zone`,
          } as Omit<GameEvent, "seq" | "timestamp">);
          break;
        }
        case "addShield": {
          const p = playerOf(state, controller);
          for (let i = 0; i < op.count && p.deck.length > 0; i++) {
            const card = p.deck.shift();
            if (card) p.shieldZone.push(card);
          }
          emit(state, now, {
            type: "effect",
            controller,
            sourceName: eff.sourceName,
            description: `${eff.sourceName}: added a shield`,
          } as Omit<GameEvent, "seq" | "timestamp">);
          break;
        }
        case "powerModSelf": {
          applyOpTo(state, now, {
            ...eff,
            op: { op: "powerMod", target: { side: "own", count: 1 }, amount: op.amount } as EffectOp,
          } as QueuedEffect, eff.sourceInstanceId);
          break;
        }
        case "bounceSelf": {
          applyOpTo(state, now, {
            ...eff,
            op: { op: "bounce", target: { side: "own", count: 1 } } as EffectOp,
          } as QueuedEffect, eff.sourceInstanceId);
          break;
        }
        case "untapSelf": {
          applyOpTo(state, now, {
            ...eff,
            op: { op: "untap", target: { side: "own", count: 1 } } as EffectOp,
          } as QueuedEffect, eff.sourceInstanceId);
          break;
        }
        case "destroySelf": {
          const found = findCreature(state, eff.sourceInstanceId);
          if (found) destroyCreature(state, now, found.owner, eff.sourceInstanceId, "effect");
          break;
        }
        default:
          break;
      }
    }

    // Surface remaining shield triggers once effects settle.
    if (
      state.status === GameStatus.InProgress &&
      !state.pendingDecision &&
      state.effectQueue.length === 0 &&
      state.pendingShieldTriggers
    ) {
      const { playerId, candidateIds } = state.pendingShieldTriggers;
      const p = playerOf(state, playerId);
      const stillInHand = candidateIds.filter((id) =>
        p.hand.some((c) => c.instanceId === id),
      );
      if (stillInHand.length > 0) {
        state.pendingDecision = {
          kind: "shieldTrigger",
          playerId,
          candidateIds: stillInHand,
        } as Draft["pendingDecision"];
      } else {
        state.pendingShieldTriggers = null;
      }
    }
  }

  // The op awaiting target selection; serialized with the state.
  type DraftWithPendingOp = Draft & { pendingOp?: QueuedEffect | null };

  // -- combat ---------------------------------------------------------------

  function hasUntappedBlockers(state: Draft, defender: 1 | 2): string[] {
    return playerOf(state, defender)
      .battleZone.filter((c) => !c.tapped && def(c.cardId).keywords.blocker)
      .map((c) => c.instanceId);
  }

  function battle(
    state: Draft,
    now: number,
    attackerId: string,
    attackerOwner: 1 | 2,
    defenderId: string,
  ): void {
    const a = findCreature(state, attackerId);
    const b = findCreature(state, defenderId);
    if (!a || !b) return;
    const ad = def(a.creature.cardId);
    const bd = def(b.creature.cardId);
    const ap = effectivePower(state, a.creature, a.owner, { attacking: true });
    const bp = effectivePower(state, b.creature, b.owner);

    let attackerDies: boolean;
    let defenderDies: boolean;
    if (ad.keywords.winsAllBattles && !bd.keywords.winsAllBattles) {
      attackerDies = false;
      defenderDies = true;
    } else if (bd.keywords.winsAllBattles && !ad.keywords.winsAllBattles) {
      attackerDies = true;
      defenderDies = false;
    } else if (ap > bp) {
      attackerDies = false;
      defenderDies = true;
    } else if (bp > ap) {
      attackerDies = true;
      defenderDies = false;
    } else {
      attackerDies = true;
      defenderDies = true;
    }
    // Slayer destroys whatever it battles (keyword or temporary grant).
    const hasSlayer = (id: string, kw: boolean | undefined): boolean =>
      Boolean(kw) ||
      state.keywordMods.some((m) => m.instanceId === id && m.keyword === "slayer");
    if (hasSlayer(attackerId, ad.keywords.slayer)) defenderDies = true;
    if (hasSlayer(defenderId, bd.keywords.slayer)) attackerDies = true;
    // Self-destruct after battle keywords.
    if (ad.keywords.destroyAfterBattle) attackerDies = true;
    if (bd.keywords.destroyAfterBattle) defenderDies = true;
    if (ad.keywords.destroyAfterWinningBattle && !attackerDies) attackerDies = true;
    if (bd.keywords.destroyAfterWinningBattle && !defenderDies) defenderDies = true;

    emit(state, now, {
      type: "battle",
      attackerInstanceId: attackerId,
      defenderInstanceId: defenderId,
      outcome: attackerDies && defenderDies
        ? "bothDestroyed"
        : attackerDies
          ? "defenderWins"
          : "attackerWins",
    } as Omit<GameEvent, "seq" | "timestamp">);

    if (defenderDies) destroyCreature(state, now, b.owner, defenderId, "battle");
    if (attackerDies) destroyCreature(state, now, a.owner, attackerId, "battle");
  }

  function breakShields(state: Draft, now: number, attackerId: string, attackerOwner: 1 | 2): void {
    const defender = other(attackerOwner);
    const p = playerOf(state, defender);
    const attacker = findCreature(state, attackerId);
    if (!attacker) return;
    const d = def(attacker.creature.cardId);
    let breaker = d.keywords.breaker ?? 1;
    for (const mod of state.keywordMods) {
      if (mod.instanceId === attackerId && mod.keyword === "breaker") {
        breaker = Math.max(breaker, mod.value ?? 1);
      }
    }
    const count = Math.min(breaker, p.shieldZone.length);
    const triggers: string[] = [];
    for (let i = 0; i < count; i++) {
      const [randState, idx] = randomIndex(state.rngState, p.shieldZone.length);
      state.rngState = randState;
      const [shield] = p.shieldZone.splice(idx, 1);
      p.hand.push(shield);
      emit(state, now, {
        type: "shieldBreak",
        defendingPlayer: defender,
        shieldCardInstanceId: shield.instanceId,
        attackerInstanceId: attackerId,
      } as Omit<GameEvent, "seq" | "timestamp">);
      const sd = registry.get(shield.cardId);
      if (sd?.keywords.shieldTrigger) triggers.push(shield.instanceId);
    }
    if (triggers.length > 0) {
      state.pendingShieldTriggers = {
        playerId: defender,
        candidateIds: triggers,
      } as Draft["pendingShieldTriggers"];
    }
  }

  /** Continue the current attack after the block decision (or absence of blockers). */
  function resolveAttack(state: Draft, now: number): void {
    const combat = state.combat;
    if (!combat) return;
    const attacker = findCreature(state, combat.attackerInstanceId);
    state.combat = null;
    if (!attacker) return; // attacker died to an onAttack effect etc.

    if (combat.blockerInstanceId) {
      const blocker = findCreature(state, combat.blockerInstanceId);
      if (blocker) {
        blocker.creature.tapped = true;
        battle(state, now, combat.attackerInstanceId, combat.attackerPlayer, combat.blockerInstanceId);
        return;
      }
    }

    if (combat.target === "player") {
      const defender = other(combat.attackerPlayer);
      const shields = playerOf(state, defender).shieldZone.length;
      if (shields === 0) {
        endGame(state, now, combat.attackerPlayer, "directAttack");
        return;
      }
      breakShields(state, now, combat.attackerInstanceId, combat.attackerPlayer);
      return;
    }

    // Attack on a creature — it may have died to an onAttack effect.
    const target = findCreature(state, combat.target);
    if (target) {
      battle(state, now, combat.attackerInstanceId, combat.attackerPlayer, combat.target);
    }
  }

  // -- mana -----------------------------------------------------------------

  function untappedMana(p: PlayerState): CardInMana[] {
    return p.manaZone.filter((c) => !c.tapped);
  }

  /**
   * Choose mana cards to pay for a card. Every civilization of the card
   * must appear among the tapped mana. Returns null if unpayable.
   */
  function autoSelectMana(p: PlayerState, card: CardDefinition): string[] | null {
    const available = untappedMana(p);
    if (available.length < card.cost) return null;
    const chosen: CardInMana[] = [];
    const needed = new Set(card.civilizations);
    // First cover each required civilization.
    for (const civ of card.civilizations) {
      const found = available.find(
        (c) => !chosen.includes(c) && c.civilizations.includes(civ),
      );
      if (found) {
        chosen.push(found);
        needed.delete(civ);
      }
    }
    if (needed.size > 0) return null;
    if (chosen.length > card.cost) return null; // more civs than cost (can't happen in practice)
    // Fill the rest with any untapped mana.
    for (const c of available) {
      if (chosen.length >= card.cost) break;
      if (!chosen.includes(c)) chosen.push(c);
    }
    if (chosen.length < card.cost) return null;
    return chosen.map((c) => c.instanceId);
  }

  function payMana(state: Draft, playerId: 1 | 2, cardDef: CardDefinition, manaTapIds: string[]): void {
    const p = playerOf(state, playerId);
    const ids = manaTapIds.length > 0 ? manaTapIds : autoSelectMana(p, cardDef);
    if (!ids) throw new IllegalActionError(`Not enough mana for ${cardDef.name}`);
    if (ids.length !== cardDef.cost) {
      throw new IllegalActionError(
        `${cardDef.name} costs ${cardDef.cost}, got ${ids.length} mana`,
      );
    }
    const cards: Mutable<CardInMana>[] = [];
    for (const id of ids) {
      const c = p.manaZone.find((m) => m.instanceId === id);
      if (!c) throw new IllegalActionError(`Mana card not found: ${id}`);
      if (c.tapped) throw new IllegalActionError("Mana card already tapped");
      if (cards.includes(c)) throw new IllegalActionError("Duplicate mana card");
      cards.push(c);
    }
    for (const civ of cardDef.civilizations) {
      if (!cards.some((c) => c.civilizations.includes(civ))) {
        throw new IllegalActionError(`Payment must include ${civ} mana`);
      }
    }
    for (const c of cards) c.tapped = true;
  }

  // -- timers ---------------------------------------------------------------

  function tickTimer(state: Draft, now: number): void {
    const t = state.timer;
    if (t.activeTimerPlayer && t.lastTickTimestamp !== null) {
      const elapsed = Math.max(0, now - t.lastTickTimestamp);
      if (t.activeTimerPlayer === 1) t.player1RemainingMs -= elapsed;
      else t.player2RemainingMs -= elapsed;
      t.lastTickTimestamp = now;
      if (t.player1RemainingMs <= 0) {
        t.player1RemainingMs = 0;
        endGame(state, now, 2, "timerExpired");
      } else if (t.player2RemainingMs <= 0) {
        t.player2RemainingMs = 0;
        endGame(state, now, 1, "timerExpired");
      }
    }
  }

  /** Whose input the game is currently waiting on. */
  function waitingOn(state: GameState): 1 | 2 {
    return state.pendingDecision ? state.pendingDecision.playerId : state.activePlayer;
  }

  function switchTimer(state: Draft, now: number): void {
    const player = waitingOn(state);
    state.timer.activeTimerPlayer = player;
    state.timer.lastTickTimestamp = now;
  }

  // -- turn flow ------------------------------------------------------------

  function startTurn(state: Draft, now: number): void {
    const p = playerOf(state, state.activePlayer);
    // Untap step
    for (const c of p.battleZone) {
      if (!def(c.cardId).keywords.doesntUntap) c.tapped = false;
      if (c.summonedOnTurn < state.turnNumber) c.summoningSick = false;
    }
    for (const m of p.manaZone) m.tapped = false;
    p.hasChargedMana = false;
    // Draw step
    const skipDraw =
      state.turnNumber === 1 && state.activePlayer === 1 && state.config.skipFirstDraw;
    if (!skipDraw) drawCards(state, now, state.activePlayer, 1);
    state.currentPhase = TurnPhase.ChargeMana;
  }

  function endTurn(state: Draft, now: number): void {
    const active = state.activePlayer;
    const p = playerOf(state, active);
    // End-of-turn abilities (return to hand, untap self, …)
    for (const c of [...p.battleZone]) {
      queueAbilities(state, active, c.instanceId, c.name, "onEndOfTurn", c.cardId);
    }
    processQueue(state, now);
    if (state.status !== GameStatus.InProgress || state.pendingDecision) {
      // Extremely rare: an end-of-turn effect required a choice. Finish the
      // turn switch after it resolves — handled by deferring below.
    }
    state.powerMods = [];
    state.keywordMods = [];
    state.combat = null;
    state.activePlayer = other(active);
    state.turnNumber += 1;
    emit(state, now, {
      type: "turnChange",
      turnNumber: state.turnNumber,
      activePlayer: state.activePlayer,
    } as Omit<GameEvent, "seq" | "timestamp">);
    if (state.status === GameStatus.InProgress) startTurn(state, now);
  }

  // -- summon / cast --------------------------------------------------------

  function summonCreature(state: Draft, now: number, action: SummonCreatureAction): void {
    const p = playerOf(state, action.playerId);
    const idx = p.hand.findIndex((c) => c.instanceId === action.cardInstanceId);
    if (idx < 0) throw new IllegalActionError("Card not in hand");
    const card = p.hand[idx];
    const d = def(card.cardId);
    if (d.type === "Spell") throw new IllegalActionError("Cannot summon a spell");

    let evolutionSources: GameCard[] = [];
    let baseCreature: Mutable<CreatureInBattle> | null = null;
    if (d.type === "Evolution Creature") {
      const baseId = action.evolutionBaseInstanceId;
      if (!baseId) throw new IllegalActionError(`${d.name} needs a creature to evolve`);
      const found = findCreature(state, baseId);
      if (!found || found.owner !== action.playerId) {
        throw new IllegalActionError("Evolution base must be your creature");
      }
      if (!evolutionBaseMatches(d, found.creature)) {
        throw new IllegalActionError(`${found.creature.name} can't evolve into ${d.name}`);
      }
      baseCreature = found.creature;
    }

    payMana(state, action.playerId, d, action.manaTapIds);
    p.hand.splice(idx, 1);

    if (baseCreature) {
      const found = findCreature(state, baseCreature.instanceId);
      if (found) {
        playerOf(state, found.owner).battleZone.splice(found.index, 1);
        const { tapped: _t, summoningSick: _s, summonedOnTurn: _o, evolutionSources: nested, ...rest } =
          baseCreature;
        evolutionSources = [rest as GameCard, ...((nested ?? []) as GameCard[])];
      }
    }

    const creature: Mutable<CreatureInBattle> = {
      ...(card as Mutable<GameCard>),
      type: d.type,
      power: d.power ?? 0,
      tapped: Boolean(d.keywords.entersTapped),
      // Evolution and speed attacker creatures can attack immediately.
      summoningSick: !(d.keywords.speedAttacker || d.type === "Evolution Creature"),
      summonedOnTurn: state.turnNumber,
      evolutionSources: evolutionSources as Mutable<CreatureInBattle["evolutionSources"]>,
    };
    p.battleZone.push(creature);
    queueAbilities(state, action.playerId, creature.instanceId, creature.name, "onSummon", card.cardId);
  }

  function evolutionBaseMatches(evo: CardDefinition, base: CreatureInBattle): boolean {
    if (!evo.evolutionRace) return true;
    const req = evo.evolutionRace.toLowerCase();
    if (req === "creature" || req === "creatures") return true;
    return (base.race ?? "").toLowerCase().includes(req.replace(/s$/, ""));
  }

  function castSpell(
    state: Draft,
    now: number,
    action: CastSpellAction,
    opts: { free?: boolean } = {},
  ): void {
    const p = playerOf(state, action.playerId);
    const idx = p.hand.findIndex((c) => c.instanceId === action.cardInstanceId);
    if (idx < 0) throw new IllegalActionError("Card not in hand");
    const card = p.hand[idx];
    const d = def(card.cardId);
    if (d.type !== "Spell") throw new IllegalActionError(`${d.name} is not a spell`);
    if (!opts.free) payMana(state, action.playerId, d, action.manaTapIds);
    p.hand.splice(idx, 1);
    // Charger spells go to the mana zone after casting; others to the graveyard.
    if (d.keywords.charger) {
      p.manaZone.push({ ...(card as Mutable<GameCard>), tapped: false });
    } else {
      p.graveyard.push(card);
    }
    queueAbilities(state, action.playerId, card.instanceId, card.name, "spell", card.cardId);
  }

  /** Play a shield trigger card for free. */
  function playShieldTrigger(state: Draft, now: number, playerId: 1 | 2, instanceId: string): void {
    const p = playerOf(state, playerId);
    const card = p.hand.find((c) => c.instanceId === instanceId);
    if (!card) throw new IllegalActionError("Shield trigger card not in hand");
    const d = def(card.cardId);
    if (d.type === "Spell") {
      castSpell(
        state,
        now,
        { type: "castSpell", playerId, cardInstanceId: instanceId, manaTapIds: [] },
        { free: true },
      );
    } else {
      // Shield trigger creature: put into battle zone for free.
      const idx = p.hand.findIndex((c) => c.instanceId === instanceId);
      p.hand.splice(idx, 1);
      const creature: Mutable<CreatureInBattle> = {
        ...(card as Mutable<GameCard>),
        type: d.type as "Creature",
        power: d.power ?? 0,
        tapped: Boolean(d.keywords.entersTapped),
        summoningSick: !d.keywords.speedAttacker,
        summonedOnTurn: state.turnNumber,
        evolutionSources: [],
      };
      p.battleZone.push(creature);
      queueAbilities(state, playerId, creature.instanceId, creature.name, "onSummon", card.cardId);
    }
    emit(state, now, {
      type: "effect",
      controller: playerId,
      sourceName: card.name,
      description: `Shield trigger: ${card.name}`,
    } as Omit<GameEvent, "seq" | "timestamp">);
  }

  // -- attack helpers ---------------------------------------------------------

  function canAttack(state: Draft, creature: CreatureInBattle): boolean {
    if (creature.tapped) return false;
    const d = def(creature.cardId);
    if (d.keywords.cantAttack) return false;
    if (creature.summoningSick) {
      // A temporary "speed attacker" grant lifts summoning sickness.
      const granted = state.keywordMods.some(
        (m) => m.instanceId === creature.instanceId && m.keyword === "speedAttacker",
      );
      if (!granted) return false;
    }
    return true;
  }

  function beginAttack(
    state: Draft,
    now: number,
    playerId: 1 | 2,
    attackerInstanceId: string,
    target: "player" | string,
  ): void {
    const found = findCreature(state, attackerInstanceId);
    if (!found || found.owner !== playerId) throw new IllegalActionError("Attacker not found");
    const attacker = found.creature;
    const d = def(attacker.cardId);
    if (!canAttack(state, attacker)) throw new IllegalActionError(`${attacker.name} can't attack now`);
    if (target === "player" && d.keywords.cantAttackPlayers) {
      throw new IllegalActionError(`${attacker.name} can't attack players`);
    }
    if (target !== "player") {
      if (d.keywords.cantAttackCreatures) {
        throw new IllegalActionError(`${attacker.name} can't attack creatures`);
      }
      const t = findCreature(state, target);
      if (!t || t.owner !== other(playerId)) throw new IllegalActionError("Invalid attack target");
      if (!t.creature.tapped && !d.keywords.canAttackUntapped) {
        throw new IllegalActionError("Can only attack tapped creatures");
      }
    }

    attacker.tapped = true;
    state.combat = {
      attackerPlayer: playerId,
      attackerInstanceId,
      target,
      blockerInstanceId: null,
    } as Draft["combat"];

    queueAbilities(state, playerId, attackerInstanceId, attacker.name, "onAttack", attacker.cardId);
    processQueue(state, now);
    if (state.status !== GameStatus.InProgress) return;

    if (!state.pendingDecision) {
      offerBlockOrResolve(state, now);
    }
    // If an onAttack effect requires targets, the block offer happens after
    // the decision resolves (handled in applyAction's post-processing).
  }

  function offerBlockOrResolve(state: Draft, now: number): void {
    const combat = state.combat;
    if (!combat) return;
    const defender = other(combat.attackerPlayer);
    const attacker = findCreature(state, combat.attackerInstanceId);
    if (!attacker) {
      state.combat = null;
      return;
    }
    const d = def(attacker.creature.cardId);
    const unblockable =
      d.keywords.cantBeBlocked ||
      state.keywordMods.some(
        (m) => m.instanceId === combat.attackerInstanceId && m.keyword === "cantBeBlocked",
      );
    let blockers = unblockable ? [] : hasUntappedBlockers(state, defender);
    if (blockers.length > 0 && (d.keywords.unblockablePowerLE || d.keywords.cantBeBlockedByCivs)) {
      blockers = blockers.filter((id) => {
        const b = findCreature(state, id);
        if (!b) return false;
        if (
          d.keywords.unblockablePowerLE !== undefined &&
          effectivePower(state, b.creature, b.owner) <= d.keywords.unblockablePowerLE
        ) {
          return false;
        }
        if (
          d.keywords.cantBeBlockedByCivs?.some((civ) => b.creature.civilizations.includes(civ))
        ) {
          return false;
        }
        return true;
      });
    }
    if (blockers.length > 0) {
      state.pendingDecision = {
        kind: "block",
        playerId: defender,
        attackerInstanceId: combat.attackerInstanceId,
        attackTarget: combat.target,
        candidateIds: blockers,
      } as Draft["pendingDecision"];
    } else {
      resolveAttack(state, now);
      processQueue(state, now);
    }
  }

  // -- public API -------------------------------------------------------------

  function createGame(params: NewGameParams): GameState {
    const config: GameConfig = { ...DEFAULT_GAME_CONFIG, ...params.config };
    let rngState = seedFromString(`${params.seed}:${params.gameId}`);

    const players = params.players.map((p, i) => {
      const playerId = (i + 1) as 1 | 2;
      const problems = validateDeck(p.deckCardIds, config);
      if (problems.length > 0) {
        throw new IllegalActionError(`Invalid deck for ${p.name}: ${problems.join("; ")}`);
      }
      const cards: GameCard[] = p.deckCardIds.map((cardId, j) => {
        const d = def(cardId);
        return {
          instanceId: `p${playerId}-${j}`,
          cardId,
          name: d.name,
          civilizations: d.civilizations,
          cost: d.cost,
          type: d.type,
          race: d.race,
          power: d.power,
          rarity: normalizeRarity(d.rarity),
          set: d.set,
          collectorNum: d.collectorNum,
          imageSrc: d.imageSrc,
          rulesText: d.rulesText,
        };
      });
      const [nextRng, shuffled] = shuffle(rngState, cards);
      rngState = nextRng;
      const shields = shuffled.slice(0, config.startingShields);
      const hand = shuffled.slice(config.startingShields, config.startingShields + config.openingHandSize);
      const deck = shuffled.slice(config.startingShields + config.openingHandSize);
      const player: PlayerState = {
        playerId,
        name: p.name,
        deck,
        hand,
        battleZone: [],
        manaZone: [],
        shieldZone: shields,
        graveyard: [],
        hasChargedMana: false,
      };
      return player;
    });

    const state: GameState = {
      gameId: params.gameId,
      config,
      status: GameStatus.InProgress,
      player1: players[0],
      player2: players[1],
      activePlayer: 1,
      turnNumber: 1,
      currentPhase: TurnPhase.ChargeMana,
      timer: {
        totalTimeMs: config.matchTimerMs,
        player1RemainingMs: config.matchTimerMs,
        player2RemainingMs: config.matchTimerMs,
        lastTickTimestamp: params.now,
        activeTimerPlayer: 1,
      },
      eventLog: [],
      nextEventSeq: 0,
      result: null,
      startedAt: params.now,
      rngState,
      pendingDecision: null,
      effectQueue: [],
      combat: null,
      powerMods: [],
      keywordMods: [],
      pendingShieldTriggers: null,
    };
    return state;
  }

  function validateDeck(deckCardIds: string[], config?: Partial<GameConfig>): string[] {
    const cfg = { ...DEFAULT_GAME_CONFIG, ...config };
    const problems: string[] = [];
    if (deckCardIds.length !== cfg.deckSize) {
      problems.push(`Deck must have exactly ${cfg.deckSize} cards (has ${deckCardIds.length})`);
    }
    const counts = new Map<string, number>();
    for (const id of deckCardIds) {
      const d = registry.get(id);
      if (!d) {
        problems.push(`Unknown or unplayable card: ${id}`);
        continue;
      }
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const [id, n] of counts) {
      if (n > cfg.maxCopiesPerCard) {
        problems.push(`Too many copies of ${registry.get(id)?.name ?? id} (${n})`);
      }
    }
    return problems;
  }

  function applyAction(prev: GameState, action: GameAction, now: number): GameState {
    if (prev.status === GameStatus.Completed) {
      throw new IllegalActionError("Game is over");
    }
    const state = clone(prev) as DraftWithPendingOp;
    tickTimer(state, now);
    if (state.status === GameStatus.Completed) return state;

    if (action.type === "surrender") {
      endGame(state, now, other(action.playerId), "surrender");
      return state;
    }

    emit(state, now, { type: "action", action } as Omit<GameEvent, "seq" | "timestamp">);

    const decision = state.pendingDecision;
    if (decision) {
      if (action.playerId !== decision.playerId) {
        throw new IllegalActionError("Waiting on the other player's decision");
      }
      handleDecisionAction(state, now, action, decision as PendingDecision);
    } else {
      if (action.playerId !== state.activePlayer) {
        throw new IllegalActionError("Not your turn");
      }
      handleTurnAction(state, now, action);
    }

    processQueue(state, now);
    // A deferred block offer: combat exists, no decision pending, queue empty.
    if (
      state.status === GameStatus.InProgress &&
      state.combat &&
      !state.pendingDecision &&
      state.effectQueue.length === 0
    ) {
      offerBlockOrResolve(state, now);
      processQueue(state, now);
    }
    if (state.status === GameStatus.InProgress) switchTimer(state, now);
    return state;
  }

  function handleDecisionAction(
    state: DraftWithPendingOp,
    now: number,
    action: GameAction,
    decision: PendingDecision,
  ): void {
    switch (decision.kind) {
      case "block": {
        if (action.type !== "block") throw new IllegalActionError("A block decision is pending");
        state.pendingDecision = null;
        if (action.blockerInstanceId) {
          if (!decision.candidateIds.includes(action.blockerInstanceId)) {
            throw new IllegalActionError("That creature can't block");
          }
          if (state.combat) state.combat.blockerInstanceId = action.blockerInstanceId;
        }
        resolveAttack(state, now);
        break;
      }
      case "shieldTrigger": {
        if (action.type !== "shieldTrigger")
          throw new IllegalActionError("A shield trigger decision is pending");
        state.pendingDecision = null;
        if (action.cardInstanceId === null) {
          state.pendingShieldTriggers = null;
          break;
        }
        if (!decision.candidateIds.includes(action.cardInstanceId)) {
          throw new IllegalActionError("That card is not a usable shield trigger");
        }
        // Remove from the pending list, then play it for free.
        if (state.pendingShieldTriggers) {
          state.pendingShieldTriggers.candidateIds = state.pendingShieldTriggers.candidateIds.filter(
            (id: string) => id !== action.cardInstanceId,
          );
          if (state.pendingShieldTriggers.candidateIds.length === 0) {
            state.pendingShieldTriggers = null;
          }
        }
        playShieldTrigger(state, now, action.playerId, action.cardInstanceId);
        break;
      }
      case "chooseTargets": {
        if (action.type !== "chooseTargets")
          throw new IllegalActionError("A target choice is pending");
        const chosen = action.targetInstanceIds;
        if (chosen.length === 0 && !decision.optional) {
          throw new IllegalActionError(`Must choose ${decision.count} target(s)`);
        }
        if (chosen.length > decision.count) throw new IllegalActionError("Too many targets");
        for (const id of chosen) {
          if (!decision.candidateIds.includes(id)) {
            throw new IllegalActionError("Invalid target");
          }
        }
        const eff = state.pendingOp;
        state.pendingDecision = null;
        state.pendingOp = null;
        if (eff) {
          for (const id of chosen) applyOpTo(state, now, eff as QueuedEffect, id);
        }
        break;
      }
      case "discard": {
        if (action.type !== "discard") throw new IllegalActionError("A discard choice is pending");
        if (action.cardInstanceIds.length !== decision.count) {
          throw new IllegalActionError(`Must discard ${decision.count} card(s)`);
        }
        const p = playerOf(state, action.playerId);
        state.pendingDecision = null;
        for (const id of action.cardInstanceIds) {
          const idx = p.hand.findIndex((c) => c.instanceId === id);
          if (idx < 0) throw new IllegalActionError("Card not in hand");
          const [card] = p.hand.splice(idx, 1);
          p.graveyard.push(card);
        }
        break;
      }
    }
  }

  function handleTurnAction(state: DraftWithPendingOp, now: number, action: GameAction): void {
    switch (action.type) {
      case "chargeMana": {
        if (state.currentPhase !== TurnPhase.ChargeMana) {
          throw new IllegalActionError("Mana can only be charged during the charge phase");
        }
        const p = playerOf(state, action.playerId);
        if (p.hasChargedMana) throw new IllegalActionError("Already charged mana this turn");
        const idx = p.hand.findIndex((c) => c.instanceId === action.cardInstanceId);
        if (idx < 0) throw new IllegalActionError("Card not in hand");
        const [card] = p.hand.splice(idx, 1);
        // Multicolored cards enter the mana zone tapped.
        p.manaZone.push({ ...card, tapped: isMulticolored(card) });
        p.hasChargedMana = true;
        state.currentPhase = TurnPhase.Main;
        break;
      }
      case "summonCreature": {
        if (state.currentPhase !== TurnPhase.Main && state.currentPhase !== TurnPhase.ChargeMana) {
          throw new IllegalActionError("Can only summon during the main phase");
        }
        if (state.currentPhase === TurnPhase.ChargeMana) state.currentPhase = TurnPhase.Main;
        summonCreature(state, now, action);
        break;
      }
      case "castSpell": {
        if (state.currentPhase !== TurnPhase.Main && state.currentPhase !== TurnPhase.ChargeMana) {
          throw new IllegalActionError("Can only cast spells during the main phase");
        }
        if (state.currentPhase === TurnPhase.ChargeMana) state.currentPhase = TurnPhase.Main;
        castSpell(state, now, action);
        break;
      }
      case "attackCreature":
      case "attackPlayer": {
        if (
          state.currentPhase !== TurnPhase.Attack &&
          state.currentPhase !== TurnPhase.Main &&
          state.currentPhase !== TurnPhase.ChargeMana
        ) {
          throw new IllegalActionError("Can't attack now");
        }
        state.currentPhase = TurnPhase.Attack;
        beginAttack(
          state,
          now,
          action.playerId,
          action.attackerInstanceId,
          action.type === "attackPlayer" ? "player" : action.targetInstanceId,
        );
        break;
      }
      case "endPhase": {
        if (state.currentPhase === TurnPhase.ChargeMana) state.currentPhase = TurnPhase.Main;
        else if (state.currentPhase === TurnPhase.Main) state.currentPhase = TurnPhase.Attack;
        else endTurn(state, now);
        break;
      }
      case "endTurn": {
        endTurn(state, now);
        break;
      }
      case "drawCard": {
        throw new IllegalActionError("Draws are automatic");
      }
      default:
        throw new IllegalActionError(`Unexpected action: ${action.type}`);
    }
  }

  function getLegalActions(state: GameState, playerId: 1 | 2): GameAction[] {
    if (state.status !== GameStatus.InProgress) return [];
    const actions: GameAction[] = [];
    const draft = state as Draft;

    const decision = state.pendingDecision;
    if (decision) {
      if (decision.playerId !== playerId) return [];
      switch (decision.kind) {
        case "block":
          actions.push({ type: "block", playerId, blockerInstanceId: null });
          for (const id of decision.candidateIds) {
            actions.push({ type: "block", playerId, blockerInstanceId: id });
          }
          return actions;
        case "shieldTrigger":
          actions.push({ type: "shieldTrigger", playerId, cardInstanceId: null });
          for (const id of decision.candidateIds) {
            actions.push({ type: "shieldTrigger", playerId, cardInstanceId: id });
          }
          return actions;
        case "chooseTargets": {
          if (decision.optional) actions.push({ type: "chooseTargets", playerId, targetInstanceIds: [] });
          if (decision.count === 1) {
            for (const id of decision.candidateIds) {
              actions.push({ type: "chooseTargets", playerId, targetInstanceIds: [id] });
            }
          } else {
            // Single sensible option: first `count` candidates; UIs build
            // their own combinations.
            actions.push({
              type: "chooseTargets",
              playerId,
              targetInstanceIds: decision.candidateIds.slice(0, decision.count),
            });
          }
          return actions;
        }
        case "discard": {
          if (decision.count === 1) {
            for (const id of decision.candidateIds) {
              actions.push({ type: "discard", playerId, cardInstanceIds: [id] });
            }
          } else {
            // Multi-card discard: offer each contiguous window; UIs and the
            // AI can also construct any valid combination themselves.
            for (let i = 0; i + decision.count <= decision.candidateIds.length; i++) {
              actions.push({
                type: "discard",
                playerId,
                cardInstanceIds: decision.candidateIds.slice(i, i + decision.count),
              });
            }
          }
          return actions;
        }
      }
    }

    if (state.activePlayer !== playerId) return [];
    const p = playerId === 1 ? state.player1 : state.player2;

    actions.push({ type: "surrender", playerId });

    if (state.currentPhase === TurnPhase.ChargeMana && !p.hasChargedMana) {
      for (const card of p.hand) {
        actions.push({ type: "chargeMana", playerId, cardInstanceId: card.instanceId });
      }
    }

    if (state.currentPhase === TurnPhase.ChargeMana || state.currentPhase === TurnPhase.Main) {
      for (const card of p.hand) {
        const d = registry.get(card.cardId);
        if (!d) continue;
        const mana = autoSelectMana(p, d);
        if (!mana) continue;
        if (d.type === "Spell") {
          actions.push({ type: "castSpell", playerId, cardInstanceId: card.instanceId, manaTapIds: [] });
        } else if (d.type === "Evolution Creature") {
          for (const base of p.battleZone) {
            if (evolutionBaseMatches(d, base)) {
              actions.push({
                type: "summonCreature",
                playerId,
                cardInstanceId: card.instanceId,
                manaTapIds: [],
                evolutionBaseInstanceId: base.instanceId,
              });
            }
          }
        } else {
          actions.push({ type: "summonCreature", playerId, cardInstanceId: card.instanceId, manaTapIds: [] });
        }
      }
    }

    if (
      state.currentPhase === TurnPhase.ChargeMana ||
      state.currentPhase === TurnPhase.Main ||
      state.currentPhase === TurnPhase.Attack
    ) {
      const opp = playerId === 1 ? state.player2 : state.player1;
      for (const c of p.battleZone) {
        if (!canAttack(draft, c)) continue;
        const d = registry.get(c.cardId);
        if (!d) continue;
        if (!d.keywords.cantAttackPlayers) {
          actions.push({ type: "attackPlayer", playerId, attackerInstanceId: c.instanceId });
        }
        if (!d.keywords.cantAttackCreatures) {
          for (const t of opp.battleZone) {
            if (t.tapped || d.keywords.canAttackUntapped) {
              actions.push({
                type: "attackCreature",
                playerId,
                attackerInstanceId: c.instanceId,
                targetInstanceId: t.instanceId,
              });
            }
          }
        }
      }
    }

    actions.push({ type: "endPhase", playerId });
    actions.push({ type: "endTurn", playerId });
    return actions;
  }

  function getVisibleState(state: GameState, playerId: 1 | 2): VisibleGameState {
    const me = playerId === 1 ? state.player1 : state.player2;
    const opp = playerId === 1 ? state.player2 : state.player1;
    return {
      gameId: state.gameId,
      config: state.config,
      status: state.status,
      me,
      opponent: {
        playerId: opp.playerId,
        name: opp.name,
        deckCount: opp.deck.length,
        handCount: opp.hand.length,
        battleZone: opp.battleZone,
        manaZone: opp.manaZone,
        shieldCount: opp.shieldZone.length,
        graveyard: opp.graveyard,
        hasChargedMana: opp.hasChargedMana,
      },
      activePlayer: state.activePlayer,
      turnNumber: state.turnNumber,
      currentPhase: state.currentPhase,
      timer: state.timer,
      eventLog: state.eventLog,
      startedAt: state.startedAt,
      result: state.result,
      pendingDecision: state.pendingDecision,
      combat: state.combat,
      powerMods: state.powerMods,
    };
  }

  return {
    registry,
    createGame,
    applyAction,
    getLegalActions,
    getVisibleState,
    validateDeck,
  };
}
