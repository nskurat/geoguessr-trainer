import { describe, expect, it } from 'vitest';
import { LocalTrainerStorage, progressKey, settingsKey, type StorageLike } from '../trainerStorage';

function mapStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing: StorageLike = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('quota');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('LocalTrainerStorage', () => {
  it('returns null settings and empty progress when nothing is stored', () => {
    const s = new LocalTrainerStorage('france', mapStorage());
    expect(s.loadSettings()).toBeNull();
    expect(s.loadProgress()).toEqual({});
  });

  it('round-trips settings', () => {
    const backing = mapStorage();
    new LocalTrainerStorage('france', backing).saveSettings({ set: 'dep', size: '10' });
    expect(new LocalTrainerStorage('france', backing).loadSettings()).toEqual({ set: 'dep', size: '10' });
  });

  it('round-trips progress', () => {
    const backing = mapStorage();
    const progress = { 'reg|BRE': { box: 2, seenAt: 123 } };
    new LocalTrainerStorage('france', backing).saveProgress(progress);
    expect(new LocalTrainerStorage('france', backing).loadProgress()).toEqual(progress);
  });

  it('keeps countries separate', () => {
    const backing = mapStorage();
    const fr = new LocalTrainerStorage('france', backing);
    const es = new LocalTrainerStorage('spain', backing);
    fr.saveProgress({ a: { box: 1, seenAt: 1 } });
    es.saveProgress({ b: { box: 2, seenAt: 2 } });
    fr.saveSettings({ set: 'reg' });
    expect(fr.loadProgress()).toEqual({ a: { box: 1, seenAt: 1 } });
    expect(es.loadProgress()).toEqual({ b: { box: 2, seenAt: 2 } });
    expect(es.loadSettings()).toBeNull();
    expect(backing.data.has(progressKey('france'))).toBe(true);
    expect(backing.data.has(settingsKey('spain'))).toBe(false);
  });

  it('drops malformed progress entries', () => {
    const backing = mapStorage();
    backing.data.set(
      progressKey('france'),
      JSON.stringify({
        good: { box: 1, seenAt: 5 },
        noSeen: { box: 1 },
        wrongTypes: { box: '1', seenAt: '5' },
        nul: null,
        num: 3,
        str: 'x',
      }),
    );
    expect(new LocalTrainerStorage('france', backing).loadProgress()).toEqual({
      good: { box: 1, seenAt: 5 },
    });
  });

  it('returns null / {} for corrupted JSON', () => {
    const backing = mapStorage();
    backing.data.set(settingsKey('france'), '{not json');
    backing.data.set(progressKey('france'), '{not json');
    const s = new LocalTrainerStorage('france', backing);
    expect(s.loadSettings()).toBeNull();
    expect(s.loadProgress()).toEqual({});
  });

  it('returns {} for progress that is not an object', () => {
    const backing = mapStorage();
    backing.data.set(progressKey('france'), '"hello"');
    expect(new LocalTrainerStorage('france', backing).loadProgress()).toEqual({});
  });

  it('falls back to memory when storage throws', () => {
    const s = new LocalTrainerStorage('france', throwing);
    expect(() => s.saveSettings({ set: 'tel' })).not.toThrow();
    expect(() => s.saveProgress({ k: { box: 3, seenAt: 9 } })).not.toThrow();
    expect(s.loadSettings()).toEqual({ set: 'tel' });
    expect(s.loadProgress()).toEqual({ k: { box: 3, seenAt: 9 } });
  });

  it('works purely in memory with null storage', () => {
    const s = new LocalTrainerStorage('france', null);
    expect(s.loadSettings()).toBeNull();
    s.saveSettings({ set: 'nom' });
    s.saveProgress({ k: { box: 1, seenAt: 1 } });
    expect(s.loadSettings()).toEqual({ set: 'nom' });
    expect(s.loadProgress()).toEqual({ k: { box: 1, seenAt: 1 } });
  });
});
