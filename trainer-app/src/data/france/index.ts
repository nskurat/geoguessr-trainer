import outline from '@svg-maps/france.departments';
import type {
  City,
  Country,
  Department,
  LatLon,
  NamePattern,
  PhoneData,
  Region,
  RiverData,
} from '../../types/geo';
import cities from './cities.json';
import { copyBe } from './copy.be';
import { copyEn } from './copy.en';
import departments from './departements.json';
import namePatterns from './placeNames.json';
import phone from './phone.json';
import localPrefixes from './phonePrefixes.json';
import regions from './regions.json';
import rivers from './rivers.json';

/*
 * France. Coordinates, river courses and place-name patterns are approximate
 * and compiled for study. Département outlines: "France departments map" by
 * Victor Cazanave (svg-maps), CC BY 4.0. Phone zones follow the Wikipedia
 * table of French area codes. `npm run validate:data` checks this data.
 */
export const france: Country = {
  id: 'france',
  name: 'France',
  sets: ['reg', 'dep', 'city', 'riv', 'tel', 'nom'],
  departmentCodes: 'shown',
  projectionRefLat: 46.5,
  regionLabelOffsets: { IDF: { dy: -4 }, COR: { dx: 2 } },
  outline,
  regions: regions as Region[],
  departments: (departments as Department[]).map((d) => ({ ...d, plate: d.code })),
  cities: cities as City[],
  phone: { ...(phone as PhoneData), localPrefixes },
  namePatterns: namePatterns as NamePattern[],
  rivers: {
    rivers: rivers.rivers.map((r) => ({ ...r, course: r.course as LatLon[] })),
    towns: rivers.towns,
  } satisfies RiverData,
  copy: { en: copyEn, be: copyBe },
};
