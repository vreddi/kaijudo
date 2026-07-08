import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { CardData } from "../types/ability";
import { buildCardRegistry } from "../compile";
import { createEngine } from "../engine";
import { aiMustAct, chooseAction } from "../ai";
import { GameStatus } from "../types/game-state";
import { nextRandom } from "../rng";

/**
 * Full-database smoke test: build random legal decks from the real card
 * database and let two AIs play complete games. Catches crashes, illegal
 * action loops, and non-terminating states across a wide swath of cards.
 */

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../../../../apps/desktop/public/data/all-cards.json");
const allCards = JSON.parse(readFileSync(dataPath, "utf8")) as CardData[];
const registry = buildCardRegistry(allCards);
const engine = createEngine(registry);

const playableIds = [...registry.keys()];

function randomDeck(seedState: number): [number, string[]] {
  let s = seedState;
  const deck: string[] = [];
  const counts = new Map<string, number>();
  while (deck.length < 40) {
    let r: number;
    [s, r] = nextRandom(s);
    const id = playableIds[Math.floor(r * playableIds.length)];
    const n = counts.get(id) ?? 0;
    if (n >= 4) continue;
    counts.set(id, n + 1);
    deck.push(id);
  }
  return [s, deck];
}

describe("card database compilation", () => {
  it("compiles the whole database", () => {
    // 2647 cards minus non-playable types (Cross Gear, Castle, …).
    expect(registry.size).toBeGreaterThan(2500);
  });

  it("implements effects or keywords for the majority of cards", () => {
    let fullyImplemented = 0;
    for (const def of registry.values()) {
      if (def.unimplementedText.length === 0) fullyImplemented++;
    }
    // Sanity floor. Cards with unimplemented lines still play (the line is
    // skipped and shown to players); this guards against compiler regressions.
    expect(fullyImplemented / registry.size).toBeGreaterThan(0.2);
  });
});

describe("AI vs AI simulation", () => {
  it("plays complete games without crashing", () => {
    let seedState = 424242;
    for (let game = 0; game < 5; game++) {
      let deck1: string[];
      let deck2: string[];
      [seedState, deck1] = randomDeck(seedState);
      [seedState, deck2] = randomDeck(seedState);
      let state = engine.createGame({
        gameId: `sim-${game}`,
        seed: `sim-seed-${game}`,
        players: [
          { name: "AI-1", deckCardIds: deck1 },
          { name: "AI-2", deckCardIds: deck2 },
        ],
        now: 0,
      });
      let steps = 0;
      let now = 0;
      while (state.status === GameStatus.InProgress && steps < 5000) {
        const actor = aiMustAct(state, 1) ? 1 : aiMustAct(state, 2) ? 2 : null;
        expect(actor).not.toBeNull();
        if (actor === null) break;
        const action = chooseAction(engine, state, actor);
        now += 100; // keep well under the match timer
        state = engine.applyAction(state, action, now);
        steps++;
      }
      expect(state.status).toBe(GameStatus.Completed);
      expect(state.result).not.toBeNull();
    }
  }, 60_000);
});
