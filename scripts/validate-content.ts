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
 * Road files (`roads.json`, `roads.osm.json`, `roadCourses.json`) and the picker's
 * `locator.json` are read from each country's folder when present.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COUNTRIES as REGISTRY } from '../trainer-app/src/data/countries';
import { france } from '../trainer-app/src/data/france/index';
import { germany } from '../trainer-app/src/data/germany/index';
import { poland } from '../trainer-app/src/data/poland/index';
import { peru } from '../trainer-app/src/data/peru/index';
import { LocatorSchema, validateCountry, validateRoadFiles } from '../trainer-app/src/services/country/schema';
import type { Country } from '../trainer-app/src/types/geo';
import { LANGS } from '../trainer-app/src/types/i18n';

const COUNTRIES: Country[] = [france, peru, germany, poland];
const DATA = join(dirname(fileURLToPath(import.meta.url)), '../trainer-app/src/data');

/** A JSON file of the country's folder, or undefined when it does not exist. */
function readData(country: string, file: string): unknown {
  const path = join(DATA, country, file);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
}

let failed = false;
for (const country of COUNTRIES) {
  const { errors, warnings } = validateCountry(country);
  // The picker shows registry names before the country loads; they must match its copy.
  const entry = REGISTRY.find((c) => c.id === country.id);
  if (!entry) errors.push('not listed in data/countries.ts');
  for (const lang of LANGS)
    if (entry && country.copy[lang] && entry.name[lang] !== country.copy[lang].countryName)
      errors.push(`data/countries.ts name.${lang} "${entry.name[lang]}" differs from copy.${lang}.countryName`);
  const roads = readData(country.id, 'roads.json');
  const osm = readData(country.id, 'roads.osm.json');
  const own = readData(country.id, 'roadCourses.json');
  if (roads !== undefined) {
    const result = validateRoadFiles(country, { roads, osm, own });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  } else if (osm !== undefined || own !== undefined) errors.push('road courses without roads.json');
  if (country.sets.includes('road') && roads === undefined) errors.push('offers road but has no roads.json');
  const locator = readData(country.id, 'locator.json');
  if (locator === undefined) warnings.push('no locator.json (npm run build:locator)');
  else {
    const parsed = LocatorSchema.safeParse(locator);
    if (!parsed.success)
      for (const issue of parsed.error.issues) errors.push(`locator.json.${issue.path.join('.')}: ${issue.message}`);
  }
  console.log(`${country.name} (${country.id}): ${errors.length} error(s), ${warnings.length} warning(s)`);
  for (const e of errors) console.log(`  error:   ${e}`);
  for (const w of warnings) console.log(`  warning: ${w}`);
  if (errors.length) failed = true;
}

process.exit(failed ? 1 : 0);
