import { describe, expect, it } from 'vitest';
import { lcg } from '../../../utils/__tests__/rng';
import { MAX_REPEATS, createRound, recordOutcome } from '../round';

const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

describe('createRound', () => {
  it('queues a shuffled copy and leaves the items untouched', () => {
    const original = [...items];
    const round = createRound(original, lcg(5));
    expect(original).toEqual(items);
    expect(round.items).toBe(original);
    expect(round.queue).not.toBe(original);
    expect([...round.queue].sort()).toEqual(items);
  });

  it('is deterministic for a given rng', () => {
    expect(createRound(items, lcg(9)).queue).toEqual(createRound(items, lcg(9)).queue);
  });

  it('starts with no answers or score', () => {
    const round = createRound(items, lcg(1));
    expect(round).toMatchObject({ first: {}, shown: {}, repeats: {}, score: 0 });
  });
});

describe('recordOutcome', () => {
  it('scores only a first attempt that is right first time', () => {
    const round = createRound(items, lcg(1));
    expect(recordOutcome(round, 'a', 0, false, () => 0)).toBe(true);
    expect(round.score).toBe(1);
    expect(round.first.a).toBe(0);
  });

  it('does not score first attempts with a non-zero outcome', () => {
    const round = createRound(items, lcg(1));
    recordOutcome(round, 'a', 2, false, () => 0);
    expect(round.score).toBe(0);
    expect(round.first.a).toBe(2);
  });

  it('flags repeat attempts, keeps the first outcome and does not score again', () => {
    const round = createRound(items, lcg(1));
    recordOutcome(round, 'a', 3, true, () => 0);
    expect(recordOutcome(round, 'a', 0, false, () => 0)).toBe(false);
    expect(round.first.a).toBe(3);
    expect(round.shown.a).toBe(0);
    expect(round.score).toBe(0);
  });

  it('requeues a miss 3 to 5 places down the queue', () => {
    for (const [r, offset] of [
      [0, 3],
      [0.34, 4],
      [0.99, 5],
    ] as const) {
      const round = createRound(items, lcg(1));
      const before = [...round.queue];
      recordOutcome(round, 'zzz', 3, true, () => r);
      expect(round.queue).toHaveLength(before.length + 1);
      expect(round.queue.indexOf('zzz')).toBe(offset);
    }
  });

  it('caps the position at the queue length', () => {
    const round = createRound(['a', 'b'], lcg(1));
    recordOutcome(round, 'a', 3, true, () => 0.99);
    expect(round.queue.at(-1)).toBe('a');
    expect(round.queue).toHaveLength(3);
  });

  it('requeues at most MAX_REPEATS times', () => {
    const round = createRound(items, lcg(1));
    const length = round.queue.length;
    for (let i = 0; i < MAX_REPEATS + 3; i++) recordOutcome(round, 'a', 3, true, () => 0);
    expect(round.repeats.a).toBe(MAX_REPEATS);
    expect(round.queue).toHaveLength(length + MAX_REPEATS);
  });

  it('does not requeue when not missed', () => {
    const round = createRound(items, lcg(1));
    const before = [...round.queue];
    recordOutcome(round, 'a', 1, false, () => 0);
    expect(round.queue).toEqual(before);
    expect(round.repeats.a).toBeUndefined();
  });

  it('shows the latest outcome', () => {
    const round = createRound(items, lcg(1));
    recordOutcome(round, 'a', 3, true, () => 0);
    recordOutcome(round, 'a', 1, false, () => 0);
    expect(round.shown.a).toBe(1);
  });
});
