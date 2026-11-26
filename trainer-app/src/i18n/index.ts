import { pluralForm, translate } from '../services/i18n/format';
import type { Term } from '../types/geo';
import { SOURCE_LANG, type Lang, type MessageParams, type PluralForms } from '../types/i18n';
import { escapeHtml } from '../utils/html';
import { en, type MessageKey, type Messages } from './en';

/*
 * The active interface language: message lookup (`t`, `th`) and the static
 * `data-i18n` text in index.html. Formatting itself is pure and tested in
 * `services/i18n/`. English is bundled; other catalogues load on demand.
 */

/** Every interface language: its name in itself (shown in the picker) and its catalogue. */
export const LANGUAGES: Record<Lang, { name: string; load: () => Promise<Messages> }> = {
  en: { name: 'English', load: () => Promise.resolve(en) },
  be: { name: 'Беларуская', load: () => import('./be').then((m) => m.be) },
};

let lang: Lang = SOURCE_LANG;
let messages: Messages = en;

export const currentLanguage = (): Lang => lang;

/** Loads `next`'s catalogue and makes it active. Callers re-render afterwards. */
export async function setLanguage(next: Lang): Promise<void> {
  const loaded = await LANGUAGES[next].load();
  lang = next;
  messages = loaded;
  document.documentElement.lang = next;
}

/** A message as plain text (escape it before putting it into HTML). */
export const t = (key: MessageKey, params?: MessageParams): string =>
  translate(lang, messages, en, key, params);

/** A message that is trusted HTML (`<b>`, `<span>`), with its parameters escaped. */
export const th = (key: MessageKey, params?: MessageParams): string =>
  translate(lang, messages, en, key, params, escapeHtml);

/** The form of `forms` for `n` in the active language. */
export const plural = (forms: PluralForms, n: number): string => pluralForm(lang, forms, n);

/** The term's form after the number `n`: "départements" / "дэпартаментаў" (for 13). */
export const termFor = (term: Term, n: number): string =>
  term.counted ? plural(term.counted, n) : term.many.toLowerCase();

/**
 * Fills the static text of the page: `data-i18n` sets the text, `data-i18n-aria` the
 * aria-label. Keys are checked when the page is localized, not at compile time.
 */
export function localizeStatic(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as MessageKey);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria as MessageKey));
  });
}
