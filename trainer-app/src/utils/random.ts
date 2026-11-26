/** A source of uniform random numbers in [0, 1), injectable so tests are deterministic. */
export type Rng = () => number;

/** Fisher–Yates shuffle, in place. Returns the same array. */
export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
