import { z } from 'zod';
import type { Country, RoadCourses, RoadData, RoadsFile } from '../../types/geo';
import { LANGS, SOURCE_LANG } from '../../types/i18n';
import { haversineKm } from '../geo/projection';
import { ROAD_CLASS_THRESHOLDS } from '../roads/visibility';
import { joinRoads, normalizeRef } from './roads';

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

const StudySetSchema = z.enum(['reg', 'dep', 'city', 'riv', 'tel', 'nom', 'road']);
const PluralFormsSchema = z
  .object({ zero: nonEmpty, one: nonEmpty, two: nonEmpty, few: nonEmpty, many: nonEmpty })
  .partial()
  .extend({ other: nonEmpty });
const TermSchema = z.object({ one: nonEmpty, many: nonEmpty, counted: PluralFormsSchema.optional() });

const DataTextSchema = z.object({
  phoneZones: z.record(z.string(), z.object({ name: nonEmpty.optional(), description: z.string() })).optional(),
  namePatterns: z
    .record(z.string(), z.object({ label: nonEmpty.optional(), where: z.string(), origin: z.string() }))
    .optional(),
  rivers: z.record(z.string(), z.object({ flowsInto: nonEmpty })).optional(),
  roadNetworks: z
    .record(z.string(), z.object({ label: nonEmpty, sign: nonEmpty, rules: z.record(z.string(), nonEmpty) }))
    .optional(),
  roads: z.record(z.string(), z.object({ name: nonEmpty })).optional(),
});

/** A country's interface text in one language. */
export const CountryCopySchema = z.object({
  countryName: nonEmpty,
  subtitle: nonEmpty,
  setLabels: z.partialRecord(StudySetSchema, nonEmpty),
  regionTerm: TermSchema,
  departmentTerm: TermSchema,
  seatLabel: nonEmpty,
  plateLabel: nonEmpty.optional(),
  codeLabel: nonEmpty.optional(),
  allAreas: nonEmpty,
  tips: z.partialRecord(StudySetSchema, nonEmpty),
  phoneHint: z.string(),
  credits: nonEmpty,
  data: DataTextSchema.optional(),
});

/** Country-level settings and interface text. */
export const CountryMetaSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: nonEmpty,
  sets: z.array(StudySetSchema).min(1),
  departmentCodes: z.enum(['shown', 'hidden']),
  departmentLabelOffsets: z
    .record(z.string(), z.object({ dx: z.number().optional(), dy: z.number().optional() }))
    .optional(),
  projectionRefLat: lat,
  outline: z.object({
    viewBox: z.string().regex(/^-?[\d.]+[ ,]-?[\d.]+[ ,][\d.]+[ ,][\d.]+$/),
    locations: z.array(z.object({ id: nonEmpty, name: z.string(), path: nonEmpty })).min(1),
    affine: z.array(z.array(z.number()).length(3)).length(2).optional(),
  }),
  /** Every supported language is required: a missing one fails as `copy.<lang>`. */
  copy: z.object(Object.fromEntries(LANGS.map((lang) => [lang, CountryCopySchema]))),
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

const roadId = z.string().regex(/^[^|\s]+$/, 'ids must be non-empty without "|" or spaces');

export const RoadNetworkSchema = z.object({
  id: roadId,
  shield: z.enum(['blue', 'red', 'yellow', 'green', 'white']),
  label: nonEmpty,
  sign: nonEmpty,
  rules: z.array(z.object({ id: roadId, text: nonEmpty })),
});

/** A road as stored in `roads.json` (no course). */
export const RoadEntrySchema = z.object({
  id: roadId,
  network: nonEmpty,
  ref: nonEmpty,
  class: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  from: nonEmpty,
  to: nonEmpty,
  towns: z.array(nonEmpty).min(2),
  codes: z.array(nonEmpty).min(1),
  lengthKm: z.number().positive().optional(),
  name: nonEmpty.optional(),
  rules: z.array(nonEmpty),
  between: z.array(nonEmpty).max(2),
  crosses: z.array(nonEmpty),
});

export const RoadTownSchema = RiverTownSchema;

/** `data/<country>/roads.json`: our own road data (MIT), never geometry from OSM. */
export const RoadsFileSchema = z.object({
  networks: z.array(RoadNetworkSchema).min(1),
  roads: z.array(RoadEntrySchema).min(1),
  towns: z.array(RoadTownSchema),
});

const CoursePartSchema = z.array(z.tuple([lat, lon])).min(2);

/** `roads.osm.json` (ODbL, with `osm` provenance) or `roadCourses.json` (without). */
export const RoadCoursesSchema = z.record(
  roadId,
  z.object({
    osm: z
      .object({ relations: z.array(z.number().int().positive()).optional(), ref: nonEmpty })
      .strict()
      .optional(),
    course: z.array(CoursePartSchema).min(1),
  }).strict(),
);

/** `data/<country>/locator.json`: the picker's locator map (`npm run build:locator`). */
export const LocatorSchema = z
  .object({
    source: nonEmpty,
    area: nonEmpty,
    viewBox: z.string().regex(/^0 0 \d+ \d+$/),
    neighbours: z.string().regex(/^M[\d\sMLZ-]+$/),
    country: z.string().regex(/^M[\d\sMLZ-]+$/),
  })
  .strict();

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

/**
 * Every non-source language must translate the English text of every phone zone, name
 * pattern and river (`copy.<lang>.data`), and may not translate ids that do not exist.
 */
function dataTextErrors(country: Country): string[] {
  const errors: string[] = [];
  const parts = [
    ['phoneZones', 'phone zone', country.phone.zones.map((z) => z.zone)],
    ['namePatterns', 'name pattern', country.namePatterns.map((p) => p.id)],
    ['rivers', 'river', country.rivers.rivers.map((r) => r.id)],
  ] as const;
  for (const lang of LANGS) {
    const text = country.copy[lang].data ?? {};
    for (const [part, label, ids] of parts) {
      const given = text[part] ?? {};
      if (lang !== SOURCE_LANG)
        for (const id of ids)
          if (!given[id]) errors.push(`${label} ${id} has no ${lang} text in copy.${lang}.data.${part}`);
      for (const id of Object.keys(given))
        if (!(ids as readonly string[]).includes(id))
          errors.push(`copy.${lang}.data.${part} translates unknown ${label} ${id}`);
    }
  }
  return errors;
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

  // Phone zones: every department needs one only when the phone set is offered.
  const zones = new Set(country.phone.zones.map((z) => z.zone));
  for (const d of country.departments) {
    const zone = country.phone.zoneByDepartement[d.code];
    if (!zone) {
      if (country.sets.includes('tel')) errors.push(`department ${d.code} (${d.name}) has no phone zone`);
    } else if (!zones.has(zone)) errors.push(`department ${d.code} has unknown phone zone ${zone}`);
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
  if (country.roads) setData.road = country.roads.roads.length;
  for (const set of country.sets) {
    for (const lang of LANGS) {
      if (!country.copy[lang].setLabels[set]) errors.push(`set ${set} has no label in copy.${lang}.setLabels`);
      if (!country.copy[lang].tips[set]) errors.push(`set ${set} has no tip in copy.${lang}.tips`);
    }
    if (!setData[set]) errors.push(`set ${set} is offered but has no data`);
  }
  errors.push(...dataTextErrors(country));
  for (const code of Object.keys(country.phone.localPrefixes ?? {})) {
    if (!departmentCodes.has(code)) errors.push(`local prefixes given for unknown department ${code}`);
  }
  for (const lang of LANGS) {
    if (country.copy[lang].plateLabel && !country.departments.some((d) => d.plate))
      warnings.push(`copy.${lang}.plateLabel is set but no department has a plate`);
    if (!!country.copy[lang].plateLabel !== !!country.copy[SOURCE_LANG].plateLabel)
      errors.push(`copy.${lang}.plateLabel must be set exactly when copy.${SOURCE_LANG}.plateLabel is`);
  }

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

  if (country.roads) {
    const roads = roadErrors(country, country.roads, { coursesRequired: country.sets.includes('road') });
    errors.push(...roads.errors);
    warnings.push(...roads.warnings);
  }

  return { errors, warnings };
}

/** The OSM credit `credits` must carry in every language when a `*.osm.json` file is used. */
export const OSM_CREDIT_MARKERS = ['OpenStreetMap', 'https://www.openstreetmap.org/copyright'] as const;

/** Roads with fewer than this many per class leave too few confusable decoys. */
export const MIN_ROADS_PER_CLASS = 5;

/** How far a road's `from` / `to` town may lie from its course ends (border towns, junctions). */
export const ROAD_END_TOLERANCE_KM = 25;

/** Latitude/longitude box of everything the country already places, widened by `margin` degrees. */
function countryBox(country: Country, extra: { lat: number; lon: number }[], margin = 1) {
  const pts = [...country.departments, ...country.cities, ...country.rivers.towns, ...extra];
  const lats = pts.map((p) => p.lat);
  const lons = pts.map((p) => p.lon);
  return {
    lat: [Math.min(...lats) - margin, Math.max(...lats) + margin],
    lon: [Math.min(...lons) - margin, Math.max(...lons) + margin],
  };
}

/**
 * Referential and sanity checks of a country's roads (docs/specs/roads.md §4): networks,
 * rules, neighbours and towns exist; refs are unique; courses are inside the country and
 * start and end near their termini; every class is drawn at some zoom; enough roads per
 * class when the set is offered; network and road text translated in every language.
 */
function roadErrors(
  country: Country,
  data: RoadData,
  { coursesRequired }: { coursesRequired: boolean },
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const networks = new Map(data.networks.map((n) => [n.id, n]));
  const roadIds = new Set(data.roads.map((r) => r.id));
  const townById = new Map(data.towns.map((t) => [t.id, t]));
  const departmentCodes = new Set(country.departments.map((d) => d.code));
  for (const d of duplicates(data.networks, (n) => n.id)) errors.push(`duplicate road network "${d}"`);
  for (const d of duplicates(data.roads, (r) => r.id)) errors.push(`duplicate road id "${d}"`);
  for (const d of duplicates(data.roads, (r) => normalizeRef(r.ref))) errors.push(`duplicate road ref "${d}"`);
  for (const d of duplicates(data.towns, (t) => t.id)) errors.push(`duplicate road town id "${d}"`);
  for (const n of data.networks)
    for (const d of duplicates(n.rules, (r) => r.id)) errors.push(`network ${n.id} has duplicate rule "${d}"`);

  const box = countryBox(country, data.towns);
  const used = new Set<string>();
  const perClass: Record<number, number> = {};
  for (const r of data.roads) {
    const at = `road ${r.ref} (${r.id})`;
    perClass[r.class] = (perClass[r.class] ?? 0) + 1;
    const network = networks.get(r.network);
    if (!network) errors.push(`${at} has unknown network ${r.network}`);
    else
      for (const rule of r.rules)
        if (!network.rules.some((x) => x.id === rule)) errors.push(`${at} has unknown rule ${rule}`);
    for (const [field, ids] of [
      ['between', r.between],
      ['crosses', r.crosses],
    ] as const) {
      for (const id of ids) {
        if (id === r.id) errors.push(`${at} lists itself in ${field}`);
        else if (!roadIds.has(id)) errors.push(`${at} has unknown road ${id} in ${field}`);
      }
      for (const d of duplicates(ids, (x) => x)) errors.push(`${at} lists ${d} twice in ${field}`);
    }
    for (const id of [r.from, r.to, ...r.towns]) {
      if (!townById.has(id)) errors.push(`${at} has unknown town ${id}`);
      used.add(id);
    }
    if (r.towns[0] !== r.from || r.towns[r.towns.length - 1] !== r.to)
      errors.push(`${at} must list from and to as its first and last town`);
    for (const code of r.codes) if (!departmentCodes.has(code)) errors.push(`${at} has unknown department ${code}`);
    if (!ROAD_CLASS_THRESHOLDS[r.class]) errors.push(`${at} has class ${r.class}, which is never drawn`);

    if (!r.course.length) {
      (coursesRequired ? errors : warnings).push(`${at} has no course`);
      continue;
    }
    r.course.forEach((part, i) => {
      if (new Set(part.map((p) => p.join(','))).size < 2) errors.push(`${at} course part ${i} has fewer than 2 distinct points`);
      if (part.some(([lat, lon]) => lat < box.lat[0] || lat > box.lat[1] || lon < box.lon[0] || lon > box.lon[1]))
        errors.push(`${at} course part ${i} leaves the country's bounding box`);
    });
    const first = r.course[0][0];
    const lastPart = r.course[r.course.length - 1];
    const last = lastPart[lastPart.length - 1];
    for (const [end, id, point] of [
      ['start', r.from, first],
      ['end', r.to, last],
    ] as const) {
      const town = townById.get(id);
      if (town && haversineKm(town.lat, town.lon, point[0], point[1]) > ROAD_END_TOLERANCE_KM)
        errors.push(`${at} course ${end} is more than ${ROAD_END_TOLERANCE_KM} km from ${town.name}`);
    }
  }
  for (const t of data.towns) if (!used.has(t.id)) warnings.push(`road town ${t.name} (${t.id}) is on no road`);
  if (country.sets.includes('road'))
    for (const [cls, n] of Object.entries(perClass))
      if (n < MIN_ROADS_PER_CLASS) errors.push(`road class ${cls} has ${n} roads; the Roads set needs ${MIN_ROADS_PER_CLASS}`);

  // Network and road text in every language (the source language's is in the data).
  const named = data.roads.filter((r) => r.name).map((r) => r.id);
  for (const lang of LANGS) {
    const text = country.copy[lang].data ?? {};
    for (const id of Object.keys(text.roadNetworks ?? {}))
      if (!networks.has(id)) errors.push(`copy.${lang}.data.roadNetworks translates unknown network ${id}`);
    for (const id of Object.keys(text.roads ?? {}))
      if (!named.includes(id)) errors.push(`copy.${lang}.data.roads translates unknown or unnamed road ${id}`);
    if (lang === SOURCE_LANG) continue;
    for (const n of data.networks) {
      const given = text.roadNetworks?.[n.id];
      if (!given) {
        errors.push(`road network ${n.id} has no ${lang} text in copy.${lang}.data.roadNetworks`);
        continue;
      }
      for (const rule of n.rules)
        if (!given.rules[rule.id]) errors.push(`road network ${n.id} rule ${rule.id} has no ${lang} text`);
      for (const id of Object.keys(given.rules))
        if (!n.rules.some((r) => r.id === id)) errors.push(`copy.${lang} translates unknown rule ${id} of network ${n.id}`);
    }
    for (const id of named)
      if (!text.roads?.[id]) errors.push(`road ${id} has no ${lang} name in copy.${lang}.data.roads`);
  }
  return { errors, warnings };
}

/** The road files of one country, as read from `data/<country>/` (any may be missing). */
export interface RoadFiles {
  /** `roads.json`: our own data. */
  roads: unknown;
  /** `roads.osm.json`: OpenStreetMap courses (ODbL). */
  osm?: unknown;
  /** `roadCourses.json`: Natural Earth or our own courses. */
  own?: unknown;
}

/**
 * Checks a country's road files before they are wired into the `Country`: each file's shape,
 * one course per road across the course files and no course without a road, the OSM `ref`
 * against ours, the OSM credit in every language when an OSM file exists, then everything
 * `validateCountry` checks for roads. Missing courses are warnings until `road` is offered.
 */
export function validateRoadFiles(country: Country, files: RoadFiles): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parse = <T>(label: string, schema: z.ZodType<T>, value: unknown): T | undefined => {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    for (const issue of result.error.issues)
      errors.push(`${label}${issue.path.length ? '.' + issue.path.join('.') : ''}: ${issue.message}`);
    return undefined;
  };
  const file = parse<RoadsFile>('roads.json', RoadsFileSchema, files.roads);
  const osm = files.osm === undefined ? undefined : parse<RoadCourses>('roads.osm.json', RoadCoursesSchema, files.osm);
  const own =
    files.own === undefined ? undefined : parse<RoadCourses>('roadCourses.json', RoadCoursesSchema, files.own);
  if (!file || errors.length) return { errors, warnings };

  if (files.osm !== undefined)
    for (const lang of LANGS)
      for (const marker of OSM_CREDIT_MARKERS)
        if (!country.copy[lang].credits.includes(marker))
          errors.push(`roads.osm.json is used but copy.${lang}.credits lacks "${marker}" (ODbL credit)`);

  const byId = new Map(file.roads.map((r) => [r.id, r]));
  for (const [label, courses] of [
    ['roads.osm.json', osm],
    ['roadCourses.json', own],
  ] as const) {
    for (const [id, entry] of Object.entries(courses ?? {})) {
      const road = byId.get(id);
      if (!road) errors.push(`${label} has a course for unknown road ${id}`);
      else if (entry.osm && normalizeRef(entry.osm.ref) !== normalizeRef(road.ref))
        errors.push(`${label} ref "${entry.osm.ref}" of ${id} differs from roads.json "${road.ref}"`);
      if (label === 'roadCourses.json' && entry.osm) errors.push(`roadCourses.json ${id} has OSM provenance; move it to roads.osm.json`);
    }
  }
  for (const id of Object.keys(osm ?? {}))
    if (own?.[id]) errors.push(`road ${id} has a course in both roads.osm.json and roadCourses.json`);
  if (!osm && !own) warnings.push('no course file (roads.osm.json or roadCourses.json) yet');

  const result = roadErrors(country, joinRoads(file, osm, own), {
    coursesRequired: country.sets.includes('road'),
  });
  errors.push(...result.errors);
  // One summary instead of a warning per road when there are no courses at all.
  warnings.push(...(osm || own ? result.warnings : result.warnings.filter((w) => !w.endsWith('has no course'))));
  return { errors, warnings };
}
