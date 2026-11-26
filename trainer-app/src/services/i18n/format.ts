import type { Lang, Message, MessageParams, PluralCategory, PluralForms } from '../../types/i18n';

/*
 * Message formatting: placeholder interpolation and plural selection. Pure; the
 * active language and dictionaries live in `i18n/index.ts`.
 */

const rulesCache = new Map<string, Intl.PluralRules>();

/** The CLDR plural category of `n` in `lang` (Belarusian: 1 one, 2–4 few, 5–20 many, 21 one…). */
export function pluralCategory(lang: Lang, n: number): PluralCategory {
  let rules = rulesCache.get(lang);
  if (!rules) {
    rules = new Intl.PluralRules(lang);
    rulesCache.set(lang, rules);
  }
  return rules.select(n);
}

/** The form of `forms` for `n`, falling back to `other`. */
export function pluralForm(lang: Lang, forms: PluralForms, n: number): string {
  return forms[pluralCategory(lang, n)] ?? forms.other;
}

/**
 * Replaces `{name}` with `params.name`. Unknown placeholders are left as they are, so a
 * missing parameter shows up on screen instead of silently vanishing. `escape` is applied
 * to each inserted value (for HTML templates).
 */
export function interpolate(
  template: string,
  params: MessageParams = {},
  escape: (value: string) => string = (v) => v,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? escape(String(params[name])) : whole,
  );
}

/** Picks the plural form (by `params.count`, if the message has forms), then interpolates. */
export function formatMessage(
  lang: Lang,
  message: Message,
  params: MessageParams = {},
  escape?: (value: string) => string,
): string {
  const template =
    typeof message === 'string' ? message : pluralForm(lang, message, Number(params.count ?? 0));
  return interpolate(template, params, escape);
}

/**
 * Looks `key` up in `messages`, then in `fallback` (the source language), and formats it.
 * A key missing from both is returned as is, which is visible on screen and in tests.
 */
export function translate<K extends string>(
  lang: Lang,
  messages: Partial<Record<K, Message>>,
  fallback: Partial<Record<K, Message>>,
  key: K,
  params?: MessageParams,
  escape?: (value: string) => string,
): string {
  const message = messages[key] ?? fallback[key];
  return message === undefined ? key : formatMessage(lang, message, params, escape);
}
