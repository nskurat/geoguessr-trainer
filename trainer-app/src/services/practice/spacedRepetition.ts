import type { Rng } from '../../utils/random';

/** One item's Leitner box and when it was last answered. */
export interface BoxRecord {
  box: number;
  seenAt: number;
}

/** Progress for every item studied, keyed by `<set>|<item id>`. */
export type ProgressRecords = Record<string, BoxRecord>;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Wait before an item in each box is due again: box 0 at once, then 10 min, 1 h, 1 day, 3 days, a week. */
export const REVIEW_INTERVALS_MS = [0, 10 * MINUTE, HOUR, DAY, 3 * DAY, 7 * DAY] as const;
export const MAX_BOX = REVIEW_INTERVALS_MS.length - 1;
/** Items in this box or above count as "solid". */
export const SOLID_BOX = 3;

/** A right answer moves the item up a box; a miss sends it back to box 0. */
export function recordAnswer(previous: BoxRecord | undefined, missed: boolean, now: number): BoxRecord {
  return { box: missed ? 0 : Math.min(MAX_BOX, (previous?.box ?? 0) + 1), seenAt: now };
}

export function isDue(record: BoxRecord, now: number): boolean {
  return now - record.seenAt >= REVIEW_INTERVALS_MS[record.box];
}

export interface ProgressStats {
  solid: number;
  due: number;
  /** Never answered. */
  fresh: number;
  total: number;
}

/** Counts over the distinct keys. */
export function progressStats(keys: string[], records: ProgressRecords, now: number): ProgressStats {
  const stats: ProgressStats = { solid: 0, due: 0, fresh: 0, total: 0 };
  for (const key of new Set(keys)) {
    stats.total++;
    const r = records[key];
    if (!r) {
      stats.fresh++;
      continue;
    }
    if (r.box >= SOLID_BOX) stats.solid++;
    if (isDue(r, now)) stats.due++;
  }
  return stats;
}

/**
 * Higher means ask sooner: overdue items first (lower boxes first), then new
 * items, then items not yet due (the closer to due, the sooner). A little
 * randomness keeps rounds from repeating in the same order.
 */
export function roundPriority(record: BoxRecord | undefined, now: number, rng: Rng): number {
  if (!record) return 1 + rng();
  const overdue = (now - record.seenAt) / Math.max(REVIEW_INTERVALS_MS[record.box], 10 * MINUTE);
  return overdue >= 1 ? 2 + (MAX_BOX - record.box) / MAX_BOX + rng() * 0.1 : overdue * 0.5 + rng() * 0.1;
}

/** The `size` highest-priority items, or all of them if there are no more than that. */
export function pickRound<T>(
  items: T[],
  size: number | 'all',
  keyOf: (item: T) => string,
  records: ProgressRecords,
  now: number,
  rng: Rng,
): T[] {
  const n = size === 'all' ? items.length : size;
  if (items.length <= n) return items;
  return items
    .map((item) => ({ item, score: roundPriority(records[keyOf(item)], now, rng) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.item);
}
