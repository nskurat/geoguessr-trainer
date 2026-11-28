/*
 * Builds the country picker's locator map (docs/specs/roads.md §5): the country filled on
 * its continent, neighbours as outlines, from Natural Earth 1:110m admin-0 (public domain).
 *
 *   npm run build:locator              all countries in FRAMES
 *   npm run build:locator -- germany   one country
 *
 * Writes `trainer-app/src/data/<country>/locator.json`: a viewBox and two SVG paths
 * (`neighbours`, `country`) in a 4:3 Mercator frame, clipped to the frame, simplified and
 * rounded to whole units (0.1 px at the 64 px display width). Overseas parts outside the
 * frame drop out, so France shows only its metropolitan part. Downloads are cached in
 * `.cache/natural-earth/`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import type { Position } from 'geojson';
import { douglasPeucker, loadNE, polygonsOf, ROOT } from './lib/naturalEarth';

/** Frame width in units; height is 3/4 of it. */
const W = 640;
const H = 480;
/** Douglas–Peucker tolerance in units (0.25 px at 64 px wide). */
const TOLERANCE = 2.5;
/** Rings smaller than this many square units are dropped (tiny islands). */
const MIN_AREA = 20;

interface Frame {
  /** The continent, for the record. */
  area: string;
  /** West and east edges; the height follows from the 4:3 aspect. */
  lon: [number, number];
  /** Latitude of the frame's centre. */
  lat: number;
}

const EUROPE: Frame = { area: 'Europe', lon: [-12, 36], lat: 50 };
const SOUTH_AMERICA: Frame = { area: 'South America', lon: [-94, -30], lat: -16 };

/** Country id → Natural Earth ISO_A3 and frame. */
const FRAMES: Record<string, { iso: string; frame: Frame }> = {
  france: { iso: 'FRA', frame: EUROPE },
  germany: { iso: 'DEU', frame: EUROPE },
  poland: { iso: 'POL', frame: EUROPE },
  peru: { iso: 'PER', frame: SOUTH_AMERICA },
};

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

function projector(frame: Frame) {
  const scale = W / (((frame.lon[1] - frame.lon[0]) * Math.PI) / 180);
  const cy = mercY(frame.lat);
  return ([lon, lat]: Position): Position => [
    (((lon - frame.lon[0]) * Math.PI) / 180) * scale,
    H / 2 - (mercY(Math.max(-85, Math.min(85, lat))) - cy) * scale,
  ];
}

/** Sutherland–Hodgman clip of a closed ring to the frame rectangle. */
function clipRing(ring: Position[]): Position[] {
  const edges: [(p: Position) => boolean, (a: Position, b: Position) => Position][] = [
    [(p) => p[0] >= 0, (a, b) => [0, a[1] + ((b[1] - a[1]) * (0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= W, (a, b) => [W, a[1] + ((b[1] - a[1]) * (W - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= 0, (a, b) => [a[0] + ((b[0] - a[0]) * (0 - a[1])) / (b[1] - a[1]), 0]],
    [(p) => p[1] <= H, (a, b) => [a[0] + ((b[0] - a[0]) * (H - a[1])) / (b[1] - a[1]), H]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) break;
  }
  return out;
}

const area = (ring: Position[]) =>
  Math.abs(ring.reduce((s, p, i) => s + p[0] * ring[(i + 1) % ring.length][1] - ring[(i + 1) % ring.length][0] * p[1], 0)) / 2;

/** An SVG path of the polygons' outer rings and holes, projected, clipped and simplified. */
function pathOf(polys: Position[][][], project: (p: Position) => Position): string {
  let d = '';
  for (const poly of polys)
    for (const ring of poly) {
      const open = ring.slice(0, -1).map(project);
      const clipped = clipRing(open);
      if (clipped.length < 3 || area(clipped) < MIN_AREA) continue;
      const kept = douglasPeucker([...clipped, clipped[0]], TOLERANCE).map((i) => clipped[i % clipped.length]);
      const pts = kept.map(([x, y]) => [Math.round(x), Math.round(y)]).filter(
        (p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1],
      );
      if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
      if (pts.length < 3) continue;
      d += 'M' + pts.map(([x, y], i) => (i === 1 ? `L${x} ${y}` : `${x} ${y}`)).join(' ') + 'Z';
    }
  return d;
}

const ids = process.argv.slice(2);
for (const id of ids) if (!FRAMES[id]) throw new Error(`unknown country ${id}; known: ${Object.keys(FRAMES).join(', ')}`);
const world = await loadNE('110m', 'admin_0_countries');
for (const id of ids.length ? ids : Object.keys(FRAMES)) {
  const { iso, frame } = FRAMES[id];
  const project = projector(frame);
  const isoOf = (props: Record<string, unknown> | null) =>
    String(props?.ISO_A3 === '-99' ? props?.ADM0_A3 : props?.ISO_A3);
  const own = world.features.filter((f) => isoOf(f.properties) === iso);
  if (!own.length) throw new Error(`${iso} not in Natural Earth admin-0`);
  const others = world.features.filter((f) => isoOf(f.properties) !== iso);
  const locator = {
    source: 'Natural Earth ne_110m_admin_0_countries (public domain)',
    area: frame.area,
    viewBox: `0 0 ${W} ${H}`,
    neighbours: pathOf(others.flatMap((f) => polygonsOf(f.geometry)), project),
    country: pathOf(own.flatMap((f) => polygonsOf(f.geometry)), project),
  };
  const json = JSON.stringify(locator, null, 1) + '\n';
  writeFileSync(join(ROOT, 'trainer-app', 'src', 'data', id, 'locator.json'), json);
  console.log(`${id}: ${(json.length / 1024).toFixed(1)} KB, ${(gzipSync(json).length / 1024).toFixed(1)} KB gzip (${frame.area})`);
}
