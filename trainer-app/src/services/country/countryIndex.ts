import type {
  City,
  Country,
  Department,
  NamePattern,
  NameTown,
  PhoneZone,
  Region,
  River,
  RiverTown,
} from '../../types/geo';

export interface IndexedDepartment extends Department {
  /** Key of the region it belongs to. */
  region: string;
}
export interface IndexedCity extends City {
  region: string;
}
export interface IndexedNameTown extends NameTown {
  /** Id of its pattern. */
  pattern: string;
}
export interface IndexedRiverTown extends RiverTown {
  /** Ids of the rivers it is on. */
  rivers: string[];
}

/** A country's data with lookups and back-references, built once at start-up. */
export interface CountryIndex {
  country: Country;
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

/** Builds the lookups. Throws if the data references something that does not exist. */
export function indexCountry(country: Country): CountryIndex {
  const regionOf: Record<string, string> = {};
  for (const r of country.regions) for (const code of r.codes) regionOf[code] = r.key;

  const departments = country.departments.map((d) => {
    const region = regionOf[d.code];
    if (!region) throw new Error(`${country.id}: department ${d.code} is in no region`);
    return { ...d, region };
  });
  const departmentByCode = byKey(departments, (d) => d.code);

  const cities = country.cities.map((c) => {
    const d = departmentByCode[c.code];
    if (!d) throw new Error(`${country.id}: city ${c.name} has unknown department ${c.code}`);
    return { ...c, region: d.region };
  });

  const zoneOfDepartment = country.phone.zoneByDepartement;
  const departmentsInZone = Object.fromEntries(
    country.phone.zones.map((z) => [
      z.zone,
      Object.keys(zoneOfDepartment).filter((c) => zoneOfDepartment[c] === z.zone),
    ]),
  );

  const nameTowns = country.namePatterns.flatMap((p) => p.towns.map((t) => ({ ...t, pattern: p.id })));

  const riverTowns = country.rivers.towns.map((t) => ({
    ...t,
    rivers: country.rivers.rivers.filter((r) => r.towns.includes(t.id)).map((r) => r.id),
  }));
  const riverTownById = byKey(riverTowns, (t) => t.id);
  for (const r of country.rivers.rivers)
    for (const t of r.towns)
      if (!riverTownById[t]) throw new Error(`${country.id}: river ${r.name} has unknown town ${t}`);

  return {
    country,
    regions: country.regions,
    regionByKey: byKey(country.regions, (r) => r.key),
    departments,
    departmentByCode,
    cities,
    cityById: byKey(cities, (c) => c.id),
    phoneZones: country.phone.zones,
    phoneZoneById: byKey(country.phone.zones, (z) => z.zone),
    zoneOfDepartment,
    departmentsInZone,
    borderDepartments: country.phone.borderDepartements,
    namePatterns: country.namePatterns,
    patternById: byKey(country.namePatterns, (p) => p.id),
    nameTowns,
    nameTownById: byKey(nameTowns, (t) => t.id),
    rivers: country.rivers.rivers,
    riverById: byKey(country.rivers.rivers, (r) => r.id),
    riverTowns,
    riverTownById,
  };
}
