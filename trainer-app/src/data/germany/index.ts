import type { City, Country, Department, LatLon, NamePattern, Region } from '../../types/geo';
import cities from './cities.json';
import { copyBe } from './copy.be';
import { copyEn } from './copy.en';
import departments from './departments.json';
import outline from './outline.json';
import namePatterns from './placeNames.json';
import regions from './regions.json';
import riverCourses from './riverCourses.json';
import rivers from './rivers.json';

/*
 * Germany. State outlines and river courses: Natural Earth 1:10m (public domain), built
 * by `npm run build:outline -- germany`. Town coordinates: GeoNames (CC BY 4.0). Facts,
 * sources and confidence notes: RESEARCH.md. `npm run validate:data` checks this data.
 * No phone set: area-code zones cut across state borders (see RESEARCH.md). The four
 * macro-regions are an Area filter only, not a study set (RESEARCH.md §4).
 */
const courses: Record<string, number[][]> = riverCourses;

export const germany: Country = {
  id: 'germany',
  name: 'Germany',
  sets: ['dep', 'city', 'riv', 'nom'],
  departmentCodes: 'hidden',
  projectionRefLat: outline.refLat,
  // Brandenburg surrounds Berlin, so its bounding-box centre falls on Berlin.
  departmentLabelOffsets: { BB: { dy: 24 } },
  outline: { viewBox: outline.viewBox, locations: outline.locations, affine: outline.affine },
  regions: regions as Region[],
  departments: departments as Department[],
  cities: cities as City[],
  phone: { zones: [], zoneByDepartement: {}, borderDepartements: [] },
  namePatterns: namePatterns as NamePattern[],
  rivers: {
    // A `course` in rivers.json is hand-drawn and continues Natural Earth's downstream,
    // where NE stops early (the tidal Elbe below Hamburg, the Weser below Brake, the Ems estuary).
    rivers: rivers.rivers.map((r) => ({
      ...r,
      course: [...(courses[r.name] ?? []), ...r.course] as LatLon[],
    })),
    towns: rivers.towns,
  },
  copy: { en: copyEn, be: copyBe },
};
