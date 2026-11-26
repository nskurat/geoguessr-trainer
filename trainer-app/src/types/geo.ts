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
  /** Departments on or near a zone border, drilled by the "Near zone borders" filter. */
  borderDepartements: string[];
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
}

/** Interface text that depends on the country. */
export interface CountryCopy {
  /** Label of the "whole country" option of the Area filter. */
  allAreas: string;
  /** "How to use it" card text per study set. */
  tips: Record<string, string>;
  /** Shown under the phone-zone legend. */
  phoneHint: string;
}

export interface Country {
  id: string;
  name: string;
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
