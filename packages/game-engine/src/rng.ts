/**
 * Deterministic PRNG (mulberry32). The engine threads the integer state
 * through GameState so games are fully reproducible from a seed —
 * required for server-authoritative multiplayer and replays.
 */

/** Derive a 32-bit seed from a string. */
export function seedFromString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Advance the RNG state once. Returns [nextState, float in [0, 1)]. */
export function nextRandom(state: number): [number, number] {
  let t = (state + 0x6d2b79f5) >>> 0;
  let x = t;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  const value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  return [t, value];
}

/** Fisher–Yates shuffle. Returns [nextState, shuffledCopy]. */
export function shuffle<T>(state: number, items: readonly T[]): [number, T[]] {
  const arr = items.slice();
  let s = state;
  for (let i = arr.length - 1; i > 0; i--) {
    let r: number;
    [s, r] = nextRandom(s);
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return [s, arr];
}

/** Pick a random index in [0, length). Returns [nextState, index]. */
export function randomIndex(state: number, length: number): [number, number] {
  const [s, r] = nextRandom(state);
  return [s, Math.floor(r * length)];
}
