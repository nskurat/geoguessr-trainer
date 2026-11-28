import type { City, Country, Department, LatLon, NamePattern } from '../../types/geo';
import cities from './cities.json';
import { copyBe } from './copy.be';
import { copyEn } from './copy.en';
import departments from './departments.json';
import outline from './outline.json';
import namePatterns from './placeNames.json';
import riverCourses from './riverCourses.json';
import rivers from './rivers.json';

/*
 * Poland. Voivodeship outlines and river courses: Natural Earth 1:10m (public domain), built
 * by `npm run build:outline -- poland`. Town coordinates: GeoNames (CC BY 4.0). Facts,
 * sources and confidence notes: RESEARCH.md. `npm run validate:data` checks this data.
 * No phone set: Polish area-code zones are finer than the 16 voivodeships (see RESEARCH.md).
 * No top-level grouping: the NUTS-1 macroregions are statistical units players never see (§4).
 */
const courses: Record<string, number[][]> = riverCourses;

export const poland: Country = {
  id: 'poland',
  name: 'Poland',
  sets: ['dep', 'city', 'riv', 'nom'],
  departmentCodes: 'hidden',
  projectionRefLat: outline.refLat,
  departmentLabelOffsets: {},
  outline: { viewBox: outline.viewBox, locations: outline.locations, affine: outline.affine },
  departments: departments as Department[],
  cities: cities as City[],
  phone: { zones: [], zoneByDepartement: {}, borderDepartements: [] },
  namePatterns: namePatterns as NamePattern[],
  rivers: {
    // Natural Earth's courses are drawn as they are; none needs a hand-drawn continuation.
    rivers: rivers.rivers.map((r) => ({
      ...r,
      course: [...(courses[r.name] ?? []), ...r.course] as LatLon[],
    })),
    towns: rivers.towns,
  },
  copy: { en: copyEn, be: copyBe },
};
