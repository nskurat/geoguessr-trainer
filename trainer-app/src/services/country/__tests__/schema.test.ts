import { describe, expect, it } from 'vitest';
import { france } from '../../../data/france';
import { germany } from '../../../data/germany';
import { peru } from '../../../data/peru';
import type { Country } from '../../../types/geo';
import { RiverSchema, validateCountry } from '../schema';

const clone = (): Country => structuredClone(france);

describe('validateCountry(france)', () => {
  it('has no errors', () => {
    expect(validateCountry(france).errors).toEqual([]);
  });
});

describe('validateCountry(peru)', () => {
  it('has no errors', () => {
    expect(validateCountry(peru).errors).toEqual([]);
  });
});

describe('validateCountry(germany)', () => {
  it('has no errors or warnings', () => {
    const { errors, warnings } = validateCountry(germany);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });
});

describe('validateCountry on broken data', () => {
  const errorsOf = (mutate: (c: Country) => void) => {
    const c = clone();
    mutate(c);
    return validateCountry(c).errors;
  };

  it('flags a duplicate department code', () => {
    const errors = errorsOf((c) => c.departments.push({ ...c.departments[0] }));
    expect(errors).toContain(`duplicate department code "${france.departments[0].code}"`);
  });

  it('flags a department in two regions', () => {
    const code = france.regions[0].codes[0];
    const errors = errorsOf((c) => c.regions[1].codes.push(code));
    expect(errors.some((e) => e.includes(`department ${code}`) && e.includes('several regions'))).toBe(true);
  });

  it('flags a department in no region', () => {
    const code = france.regions[0].codes[0];
    const errors = errorsOf((c) => (c.regions[0].codes = c.regions[0].codes.slice(1)));
    expect(errors.some((e) => e.includes(`department ${code}`) && e.includes('no region'))).toBe(true);
  });

  it('flags a region listing an unknown department', () => {
    expect(errorsOf((c) => c.regions[0].codes.push('ZZ'))).toContain(
      `region ${france.regions[0].key} lists unknown department ZZ`,
    );
  });

  it('flags a department without a phone zone', () => {
    const code = france.departments[0].code;
    const errors = errorsOf((c) => delete c.phone.zoneByDepartement[code]);
    expect(errors.some((e) => e.includes(`department ${code}`) && e.includes('no phone zone'))).toBe(true);
  });

  it('needs no phone zones when the phone set is not offered', () => {
    const code = france.departments[0].code;
    const errors = errorsOf((c) => {
      c.sets = c.sets.filter((s) => s !== 'tel');
      delete c.phone.zoneByDepartement[code];
    });
    expect(errors.some((e) => e.includes('no phone zone'))).toBe(false);
  });

  it('flags a phone zone that does not exist', () => {
    const code = france.departments[0].code;
    const errors = errorsOf((c) => (c.phone.zoneByDepartement[code] = '99'));
    expect(errors).toContain(`department ${code} has unknown phone zone 99`);
  });

  it('flags an unknown border department', () => {
    expect(errorsOf((c) => c.phone.borderDepartements.push('ZZ'))).toContain(
      'border department ZZ does not exist',
    );
  });

  it('flags a city in an unknown department', () => {
    const errors = errorsOf((c) =>
      c.cities.push({ id: 'zz', name: 'Nowhere', code: 'ZZ', lat: 0, lon: 0, tier: 1 }),
    );
    expect(errors).toContain('city Nowhere has unknown department ZZ');
  });

  it('flags a pattern in an unknown department', () => {
    const errors = errorsOf((c) => c.namePatterns[0].codes.push('ZZ'));
    expect(errors).toContain(`pattern ${france.namePatterns[0].label} has unknown department ZZ`);
  });

  it('flags a river referencing an unknown town', () => {
    const errors = errorsOf((c) => c.rivers.rivers[0].towns.push('ghost'));
    expect(errors).toContain(`river ${france.rivers.rivers[0].name} has unknown town ghost`);
  });

  it('flags out-of-range coordinates', () => {
    const errors = errorsOf((c) => {
      c.cities[0].lat = 91;
      c.departments[0].lon = -181;
    });
    expect(errors.some((e) => e.startsWith('cities[0].lat'))).toBe(true);
    expect(errors.some((e) => e.startsWith('departments[0].lon'))).toBe(true);
  });

  it('flags an invalid city tier', () => {
    const errors = errorsOf((c) => ((c.cities[0] as { tier: number }).tier = 3));
    expect(errors.some((e) => e.startsWith('cities[0].tier'))).toBe(true);
  });

  it('flags a river course with fewer than two points', () => {
    const errors = errorsOf((c) => (c.rivers.rivers[0].course = [[48, 2]]));
    expect(errors.some((e) => e.startsWith('rivers[0].course'))).toBe(true);
  });
});

describe('validateCountry warnings', () => {
  const warningsOf = (mutate: (c: Country) => void) => {
    const c = clone();
    mutate(c);
    return validateCountry(c).warnings;
  };

  it('has none for France', () => {
    expect(validateCountry(france).warnings).toEqual([]);
  });

  it('warns about a river town on no river', () => {
    const warnings = warningsOf((c) =>
      c.rivers.towns.push({ id: 'lonely', name: 'Lonely', lat: 45, lon: 2 }),
    );
    expect(warnings).toContain('river town Lonely (lonely) is on no river');
  });

  it('warns about a pattern with no towns', () => {
    const warnings = warningsOf((c) => (c.namePatterns[0].towns = []));
    expect(warnings).toContain(`pattern ${france.namePatterns[0].label} has no towns`);
  });

  it('warns about outline and data mismatches in both directions, ignoring case', () => {
    const warnings = warningsOf((c) => {
      c.outline.locations.push({ id: 'zz', name: 'Extra', path: 'M0 0h1v1z' });
      c.outline.locations = c.outline.locations.filter(
        (l) => l.id.toUpperCase() !== c.departments[0].code.toUpperCase(),
      );
    });
    expect(warnings).toContain('outline area ZZ has no department data');
    expect(
      warnings.some(
        (w) => w.startsWith(`department ${france.departments[0].code} `) && w.includes('not in the outline'),
      ),
    ).toBe(true);
  });
});

describe('validateCountry on missing translations', () => {
  const errorsOf = (mutate: (c: Country) => void) => {
    const c = structuredClone(france);
    mutate(c);
    return validateCountry(c).errors;
  };

  it('flags a country without copy for a supported language', () => {
    const errors = errorsOf((c) => delete (c.copy as Partial<Country['copy']>).be);
    expect(errors.some((e) => e.startsWith('country[0].copy.be'))).toBe(true);
  });

  it('flags a set without a label or tip in one language', () => {
    const errors = errorsOf((c) => {
      delete c.copy.be.setLabels.riv;
      delete c.copy.be.tips.riv;
    });
    expect(errors).toContain('set riv has no label in copy.be.setLabels');
    expect(errors).toContain('set riv has no tip in copy.be.tips');
  });

  it('flags data text missing in a non-source language', () => {
    const errors = errorsOf((c) => {
      delete c.copy.be.data!.phoneZones!['04'];
      delete c.copy.be.data!.namePatterns!.p3;
      delete c.copy.be.data!.rivers!.r7;
    });
    expect(errors).toContain('phone zone 04 has no be text in copy.be.data.phoneZones');
    expect(errors).toContain('name pattern p3 has no be text in copy.be.data.namePatterns');
    expect(errors).toContain('river r7 has no be text in copy.be.data.rivers');
  });

  it('flags translations of ids that do not exist', () => {
    const errors = errorsOf((c) => (c.copy.be.data!.rivers!.r99 = { flowsInto: 'мора' }));
    expect(errors).toContain('copy.be.data.rivers translates unknown river r99');
  });

  it('flags a plate label present in one language only', () => {
    const errors = errorsOf((c) => delete c.copy.be.plateLabel);
    expect(errors).toContain('copy.be.plateLabel must be set exactly when copy.en.plateLabel is');
  });
});

describe('schemas', () => {
  it('requires course points to be [lat, lon] tuples', () => {
    const river = { id: 'r', name: 'R', lengthKm: 10, flowsInto: 'sea', towns: [] };
    expect(
      RiverSchema.safeParse({
        ...river,
        course: [
          [1, 2],
          [3, 4],
        ],
      }).success,
    ).toBe(true);
    expect(
      RiverSchema.safeParse({
        ...river,
        course: [
          [1, 2, 3],
          [3, 4],
        ],
      }).success,
    ).toBe(false);
  });
});
