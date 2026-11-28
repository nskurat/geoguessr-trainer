import { describe, expect, it } from 'vitest';
import { germany } from '../../../data/germany';
import roadsJson from '../../../data/germany/roads.json';
import type { Country, RoadCourses, RoadsFile } from '../../../types/geo';
import { joinRoads, normalizeRef, osmRefMatches, refMatchesRoad, splitRefs } from '../roads';
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

describe('several numbers per road', () => {
  const a7 = { ref: 'A 7', altRefs: [{ ref: 'E 45', network: 'E', kind: 'european' as const }] };

  it('splits OSM multi-value refs', () => {
    expect(splitRefs('A 7;E 45')).toEqual(['A 7', 'E 45']);
    expect(splitRefs(' A 7 ; ')).toEqual(['A 7']);
    expect(splitRefs(undefined)).toEqual([]);
  });

  it('matches the primary ref or a known other number, never an unknown one alone', () => {
    expect(refMatchesRoad('A7', a7)).toBe(true);
    expect(refMatchesRoad('e 45', a7)).toBe(true);
    expect(refMatchesRoad('E 43', a7)).toBe(false);
    expect(osmRefMatches('A 7;E 45', a7)).toBe(true);
    expect(osmRefMatches('E 45', a7)).toBe(true);
    expect(osmRefMatches('A 7;E 99', a7)).toBe(true);
    expect(osmRefMatches('A 70;E 99', a7)).toBe(false);
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

  it('rejects geometry in roads.json (courses belong in the course files)', () => {
    const errors = errorsOf((f) => Object.assign(f.roads[0], { course: [[[50, 8], [51, 8]]] }));
    expect(errors.some((e) => e.startsWith('roads.json.roads.0') && e.includes('course'))).toBe(true);
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
    expect(errors).toContain('roads.osm.json ref "A 70" of a7 has neither roads.json "A 7" nor one of its altRefs');
    expect(errors).toContain('roads.osm.json has a course for unknown road zz');
    expect(errors).toContain('road a9 has a course in both roads.osm.json and roadCourses.json');
  });

  it('accepts an OSM ref list that holds the primary ref or a known altRef', () => {
    const f = file();
    const osm = townCourses(f, true);
    osm.a7.osm!.ref = 'A 7;E 45';
    osm.a1.osm!.ref = 'E 47';
    expect(f.roads[0].altRefs?.some((a) => a.ref === 'E 47')).toBe(true);
    expect(validateRoadFiles(withOsmCredit(), { roads: f, osm }).errors).toEqual([]);
  });

  it('checks altRefs: own ref, other roads, concurrency both ways, stretches', () => {
    const errors = errorsOf((f) => {
      const [a1, a2, a3, a4, a5] = f.roads;
      a1.altRefs = [{ ref: 'A1', network: 'A', kind: 'former' }];
      a2.altRefs = [{ ref: 'A 3', network: 'A', kind: 'european' }];
      a3.altRefs = [
        { ref: 'A 4', network: 'A', kind: 'concurrent', from: 't8', to: 't8' },
        { ref: 'A 99 X', network: 'A', kind: 'concurrent' },
      ];
      a4.altRefs = [{ ref: 'A 5', network: 'B', kind: 'concurrent', from: 't8' }];
      a5.altRefs = [
        { ref: 'E 40', network: 'E', kind: 'european', from: 't44', to: 'ghost' },
        { ref: 'E 40', network: 'E', kind: 'european' },
      ];
    });
    expect(errors).toContain('road A 1 (a1) lists its own ref A1 in altRefs');
    expect(errors).toContain('road A 2 (a2) altRef A 3 (european) is the primary ref of road a3; use kind concurrent');
    expect(errors).toContain('road A 3 (a3) shares a stretch with A 4 but A 4 does not list A 3 as concurrent');
    expect(errors).toContain('road A 3 (a3) concurrent altRef A 99 X is no other road\'s ref');
    expect(errors).toContain('road A 4 (a4) concurrent altRef A 5 has network B, not A');
    expect(errors).toContain('road A 4 (a4) altRef A 5 needs both from and to, or neither');
    expect(errors).toContain('road A 5 (a5) altRef E 40 stretch town ghost is not on the road');
    expect(errors).toContain('road A 5 (a5) lists altRef E40 several times; each needs a stretch');
  });

  it('accepts one number on two stretches and a reciprocal concurrency', () => {
    const errors = errorsOf((f) => {
      const [, , a3, a4] = f.roads;
      a3.altRefs = [{ ref: 'A 4', network: 'A', kind: 'concurrent', from: 't8', to: 't8' }];
      a4.altRefs = [
        { ref: 'A 3', network: 'A', kind: 'concurrent', from: 't8', to: 't8' },
        { ref: 'E 40', network: 'E', kind: 'european', from: 't33', to: 't34' },
        { ref: 'E 40', network: 'E', kind: 'european', from: 't36', to: 't43' },
      ];
    });
    expect(errors).toEqual([]);
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
