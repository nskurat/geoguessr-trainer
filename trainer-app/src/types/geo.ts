import type { Lang, PluralForms } from './i18n';
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
  /**
   * Set only for rivers that extend beyond this country: their `lengthKm` is the whole river,
   * and the info card says so ("in total, not just in …"). Leave unset for domestic rivers.
   */
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
  /**
   * Lower-case forms after a number ("13 départements"), by plural category. Needed where
   * the noun's form depends on the number (Belarusian: 1 рэгіён, 2 рэгіёны, 5 рэгіёнаў);
   * without it `many` is lower-cased.
   */
  counted?: PluralForms;
}

/**
 * Translations of the English text inside a country's data files (phone zones, name
 * patterns, rivers), keyed by id. Place names inside them stay as in the data. Required
 * for every item in each non-source language (`npm run validate:data` checks it).
 */
export interface DataText {
  /** By zone. `name` defaults to the data's (Peru's zones are named after regions). */
  phoneZones?: Record<string, { name?: string; description: string }>;
  /** By pattern id. `label` defaults to the data's (only notes like "(Basque)" need one). */
  namePatterns?: Record<string, { label?: string; where: string; origin: string }>;
  /** By river id. */
  rivers?: Record<string, { flowsInto: string }>;
}

/** Interface text that depends on the country, in one language. */
export interface CountryCopy {
  /** The country's name in this language (exonym), for the title and picker. */
  countryName: string;
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
  /** Under a department code asked by number; defaults to "<Term> number" (`sub.codeNumber`). */
  codeLabel?: string;
  /** Label of the "whole country" option of the Area filter. */
  allAreas: string;
  /** "How to use it" card text per study set. */
  tips: Partial<Record<StudySet, string>>;
  /** Shown under the phone-zone legend. */
  phoneHint: string;
  /** Footer credits, as trusted HTML authored in the country's data module. */
  credits: string;
  /** Translations of the data files' English text; omitted in the source language. */
  data?: DataText;
}

export interface Country {
  id: string;
  /** English name, for tooling output; the interface uses `copy[lang].countryName`. */
  name: string;
  /** Study sets offered for this country, in display order: only those worth drilling for it. */
  sets: StudySet[];
  /** Whether department codes mean something to players (France's numbers do; Peru's do not). */
  departmentCodes: 'shown' | 'hidden';
  /** Latitude at which the projection is undistorted, roughly the country's middle. */
  projectionRefLat: number;
  /** Nudges, in map units, for region labels whose area-weighted centre sits badly. */
  regionLabelOffsets: Record<string, { dx?: number; dy?: number }>;
  /**
   * Nudges, in map units, for department labels whose bounding-box centre sits badly, e.g. a
   * department that surrounds another (Brandenburg around Berlin).
   */
  departmentLabelOffsets?: Record<string, { dx?: number; dy?: number }>;
  outline: MapOutline;
  regions: Region[];
  departments: Department[];
  cities: City[];
  phone: PhoneData;
  namePatterns: NamePattern[];
  rivers: RiverData;
  /** Interface text per language (`data/<country>/copy.<lang>.ts`); every language is required. */
  copy: Record<Lang, CountryCopy>;
}
