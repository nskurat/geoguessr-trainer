import { describe, expect, it } from 'vitest';
import { shuffle } from '../random';
import { lcg } from './rng';

describe('shuffle', () => {
  it('shuffles in place and returns the same array', () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items, lcg(1));
    expect(result).toBe(items);
  });

  it('keeps every element exactly once', () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    shuffle(items, lcg(7));
    expect([...items].sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it('is deterministic for a given rng', () => {
    const a = shuffle(
      Array.from({ length: 20 }, (_, i) => i),
      lcg(42),
    );
    const b = shuffle(
      Array.from({ length: 20 }, (_, i) => i),
      lcg(42),
    );
    expect(a).toEqual(b);
  });

  it('gives different orders for different seeds', () => {
    const a = shuffle(
      Array.from({ length: 20 }, (_, i) => i),
      lcg(1),
    );
    const b = shuffle(
      Array.from({ length: 20 }, (_, i) => i),
      lcg(2),
    );
    expect(a).not.toEqual(b);
  });

  it('actually reorders with a typical rng', () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    shuffle(items, lcg(3));
    expect(items).not.toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  it('leaves the order unchanged when rng always returns just under 1', () => {
    const items = [1, 2, 3, 4];
    shuffle(items, () => 0.999999);
    expect(items).toEqual([1, 2, 3, 4]);
  });

  it('handles empty and single-element arrays without calling rng', () => {
    const rng = () => {
      throw new Error('rng should not be called');
    };
    expect(shuffle([], rng)).toEqual([]);
    expect(shuffle(['a'], rng)).toEqual(['a']);
  });
});
