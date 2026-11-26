import './index.css';
import { startTrainer } from './app/trainer';
import { france } from './data/france';
import { indexCountry } from './services/country/countryIndex';
import { LocalTrainerStorage } from './services/storage/trainerStorage';

// Only France so far; a country picker is in docs/backlog.md.
const country = france;

try {
  startTrainer(indexCountry(country), new LocalTrainerStorage(country.id));
} catch (error) {
  const msg = document.querySelector('#msg');
  if (msg) msg.textContent = 'The trainer could not start. Reload the page to try again.';
  throw error;
}
