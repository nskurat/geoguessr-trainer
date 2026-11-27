/**
 * Builds a country's map outline (admin-1 units as SVG paths) and its river courses
 * from Natural Earth data, projected exactly as the trainer projects lat/lon.
 *
 * Usage:
 *   npm run build:outline -- <country>        e.g. npm run build:outline -- peru
 *
 * Writes, for the country's entry in COUNTRIES below:
 *   trainer-app/src/data/<country>/outline.json       viewBox, locations [{id, name, path}],
 *                                                     affine, refLat, source
 *   trainer-app/src/data/<country>/riverCourses.json  { "<river>": [[lat, lon], ...] } source → mouth
 *
 * Projection: `mercatorPlane(lat, lon, refLat)` from trainer-app/src/services/geo/projection.ts,
 * then the affine map written to outline.json (x = s·px/cos(refLat) + c, y = −s·py + f, so the
 * map is conformal: mercatorPlane already scales x by cos(refLat)). The trainer can
 * use `affine ∘ mercatorPlane` directly, so dots and rivers land exactly on the outline.
 * refLat is the middle latitude of the country's bounding box, rounded to 0.1°.
 *
 * Geometry is simplified on a shared topology (topojson-server → topojson-simplify →
 * topojson-client), so neighbouring units keep identical borders with no gaps or overlaps.
 * Islands and holes below MIN_RING_AREA are dropped, but each unit keeps its largest polygon.
 *
 * Sources: Natural Earth 1:10m vector data (https://www.naturalearthdata.com), public domain:
 *   ne_10m_admin_0_countries, ne_10m_admin_1_states_provinces, ne_10m_rivers_lake_centerlines,
 *   and per country extra river layers such as ne_10m_rivers_europe.
 * Downloaded on demand from github.com/nvkelso/natural-earth-vector into the git-ignored
 * cache directory .cache/natural-earth/ (delete it to re-download).
 *
 * Merging units: `merge: { LMA: { from: ['LMA', 'CAL'], name: '…' } }` dissolves the listed
 * units (ids after idOverrides) into one location on the shared topology (topojson-client
 * `merge`), so the merged unit has no internal border and still fits its neighbours exactly.
 *
 * Adding a country: add an entry to COUNTRIES (Natural Earth adm0_a3 code, id/name
 * overrides, merges, rivers with a hint of where each one's downstream end lies, check points).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';
import { feature, merge } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { mercatorPlane } from '../trainer-app/src/services/geo/projection';

type LatLon = [number, number];
type Pt = [number, number];

interface RiverSpec {
  /** Key in riverCourses.json (local/Spanish name). */
  key: string;
  /** Natural Earth `name`, `name_en` or `name_alt` to match (several when NE splits the river). */
  ne: string | string[];
  /** Roughly where the river's downstream end is (may lie outside the country): orients the line. */
  mouth: LatLon;
  /** Keep the course from the vertex nearest this point (to cut one stretch out of a longer NE line). */
  from?: LatLon;
  /** Keep the course up to the vertex nearest this point. */
  to?: LatLon;
}

interface CountryConfig {
  /** Natural Earth `adm0_a3` code. */
  adm0: string;
  /** Prefix stripped from `iso_3166_2` to make an id. */
  isoPrefix: string;
  /** Overrides keyed by Natural Earth admin-1 `name`. */
  idOverrides?: Record<string, string>;
  nameOverrides?: Record<string, string>;
  /** Units dissolved into one location: output id → source ids (after idOverrides) and name. */
  merge?: Record<string, { from: string[]; name: string }>;
  /** Expected number of Natural Earth admin-1 units, before merging (sanity check). */
  expectedUnits: number;
  rivers: RiverSpec[];
  /**
   * Natural Earth river layers to search, in addition to the default 10m
   * `rivers_lake_centerlines` (e.g. `rivers_europe`, the supplement with smaller rivers).
   */
  extraRiverLayers?: string[];
  /** Candidate rivers with no usable Natural Earth 1:10m line, reported as missing. */
  missingRivers?: string[];
  /** Known points and the unit they must fall in: checked after the build. */
  checks: { name: string; lat: number; lon: number; id: string }[];
}

const COUNTRIES: Record<string, CountryConfig> = {
  peru: {
    adm0: 'PER',
    isoPrefix: 'PE-',
    // NE tags Metropolitan Lima ("Lima Province", type "Captial District") PE-LIM like the
    // Lima department; LMA is its real ISO 3166-2 code.
    idOverrides: { 'Lima Province': 'LMA' },
    nameOverrides: { 'Lima Province': 'Lima Metropolitana' },
    // NE's Callao is far too small (Ventanilla is put in Lima), and the two are one city for
    // players anyway: one unit.
    merge: { LMA: { from: ['LMA', 'CAL'], name: 'Lima Metropolitana y Callao' } },
    expectedUnits: 26,
    rivers: [
      { key: 'Amazonas', ne: 'Amazonas', mouth: [-0.5, -50] },
      // NE's "Ucayali" line runs from the Apurímac's source; the Ucayali proper starts at
      // Atalaya (Tambo + Urubamba), and the Apurímac ends where the Mantaro joins it.
      { key: 'Ucayali', ne: 'Ucayali', mouth: [-4.45, -73.45], from: [-10.73, -73.76] },
      { key: 'Apurímac', ne: 'Ucayali', mouth: [-4.45, -73.45], to: [-12.26, -73.98] },
      { key: 'Marañón', ne: 'Marañón', mouth: [-4.45, -73.45] },
      { key: 'Huallaga', ne: 'Huallaga', mouth: [-5.1, -75.6] },
      { key: 'Napo', ne: 'Napo', mouth: [-3.4, -72.7] },
      { key: 'Putumayo', ne: 'Putumayo', mouth: [-3.1, -67.9] },
      { key: 'Madre de Dios', ne: 'Madre de Dios', mouth: [-10.4, -65.4] },
      { key: 'Purús', ne: 'Purús', mouth: [-3.7, -61.4] },
      { key: 'Yavarí', ne: 'Javari', mouth: [-4.2, -70] },
      { key: 'Santa', ne: 'Santa', mouth: [-8.97, -78.64] },
      { key: 'Tambo', ne: 'Tambo', mouth: [-17.17, -71.8] },
      { key: 'Pisco', ne: 'Pisco', mouth: [-13.7, -76.2] },
      // NE 10m labels the Catamayo–Chira (mouth near Paita, -4.9) "Tumbes".
      { key: 'Chira', ne: 'Tumbes', mouth: [-4.89, -81.19] },
    ],
    missingRivers: ['Urubamba', 'Mantaro', 'Tigre', 'Pastaza', 'Rímac', 'Majes / Colca', 'Piura', 'Tumbes', 'Cañete'],
    checks: [
      { name: 'Lima', lat: -12.046, lon: -77.043, id: 'LMA' },
      { name: 'Callao', lat: -12.056, lon: -77.118, id: 'LMA' },
      { name: 'Cusco', lat: -13.532, lon: -71.967, id: 'CUS' },
      { name: 'Iquitos', lat: -3.749, lon: -73.253, id: 'LOR' },
      { name: 'Arequipa', lat: -16.409, lon: -71.537, id: 'ARE' },
      { name: 'Huacho', lat: -11.107, lon: -77.605, id: 'LIM' },
    ],
  },
  germany: {
    adm0: 'DEU',
    isoPrefix: 'DE-',
    expectedUnits: 16,
    // The 10m centerlines lack most tributaries; the Europe supplement has them.
    extraRiverLayers: ['rivers_europe'],
    rivers: [
      // NE splits the Rhine into "Rhein" (Alps, Lake Constance), "Rhin" and "Rhine"; the
      // German stretch starts where it leaves Lake Constance and ends at the Dutch border.
      { key: 'Rhein', ne: ['Rhein', 'Rhine'], mouth: [51.98, 4.1], from: [47.66, 8.88], to: [51.84, 6.1] },
      { key: 'Donau', ne: 'Donau', mouth: [45.2, 29.7] },
      // NE's Elbe stops in Hamburg: the tidal Elbe to Cuxhaven is drawn by hand in rivers.json.
      { key: 'Elbe', ne: 'Elbe', mouth: [53.9, 8.7], from: [50.89, 14.23] },
      { key: 'Main', ne: 'Main', mouth: [50.0, 8.28] },
      // NE's Weser starts at the Werra's source; the Weser proper starts at Hann. Münden.
      // It stops near Brake: the stretch to Bremerhaven is drawn by hand in rivers.json.
      { key: 'Weser', ne: 'Weser', mouth: [53.6, 8.5], from: [51.42, 9.65] },
      { key: 'Mosel', ne: 'Mosel', mouth: [50.36, 7.6], from: [49.47, 6.36] },
      { key: 'Neckar', ne: 'Neckar', mouth: [49.51, 8.44] },
      { key: 'Oder', ne: 'Oder', mouth: [53.7, 14.3] },
      { key: 'Saale', ne: 'Saale', mouth: [51.95, 11.9] },
      { key: 'Isar', ne: 'Isar', mouth: [48.8, 12.98] },
      // NE's "Spree" features also carry the Havel below Berlin: cut at Spandau.
      { key: 'Spree', ne: 'Spree', mouth: [52.54, 13.2], to: [52.53, 13.21] },
      { key: 'Ruhr', ne: 'Ruhr', mouth: [51.45, 6.73] },
      { key: 'Ems', ne: 'Ems', mouth: [53.3, 7.2] },
      { key: 'Inn', ne: 'Inn', mouth: [48.57, 13.47] },
      // NE's "Lahn" starts up the Ohm in the Vogelsberg: cut where the Ohm joins at Cölbe
      // (the upper Lahn above Marburg, past Biedenkopf, is not drawn).
      { key: 'Lahn', ne: 'Lahn', mouth: [50.31, 7.6], from: [50.85, 8.78] },
    ],
    checks: [
      { name: 'Berlin', lat: 52.52, lon: 13.405, id: 'BE' },
      { name: 'Potsdam', lat: 52.399, lon: 13.066, id: 'BB' },
      { name: 'Hamburg', lat: 53.551, lon: 9.993, id: 'HH' },
      { name: 'Bremen', lat: 53.076, lon: 8.807, id: 'HB' },
      { name: 'Bremerhaven', lat: 53.55, lon: 8.58, id: 'HB' },
      { name: 'München', lat: 48.137, lon: 11.575, id: 'BY' },
      { name: 'Mainz', lat: 49.982, lon: 8.28, id: 'RP' },
      { name: 'Wiesbaden', lat: 50.086, lon: 8.244, id: 'HE' },
      { name: 'Saarbrücken', lat: 49.233, lon: 7.01, id: 'SL' },
    ],
  },
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache', 'natural-earth');
const NE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const SOURCE = 'Natural Earth 1:10m admin-1 (public domain)';

/** Longer side of the map, in SVG units, and padding around it. */
const MAP_SIZE = 600;
const PADDING = 8;
/** Simplification threshold: minimum triangle area (Visvalingam), in SVG units². */
const MIN_TRIANGLE_AREA = 0.01;
/** Islands and holes smaller than this (SVG units²; 1 unit ≈ 2 km for Peru) are dropped. */
const MIN_RING_AREA = 0.5;
/** River waypoints within this distance (degrees) of the border count as inside. */
const RIVER_BUFFER_DEG = 0.12;
const RIVER_MIN_POINTS = 15;
const RIVER_MAX_POINTS = 60;
/** Douglas–Peucker tolerance floor (SVG units), so short rivers drop their jitter too. */
const RIVER_MIN_TOLERANCE = 0.3;

async function loadNE(name: string): Promise<FeatureCollection> {
  const file = join(CACHE, `ne_10m_${name}.geojson`);
  if (!existsSync(file)) {
    const url = `${NE_URL}ne_10m_${name}.geojson`;
    console.log(`Downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(readFileSync(file, 'utf8')) as FeatureCollection;
}

// ---------- geometry helpers ----------

function polygonsOf(g: Geometry | null): Position[][][] {
  if (!g) return [];
  if (g.type === 'Polygon') return [g.coordinates];
  if (g.type === 'MultiPolygon') return g.coordinates;
  return [];
}

/** Signed shoelace area (positive = counter-clockwise in a y-up plane). */
function signedArea(ring: Position[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return a / 2;
}

function pointInRing(x: number, y: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInPolygons(x: number, y: number, polys: Position[][][]): boolean {
  return polys.some((p) => pointInRing(x, y, p[0]) && !p.slice(1).some((h) => pointInRing(x, y, h)));
}

function segDist(x: number, y: number, a: Position, b: Position): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)) : 0;
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}

function nearRings(x: number, y: number, polys: Position[][][], d: number): boolean {
  for (const p of polys)
    for (const ring of p)
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1];
        const b = ring[i];
        if (Math.min(a[0], b[0]) - d > x || Math.max(a[0], b[0]) + d < x) continue;
        if (Math.min(a[1], b[1]) - d > y || Math.max(a[1], b[1]) + d < y) continue;
        if (segDist(x, y, a, b) <= d) return true;
      }
  return false;
}

/** Douglas–Peucker on planar points; returns kept indices. */
function douglasPeucker(pts: Pt[], tol: number): number[] {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    let best = -1;
    let bestD = tol;
    for (let k = i + 1; k < j; k++) {
      const d = segDist(pts[k][0], pts[k][1], pts[i], pts[j]);
      if (d > bestD) {
        bestD = d;
        best = k;
      }
    }
    if (best >= 0) {
      keep[best] = 1;
      stack.push([i, best], [best, j]);
    }
  }
  return [...keep.keys()].filter((k) => keep[k]);
}

/**
 * Douglas–Peucker with the tolerance chosen so the river keeps at most RIVER_MAX_POINTS
 * (and no detail finer than RIVER_MIN_TOLERANCE), but at least RIVER_MIN_POINTS when it has them.
 */
function simplifyRiver(pts: Pt[]): number[] {
  if (pts.length <= RIVER_MIN_POINTS) return pts.map((_, i) => i);
  // count(tol) decreases with tol: bisect for the smallest tol with count ≤ max, …
  const bisect = (ok: (n: number) => boolean, lo: number, hi: number, wantSmall: boolean) => {
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const good = ok(douglasPeucker(pts, mid).length);
      if (wantSmall === good) hi = mid;
      else lo = mid;
    }
    return wantSmall ? hi : lo;
  };
  let tol = Math.max(RIVER_MIN_TOLERANCE, bisect((n) => n <= RIVER_MAX_POINTS, 0, 50, true));
  // … then back off to the largest tol that still keeps the minimum.
  if (douglasPeucker(pts, tol).length < RIVER_MIN_POINTS) tol = bisect((n) => n >= RIVER_MIN_POINTS, 0, tol, false);
  return douglasPeucker(pts, tol);
}

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Compact relative SVG path from rings in SVG units, coordinates in hundredths. */
function ringsToPath(rings: Pt[][]): string {
  const num = (h: number) => {
    const s = (h / 100).toFixed(2).replace(/\.?0+$/, '');
    return s.replace(/^(-?)0\./, '$1.');
  };
  const pair = (a: number, b: number) => {
    const sb = num(b);
    return num(a) + (sb.startsWith('-') ? '' : ',') + sb;
  };
  let d = '';
  let cx = 0;
  let cy = 0;
  for (const ring of rings) {
    const hs = ring.map(([x, y]) => [Math.round(x * 100), Math.round(y * 100)] as Pt);
    const pts = hs.filter((p, i) => i === 0 || p[0] !== hs[i - 1][0] || p[1] !== hs[i - 1][1]);
    if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    if (pts.length < 3) continue;
    d += 'm' + pair(pts[0][0] - cx, pts[0][1] - cy);
    for (let i = 1; i < pts.length; i++) {
      const s = pair(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      d += i === 1 || !s.startsWith('-') ? (i === 1 ? 'l' : ' ') + s : s;
    }
    d += 'z';
    [cx, cy] = pts[0];
  }
  return d.replace(/^m/, 'M');
}

/** Parses the paths written by ringsToPath back into absolute rings (for the self-check). */
function pathToRings(d: string): Pt[][] {
  const rings: Pt[][] = [];
  const tokens = d.match(/[MmLlZz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let ring: Pt[] = [];
  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i++;
      if (cmd === 'z' || cmd === 'Z') {
        if (ring.length) [cx, cy] = ring[0];
        rings.push(ring);
        ring = [];
      }
      continue;
    }
    const x = Number(tokens[i]);
    const y = Number(tokens[i + 1]);
    i += 2;
    if (cmd === 'M') [cx, cy] = [x, y];
    else [cx, cy] = [cx + x, cy + y];
    ring.push([cx, cy]);
    if (cmd === 'M' || cmd === 'm') cmd = cmd === 'M' ? 'L' : 'l';
  }
  return rings;
}

// ---------- rivers ----------

function chainLines(lines: Position[][]): Position[][] {
  const chains = lines.map((l) => l.slice());
  const close = (a: Position, b: Position) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.01;
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < chains.length; i++)
      for (let j = 0; j < chains.length; j++) {
        if (i === j) continue;
        const a = chains[i];
        const b = chains[j];
        let joined: Position[] | null = null;
        if (close(a[a.length - 1], b[0])) joined = [...a, ...b.slice(1)];
        else if (close(a[a.length - 1], b[b.length - 1])) joined = [...a, ...b.slice(0, -1).reverse()];
        else if (close(a[0], b[0])) joined = [...a.slice().reverse(), ...b.slice(1)];
        if (joined) {
          chains[i] = joined;
          chains.splice(j, 1);
          merged = true;
          break outer;
        }
      }
  }
  return chains;
}

const lineLength = (l: Position[]) => l.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - l[i - 1][0], p[1] - l[i - 1][1]) : 0), 0);

function nearestIndex(line: Position[], [lat, lon]: LatLon): number {
  let best = 0;
  let bestD = Infinity;
  line.forEach((p, i) => {
    const d = Math.hypot(p[0] - lon, p[1] - lat);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

// ---------- main ----------

async function main() {
  const countryId = process.argv[2];
  const cfg = countryId ? COUNTRIES[countryId] : undefined;
  if (!countryId || !cfg) {
    console.error(`Usage: npm run build:outline -- <country>   (known: ${Object.keys(COUNTRIES).join(', ')})`);
    process.exit(1);
  }
  const outDir = join(ROOT, 'trainer-app', 'src', 'data', countryId);
  mkdirSync(outDir, { recursive: true });

  // Admin-1 units
  const admin1 = await loadNE('admin_1_states_provinces');
  const units = admin1.features
    .filter((f) => f.properties?.adm0_a3 === cfg.adm0)
    .map((f) => {
      const p = f.properties as { name: string; iso_3166_2: string };
      const id = cfg.idOverrides?.[p.name] ?? p.iso_3166_2.replace(cfg.isoPrefix, '');
      const name = cfg.nameOverrides?.[p.name] ?? p.name;
      return { id, name, polys: polygonsOf(f.geometry) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  if (units.length !== cfg.expectedUnits) throw new Error(`Expected ${cfg.expectedUnits} units, got ${units.length}`);
  const ids = new Set(units.map((u) => u.id));
  if (ids.size !== units.length) throw new Error(`Duplicate ids: ${units.map((u) => u.id).join(',')}`);

  // Projection: refLat = mid latitude of the bbox; affine fits the longer side to MAP_SIZE.
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const u of units) for (const p of u.polys) for (const [, lat] of p[0]) [minLat, maxLat] = [Math.min(minLat, lat), Math.max(maxLat, lat)];
  const refLat = round((minLat + maxLat) / 2, 1);
  // mercatorPlane's y is Mercator (stretched by sec(lat)) but its x is already scaled by
  // cos(refLat); undo that so the map is conformal and keeps the country's true shape
  // (it matters away from the equator: Germany would be squashed to 63% of its width).
  const kx = 1 / Math.cos((refLat * Math.PI) / 180);
  const plane = (lat: number, lon: number): Pt => {
    const [px, py] = mercatorPlane(lat, lon, refLat);
    return [px * kx, py];
  };
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const u of units)
    for (const p of u.polys)
      for (const [lon, lat] of p[0]) {
        const [px, py] = plane(lat, lon);
        [x0, x1, y0, y1] = [Math.min(x0, px), Math.max(x1, px), Math.min(y0, py), Math.max(y1, py)];
      }
  const s = round(MAP_SIZE / Math.max(x1 - x0, y1 - y0), 6);
  const c = round(PADDING - s * x0, 4);
  const f = round(PADDING + s * y1, 4);
  const W = Math.ceil(s * (x1 - x0) + 2 * PADDING);
  const H = Math.ceil(s * (y1 - y0) + 2 * PADDING);
  const project = (lat: number, lon: number): Pt => {
    const [px, py] = plane(lat, lon);
    return [s * px + c, -s * py + f];
  };

  // Shared topology in SVG units (y down), simplified with planar triangle areas.
  const projected: FeatureCollection<Polygon | MultiPolygon, { id: string }> = {
    type: 'FeatureCollection',
    features: units.map((u) => ({
      type: 'Feature',
      properties: { id: u.id },
      geometry: { type: 'MultiPolygon', coordinates: u.polys.map((p) => p.map((r) => r.map(([lon, lat]) => project(lat, lon)))) },
    })),
  };
  type UnitsTopology = Topology<{ units: GeometryCollection<{ id: string }> }>;
  const topo = simplify(presimplify(topology({ units: projected }) as UnitsTopology), MIN_TRIANGLE_AREA);
  const simplified = feature(topo, topo.objects.units);

  // Output units: merged groups dissolved on the topology, the rest as they are.
  const merged = new Set(Object.values(cfg.merge ?? {}).flatMap((m) => m.from));
  const outUnits: { id: string; name: string; geometry: Geometry | null }[] = units
    .filter((u) => !merged.has(u.id))
    .map((u) => ({
      id: u.id,
      name: u.name,
      geometry: simplified.features.find((g: Feature<Geometry, { id: string }>) => g.properties.id === u.id)?.geometry ?? null,
    }));
  for (const [id, m] of Object.entries(cfg.merge ?? {})) {
    const geoms = topo.objects.units.geometries.filter((g) => m.from.includes((g.properties as { id?: string } | undefined)?.id ?? ''));
    if (geoms.length !== m.from.length) throw new Error(`Merge ${id}: found ${geoms.length} of ${m.from.join(', ')}`);
    outUnits.push({ id, name: m.name, geometry: merge(topo, geoms as Parameters<typeof merge>[1]) });
  }
  outUnits.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const locations = outUnits.map((u) => {
    let polys = polygonsOf(u.geometry).filter((p) => p[0].length >= 4);
    const areas = polys.map((p) => Math.abs(signedArea(p[0])));
    const largest = areas.indexOf(Math.max(...areas));
    polys = polys.filter((_, i) => i === largest || areas[i] >= MIN_RING_AREA);
    // Exterior rings one way, holes the other, so nonzero fill renders holes.
    const rings: Pt[][] = [];
    for (const p of polys) {
      p.forEach((r, k) => {
        if (k > 0 && (r.length < 4 || Math.abs(signedArea(r)) < MIN_RING_AREA)) return;
        const ccw = signedArea(r) > 0;
        const ring = r.map((q) => [q[0], q[1]] as Pt);
        rings.push((k === 0) === ccw ? ring : ring.reverse());
      });
    }
    return { id: u.id, name: u.name, path: ringsToPath(rings) };
  });

  const outline = {
    viewBox: `0 0 ${W} ${H}`,
    locations,
    affine: [
      [round(s * kx, 6), 0, c],
      [0, -s, f],
    ],
    refLat,
    source: SOURCE,
  };
  const outlineFile = join(outDir, 'outline.json');
  writeFileSync(outlineFile, JSON.stringify(outline) + '\n');
  console.log(`outline.json: ${locations.length} units, ${(JSON.stringify(outline).length / 1024).toFixed(1)} KB`);
  console.log(`  refLat ${refLat}, viewBox ${outline.viewBox}, affine ${JSON.stringify(outline.affine)}`);

  // Self-check: known points fall inside the right simplified unit.
  const ringsById = new Map(locations.map((l) => [l.id, pathToRings(l.path)]));
  let failures = 0;
  for (const chk of cfg.checks) {
    const [x, y] = project(chk.lat, chk.lon);
    const hits = [...ringsById].filter(([, rings]) => {
      let n = 0;
      for (const r of rings) if (pointInRing(x, y, r)) n++;
      return n % 2 === 1;
    });
    const got = hits.map(([id]) => id).join(',') || 'none';
    const ok = got === chk.id;
    if (!ok) failures++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${chk.name} (${x.toFixed(1)}, ${y.toFixed(1)}) in ${got}, expected ${chk.id}`);
  }

  // Rivers
  const admin0 = await loadNE('admin_0_countries');
  const countryPolys = polygonsOf(admin0.features.find((ft) => ft.properties?.ADM0_A3 === cfg.adm0)?.geometry ?? null);
  const inCountry = (p: Position) =>
    pointInPolygons(p[0], p[1], countryPolys) || nearRings(p[0], p[1], countryPolys, RIVER_BUFFER_DEG);
  const riverLayers = ['rivers_lake_centerlines', ...(cfg.extraRiverLayers ?? [])];
  const riversNE = (await Promise.all(riverLayers.map((l) => loadNE(l)))).flatMap((fc) => fc.features);
  const courses: Record<string, LatLon[]> = {};
  for (const spec of cfg.rivers) {
    const names = ([] as string[]).concat(spec.ne);
    const lines: Position[][] = [];
    for (const ft of riversNE) {
      const p = ft.properties ?? {};
      if (![p.name, p.name_en, p.name_alt].some((n) => names.includes(n as string))) continue;
      if (ft.geometry.type === 'LineString') lines.push(ft.geometry.coordinates);
      else if (ft.geometry.type === 'MultiLineString') lines.push(...ft.geometry.coordinates);
    }
    if (!lines.length) {
      console.log(`  river ${spec.key}: not found in Natural Earth (${names.join(', ')})`);
      continue;
    }
    let line = chainLines(lines).sort((a, b) => lineLength(b) - lineLength(a))[0];
    const dEnd = (q: Position) => Math.hypot(q[0] - spec.mouth[1], q[1] - spec.mouth[0]);
    if (dEnd(line[0]) < dEnd(line[line.length - 1])) line = line.slice().reverse();
    if (spec.from) line = line.slice(nearestIndex(line, spec.from));
    if (spec.to) line = line.slice(0, nearestIndex(line, spec.to) + 1);
    // Longest run inside the country (plus buffer)
    let best: Position[] = [];
    let run: Position[] = [];
    for (const q of [...line, null]) {
      if (q && inCountry(q)) run.push(q);
      else {
        if (lineLength(run) > lineLength(best)) best = run;
        run = [];
      }
    }
    if (best.length < 2) {
      console.log(`  river ${spec.key}: no stretch inside the country`);
      continue;
    }
    const pts = best.map(([lon, lat]) => project(lat, lon));
    const keep = simplifyRiver(pts);
    courses[spec.key] = keep.map((i) => [round(best[i][1], 3), round(best[i][0], 3)]);
    console.log(`  river ${spec.key}: ${best.length} → ${keep.length} points`);
  }
  for (const m of cfg.missingRivers ?? []) console.log(`  river ${m}: missing in Natural Earth 1:10m`);
  writeFileSync(join(outDir, 'riverCourses.json'), JSON.stringify(courses, null, 0).replace(/\],"/g, '],\n"') + '\n');
  console.log(`riverCourses.json: ${Object.keys(courses).length} rivers`);
  if (failures) {
    console.error(`${failures} check point(s) fell outside their expected unit`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
