import { shuffle, type Rng } from '../../utils/random';

export interface DistractorOptions {
  answer: string;
  /** Items in the current round, preferred as wrong answers since they are being learnt together. */
  roundItems: string[];
  /** Every item of the set, used to fill up when the round is small. */
  allItems: string[];
  /** Grouping (e.g. region) used to pick nearby, harder wrong answers. */
  groupOf: (item: string) => string;
  rng: Rng;
}

/**
 * Four multiple-choice options, shuffled: the answer, up to two wrong answers
 * from the same group, then others from the round and finally the whole set.
 */
export function pickChoices({ answer, roundItems, allItems, groupOf, rng }: DistractorOptions): string[] {
  const others = shuffle(
    roundItems.filter((x) => x !== answer),
    rng,
  );
  const out = others.filter((x) => groupOf(x) === groupOf(answer)).slice(0, 2);
  for (const x of others.concat(shuffle(allItems.slice(), rng))) {
    if (out.length >= 3) break;
    if (x !== answer && !out.includes(x)) out.push(x);
  }
  return shuffle([answer, ...out], rng);
}

/** Share of the smaller area that the two areas have in common (0–1). */
export function areaOverlap(a: string[], b: string[]): number {
  const shared = a.filter((x) => b.includes(x)).length;
  return shared / Math.min(a.length, b.length);
}

/**
 * Four options for "which pattern is typical here?": the answer plus three
 * patterns whose areas overlap it by less than half, so only one fits.
 */
export function pickPatternChoices(
  answer: string,
  patterns: { id: string; codes: string[] }[],
  rng: Rng,
): string[] {
  const area = patterns.find((p) => p.id === answer)?.codes ?? [];
  const others = shuffle(
    patterns.filter((p) => p.id !== answer && areaOverlap(p.codes, area) < 0.5).map((p) => p.id),
    rng,
  ).slice(0, 3);
  return shuffle([answer, ...others], rng);
}
