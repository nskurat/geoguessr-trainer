/** Interface languages, in picker order. `en` is the source language and the fallback. */
export const LANGS = ['en', 'be'] as const;
export type Lang = (typeof LANGS)[number];
export const SOURCE_LANG: Lang = 'en';

/** CLDR plural categories, as returned by `Intl.PluralRules#select`. */
export type PluralCategory = Intl.LDMLPluralRule;

/**
 * A message that depends on a number (the `count` parameter). `other` is required as
 * the fallback; a language fills the categories it has (English: one/other;
 * Belarusian: one/few/many, with `other` for fractions).
 */
export type PluralForms = Partial<Record<PluralCategory, string>> & { other: string };

/** One interface message: a template with `{param}` placeholders, or plural forms of one. */
export type Message = string | PluralForms;

export type MessageParams = Record<string, string | number>;
