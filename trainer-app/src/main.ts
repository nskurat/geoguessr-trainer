import './index.css';
import { relocalizeTrainer, startTrainer } from './app/trainer';
import { COUNTRIES, DEFAULT_COUNTRY } from './data/countries';
import { LANGUAGES, currentLanguage, localizeStatic, setLanguage, t } from './i18n';
import { indexCountry } from './services/country/countryIndex';
import { negotiateLanguage } from './services/i18n/negotiate';
import { LocalTrainerStorage } from './services/storage/trainerStorage';
import type { Country } from './types/geo';
import { LANGS, SOURCE_LANG, type Lang } from './types/i18n';
import { escapeHtml } from './utils/html';

const LAST_COUNTRY_KEY = 'geotrainer_country';
/** The language picked in the picker; global, not per country. */
const LANG_KEY = 'geotrainer_lang';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // Storage blocked: fall back to the defaults.
  }
}
function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not remembered; the URL still works.
  }
}

/** The country in the URL (?country=peru), else the last one picked, else the default. */
function chosenCountry(): string {
  const fromUrl = new URLSearchParams(location.search).get('country');
  const last = readStorage(LAST_COUNTRY_KEY);
  const known = (id: string | null) => !!id && COUNTRIES.some((c) => c.id === id);
  if (known(fromUrl)) return fromUrl!;
  if (known(last)) return last!;
  return DEFAULT_COUNTRY;
}

/** The language in the URL (?lang=be), else the one picked before, else the browser's, else English. */
function chosenLanguage(): Lang {
  const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
  return negotiateLanguage(
    { url: new URLSearchParams(location.search).get('lang'), saved: readStorage(LANG_KEY), browser },
    LANGS,
    SOURCE_LANG,
  );
}

function renderCountryPicker(current: string): void {
  const select = document.querySelector<HTMLSelectElement>('#country')!;
  const lang = currentLanguage();
  select.innerHTML = COUNTRIES.map(
    (c) => `<option value="${c.id}">${escapeHtml(c.name[lang])}</option>`,
  ).join('');
  select.value = current;
}

function bindCountryPicker(current: string): void {
  const select = document.querySelector<HTMLSelectElement>('#country')!;
  renderCountryPicker(current);
  // With several countries, the country name in the title is the picker (see renderChrome).
  document.querySelector<HTMLElement>('#countryPick')!.hidden = COUNTRIES.length < 2;
  select.onchange = () => {
    // A fresh page per country keeps the trainer's state simple; the URL stays shareable
    // and keeps ?lang, so the language carries over.
    const url = new URL(location.href);
    url.searchParams.set('country', select.value);
    location.assign(url);
  };
}

/**
 * Languages are listed by their own names, so anyone can find theirs whatever the current
 * language. Switching re-renders in place (the round in progress is kept), remembers the
 * choice and puts it in the URL so a reload or shared link keeps it.
 */
function bindLanguagePicker(onChange: (lang: Lang) => Promise<void>): void {
  const select = document.querySelector<HTMLSelectElement>('#lang')!;
  select.innerHTML = LANGS.map(
    (l) => `<option value="${l}" lang="${l}">${escapeHtml(LANGUAGES[l].name)}</option>`,
  ).join('');
  select.value = currentLanguage();
  document.querySelector<HTMLElement>('#langL')!.style.display = LANGS.length > 1 ? '' : 'none';
  select.onchange = async () => {
    const lang = select.value as Lang;
    writeStorage(LANG_KEY, lang);
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(history.state, '', url);
    await onChange(lang);
  };
}

/** Applies a language to the page; the trainer re-renders itself when it is running. */
async function applyLanguage(lang: Lang, countryId: string, country: Country | null): Promise<void> {
  try {
    await setLanguage(lang);
  } catch {
    await setLanguage(SOURCE_LANG); // The catalogue failed to load: stay usable in English.
  }
  document.querySelector<HTMLSelectElement>('#lang')!.value = currentLanguage();
  localizeStatic();
  renderCountryPicker(countryId);
  if (country) relocalizeTrainer(indexCountry(country, currentLanguage()));
}

async function main(): Promise<void> {
  const id = chosenCountry();
  writeStorage(LAST_COUNTRY_KEY, id);
  let country: Country | null = null;
  await applyLanguage(chosenLanguage(), id, null);
  bindCountryPicker(id);
  bindLanguagePicker((lang) => applyLanguage(lang, id, country));
  const loaded = await COUNTRIES.find((c) => c.id === id)!.load();
  country = loaded;
  startTrainer(indexCountry(loaded, currentLanguage()), new LocalTrainerStorage(loaded.id));
}

main().catch((error) => {
  const msg = document.querySelector('#msg');
  if (msg) msg.textContent = t('app.startFailed');
  throw error;
});
