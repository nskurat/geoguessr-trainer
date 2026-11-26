/*
 * Checks every country's content data (regions, départements, cities, phone
 * zones, place-name patterns, rivers) for schema and referential errors, so
 * a typo in a JSON file fails here rather than showing up as a broken quiz.
 *
 *   npm run validate:data
 *
 * Prints errors and warnings per country and exits with code 1 on any error
 * (warnings alone do not fail). To validate another country, add it to COUNTRIES.
 */
import { france } from '../trainer-app/src/data/france/index';
import { validateCountry } from '../trainer-app/src/services/country/schema';
import type { Country } from '../trainer-app/src/types/geo';

const COUNTRIES: Country[] = [france];

let failed = false;
for (const country of COUNTRIES) {
  const { errors, warnings } = validateCountry(country);
  console.log(`${country.name} (${country.id}): ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const e of errors) console.log(`  error:   ${e}`);
  for (const w of warnings) console.log(`  warning: ${w}`);
  if (errors.length) failed = true;
}

process.exit(failed ? 1 : 0);
