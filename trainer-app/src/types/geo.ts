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

/** 1 = trunk, 2 = regional, 3 = minor: the class decides from which zoom a road is drawn. */
export type RoadClass = 1 | 2 | 3;

/** Generic sign colours: the real-world colour of a network's shields (never a country in code). */
export type ShieldStyle = 'blue' | 'red' | 'yellow' | 'green' | 'white';

/** One numbering rule of a network, e.g. "Odd numbers run north–south". */
export interface RoadRule {
  id: string;
  /** In the source language (English); other languages translate it in `DataText.roadNetworks`. */
  text: string;
}

/** A family of numbered roads that share a sign and a numbering logic (Autobahn, autoroute…). */
export interface RoadNetwork {
  /** Data id, not shown, e.g. "A". */
  id: string;
  shield: ShieldStyle;
  /** In English, e.g. "Autobahn". */
  label: string;
  /** How its numbers are signed, in English, e.g. "Blue shield, white number". */
  sign: string;
  /** Numbering rules that roads of the network refer to by id. */
  rules: RoadRule[];
}

/**
 * What another number on a road means: an E-route signed on (part of) it, a stretch shared
 * with another road of the data (two national numbers on one carriageway), or a number it
 * used to carry.
 */
export type RoadAltRefKind = 'european' | 'concurrent' | 'former';

/** Another number a road carries besides its primary `ref`; never drilled or put on its shield. */
export interface RoadAltRef {
  /** As signed, e.g. "E 45"; for `concurrent`, the other road's primary `ref`. */
  ref: string;
  /** Network id, e.g. "E"; for `concurrent`, the other road's network. Need not be in `networks`. */
  network: string;
  kind: RoadAltRefKind;
  /**
   * `towns` ids of this road bounding the stretch the number applies to (both or neither;
   * equal for a short stretch at one town). Without them the number applies to the whole road.
   */
  from?: string;
  to?: string;
  /** Maintainer note in English (exact junctions, source detail); not shown or translated. */
  note?: string;
}

/**
 * A numbered road as the trainer studies it: where it sits in the network's pattern (its
 * rules and neighbours) more than its exact course.
 */
export interface Road {
  /** Stable id without "|", e.g. "a7"; progress key `road|a7`. A renumbered road gets a new id. */
  id: string;
  /** `RoadNetwork.id`. */
  network: string;
  /** As signed, e.g. "A 7"; never translated. The number drilled and shown on the shield. */
  ref: string;
  /** Its other numbers (E-routes, shared stretches, former numbers), most relevant first. */
  altRefs?: RoadAltRef[];
  class: RoadClass;
  /** `RoadData.towns` id of the start terminus (may be a border town). */
  from: string;
  /** `RoadData.towns` id of the end terminus. */
  to: string;
  /** `RoadData.towns` ids, in order from `from` to `to`. */
  towns: string[];
  /** Departments it crosses (hints, Area scope). */
  codes: string[];
  /** Sourced length of the whole route in this country. */
  lengthKm?: number;
  /** Nickname in English, e.g. "Carretera Central". */
  name?: string;
  /** Ids of the network's rules that place this road, most telling first. */
  rules: string[];
  /** The parallel roads either side in the pattern (0–2 road ids), e.g. the A 5 and the A 9 for the A 7. */
  between: string[];
  /** Road ids of the main crossings, in order along the road. */
  crosses: string[];
  /**
   * Parts, each ordered from `from` towards `to`. Joined in at load time from
   * `roads.osm.json` or `roadCourses.json`; never stored in `roads.json`.
   */
  course: LatLon[][];
}

/** A road as stored in `roads.json` (our own data): everything but the course. */
export type RoadEntry = Omit<Road, 'course'>;

/** A town on one or several roads (the shape of `RiverTown`). */
export type RoadTown = RiverTown;

export interface RoadData {
  networks: RoadNetwork[];
  roads: Road[];
  /** Shared between roads: a junction town appears once and is listed by each road. */
  towns: RoadTown[];
}

/** The contents of `data/<country>/roads.json`. */
export interface RoadsFile {
  networks: RoadNetwork[];
  roads: RoadEntry[];
  towns: RoadTown[];
}

/**
 * One road's course in a course file: `roads.osm.json` (OpenStreetMap, ODbL, with `osm`
 * provenance) or `roadCourses.json` (Natural Earth or our own drawing, without it).
 */
export interface RoadCourse {
  /** OSM provenance: the route relations the course was assembled from and their `ref`. */
  osm?: { relations?: number[]; ref: string };
  /** [lat, lon] parts. */
  course: LatLon[][];
}

/** A course file, keyed by road id. */
export type RoadCourses = Record<string, RoadCourse>;

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
  /** By network id: label, sign description and every rule by rule id. */
  roadNetworks?: Record<string, { label: string; sign: string; rules: Record<string, string> }>;
  /** By road id, for roads with a `name`. */
  roads?: Record<string, { name: string }>;
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
  /** Numbered roads; required when `sets` includes `road`. */
  roads?: RoadData;
  /** Interface text per language (`data/<country>/copy.<lang>.ts`); every language is required. */
  copy: Record<Lang, CountryCopy>;
}
