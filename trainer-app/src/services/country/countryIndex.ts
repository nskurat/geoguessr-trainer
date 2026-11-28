import type {
  City,
  Country,
  CountryCopy,
  Department,
  NamePattern,
  NameTown,
  PhoneZone,
  Region,
  River,
  RiverTown,
} from '../../types/geo';
import { SOURCE_LANG, type Lang } from '../../types/i18n';

export interface IndexedDepartment extends Department {
  /** Key of the region it belongs to; undefined when the country has no regions. */
  region?: string;
}
export interface IndexedCity extends City {
  region?: string;
}
export interface IndexedNameTown extends NameTown {
  /** Id of its pattern. */
  pattern: string;
}
export interface IndexedRiverTown extends RiverTown {
  /** Ids of the rivers it is on. */
  rivers: string[];
}

/**
 * A country's data in one interface language, with lookups and back-references. Built at
 * start-up and again when the language changes; ids are the same in every language.
 */
export interface CountryIndex {
  country: Country;
  lang: Lang;
  /** The country's interface text in `lang`. */
  copy: CountryCopy;
  /** Empty when the country has no top-level grouping. */
  regions: Region[];
  regionByKey: Record<string, Region>;
  departments: IndexedDepartment[];
  departmentByCode: Record<string, IndexedDepartment>;
  cities: IndexedCity[];
  cityById: Record<string, IndexedCity>;
  phoneZones: PhoneZone[];
  phoneZoneById: Record<string, PhoneZone>;
  /** Department code → landline prefix. */
  zoneOfDepartment: Record<string, string>;
  departmentsInZone: Record<string, string[]>;
  borderDepartments: string[];
  namePatterns: NamePattern[];
  patternById: Record<string, NamePattern>;
  nameTowns: IndexedNameTown[];
  nameTownById: Record<string, IndexedNameTown>;
  rivers: River[];
  riverById: Record<string, River>;
  riverTowns: IndexedRiverTown[];
  riverTownById: Record<string, IndexedRiverTown>;
}

const byKey = <T>(items: T[], key: (item: T) => string): Record<string, T> =>
  Object.fromEntries(items.map((item) => [key(item), item]));

/**
 * The data's English text (phone zones, name patterns, rivers) replaced by `lang`'s
 * translations from the country's copy. Items without a translation keep the data's text.
 */
export function localizeData(
  country: Country,
  lang: Lang,
): { zones: PhoneZone[]; namePatterns: NamePattern[]; rivers: River[] } {
  const text = country.copy[lang].data ?? {};
  return {
    zones: country.phone.zones.map((z) => {
      const tr = text.phoneZones?.[z.zone];
      return tr ? { ...z, name: tr.name ?? z.name, description: tr.description } : z;
    }),
    namePatterns: country.namePatterns.map((p) => {
      const tr = text.namePatterns?.[p.id];
      return tr ? { ...p, label: tr.label ?? p.label, where: tr.where, origin: tr.origin } : p;
    }),
    rivers: country.rivers.rivers.map((r) => {
      const tr = text.rivers?.[r.id];
      return tr ? { ...r, flowsInto: tr.flowsInto } : r;
    }),
  };
}

/**
 * Builds the lookups for `lang` (default English). Throws if the data references
 * something that does not exist.
 */
export function indexCountry(country: Country, lang: Lang = SOURCE_LANG): CountryIndex {
  const { zones, namePatterns, rivers } = localizeData(country, lang);
  const regions = country.regions ?? [];
  const regionOf: Record<string, string> = {};
  for (const r of regions) for (const code of r.codes) regionOf[code] = r.key;

  const departments = country.departments.map((d): IndexedDepartment => {
    if (!regions.length) return { ...d };
    const region = regionOf[d.code];
    if (!region) throw new Error(`${country.id}: department ${d.code} is in no region`);
    return { ...d, region };
  });
  const departmentByCode = byKey(departments, (d) => d.code);

  const cities = country.cities.map((c) => {
    const d = departmentByCode[c.code];
    if (!d) throw new Error(`${country.id}: city ${c.name} has unknown department ${c.code}`);
    return d.region ? { ...c, region: d.region } : { ...c };
  });

  const zoneOfDepartment = country.phone.zoneByDepartement;
  const departmentsInZone = Object.fromEntries(
    zones.map((z) => [
      z.zone,
      Object.keys(zoneOfDepartment).filter((c) => zoneOfDepartment[c] === z.zone),
    ]),
  );

  const nameTowns = namePatterns.flatMap((p) => p.towns.map((t) => ({ ...t, pattern: p.id })));

  const riverTowns = country.rivers.towns.map((t) => ({
    ...t,
    rivers: rivers.filter((r) => r.towns.includes(t.id)).map((r) => r.id),
  }));
  const riverTownById = byKey(riverTowns, (t) => t.id);
  for (const r of rivers)
    for (const t of r.towns)
      if (!riverTownById[t]) throw new Error(`${country.id}: river ${r.name} has unknown town ${t}`);

  return {
    country,
    lang,
    copy: country.copy[lang],
    regions,
    regionByKey: byKey(regions, (r) => r.key),
    departments,
    departmentByCode,
    cities,
    cityById: byKey(cities, (c) => c.id),
    phoneZones: zones,
    phoneZoneById: byKey(zones, (z) => z.zone),
    zoneOfDepartment,
    departmentsInZone,
    borderDepartments: country.phone.borderDepartements,
    namePatterns,
    patternById: byKey(namePatterns, (p) => p.id),
    nameTowns,
    nameTownById: byKey(nameTowns, (t) => t.id),
    rivers,
    riverById: byKey(rivers, (r) => r.id),
    riverTowns,
    riverTownById,
  };
}
