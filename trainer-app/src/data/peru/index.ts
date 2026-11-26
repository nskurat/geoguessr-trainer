import type { City, Country, Department, LatLon, PhoneData, Region } from '../../types/geo';
import cities from './cities.json';
import { copyBe } from './copy.be';
import { copyEn } from './copy.en';
import departments from './departments.json';
import outline from './outline.json';
import phone from './phone.json';
import regions from './regions.json';
import riverCourses from './riverCourses.json';
import rivers from './rivers.json';

/*
 * Peru. Outlines and most river courses: Natural Earth 1:10m (public domain),
 * built by `npm run build:outline -- peru`; Callao is merged into Lima
 * Metropolitana. Facts, sources and confidence notes: RESEARCH.md.
 * `npm run validate:data` checks this data.
 */
const courses: Record<string, number[][]> = riverCourses;

export const peru: Country = {
  id: 'peru',
  name: 'Peru',
  sets: ['reg', 'dep', 'city', 'tel', 'riv'],
  departmentCodes: 'hidden',
  projectionRefLat: outline.refLat,
  regionLabelOffsets: {},
  outline: { viewBox: outline.viewBox, locations: outline.locations, affine: outline.affine },
  regions: regions as Region[],
  departments: departments as Department[],
  cities: cities as City[],
  phone: phone as PhoneData,
  namePatterns: [],
  rivers: {
    // Hand-researched courses where Natural Earth has none (Urubamba, Rímac).
    rivers: rivers.rivers.map((r) => ({
      ...r,
      course: (r.course.length ? r.course : (courses[r.name] ?? [])) as LatLon[],
    })),
    towns: rivers.towns,
  },
  copy: { en: copyEn, be: copyBe },
};
