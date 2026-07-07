import type { Engine } from "./engine";
import type { GameAction } from "./types/actions";
import type { CreatureInBattle } from "./types/card-in-play";
import type { GameState } from "./types/game-state";
import { GameStatus } from "./types/game-state";
import { TurnPhase } from "./types/turn-phase";

/**
 * Heuristic AI opponent. Given a state where `playerId` must act
 * (its turn, or a pending decision addressed to it), returns the action
 * it wants to take. Drive it in a loop:
 *
 *   while (aiMustAct(state, ai)) state = engine.applyAction(state, chooseAction(engine, state, ai), now)
 */

export function aiMustAct(state: GameState, playerId: 1 | 2): boolean {
  if (state.status !== GameStatus.InProgress) return false;
  if (state.pendingDecision) return state.pendingDecision.playerId === playerId;
  return state.activePlayer === playerId;
}

function me(state: GameState, playerId: 1 | 2) {
  return playerId === 1 ? state.player1 : state.player2;
}

function opp(state: GameState, playerId: 1 | 2) {
  return playerId === 1 ? state.player2 : state.player1;
}

/** Rough value of a creature card for playing/keeping decisions. */
function creatureValue(power: number | undefined, cost: number): number {
  return (power ?? 0) / 1000 + cost;
}

export function chooseAction(engine: Engine, state: GameState, playerId: 1 | 2): GameAction {
  const legal = engine.getLegalActions(state, playerId);
  if (legal.length === 0) {
    throw new Error("AI has no legal actions");
  }
  const my = me(state, playerId);
  const enemy = opp(state, playerId);

  const decision = state.pendingDecision;
  if (decision && decision.playerId === playerId) {
    switch (decision.kind) {
      case "block": {
        // Block if the blocker survives or if a shield/life is at stake late game.
        const blocks = legal.filter(
          (a): a is Extract<GameAction, { type: "block" }> =>
            a.type === "block" && a.blockerInstanceId !== null,
        );
        const attacker = [...my.battleZone, ...enemy.battleZone].find(
          (c) => c.instanceId === decision.attackerInstanceId,
        );
        const attackerDef = attacker ? engine.registry.get(attacker.cardId) : undefined;
        const attackerPower =
          (attacker?.power ?? 0) + (attackerDef?.keywords.powerAttacker ?? 0);
        const shieldsLeft = my.shieldZone.length;
        let best: { action: GameAction; score: number } | null = null;
        for (const b of blocks) {
          const blocker = my.battleZone.find((c) => c.instanceId === b.blockerInstanceId);
          if (!blocker) continue;
          const survives = blocker.power > attackerPower;
          const trades = blocker.power === attackerPower;
          let score = -1;
          if (survives) score = 3;
          else if (trades) score = 1.5;
          else if (decision.attackTarget === "player" && shieldsLeft <= 2) {
            // Chump-block to protect the last shields.
            score = 1 - creatureValue(blocker.power, blocker.cost) / 10;
          }
          if (best === null || score > best.score) best = { action: b, score };
        }
        if (best && best.score > 0) return best.action;
        return { type: "block", playerId, blockerInstanceId: null };
      }
      case "shieldTrigger": {
        // Always use shield triggers (they're free).
        const use = legal.find(
          (a) => a.type === "shieldTrigger" && a.cardInstanceId !== null,
        );
        return use ?? { type: "shieldTrigger", playerId, cardInstanceId: null };
      }
      case "chooseTargets": {
        const options = legal.filter(
          (a): a is Extract<GameAction, { type: "chooseTargets" }> => a.type === "chooseTargets",
        );
        const nonEmpty = options.filter((a) => a.targetInstanceIds.length > 0);
        if (nonEmpty.length === 0) return options[0];
        const desc = decision.description.toLowerCase();
        const harmful =
          desc.includes("destroy") || desc.includes("tap") || desc.includes("-");
        const findCreaturePower = (id: string): number => {
          const c = [...my.battleZone, ...enemy.battleZone].find((x) => x.instanceId === id);
          return c?.power ?? 0;
        };
        const enemyIds = new Set(enemy.battleZone.map((c) => c.instanceId));
        let best = nonEmpty[0];
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const option of nonEmpty) {
          let score = 0;
          for (const id of option.targetInstanceIds) {
            const power = findCreaturePower(id);
            const isEnemy = enemyIds.has(id);
            if (harmful) score += isEnemy ? power : -power;
            else score += isEnemy ? -power : power;
          }
          if (score > bestScore) {
            bestScore = score;
            best = option;
          }
        }
        // Decline optional harmful-to-self effects.
        if (bestScore < 0 && decision.optional) {
          const decline = options.find((a) => a.targetInstanceIds.length === 0);
          if (decline) return decline;
        }
        return best;
      }
      case "discard": {
        // Discard the lowest-value cards.
        const sorted = [...decision.candidateIds].sort((a, b) => {
          const cardA = my.hand.find((c) => c.instanceId === a);
          const cardB = my.hand.find((c) => c.instanceId === b);
          return (cardA?.cost ?? 0) - (cardB?.cost ?? 0);
        });
        return {
          type: "discard",
          playerId,
          cardInstanceIds: sorted.slice(0, decision.count),
        };
      }
    }
  }

  // ---- normal turn play ----
  const manaCount = my.manaZone.length;

  // 1. Charge mana (always in the early game; later only with a full hand).
  if (state.currentPhase === TurnPhase.ChargeMana && !my.hasChargedMana) {
    const charges = legal.filter(
      (a): a is Extract<GameAction, { type: "chargeMana" }> => a.type === "chargeMana",
    );
    if (charges.length > 0 && (manaCount < 7 || my.hand.length > 5)) {
      // Charge the card we're least likely to play: highest cost beyond
      // reach, otherwise a duplicate/lowest-value card.
      const byInstance = new Map(my.hand.map((c) => [c.instanceId, c]));
      let best = charges[0];
      let bestScore = Number.NEGATIVE_INFINITY;
      for (const action of charges) {
        const card = byInstance.get(action.cardInstanceId);
        if (!card) continue;
        let score = 0;
        if (card.cost > manaCount + 3) score += card.cost; // unplayable soon → dump
        else score -= creatureValue(card.power, card.cost); // keep strong playable cards
        if (score > bestScore) {
          bestScore = score;
          best = action;
        }
      }
      return best;
    }
  }

  // 2. Summon / cast — highest-cost playable card first (uses mana efficiently).
  const plays = legal.filter(
    (a) => a.type === "summonCreature" || a.type === "castSpell",
  );
  if (plays.length > 0) {
    const byInstance = new Map(my.hand.map((c) => [c.instanceId, c]));
    let best: GameAction | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const action of plays) {
      const id =
        action.type === "summonCreature" || action.type === "castSpell"
          ? action.cardInstanceId
          : "";
      const card = byInstance.get(id);
      if (!card) continue;
      // Don't cast removal/utility spells with no enemy creatures around.
      if (card.type === "Spell" && enemy.battleZone.length === 0) {
        const text = card.rulesText.join(" ").toLowerCase();
        if (text.includes("destroy") || text.includes("tap") || text.includes("return")) continue;
      }
      let score = card.cost * 2 + (card.power ?? 0) / 1000;
      if (card.type === "Evolution Creature") score += 3;
      if (score > bestScore) {
        bestScore = score;
        best = action;
      }
    }
    if (best) return best;
  }

  // 3. Attack.
  const attacks = legal.filter(
    (a) => a.type === "attackPlayer" || a.type === "attackCreature",
  );
  if (attacks.length > 0) {
    const enemyByInstance = new Map(enemy.battleZone.map((c) => [c.instanceId, c]));
    const myByInstance = new Map(my.battleZone.map((c) => [c.instanceId, c]));
    const effPower = (c: CreatureInBattle, attacking: boolean): number => {
      const d = engine.registry.get(c.cardId);
      return c.power + (attacking && d?.keywords.powerAttacker ? d.keywords.powerAttacker : 0);
    };
    // Favorable creature attacks first (remove blockers/threats for free).
    let bestCreatureAttack: GameAction | null = null;
    let bestGain = 0;
    for (const action of attacks) {
      if (action.type !== "attackCreature") continue;
      const attacker = myByInstance.get(action.attackerInstanceId);
      const target = enemyByInstance.get(action.targetInstanceId);
      if (!attacker || !target) continue;
      const ad = engine.registry.get(attacker.cardId);
      const wins = effPower(attacker, true) > target.power || ad?.keywords.slayer;
      const survives = effPower(attacker, true) > target.power;
      if (!wins) continue;
      const gain = target.power / 1000 + (survives ? 1 : -attacker.power / 2000);
      if (gain > bestGain) {
        bestGain = gain;
        bestCreatureAttack = action;
      }
    }
    if (bestCreatureAttack) return bestCreatureAttack;

    // Then pressure the player — strongest attacker first.
    let bestPlayerAttack: GameAction | null = null;
    let bestPower = -1;
    for (const action of attacks) {
      if (action.type !== "attackPlayer") continue;
      const attacker = myByInstance.get(action.attackerInstanceId);
      if (!attacker) continue;
      const p = effPower(attacker, true);
      if (p > bestPower) {
        bestPower = p;
        bestPlayerAttack = action;
      }
    }
    if (bestPlayerAttack) return bestPlayerAttack;
  }

  // 4. Nothing else to do.
  if (state.currentPhase === TurnPhase.ChargeMana || state.currentPhase === TurnPhase.Main) {
    // Advance to attack phase if we might attack, else end turn.
    const canEverAttack = my.battleZone.some((c) => !c.tapped && !c.summoningSick);
    if (canEverAttack && state.currentPhase !== TurnPhase.Main) {
      return { type: "endPhase", playerId };
    }
  }
  return { type: "endTurn", playerId };
}
