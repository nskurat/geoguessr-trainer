import './index.css';
import { startTrainer } from './app/trainer';
import { COUNTRIES, DEFAULT_COUNTRY } from './data/countries';
import { indexCountry } from './services/country/countryIndex';
import { LocalTrainerStorage } from './services/storage/trainerStorage';

const LAST_COUNTRY_KEY = 'geotrainer_country';

/** The country in the URL (?country=peru), else the last one picked, else the default. */
function chosenCountry(): string {
  const fromUrl = new URLSearchParams(location.search).get('country');
  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_COUNTRY_KEY);
  } catch {
    // Storage blocked: fall back to the default.
  }
  const known = (id: string | null) => !!id && COUNTRIES.some((c) => c.id === id);
  if (known(fromUrl)) return fromUrl!;
  if (known(last)) return last!;
  return DEFAULT_COUNTRY;
}

function bindCountryPicker(current: string): void {
  const select = document.querySelector<HTMLSelectElement>('#country')!;
  select.innerHTML = COUNTRIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  select.value = current;
  document.querySelector<HTMLElement>('#countryL')!.style.display = COUNTRIES.length > 1 ? '' : 'none';
  select.onchange = () => {
    // A fresh page per country keeps the trainer's state simple; the URL stays shareable.
    const url = new URL(location.href);
    url.searchParams.set('country', select.value);
    location.assign(url);
  };
}

async function main(): Promise<void> {
  const id = chosenCountry();
  try {
    localStorage.setItem(LAST_COUNTRY_KEY, id);
  } catch {
    // Not remembered; the URL still works.
  }
  bindCountryPicker(id);
  const country = await COUNTRIES.find((c) => c.id === id)!.load();
  startTrainer(indexCountry(country), new LocalTrainerStorage(country.id));
}

main().catch((error) => {
  const msg = document.querySelector('#msg');
  if (msg) msg.textContent = 'The trainer could not start. Reload the page to try again.';
  throw error;
});
