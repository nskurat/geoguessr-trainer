import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings } from '../settings';

const valid = { regionKeys: ['BRE', 'IDF'], riverIds: ['r0', 'r1'], roadIds: ['a7', 'a44'] };

describe('normalizeSettings', () => {
  it('returns the defaults for garbage, null and non-objects', () => {
    for (const raw of [null, undefined, 'x', 42, true, [], {}]) {
      expect(normalizeSettings(raw, valid)).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('returns a new object, not the shared defaults', () => {
    expect(normalizeSettings(null, valid)).not.toBe(DEFAULT_SETTINGS);
  });

  it('keeps valid values', () => {
    const raw = {
      set: 'riv',
      mode: 'practice',
      kind: 'town',
      scope: 'BRE',
      ask: 'mix',
      labels: 'off',
      river: 'r1',
      size: 'all',
      phoneFilter: 'all',
      road: 'a44',
      roadClass: '2',
    };
    expect(normalizeSettings(raw, valid)).toEqual(raw);
  });

  it('keeps valid fields while replacing invalid ones', () => {
    const result = normalizeSettings({ set: 'dep', mode: 'bogus', size: '40' }, valid);
    expect(result).toEqual({ ...DEFAULT_SETTINGS, set: 'dep', size: '40' });
  });

  it('rejects unknown region keys and river ids', () => {
    const result = normalizeSettings({ scope: 'XXX', river: 'r99' }, valid);
    expect(result.scope).toBe('all');
    expect(result.river).toBe('all');
  });

  it('rejects a road the country does not have, and any road without road ids', () => {
    expect(normalizeSettings({ road: 'a99', roadClass: '4' }, valid)).toMatchObject({
      road: 'all',
      roadClass: 'all',
    });
    expect(normalizeSettings({ road: 'a7' }, { regionKeys: [], riverIds: [] }).road).toBe('all');
  });

  it('accepts all as scope and river', () => {
    expect(normalizeSettings({ scope: 'all', river: 'all' }, valid)).toMatchObject({
      scope: 'all',
      river: 'all',
    });
  });

  it('normalises a saved area to all when the country has no regions, keeping the rest', () => {
    const noRegions = { regionKeys: [], riverIds: ['r0'], sets: ['dep', 'city', 'riv', 'nom'] as const };
    const result = normalizeSettings({ set: 'city', scope: 'CEN', river: 'r0', size: '40' }, noRegions);
    expect(result).toMatchObject({ set: 'city', scope: 'all', river: 'r0', size: '40' });
  });

  it('falls back to the first offered set when the saved reg set is no longer offered', () => {
    const result = normalizeSettings({ set: 'reg', scope: 'all' }, { ...valid, sets: ['dep', 'city'] });
    expect(result.set).toBe('dep');
  });

  it('keeps a saved area when the regions are an Area filter only (no reg set)', () => {
    const result = normalizeSettings({ set: 'dep', scope: 'BRE' }, { ...valid, sets: ['dep', 'city'] });
    expect(result).toMatchObject({ set: 'dep', scope: 'BRE' });
  });

  it('rejects unknown enum values and wrong types', () => {
    const result = normalizeSettings(
      { set: 'zzz', mode: 1, kind: null, ask: 'x', labels: {}, size: 20, phoneFilter: 'none' },
      valid,
    );
    expect(result).toEqual(DEFAULT_SETTINGS);
  });
});
