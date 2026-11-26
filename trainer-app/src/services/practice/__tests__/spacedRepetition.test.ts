import { describe, expect, it } from 'vitest';
import {
  MAX_BOX,
  REVIEW_INTERVALS_MS,
  SOLID_BOX,
  isDue,
  pickRound,
  progressStats,
  recordAnswer,
  type ProgressRecords,
} from '../spacedRepetition';

const NOW = 1_000_000_000;
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const noRandom = () => 0;

describe('recordAnswer', () => {
  it('starts an unseen item in box 1 when answered right', () => {
    expect(recordAnswer(undefined, false, NOW)).toEqual({ box: 1, seenAt: NOW });
  });

  it('moves a right answer up one box and stamps the time', () => {
    expect(recordAnswer({ box: 2, seenAt: 5 }, false, NOW)).toEqual({ box: 3, seenAt: NOW });
  });

  it('caps at MAX_BOX', () => {
    expect(recordAnswer({ box: MAX_BOX, seenAt: 5 }, false, NOW).box).toBe(MAX_BOX);
  });

  it('resets to box 0 on a miss, even for a new item', () => {
    expect(recordAnswer({ box: 4, seenAt: 5 }, true, NOW)).toEqual({ box: 0, seenAt: NOW });
    expect(recordAnswer(undefined, true, NOW)).toEqual({ box: 0, seenAt: NOW });
  });
});

describe('isDue', () => {
  it('has box 0 due immediately', () => {
    expect(isDue({ box: 0, seenAt: NOW }, NOW)).toBe(true);
  });

  it('waits the interval of each box, due exactly at the boundary', () => {
    REVIEW_INTERVALS_MS.forEach((interval, box) => {
      if (interval === 0) return;
      expect(isDue({ box, seenAt: NOW }, NOW + interval - 1)).toBe(false);
      expect(isDue({ box, seenAt: NOW }, NOW + interval)).toBe(true);
    });
  });
});

describe('progressStats', () => {
  const records: ProgressRecords = {
    'reg|a': { box: SOLID_BOX, seenAt: NOW - 10 * DAY }, // solid and due
    'reg|b': { box: SOLID_BOX, seenAt: NOW }, // solid, not due
    'reg|c': { box: 1, seenAt: NOW - HOUR }, // due, not solid
    'reg|d': { box: 1, seenAt: NOW }, // neither
  };

  it('counts solid, due and fresh items', () => {
    const stats = progressStats(['reg|a', 'reg|b', 'reg|c', 'reg|d', 'reg|e'], records, NOW);
    expect(stats).toEqual({ solid: 2, due: 2, fresh: 1, total: 5 });
  });

  it('dedupes keys', () => {
    const stats = progressStats(['reg|a', 'reg|a', 'reg|e', 'reg|e'], records, NOW);
    expect(stats).toEqual({ solid: 1, due: 1, fresh: 1, total: 2 });
  });

  it('handles no keys', () => {
    expect(progressStats([], records, NOW)).toEqual({ solid: 0, due: 0, fresh: 0, total: 0 });
  });
});

describe('pickRound', () => {
  const keyOf = (s: string) => `x|${s}`;

  it('returns all items when the size is at least the length', () => {
    const items = ['a', 'b', 'c'];
    expect(pickRound(items, 3, keyOf, {}, NOW, noRandom)).toEqual(items);
    expect(pickRound(items, 10, keyOf, {}, NOW, noRandom)).toEqual(items);
  });

  it("returns all items for 'all'", () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(pickRound(items, 'all', keyOf, {}, NOW, noRandom)).toEqual(items);
  });

  it('prefers overdue over new over not-yet-due', () => {
    const records: ProgressRecords = {
      'x|overdue': { box: 1, seenAt: NOW - HOUR }, // 10 min interval, long overdue
      'x|waiting': { box: 3, seenAt: NOW - 1 * MIN }, // a day interval, barely started
    };
    const items = ['waiting', 'fresh', 'overdue'];
    expect(pickRound(items, 1, keyOf, records, NOW, noRandom)).toEqual(['overdue']);
    expect(pickRound(items, 2, keyOf, records, NOW, noRandom)).toEqual(['overdue', 'fresh']);
  });

  it('puts overdue items from lower boxes first', () => {
    const records: ProgressRecords = {
      'x|low': { box: 1, seenAt: NOW - 10 * DAY },
      'x|high': { box: 5, seenAt: NOW - 100 * DAY },
    };
    expect(pickRound(['high', 'low', 'new'], 1, keyOf, records, NOW, noRandom)).toEqual(['low']);
  });

  it('prefers not-yet-due items closer to due', () => {
    const records: ProgressRecords = {
      'x|far': { box: 4, seenAt: NOW - HOUR }, // 3 days interval, 1h in
      'x|near': { box: 4, seenAt: NOW - 2 * DAY }, // 2 of 3 days in
      'x|mid': { box: 4, seenAt: NOW - DAY }, // 1 of 3 days in
    };
    expect(pickRound(['far', 'near', 'mid'], 1, keyOf, records, NOW, noRandom)).toEqual(['near']);
  });

  it('does not mutate the input', () => {
    const items = ['c', 'b', 'a'];
    pickRound(items, 1, keyOf, {}, NOW, noRandom);
    expect(items).toEqual(['c', 'b', 'a']);
  });
});
