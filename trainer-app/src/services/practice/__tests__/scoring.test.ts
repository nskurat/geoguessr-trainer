import { describe, expect, it } from 'vitest';
import { CITY_DISTANCE_BANDS, RIVER_TOWN_DISTANCE_BANDS, distanceOutcome, isMiss } from '../scoring';

describe('distanceOutcome', () => {
  const bands = CITY_DISTANCE_BANDS;

  it('maps distances to bands, inclusive at the upper edge', () => {
    expect(distanceOutcome(0, bands)).toBe(0);
    expect(distanceOutcome(25, bands)).toBe(0);
    expect(distanceOutcome(25.01, bands)).toBe(1);
    expect(distanceOutcome(60, bands)).toBe(1);
    expect(distanceOutcome(60.01, bands)).toBe(2);
    expect(distanceOutcome(120, bands)).toBe(2);
    expect(distanceOutcome(120.01, bands)).toBe(3);
    expect(distanceOutcome(5000, bands)).toBe(3);
  });

  it('uses the supplied bands', () => {
    expect(distanceOutcome(21, RIVER_TOWN_DISTANCE_BANDS)).toBe(1);
    expect(distanceOutcome(91, RIVER_TOWN_DISTANCE_BANDS)).toBe(3);
  });

  it('has increasingly wide bands', () => {
    for (const b of [CITY_DISTANCE_BANDS, RIVER_TOWN_DISTANCE_BANDS]) {
      expect(b[0]).toBeLessThan(b[1]);
      expect(b[1]).toBeLessThan(b[2]);
    }
  });
});

describe('isMiss', () => {
  it('never counts an unanswered question as a miss', () => {
    expect(isMiss(undefined, true)).toBe(false);
    expect(isMiss(undefined, false)).toBe(false);
  });

  it('is forgiving for distance questions: only outcomes 2 and 3 miss', () => {
    expect(isMiss(0, true)).toBe(false);
    expect(isMiss(1, true)).toBe(false);
    expect(isMiss(2, true)).toBe(true);
    expect(isMiss(3, true)).toBe(true);
  });

  it('needs a first-try answer otherwise: any outcome above 0 misses', () => {
    expect(isMiss(0, false)).toBe(false);
    expect(isMiss(1, false)).toBe(true);
    expect(isMiss(2, false)).toBe(true);
    expect(isMiss(3, false)).toBe(true);
  });
});
