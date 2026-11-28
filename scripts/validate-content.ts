/*
 * Checks every country's content data (regions, départements, cities, phone
 * zones, place-name patterns, rivers) for schema and referential errors, so
 * a typo in a JSON file fails here rather than showing up as a broken quiz.
 *
 *   npm run validate:data
 *
 * Prints errors and warnings per country and exits with code 1 on any error
 * (warnings alone do not fail). To validate another country, add it to COUNTRIES.
 * Every country must have copy in every interface language (types/i18n.ts LANGS).
 */
import { COUNTRIES as REGISTRY } from '../trainer-app/src/data/countries';
import { france } from '../trainer-app/src/data/france/index';
import { germany } from '../trainer-app/src/data/germany/index';
import { poland } from '../trainer-app/src/data/poland/index';
import { peru } from '../trainer-app/src/data/peru/index';
import { validateCountry } from '../trainer-app/src/services/country/schema';
import type { Country } from '../trainer-app/src/types/geo';
import { LANGS } from '../trainer-app/src/types/i18n';

const COUNTRIES: Country[] = [france, peru, germany, poland];

let failed = false;
for (const country of COUNTRIES) {
  const { errors, warnings } = validateCountry(country);
  // The picker shows registry names before the country loads; they must match its copy.
  const entry = REGISTRY.find((c) => c.id === country.id);
  if (!entry) errors.push('not listed in data/countries.ts');
  for (const lang of LANGS)
    if (entry && country.copy[lang] && entry.name[lang] !== country.copy[lang].countryName)
      errors.push(`data/countries.ts name.${lang} "${entry.name[lang]}" differs from copy.${lang}.countryName`);
  console.log(`${country.name} (${country.id}): ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const e of errors) console.log(`  error:   ${e}`);
  for (const w of warnings) console.log(`  warning: ${w}`);
  if (errors.length) failed = true;
}

process.exit(failed ? 1 : 0);
