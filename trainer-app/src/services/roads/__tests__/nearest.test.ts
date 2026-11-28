import { describe, expect, it } from 'vitest';
import { nearestLines, segmentDistance, tappedLine, type LineItem } from '../nearest';

const lines: LineItem[] = [
  { id: 'h', parts: [[[0, 0], [100, 0]]] },
  { id: 'v', parts: [[[50, -50], [50, 50]]] },
  { id: 'shared', parts: [[[0, 0.5], [100, 0.5]]] },
  { id: 'two', parts: [[[200, 0], [210, 0]], [[300, 0], [310, 0]]] },
];

describe('segmentDistance', () => {
  it('measures to the segment, clamped to its ends', () => {
    expect(segmentDistance([5, 3], [0, 0], [10, 0])).toBe(3);
    expect(segmentDistance([-3, 4], [0, 0], [10, 0])).toBe(5);
    expect(segmentDistance([1, 1], [0, 0], [0, 0])).toBeCloseTo(Math.SQRT2);
  });
});

describe('nearestLines', () => {
  it('returns nothing for a tap away from every line (a neutral tap)', () => {
    expect(nearestLines([20, 30], lines, 12)).toEqual([]);
  });

  it('returns the nearest line, and every line within the tie distance', () => {
    expect(nearestLines([20, 8], lines, 12).map((h) => h.id)).toEqual(['shared', 'h']);
    expect(nearestLines([45, 20], lines, 12)).toEqual([{ id: 'v', distance: 5 }]);
    expect(nearestLines([20, 8], lines, 12, 0).map((h) => h.id)).toEqual(['shared']);
  });

  it('searches every part of a line', () => {
    expect(nearestLines([305, 4], lines, 12)).toEqual([{ id: 'two', distance: 4 }]);
  });
});

describe('tappedLine', () => {
  it('lets the target win only where it is about as near as the nearest line', () => {
    expect(tappedLine([50, 1], lines, 12, 'v')).toBe('v');
    expect(tappedLine([60, 1], lines, 12, 'v')).toBe('shared');
    expect(tappedLine([60, 1], lines, 12, 'h')).toBe('h');
    expect(tappedLine([20, 30], lines, 12, 'h')).toBeUndefined();
  });

  it('counts a tap on a shared stretch (two numbers, one carriageway) for whichever road is the target', () => {
    // Both route relations hold the shared ways, so both courses run over x = 100…200.
    const pair: LineItem[] = [
      { id: 'a7', parts: [[[100, -100], [100, 0], [200, 0], [200, 100]]] },
      { id: 'a44', parts: [[[0, 0], [100, 0], [200, 0], [300, -50]]] },
    ];
    expect(tappedLine([150, 2], pair, 12, 'a7')).toBe('a7');
    expect(tappedLine([150, 2], pair, 12, 'a44')).toBe('a44');
    expect(tappedLine([40, 2], pair, 12, 'a7')).toBe('a44');
  });
});
