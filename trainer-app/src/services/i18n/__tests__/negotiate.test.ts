import { describe, expect, it } from 'vitest';
import type { Lang } from '../../../types/i18n';
import { matchLanguage, negotiateLanguage } from '../negotiate';

const supported: Lang[] = ['en', 'be'];

describe('matchLanguage', () => {
  it('matches primary subtags in any case and separator', () => {
    expect(matchLanguage('be', supported)).toBe('be');
    expect(matchLanguage('be-BY', supported)).toBe('be');
    expect(matchLanguage('BE_by', supported)).toBe('be');
    expect(matchLanguage(' en-GB ', supported)).toBe('en');
  });

  it('rejects unsupported, empty and lookalike tags', () => {
    expect(matchLanguage('ru', supported)).toBeNull();
    expect(matchLanguage('ber', supported)).toBeNull();
    expect(matchLanguage('', supported)).toBeNull();
    expect(matchLanguage(null, supported)).toBeNull();
    expect(matchLanguage(undefined, supported)).toBeNull();
  });
});

describe('negotiateLanguage', () => {
  it('prefers the URL', () => {
    expect(negotiateLanguage({ url: 'be', saved: 'en', browser: ['en'] }, supported, 'en')).toBe('be');
  });

  it('then the saved choice', () => {
    expect(negotiateLanguage({ url: 'xx', saved: 'be', browser: ['en'] }, supported, 'en')).toBe('be');
  });

  it('then the first supported browser language', () => {
    expect(negotiateLanguage({ browser: ['ru-RU', 'be-BY', 'en'] }, supported, 'en')).toBe('be');
  });

  it('does not map Russian to Belarusian', () => {
    expect(negotiateLanguage({ browser: ['ru'] }, supported, 'en')).toBe('en');
  });

  it('falls back when nothing matches', () => {
    expect(negotiateLanguage({}, supported, 'en')).toBe('en');
  });
});
