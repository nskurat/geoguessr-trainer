import { describe, expect, it } from 'vitest';
import { germanyRoadEntries } from './fixtures';
import { confusability, courseGapKm, pickRoadChoices, pickRoadDecoys, refBand, type DecoyRoad } from '../decoys';

const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const road = (id: string, ref: string, extra: Partial<DecoyRoad> = {}): DecoyRoad => ({
  id,
  network: 'A',
  ref,
  class: 2,
  codes: [],
  between: [],
  crosses: [],
  ...extra,
});

describe('refBand', () => {
  it('groups numbers by first digit and length', () => {
    expect(refBand('A 44')).toBe('4/2');
    expect(refBand('A 45')).toBe(refBand('A 44'));
    expect(refBand('PE-28A')).toBe('2/2');
    expect(refBand('A 7')).toBe('x/1');
    expect(refBand('A 99')).not.toBe(refBand('A 9'));
    expect(refBand('Ring')).toBeUndefined();
  });
});

describe('courseGapKm', () => {
  it('is about 111 km per degree of latitude, and Infinity beyond the limit or without a course', () => {
    expect(courseGapKm([[[50, 8], [50, 9]]], [[[51, 8], [52, 8]]], 200)).toBeCloseTo(111.3, 0);
    expect(courseGapKm([[[50, 8], [50, 9]]], [[[53, 8.5], [54, 8.5]]])).toBe(Infinity);
    expect(courseGapKm([], [[[50, 8], [50, 9]]])).toBe(Infinity);
  });
});

describe('confusability', () => {
  it('ranks a parallel road in the pattern above a same-band one above an unrelated one', () => {
    const t = road('a44', 'A 44', { between: ['a1'], codes: ['NW'] });
    const parallel = road('a1', 'A 1', { class: 1 });
    const band = road('a45', 'A 45');
    const far = road('a93', 'A 93', { codes: ['BY'] });
    expect(confusability(t, parallel)).toBeGreaterThan(confusability(t, band));
    expect(confusability(t, band)).toBeGreaterThan(confusability(t, far));
    expect(confusability(t, far)).toBe(0);
  });

  it('counts nearby courses', () => {
    const a = road('a', 'A 61', { course: [[[50, 7], [51, 7]]] });
    const b = road('b', 'A 93', { course: [[[50, 7.5], [51, 7.5]]] });
    expect(confusability(a, b)).toBe(2);
  });
});

describe('pickRoadDecoys', () => {
  const roads = [
    road('a40', 'A 40', { codes: ['NW'], between: ['a42'] }),
    road('a42', 'A 42', { codes: ['NW'] }),
    road('a43', 'A 43', { codes: ['NW'] }),
    road('a44', 'A 44', { codes: ['NW'] }),
    road('a93', 'A 93', { codes: ['BY'] }),
    road('a95', 'A 95', { codes: ['BY'] }),
    road('a1', 'A 1', { class: 1, codes: ['NW'] }),
  ];

  it('picks the most confusable roads of the same class first', () => {
    expect(pickRoadDecoys(roads[0], roads, 3, seq([0.1, 0.7, 0.4]))).toEqual(
      expect.arrayContaining(['a42', 'a43', 'a44']),
    );
    expect(pickRoadDecoys(roads[0], roads, 3, seq([0.1]))[0]).toBe('a42');
  });

  it('never returns the target, and tops up from other classes only when needed', () => {
    const picked = pickRoadDecoys(roads[0], roads, 10, seq([0.3]));
    expect(picked).not.toContain('a40');
    expect(picked).toHaveLength(6);
    expect(picked[picked.length - 1]).toBe('a1');
  });

  it('is deterministic for a given rng', () => {
    const a = pickRoadDecoys(roads[4], roads, 4, seq([0.2, 0.9, 0.5]));
    const b = pickRoadDecoys(roads[4], roads, 4, seq([0.2, 0.9, 0.5]));
    expect(a).toEqual(b);
  });

  it('gives 3–5 same-class decoys for every German road', () => {
    for (const r of germanyRoadEntries) {
      const picked = pickRoadDecoys(r, germanyRoadEntries, 5, Math.random);
      expect(picked).toHaveLength(5);
      const sameClass = picked.filter((id) => germanyRoadEntries.find((x) => x.id === id)!.class === r.class);
      expect(sameClass.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('pickRoadChoices', () => {
  it('returns the answer and count − 1 others, without duplicates', () => {
    const roads = [road('a', 'A 40'), road('b', 'A 42'), road('c', 'A 43'), road('d', 'A 44'), road('e', 'A 45')];
    const choices = pickRoadChoices(roads[0], roads, seq([0.5, 0.2, 0.8]));
    expect(choices).toHaveLength(4);
    expect(choices).toContain('a');
    expect(new Set(choices).size).toBe(4);
    expect(pickRoadChoices(roads[0], roads, seq([0.5]), 5)).toHaveLength(5);
  });
});
