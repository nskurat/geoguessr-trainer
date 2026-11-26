import type { City, Country, Department, LatLon, PhoneData, Region } from '../../types/geo';
import type { StudySet } from '../../types/trainer';
import cities from './cities.json';
import copy from './copy.json';
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
  sets: copy.sets as StudySet[],
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
  copy: {
    subtitle: copy.subtitle,
    setLabels: copy.setLabels,
    regionTerm: copy.regionTerm,
    departmentTerm: copy.departmentTerm,
    seatLabel: copy.seatLabel,
    allAreas: copy.allAreas,
    tips: copy.tips,
    phoneHint: copy.phoneHint,
    credits:
      'Region outlines and most river courses: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (public domain); Callao is shown together with Lima Metropolitana. Area codes, cities and river towns are compiled from Wikipedia and GeoGuessr guides (see RESEARCH.md in the repository). Coordinates and courses are approximate and compiled for study, not survey-grade.',
  },
};
