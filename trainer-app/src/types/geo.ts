import type { StudySet } from './trainer';

/**
 * Country-agnostic geography types. A country is described entirely by data
 * (see `data/<country>/index.ts`); the trainer code never names a country.
 */

/** A [latitude, longitude] pair in degrees. */
export type LatLon = [number, number];

/** A point in map (SVG viewBox) units. */
export type Point = [number, number];

/** Top-level administrative area (région in France). */
export interface Region {
  key: string;
  name: string;
  capital: string;
  /** Hue (0–360) of the region's fill in learn mode. */
  hue: number;
  /** Codes of the departments it contains. */
  codes: string[];
}

/** Second-level administrative area (département in France), identified by its code. */
export interface Department {
  code: string;
  name: string;
  /** Administrative seat. */
  prefecture: string;
  lat: number;
  lon: number;
  /** What its licence plates show (France: the code at the right; Peru: none verified). */
  plate?: string;
}

export interface City {
  id: string;
  name: string;
  /** Code of the department it is in. */
  code: string;
  lat: number;
  lon: number;
  /** 1 = major city, always labelled; 2 = labelled when zoomed in or filtered to a region. */
  tier: 1 | 2;
}

export interface PhoneZone {
  /** Landline prefix, e.g. "04". */
  zone: string;
  name: string;
  description: string;
  /** Hue (0–360) of the zone's fill in learn mode. */
  hue: number;
}

export interface PhoneData {
  zones: PhoneZone[];
  /** Department code → landline prefix. */
  zoneByDepartement: Record<string, string>;
  /** Departments on or near a zone border, drilled by the "Near zone borders" filter. Empty hides the filter. */
  borderDepartements: string[];
  /**
   * Finer local prefixes per department (France: the two digits after 0Z). Shown as small
   * labels in learn mode and in the info card; never quizzed.
   */
  localPrefixes?: Record<string, string[]>;
}

export interface NameTown {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Practice only: not listed as an example in learn mode, so the pattern is learnt rather than the list. */
  extra: boolean;
}

/** A place-name ending or prefix typical of an area. */
export interface NamePattern {
  id: string;
  label: string;
  where: string;
  origin: string;
  /** Departments where the pattern is common. */
  codes: string[];
  towns: NameTown[];
}

export interface River {
  id: string;
  name: string;
  lengthKm: number;
  /** True when `lengthKm` is the whole river, not just the stretch inside this country. */
  lengthIsTotal?: boolean;
  flowsInto: string;
  /** Waypoints from source to mouth. */
  course: LatLon[];
  /** Ids of towns on it (`RiverData.towns`), source to mouth. */
  towns: string[];
}

export interface RiverTown {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface RiverData {
  rivers: River[];
  /** Shared between rivers: a confluence town appears once and is listed by each river. */
  towns: RiverTown[];
}

/** SVG outlines of the departments, as published by the @svg-maps packages. */
export interface MapOutline {
  viewBox: string;
  locations: { id: string; name: string; path: string }[];
  /**
   * When the outline was generated with the trainer's own projection
   * (`scripts/build-outline.ts`), the exact affine from `mercatorPlane(lat, lon, refLat)`
   * to SVG units, as [[a, b, c], [d, e, f]]. Without it the projection is fitted from anchors.
   */
  affine?: number[][];
}

/** A term in its singular and plural forms, e.g. Département / Départements. */
export interface Term {
  one: string;
  many: string;
}

/** Interface text that depends on the country. */
export interface CountryCopy {
  /** One sentence under the title. */
  subtitle: string;
  /** Button label and heading of each enabled study set. */
  setLabels: Partial<Record<StudySet, string>>;
  /** Top-level areas (régions in France). */
  regionTerm: Term;
  /** Second-level areas (départements in France). */
  departmentTerm: Term;
  /** Label of a department's administrative seat, e.g. "Prefecture" or "Capital". */
  seatLabel: string;
  /** Label before `Department.plate`, e.g. "Plates end in". */
  plateLabel?: string;
  /** Label of the "whole country" option of the Area filter. */
  allAreas: string;
  /** "How to use it" card text per study set. */
  tips: Partial<Record<StudySet, string>>;
  /** Shown under the phone-zone legend. */
  phoneHint: string;
  /** Footer credits, as trusted HTML authored in the country's data module. */
  credits: string;
}

export interface Country {
  id: string;
  name: string;
  /** Study sets offered for this country, in display order: only those worth drilling for it. */
  sets: StudySet[];
  /** Whether department codes mean something to players (France's numbers do; Peru's do not). */
  departmentCodes: 'shown' | 'hidden';
  /** Latitude at which the projection is undistorted, roughly the country's middle. */
  projectionRefLat: number;
  /** Nudges, in map units, for region labels whose area-weighted centre sits badly. */
  regionLabelOffsets: Record<string, { dx?: number; dy?: number }>;
  outline: MapOutline;
  regions: Region[];
  departments: Department[];
  cities: City[];
  phone: PhoneData;
  namePatterns: NamePattern[];
  rivers: RiverData;
  copy: CountryCopy;
}
