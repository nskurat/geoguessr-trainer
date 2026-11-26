import { describe, expect, it } from 'vitest';
import { france } from '../../../data/france';
import type { Country } from '../../../types/geo';
import { indexCountry } from '../countryIndex';

function fixture(): Country {
  return {
    id: 'testland',
    name: 'Testland',
    projectionRefLat: 45,
    regionLabelOffsets: {},
    outline: { viewBox: '0 0 10 10', locations: [] },
    regions: [
      { key: 'N', name: 'North', capital: 'Nord', hue: 10, codes: ['01', '02'] },
      { key: 'S', name: 'South', capital: 'Sud', hue: 200, codes: ['03'] },
    ],
    departments: [
      { code: '01', name: 'One', prefecture: 'Uno', lat: 1, lon: 1 },
      { code: '02', name: 'Two', prefecture: 'Dos', lat: 2, lon: 2 },
      { code: '03', name: 'Three', prefecture: 'Tres', lat: 3, lon: 3 },
    ],
    cities: [
      { id: 'c1', name: 'Uno', code: '01', lat: 1, lon: 1, tier: 1 },
      { id: 'c3', name: 'Tres', code: '03', lat: 3, lon: 3, tier: 2 },
    ],
    phone: {
      zones: [
        { zone: '01', name: 'A', description: '', hue: 0 },
        { zone: '02', name: 'B', description: '', hue: 100 },
      ],
      zoneByDepartement: { '01': '01', '02': '01', '03': '02' },
      borderDepartements: ['03'],
    },
    namePatterns: [
      {
        id: 'p',
        label: '-ac',
        where: 'south',
        origin: 'Latin',
        codes: ['03'],
        towns: [{ id: 'pt', name: 'Cognac', lat: 3, lon: 3, extra: false }],
      },
    ],
    rivers: {
      rivers: [
        {
          id: 'r1',
          name: 'Alpha',
          lengthKm: 100,
          flowsInto: 'sea',
          course: [
            [1, 1],
            [2, 2],
          ],
          towns: ['t1', 'tx'],
        },
        {
          id: 'r2',
          name: 'Beta',
          lengthKm: 50,
          flowsInto: 'Alpha',
          course: [
            [3, 3],
            [2, 2],
          ],
          towns: ['tx', 't2'],
        },
      ],
      towns: [
        { id: 't1', name: 'Upstream', lat: 1, lon: 1 },
        { id: 'tx', name: 'Confluence', lat: 2, lon: 2 },
        { id: 't2', name: 'Other', lat: 3, lon: 3 },
      ],
    },
    copy: { allAreas: 'All', tips: {}, phoneHint: '' },
  };
}

describe('indexCountry', () => {
  const index = indexCountry(fixture());

  it('builds lookups by key, code and id', () => {
    expect(index.regionByKey.S.name).toBe('South');
    expect(index.departmentByCode['02'].name).toBe('Two');
    expect(index.cityById.c3.name).toBe('Tres');
    expect(index.phoneZoneById['02'].name).toBe('B');
    expect(index.patternById.p.label).toBe('-ac');
    expect(index.riverById.r2.name).toBe('Beta');
    expect(index.borderDepartments).toEqual(['03']);
  });

  it('adds the region to departments and cities', () => {
    expect(index.departmentByCode['01'].region).toBe('N');
    expect(index.departmentByCode['03'].region).toBe('S');
    expect(index.cityById.c1.region).toBe('N');
    expect(index.cityById.c3.region).toBe('S');
  });

  it('lists departments per phone zone', () => {
    expect(index.departmentsInZone['01']).toEqual(['01', '02']);
    expect(index.departmentsInZone['02']).toEqual(['03']);
    expect(index.zoneOfDepartment['03']).toBe('02');
  });

  it('adds the pattern to name towns', () => {
    expect(index.nameTowns).toEqual([expect.objectContaining({ id: 'pt', pattern: 'p' })]);
    expect(index.nameTownById.pt.name).toBe('Cognac');
  });

  it('lists every river through a town shared by two rivers', () => {
    expect(index.riverTownById.tx.rivers).toEqual(['r1', 'r2']);
    expect(index.riverTownById.t1.rivers).toEqual(['r1']);
    expect(index.riverTownById.t2.rivers).toEqual(['r2']);
  });

  it('does not mutate the source country', () => {
    expect('region' in (fixture().departments[0] as object)).toBe(false);
    expect('region' in (index.country.departments[0] as object)).toBe(false);
  });

  it('throws on a department in no region', () => {
    const c = fixture();
    c.regions[0].codes = ['01'];
    expect(() => indexCountry(c)).toThrow(/department 02 is in no region/);
  });

  it('throws on a city with an unknown department', () => {
    const c = fixture();
    c.cities.push({ id: 'cx', name: 'Nowhere', code: '99', lat: 0, lon: 0, tier: 2 });
    expect(() => indexCountry(c)).toThrow(/city Nowhere has unknown department 99/);
  });

  it('throws on a river referencing an unknown town', () => {
    const c = fixture();
    c.rivers.rivers[0].towns.push('ghost');
    expect(() => indexCountry(c)).toThrow(/river Alpha has unknown town ghost/);
  });
});

describe('indexCountry(france)', () => {
  const index = indexCountry(france);

  it('indexes 13 regions and 96 departments', () => {
    expect(index.regions).toHaveLength(13);
    expect(index.departments).toHaveLength(96);
  });

  it('gives every department a phone zone that lists it', () => {
    for (const d of index.departments) {
      const zone = index.zoneOfDepartment[d.code];
      expect(zone, d.code).toBeTruthy();
      expect(index.departmentsInZone[zone]).toContain(d.code);
    }
  });
});
