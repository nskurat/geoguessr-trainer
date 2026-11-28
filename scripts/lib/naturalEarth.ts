/**
 * Shared helpers for the data scripts that read Natural Earth (public domain):
 * download with a git-ignored cache, and small planar geometry on [x, y] points.
 * `build-outline.ts` keeps its own copies (it predates this module).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FeatureCollection, Geometry, Position } from 'geojson';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const NE_CACHE = join(ROOT, '.cache', 'natural-earth');
const NE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';

/** Loads `ne_<scale>_<name>.geojson`, e.g. `loadNE('10m', 'roads')`, downloading it once. */
export async function loadNE(scale: '10m' | '50m' | '110m', name: string): Promise<FeatureCollection> {
  const file = join(NE_CACHE, `ne_${scale}_${name}.geojson`);
  if (!existsSync(file)) {
    const url = `${NE_URL}ne_${scale}_${name}.geojson`;
    console.log(`Downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    mkdirSync(NE_CACHE, { recursive: true });
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(readFileSync(file, 'utf8')) as FeatureCollection;
}

export function polygonsOf(g: Geometry | null): Position[][][] {
  if (!g) return [];
  if (g.type === 'Polygon') return [g.coordinates];
  if (g.type === 'MultiPolygon') return g.coordinates;
  return [];
}

export function linesOf(g: Geometry | null): Position[][] {
  if (!g) return [];
  if (g.type === 'LineString') return [g.coordinates];
  if (g.type === 'MultiLineString') return g.coordinates;
  return [];
}

export function pointInRing(x: number, y: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInPolygons(x: number, y: number, polys: Position[][][]): boolean {
  return polys.some((p) => pointInRing(x, y, p[0]) && !p.slice(1).some((h) => pointInRing(x, y, h)));
}

export function segDist(x: number, y: number, a: Position, b: Position): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)) : 0;
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}

/** Distance from (x, y) to the nearest ring edge of `polys`. */
export function distToRings(x: number, y: number, polys: Position[][][]): number {
  let best = Infinity;
  for (const p of polys)
    for (const ring of p)
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1];
        const b = ring[i];
        if (Math.min(a[0], b[0]) - best > x || Math.max(a[0], b[0]) + best < x) continue;
        if (Math.min(a[1], b[1]) - best > y || Math.max(a[1], b[1]) + best < y) continue;
        best = Math.min(best, segDist(x, y, a, b));
      }
  return best;
}

/** Distance from (x, y) to the nearest segment of any line. */
export function distToLines(x: number, y: number, lines: Position[][]): number {
  let best = Infinity;
  for (const l of lines) {
    if (l.length === 1) best = Math.min(best, Math.hypot(x - l[0][0], y - l[0][1]));
    for (let i = 1; i < l.length; i++) best = Math.min(best, segDist(x, y, l[i - 1], l[i]));
  }
  return best;
}

/** Douglas–Peucker on planar points; returns kept indices. */
export function douglasPeucker(pts: Position[], tol: number): number[] {
  if (pts.length < 3) return pts.map((_, i) => i);
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

/** Joins lines that share end points (within `eps`) into longer chains. */
export function chainLines(lines: Position[][], eps: number): Position[][] {
  const chains = lines.filter((l) => l.length > 1).map((l) => l.slice());
  const close = (a: Position, b: Position) => Math.hypot(a[0] - b[0], a[1] - b[1]) < eps;
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
        else if (close(a[0], b[b.length - 1])) joined = [...b, ...a.slice(1)];
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

export const lineLength = (l: Position[]): number =>
  l.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - l[i - 1][0], p[1] - l[i - 1][1]) : 0), 0);

export const round = (n: number, d: number): number => Math.round(n * 10 ** d) / 10 ** d;

/**
 * A local equirectangular projection to kilometres around (lat0, lon0): within about 1%
 * across a country the size of Germany, which is all Douglas–Peucker tolerances and gap
 * checks need. Points are [lon, lat] in, [x, y] km out.
 */
export function kmPlane(lat0: number, lon0: number) {
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110.57;
  return {
    toKm: ([lon, lat]: Position): Position => [(lon - lon0) * kx, (lat - lat0) * ky],
    toLonLat: ([x, y]: Position): Position => [x / kx + lon0, y / ky + lat0],
  };
}
