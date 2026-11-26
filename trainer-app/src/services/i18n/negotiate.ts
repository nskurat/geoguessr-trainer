import type { Lang } from '../../types/i18n';

/** Where the interface language can come from, in priority order. */
export interface LanguageSources {
  /** `?lang=` from the URL. */
  url?: string | null;
  /** The choice saved by the language picker. */
  saved?: string | null;
  /** `navigator.languages` (or `[navigator.language]`), most preferred first. */
  browser?: readonly string[];
}

/** The supported language a tag such as "be", "be-BY" or "BE_by" stands for, if any. */
export function matchLanguage(tag: string | null | undefined, supported: readonly Lang[]): Lang | null {
  if (!tag) return null;
  const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
  return supported.find((l) => l === primary) ?? null;
}

/**
 * The interface language: the URL, else the saved choice, else the first browser language
 * we support, else `fallback`. A tag only matches its own language (Russian does not fall
 * back to Belarusian or the reverse).
 */
export function negotiateLanguage(sources: LanguageSources, supported: readonly Lang[], fallback: Lang): Lang {
  return (
    matchLanguage(sources.url, supported) ??
    matchLanguage(sources.saved, supported) ??
    (sources.browser ?? []).map((t) => matchLanguage(t, supported)).find((l) => l !== null) ??
    fallback
  );
}
