import { describe, expect, it } from 'vitest';
import { formatMessage, interpolate, pluralCategory, pluralForm, translate } from '../format';

const forms = { one: '{count} дэпартамент', few: '{count} дэпартаменты', many: '{count} дэпартаментаў', other: '{count} дэпартамента' };

describe('pluralCategory', () => {
  it('follows the Belarusian one/few/many rules', () => {
    const cases: [number, string][] = [
      [1, 'one'], [21, 'one'], [101, 'one'],
      [2, 'few'], [3, 'few'], [4, 'few'], [22, 'few'], [34, 'few'],
      [0, 'many'], [5, 'many'], [11, 'many'], [12, 'many'], [14, 'many'], [20, 'many'], [25, 'many'], [111, 'many'],
      [1.5, 'other'],
    ];
    for (const [n, category] of cases) expect([n, pluralCategory('be', n)]).toEqual([n, category]);
  });

  it('follows the English one/other rules', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect(pluralCategory('en', 0)).toBe('other');
    expect(pluralCategory('en', 2)).toBe('other');
    expect(pluralCategory('en', 21)).toBe('other');
  });
});

describe('pluralForm', () => {
  it('picks the form for the number', () => {
    expect(pluralForm('be', forms, 1)).toBe('{count} дэпартамент');
    expect(pluralForm('be', forms, 3)).toBe('{count} дэпартаменты');
    expect(pluralForm('be', forms, 13)).toBe('{count} дэпартаментаў');
  });

  it('falls back to other when a category is missing', () => {
    expect(pluralForm('be', { one: 'a', other: 'b' }, 5)).toBe('b');
    expect(pluralForm('en', { other: 'only' }, 1)).toBe('only');
  });
});

describe('interpolate', () => {
  it('replaces placeholders, numbers included', () => {
    expect(interpolate('{a} / {b} solid', { a: 3, b: 13 })).toBe('3 / 13 solid');
  });

  it('replaces every occurrence', () => {
    expect(interpolate('{x}-{x}', { x: 'y' })).toBe('y-y');
  });

  it('leaves unknown placeholders visible', () => {
    expect(interpolate('Hi {name}', {})).toBe('Hi {name}');
  });

  it('escapes inserted values only', () => {
    const esc = (v: string) => v.replace(/</g, '&lt;');
    expect(interpolate('<b>{v}</b>', { v: '<i>' }, esc)).toBe('<b>&lt;i></b>');
  });

  it('does not treat object prototype names as parameters', () => {
    expect(interpolate('{constructor}', {})).toBe('{constructor}');
  });
});

describe('formatMessage', () => {
  it('formats plain strings', () => {
    expect(formatMessage('en', 'Zone {zone}', { zone: '04' })).toBe('Zone 04');
  });

  it('selects the plural form by count', () => {
    expect(formatMessage('be', forms, { count: 22 })).toBe('22 дэпартаменты');
    expect(formatMessage('be', forms, { count: 96 })).toBe('96 дэпартаментаў');
  });

  it('treats a missing count as zero', () => {
    expect(formatMessage('be', forms)).toBe('{count} дэпартаментаў');
  });
});

describe('translate', () => {
  const en = { hello: 'Hello {name}', only: 'English only' };
  const be = { hello: 'Прывітанне, {name}' };

  it('uses the language’s message', () => {
    expect(translate('be', be, en, 'hello', { name: 'Ала' })).toBe('Прывітанне, Ала');
  });

  it('falls back to the source language', () => {
    expect(translate<'hello' | 'only'>('be', be, en, 'only')).toBe('English only');
  });

  it('returns the key when no language has it', () => {
    expect(translate<string>('be', be, en, 'nope')).toBe('nope');
  });
});
