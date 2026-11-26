import { z } from 'zod';
import type { Country } from '../../types/geo';

/*
 * Zod schemas mirroring `types/geo.ts`, plus `validateCountry`, which adds the
 * referential and sanity checks a schema cannot express. Used by
 * `npm run validate:data` and the schema tests, not by the app at runtime.
 */

const lat = z.number().min(-90).max(90);
const lon = z.number().min(-180).max(180);
const hue = z.number().min(0).max(360);
const nonEmpty = z.string().min(1);

export const RegionSchema = z.object({
  key: nonEmpty,
  name: nonEmpty,
  capital: nonEmpty,
  hue,
  codes: z.array(nonEmpty).min(1),
});

export const DepartmentSchema = z.object({
  code: nonEmpty,
  name: nonEmpty,
  prefecture: nonEmpty,
  lat,
  lon,
  plate: nonEmpty.optional(),
});

export const CitySchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  code: nonEmpty,
  lat,
  lon,
  tier: z.union([z.literal(1), z.literal(2)]),
});

export const PhoneZoneSchema = z.object({
  zone: nonEmpty,
  name: nonEmpty,
  description: z.string(),
  hue,
});

export const PhoneDataSchema = z.object({
  zones: z.array(PhoneZoneSchema),
  zoneByDepartement: z.record(z.string(), z.string()),
  borderDepartements: z.array(z.string()),
  localPrefixes: z.record(z.string(), z.array(nonEmpty).min(1)).optional(),
});

const StudySetSchema = z.enum(['reg', 'dep', 'city', 'riv', 'tel', 'nom']);
const TermSchema = z.object({ one: nonEmpty, many: nonEmpty });

/** Country-level settings and interface text. */
export const CountryMetaSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: nonEmpty,
  sets: z.array(StudySetSchema).min(1),
  departmentCodes: z.enum(['shown', 'hidden']),
  projectionRefLat: lat,
  outline: z.object({
    viewBox: z.string().regex(/^-?[\d.]+[ ,]-?[\d.]+[ ,][\d.]+[ ,][\d.]+$/),
    locations: z.array(z.object({ id: nonEmpty, name: z.string(), path: nonEmpty })).min(1),
    affine: z.array(z.array(z.number()).length(3)).length(2).optional(),
  }),
  copy: z.object({
    subtitle: nonEmpty,
    setLabels: z.partialRecord(StudySetSchema, nonEmpty),
    regionTerm: TermSchema,
    departmentTerm: TermSchema,
    seatLabel: nonEmpty,
    plateLabel: nonEmpty.optional(),
    allAreas: nonEmpty,
    tips: z.partialRecord(StudySetSchema, nonEmpty),
    phoneHint: z.string(),
    credits: nonEmpty,
  }),
});

export const NameTownSchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  lat,
  lon,
  extra: z.boolean(),
});

export const NamePatternSchema = z.object({
  id: nonEmpty,
  label: nonEmpty,
  where: z.string(),
  origin: z.string(),
  codes: z.array(nonEmpty),
  towns: z.array(NameTownSchema),
});

export const LatLonSchema = z.tuple([lat, lon]);

export const RiverSchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  lengthKm: z.number().positive(),
  lengthIsTotal: z.boolean().optional(),
  flowsInto: nonEmpty,
  course: z.array(LatLonSchema).min(2),
  towns: z.array(nonEmpty),
});

export const RiverTownSchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  lat,
  lon,
});

export const RiverDataSchema = z.object({
  rivers: z.array(RiverSchema),
  towns: z.array(RiverTownSchema),
});

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

/** Items of `list` whose `key` occurs more than once. */
function duplicates<T>(list: T[], key: (item: T) => string): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const item of list) {
    const k = key(item);
    if (seen.has(k)) dup.add(k);
    seen.add(k);
  }
  return [...dup];
}

/** Checks a country's data: schema shape first, then references between its parts. */
export function validateCountry(country: Country): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const check = (label: string, schema: z.ZodType, items: unknown[]) => {
    items.forEach((item, i) => {
      const result = schema.safeParse(item);
      if (result.success) return;
      for (const issue of result.error.issues) {
        errors.push(`${label}[${i}]${issue.path.length ? '.' + issue.path.join('.') : ''}: ${issue.message}`);
      }
    });
  };
  check('country', CountryMetaSchema, [country]);
  check('regions', RegionSchema, country.regions);
  check('departments', DepartmentSchema, country.departments);
  check('cities', CitySchema, country.cities);
  check('phone', PhoneDataSchema, [country.phone]);
  check('namePatterns', NamePatternSchema, country.namePatterns);
  check('rivers', RiverSchema, country.rivers.rivers);
  check('riverTowns', RiverTownSchema, country.rivers.towns);
  // Everything below indexes into the data, so stop here if its shape is wrong.
  if (errors.length) return { errors, warnings };

  // Unique ids / codes / keys.
  const unique = (label: string, list: string[]) => {
    for (const d of duplicates(list, (x) => x)) errors.push(`duplicate ${label} "${d}"`);
  };
  unique(
    'region key',
    country.regions.map((r) => r.key),
  );
  unique(
    'department code',
    country.departments.map((d) => d.code),
  );
  unique(
    'city id',
    country.cities.map((c) => c.id),
  );
  unique(
    'phone zone',
    country.phone.zones.map((z) => z.zone),
  );
  unique(
    'name pattern id',
    country.namePatterns.map((p) => p.id),
  );
  unique(
    'name town id',
    country.namePatterns.flatMap((p) => p.towns.map((t) => t.id)),
  );
  unique(
    'river id',
    country.rivers.rivers.map((r) => r.id),
  );
  unique(
    'river town id',
    country.rivers.towns.map((t) => t.id),
  );

  // Regions and departments.
  const departmentCodes = new Set(country.departments.map((d) => d.code));
  const regionsOf: Record<string, string[]> = {};
  for (const r of country.regions) {
    for (const code of r.codes) {
      if (!departmentCodes.has(code)) errors.push(`region ${r.key} lists unknown department ${code}`);
      (regionsOf[code] ??= []).push(r.key);
    }
  }
  for (const d of country.departments) {
    const regions = regionsOf[d.code] ?? [];
    if (regions.length === 0) errors.push(`department ${d.code} (${d.name}) is in no region`);
    else if (regions.length > 1)
      errors.push(`department ${d.code} (${d.name}) is in several regions: ${regions.join(', ')}`);
  }

  // Phone zones.
  const zones = new Set(country.phone.zones.map((z) => z.zone));
  for (const d of country.departments) {
    const zone = country.phone.zoneByDepartement[d.code];
    if (!zone) errors.push(`department ${d.code} (${d.name}) has no phone zone`);
    else if (!zones.has(zone)) errors.push(`department ${d.code} has unknown phone zone ${zone}`);
  }
  for (const code of Object.keys(country.phone.zoneByDepartement)) {
    if (!departmentCodes.has(code)) errors.push(`phone zone given for unknown department ${code}`);
  }
  for (const code of country.phone.borderDepartements) {
    if (!departmentCodes.has(code)) errors.push(`border department ${code} does not exist`);
  }

  // Cities and name patterns.
  for (const c of country.cities) {
    if (!departmentCodes.has(c.code)) errors.push(`city ${c.name} has unknown department ${c.code}`);
  }
  for (const p of country.namePatterns) {
    for (const code of p.codes) {
      if (!departmentCodes.has(code)) errors.push(`pattern ${p.label} has unknown department ${code}`);
    }
    if (p.towns.length === 0) warnings.push(`pattern ${p.label} has no towns`);
  }

  // Rivers.
  const riverTownIds = new Set(country.rivers.towns.map((t) => t.id));
  const usedTowns = new Set<string>();
  for (const r of country.rivers.rivers) {
    for (const t of r.towns) {
      if (!riverTownIds.has(t)) errors.push(`river ${r.name} has unknown town ${t}`);
      usedTowns.add(t);
    }
  }
  for (const t of country.rivers.towns) {
    if (!usedTowns.has(t.id)) warnings.push(`river town ${t.name} (${t.id}) is on no river`);
  }

  // Every offered set needs its label, tip and data; codes in local prefixes must exist.
  if (new Set(country.sets).size !== country.sets.length) errors.push('sets has duplicates');
  const setData: Record<string, number> = {
    reg: country.regions.length,
    dep: country.departments.length,
    city: country.cities.length,
    riv: country.rivers.rivers.length,
    tel: country.phone.zones.length,
    nom: country.namePatterns.length,
  };
  for (const set of country.sets) {
    if (!country.copy.setLabels[set]) errors.push(`set ${set} has no label in copy.setLabels`);
    if (!country.copy.tips[set]) errors.push(`set ${set} has no tip in copy.tips`);
    if (!setData[set]) errors.push(`set ${set} is offered but has no data`);
  }
  for (const code of Object.keys(country.phone.localPrefixes ?? {})) {
    if (!departmentCodes.has(code)) errors.push(`local prefixes given for unknown department ${code}`);
  }
  if (country.copy.plateLabel && !country.departments.some((d) => d.plate))
    warnings.push('copy.plateLabel is set but no department has a plate');

  // The outline against the data (compared upper-cased: outline ids may differ in case).
  const outlineIds = new Set(country.outline.locations.map((l) => l.id.toUpperCase()));
  const dataCodes = new Set(country.departments.map((d) => d.code.toUpperCase()));
  for (const d of country.departments) {
    if (!outlineIds.has(d.code.toUpperCase()))
      warnings.push(`department ${d.code} (${d.name}) is not in the outline`);
  }
  for (const id of outlineIds) {
    if (!dataCodes.has(id)) warnings.push(`outline area ${id} has no department data`);
  }

  return { errors, warnings };
}
