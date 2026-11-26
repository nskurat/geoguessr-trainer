import { describe, expect, it } from 'vitest';
import { lcg } from '../../../utils/__tests__/rng';
import { areaOverlap, pickChoices, pickPatternChoices } from '../distractors';

const groupOf = (x: string) => x[0]; // 'a1' and 'a2' share group 'a'
const allItems = ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'c1', 'c2', 'd1'];

describe('pickChoices', () => {
  it('returns four unique options including the answer', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const choices = pickChoices({ answer: 'a1', roundItems: allItems, allItems, groupOf, rng: lcg(seed) });
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain('a1');
    }
  });

  it('uses up to two same-group distractors when available', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const choices = pickChoices({ answer: 'a1', roundItems: allItems, allItems, groupOf, rng: lcg(seed) });
      expect(choices.filter((c) => groupOf(c) === 'a')).toHaveLength(3); // answer + two
    }
  });

  it('uses fewer same-group distractors if the group is small', () => {
    const choices = pickChoices({ answer: 'd1', roundItems: allItems, allItems, groupOf, rng: lcg(3) });
    expect(choices.filter((c) => groupOf(c) === 'd')).toEqual(['d1']);
    expect(choices).toHaveLength(4);
  });

  it('fills from allItems when the round is small', () => {
    const choices = pickChoices({ answer: 'b1', roundItems: ['b1', 'b2'], allItems, groupOf, rng: lcg(4) });
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain('b1');
    expect(choices).toContain('b2');
  });

  it('prefers round items over the rest of the set', () => {
    const roundItems = ['b1', 'c1', 'd1', 'a1'];
    for (let seed = 1; seed <= 10; seed++) {
      const choices = pickChoices({ answer: 'b1', roundItems, allItems, groupOf, rng: lcg(seed) });
      expect([...choices].sort()).toEqual(['a1', 'b1', 'c1', 'd1']);
    }
  });

  it('is deterministic for a given rng', () => {
    const run = () => pickChoices({ answer: 'a1', roundItems: allItems, allItems, groupOf, rng: lcg(8) });
    expect(run()).toEqual(run());
  });

  it('copes with fewer than four items overall', () => {
    const choices = pickChoices({
      answer: 'x',
      roundItems: ['x', 'y'],
      allItems: ['x', 'y'],
      groupOf,
      rng: lcg(1),
    });
    expect([...choices].sort()).toEqual(['x', 'y']);
  });
});

describe('areaOverlap', () => {
  it('is the shared share of the smaller area', () => {
    expect(areaOverlap(['1', '2', '3', '4'], ['3', '4'])).toBe(1);
    expect(areaOverlap(['1', '2', '3', '4'], ['4', '5'])).toBe(0.5);
    expect(areaOverlap(['1', '2'], ['3', '4'])).toBe(0);
  });

  it('is symmetric', () => {
    expect(areaOverlap(['1', '2', '3'], ['3', '4'])).toBe(areaOverlap(['3', '4'], ['1', '2', '3']));
  });
});

describe('pickPatternChoices', () => {
  const patterns = [
    { id: 'p1', codes: ['01', '02', '03', '04'] },
    { id: 'overlap-all', codes: ['01', '02'] }, // overlap 1
    { id: 'overlap-half', codes: ['04', '09'] }, // overlap 0.5
    { id: 'p4', codes: ['10', '11'] },
    { id: 'p5', codes: ['12'] },
    { id: 'p6', codes: ['13', '14'] },
    { id: 'p7', codes: ['15'] },
  ];

  it('returns the answer plus three non-overlapping patterns', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const choices = pickPatternChoices('p1', patterns, lcg(seed));
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain('p1');
    }
  });

  it('excludes patterns overlapping by 0.5 or more', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const choices = pickPatternChoices('p1', patterns, lcg(seed));
      expect(choices).not.toContain('overlap-all');
      expect(choices).not.toContain('overlap-half');
    }
  });

  it('returns fewer options when too few patterns qualify', () => {
    const choices = pickPatternChoices('p1', patterns.slice(0, 4), lcg(1));
    expect([...choices].sort()).toEqual(['p1', 'p4']);
  });
});
