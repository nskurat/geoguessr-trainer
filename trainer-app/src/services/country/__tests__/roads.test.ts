import { describe, expect, it } from 'vitest';
import { germany } from '../../../data/germany';
import roadsJson from '../../../data/germany/roads.json';
import type { Country, RoadCourses, RoadsFile } from '../../../types/geo';
import { joinRoads, normalizeRef } from '../roads';
import { validateCountry, validateRoadFiles } from '../schema';

const file = (): RoadsFile => structuredClone(roadsJson) as RoadsFile;

/** Straight courses from each road's first to last town: enough for the checks, not real geometry. */
function townCourses(f: RoadsFile, osm = false): RoadCourses {
  const town = new Map(f.towns.map((t) => [t.id, t]));
  return Object.fromEntries(
    f.roads.map((r) => [
      r.id,
      {
        ...(osm ? { osm: { ref: r.ref.replace(' ', '') } } : {}),
        course: [r.towns.map((id) => [town.get(id)!.lat, town.get(id)!.lon] as [number, number])],
      },
    ]),
  );
}

const withOsmCredit = (): Country => {
  const c = structuredClone(germany);
  for (const lang of ['en', 'be'] as const)
    c.copy[lang].credits += ' Roads © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ODbL.';
  return c;
};

describe('normalizeRef and joinRoads', () => {
  it('compares refs without spaces or case', () => {
    expect(normalizeRef('A 7')).toBe(normalizeRef('a7'));
    expect(normalizeRef('PE-1N')).toBe('PE-1N');
  });

  it('joins courses by id and leaves missing courses empty', () => {
    const f = file();
    const own = { [f.roads[1].id]: { course: [[[50, 8], [51, 8]]] } } as RoadCourses;
    const joined = joinRoads(f, undefined, own);
    expect(joined.roads[0].course).toEqual([]);
    expect(joined.roads[1].course).toEqual([[[50, 8], [51, 8]]]);
    expect(joined.networks).toBe(f.networks);
  });
});

describe("Germany's roads.json", () => {
  it('validates with only the missing-courses warning', () => {
    expect(validateRoadFiles(germany, { roads: file() })).toEqual({
      errors: [],
      warnings: ['no course file (roads.osm.json or roadCourses.json) yet'],
    });
  });

  it('has the two classes with enough roads each, and a Belarusian network text', () => {
    const f = file();
    expect(f.roads.filter((r) => r.class === 1)).toHaveLength(9);
    expect(f.roads.filter((r) => r.class === 2).length).toBeGreaterThanOrEqual(5);
    expect(germany.copy.be.data?.roadNetworks?.A.rules.odd).toBeTruthy();
  });

  it('validates with courses joined into the country and the road set offered', () => {
    const f = file();
    const c = withOsmCredit();
    c.roads = joinRoads(f, townCourses(f, true));
    c.sets = [...c.sets, 'road'];
    for (const lang of ['en', 'be'] as const) {
      c.copy[lang].setLabels.road = 'Roads';
      c.copy[lang].tips.road = 'Tip';
    }
    expect(validateCountry(c)).toEqual({ errors: [], warnings: [] });
  });
});

describe('validateRoadFiles on broken data', () => {
  const errorsOf = (mutate: (f: RoadsFile) => void, country: Country = germany, extra = {}) => {
    const f = file();
    mutate(f);
    return validateRoadFiles(country, { roads: f, ...extra }).errors;
  };

  it('flags a bad shape', () => {
    expect(errorsOf((f) => (f.roads[0].id = 'a 1')).some((e) => e.startsWith('roads.json.roads.0.id'))).toBe(true);
  });

  it('flags duplicate refs after normalising', () => {
    expect(errorsOf((f) => (f.roads[1].ref = 'A1'))).toContain('duplicate road ref "A1"');
  });

  it('flags unknown networks, rules, neighbours, crossings, towns and departments', () => {
    const errors = errorsOf((f) => {
      f.roads[0].network = 'Z';
      f.roads[1].rules.push('nope');
      f.roads[1].between = ['a1', 'zz'];
      f.roads[2].crosses.push(f.roads[2].id);
      f.roads[3].towns.splice(1, 0, 'ghost');
      f.roads[4].codes.push('ZZ');
    });
    expect(errors).toContain('road A 1 (a1) has unknown network Z');
    expect(errors).toContain('road A 2 (a2) has unknown rule nope');
    expect(errors).toContain('road A 2 (a2) has unknown road zz in between');
    expect(errors).toContain('road A 3 (a3) lists itself in crosses');
    expect(errors).toContain('road A 4 (a4) has unknown town ghost');
    expect(errors).toContain('road A 5 (a5) has unknown department ZZ');
  });

  it('requires from and to to be the first and last town', () => {
    expect(errorsOf((f) => f.roads[0].towns.reverse())).toContain(
      'road A 1 (a1) must list from and to as its first and last town',
    );
  });

  it('requires the Belarusian text of every network rule', () => {
    const c = structuredClone(germany);
    delete c.copy.be.data!.roadNetworks!.A.rules.band4;
    expect(errorsOf(() => {}, c)).toContain('road network A rule band4 has no be text');
  });

  it('flags a course for an unknown road, a road with two courses and an OSM ref mismatch', () => {
    const f = file();
    const osm = townCourses(f, true);
    osm.a7.osm!.ref = 'A 70';
    osm.zz = { course: [[[50, 8], [51, 8]]] };
    const own = { a9: townCourses(f).a9 };
    const { errors } = validateRoadFiles(withOsmCredit(), { roads: f, osm, own });
    expect(errors).toContain('roads.osm.json ref "A 70" of a7 differs from roads.json "A 7"');
    expect(errors).toContain('roads.osm.json has a course for unknown road zz');
    expect(errors).toContain('road a9 has a course in both roads.osm.json and roadCourses.json');
  });

  it('requires the OSM credit in every language when roads.osm.json exists', () => {
    const f = file();
    const { errors } = validateRoadFiles(germany, { roads: f, osm: townCourses(f, true) });
    expect(errors).toContain(
      'roads.osm.json is used but copy.be.credits lacks "https://www.openstreetmap.org/copyright" (ODbL credit)',
    );
    expect(errors.filter((e) => e.includes('ODbL credit'))).toHaveLength(4);
  });

  it('flags courses outside the country and far from their termini', () => {
    const f = file();
    const own = townCourses(f);
    own.a1.course = [[[10, 10], [11, 11]]];
    own.a2.course[0][0] = [own.a2.course[0][0][0] + 1, own.a2.course[0][0][1]];
    own.a3.course = [[[50, 8], [50, 8]]];
    const { errors } = validateRoadFiles(germany, { roads: f, own });
    expect(errors).toContain("road A 1 (a1) course part 0 leaves the country's bounding box");
    expect(errors.some((e) => e.startsWith('road A 2 (a2) course start is more than 25 km'))).toBe(true);
    expect(errors).toContain('road A 3 (a3) course part 0 has fewer than 2 distinct points');
  });

  it('requires five roads per class and every course once the set is offered', () => {
    const f = file();
    const c = structuredClone(germany);
    c.sets = [...c.sets, 'road'];
    f.roads = f.roads.filter((r) => r.class === 2 || ['a1', 'a2'].includes(r.id));
    f.roads.forEach((r) => (r.between = r.between.filter((id) => f.roads.some((x) => x.id === id))));
    f.roads.forEach((r) => (r.crosses = r.crosses.filter((id) => f.roads.some((x) => x.id === id))));
    const { errors } = validateRoadFiles(c, { roads: f });
    expect(errors).toContain('road class 1 has 2 roads; the Roads set needs 5');
    expect(errors).toContain('road A 1 (a1) has no course');
  });
});
