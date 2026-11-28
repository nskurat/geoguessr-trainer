/**
 * Builds a country's road courses from OpenStreetMap route relations and cross-checks them,
 * and our own road list, against Natural Earth.
 *
 * Usage:
 *   npm run build:roads -- <country> [--refresh] [--input <overpass.json>]
 *
 * Input: trainer-app/src/data/<country>/roads.json (our data: ids, network, ref, termini,
 * towns) and the country's entry in COUNTRIES below (OSM network tags, Overpass area, tolerance).
 *
 * Steps (docs/specs/roads.md §4 "Extract and simplification pipeline"):
 * 1. Extract: one Overpass query per network,
 *      relation[type=route][route=road][network=<tag>](area); out geom;
 *    cached as .cache/osm/osm-<country>-<network>-<YYYY-MM-DD>.json (git-ignored). The newest
 *    cache file is reused; --refresh queries again. If no Overpass endpoint answers, the
 *    fallback is a Geofabrik extract filtered with osmium (printed by the script) and
 *    converted to Overpass JSON, passed with --input.
 * 2. Assemble: per road, the relations whose `ref` matches; members of role "" or "forward"
 *    (one carriageway), merged into ordered lines and oriented from the `from` town to the
 *    `to` town; clipped to the Natural Earth national outline with a 5 km buffer.
 * 3. Simplify: Douglas–Peucker in projected km (tolerance per class), parts under 2 km
 *    dropped, coordinates rounded to 3 decimals.
 * 4. Write trainer-app/src/data/<country>/roads.osm.json with `osm` provenance (relations,
 *    ref) and the course, nothing else (ODbL, never merged with roads.json; see
 *    docs/licensing.md "OpenStreetMap road data (ODbL)").
 * 5. Report: per road, the sourced length against OSM and Natural Earth lengths, the
 *    distance of each listed town from the Natural Earth line with the same number, gaps
 *    over 5 km, ref mismatches, roads without a relation, and the raw and gzip size of the
 *    course file against the budget. Written to stdout and .cache/osm/report-<country>.md.
 *    Several numbers: a relation's `ref` may be a ";" list ("A 1;A 3") and `int_ref` holds
 *    E-routes. A relation belongs to each road whose primary ref is in its `ref`; it is a
 *    mismatch only when no number is a road's primary ref or known altRef. The other numbers
 *    are reported as suggested altRefs and never written into roads.json.
 *
 * Without OSM (no endpoint and no cache) the Natural Earth part of the report is still
 * printed, nothing is written to data/, and the script exits with code 2.
 * It never writes outside data/<country>/ and .cache/.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import type { Position } from 'geojson';
import { normalizeRef as normRef, refMatchesRoad, splitRefs } from '../trainer-app/src/services/country/roads';
import { RoadsFileSchema } from '../trainer-app/src/services/country/schema';
import type { RoadClass, RoadCourses, RoadEntry, RoadsFile } from '../trainer-app/src/types/geo';
import {
  ROOT,
  chainLines,
  distToLines,
  distToRings,
  douglasPeucker,
  kmPlane,
  lineLength,
  linesOf,
  loadNE,
  pointInPolygons,
  polygonsOf,
  round,
} from './lib/naturalEarth';

interface NetworkConfig {
  /** `RoadNetwork.id` in roads.json. */
  id: string;
  /** OSM `network=*` value of the route relations. */
  osmNetwork: string;
  /** How Natural Earth writes the number: `A 7` → `A7` in `routeraw`. */
  neRef: (ref: string) => string;
}

interface CountryConfig {
  /** Natural Earth ADM0_A3 of the national outline used for clipping. */
  adm0: string;
  /** ISO 3166-1 alpha-2 code of the Overpass area. */
  iso: string;
  networks: NetworkConfig[];
  /** Douglas–Peucker tolerance in km per road class. */
  toleranceKm: Record<RoadClass, number>;
  /** gzip budget of the class 1–2 course file, in bytes. */
  budgetGzip: number;
}

const COUNTRIES: Record<string, CountryConfig> = {
  germany: {
    adm0: 'DEU',
    iso: 'DE',
    networks: [{ id: 'A', osmNetwork: 'BAB', neRef: (ref) => ref.replace(/\s+/g, '') }],
    toleranceKm: { 1: 1, 2: 1, 3: 0.2 },
    budgetGzip: 15 * 1024,
  },
};

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const OSM_CACHE = join(ROOT, '.cache', 'osm');
/** Clip buffer around the national outline, km. */
const CLIP_BUFFER_KM = 5;
/** Parts shorter than this are dropped, km. */
const MIN_PART_KM = 2;
/** A break between consecutive parts longer than this is reported as a gap, km. */
const GAP_KM = 5;
/** A listed town farther than this from the Natural Earth line is reported, km. */
const TOWN_NEAR_KM = 10;
/** Way ends closer than this are joined, km. */
const JOIN_KM = 0.05;


interface OverpassMember {
  type: string;
  ref: number;
  role: string;
  geometry?: { lat: number; lon: number }[];
}
interface OverpassRelation {
  type: 'relation';
  id: number;
  tags?: Record<string, string>;
  members?: OverpassMember[];
}

function overpassQuery(iso: string, network: string): string {
  return `[out:json][timeout:300];area["ISO3166-1"="${iso}"][admin_level=2]->.a;relation[type=route][route=road][network="${network}"](area.a);out geom;`;
}

/** The newest cached extract for a country and network, or the fresh Overpass answer. */
async function loadOsm(country: string, cfg: CountryConfig, net: NetworkConfig, refresh: boolean) {
  mkdirSync(OSM_CACHE, { recursive: true });
  const prefix = `osm-${country}-${net.id}-`;
  const cached = readdirSync(OSM_CACHE)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .sort();
  if (!refresh && cached.length) {
    const file = cached[cached.length - 1];
    console.log(`OSM: using cache ${file}`);
    return { file, data: JSON.parse(readFileSync(join(OSM_CACHE, file), 'utf8')) as { elements: OverpassRelation[] } };
  }
  const query = overpassQuery(cfg.iso, net.osmNetwork);
  for (const url of OVERPASS) {
    try {
      console.log(`OSM: querying ${url}`);
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: query }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const file = `${prefix}${new Date().toISOString().slice(0, 10)}.json`;
      writeFileSync(join(OSM_CACHE, file), text);
      return { file, data: JSON.parse(text) as { elements: OverpassRelation[] } };
    } catch (err) {
      console.log(`OSM: ${url} failed (${(err as Error).message})`);
    }
  }
  return null;
}

function printFallback(country: string, cfg: CountryConfig, net: NetworkConfig) {
  console.log(
    [
      'No Overpass endpoint answered. Fallback (Geofabrik extract, same filter):',
      `  curl -O https://download.geofabrik.de/europe/${country}-latest.osm.pbf`,
      `  osmium tags-filter ${country}-latest.osm.pbf r/type=route r/route=road r/network=${net.osmNetwork} -o routes.osm.pbf`,
      '  convert routes.osm.pbf to Overpass JSON (relations with member geometry, `out geom`)',
      `  npm run build:roads -- ${country} --input <file.json>`,
      `Overpass query used: ${overpassQuery(cfg.iso, net.osmNetwork)}`,
    ].join('\n'),
  );
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const input = inputIdx >= 0 ? args[inputIdx + 1] : undefined;
  const country = args.find((a, i) => !a.startsWith('--') && (inputIdx < 0 || i !== inputIdx + 1));
  const refresh = args.includes('--refresh');
  const cfg = country ? COUNTRIES[country] : undefined;
  if (!country || !cfg) {
    console.error(`Usage: npm run build:roads -- <country> [--refresh] [--input <overpass.json>]   (known: ${Object.keys(COUNTRIES).join(', ')})`);
    process.exit(1);
  }
  const dataDir = join(ROOT, 'trainer-app', 'src', 'data', country);
  const parsed = RoadsFileSchema.safeParse(JSON.parse(readFileSync(join(dataDir, 'roads.json'), 'utf8')));
  if (!parsed.success) {
    console.error('roads.json does not match RoadsFileSchema; run npm run validate:data');
    process.exit(1);
  }
  const data = parsed.data as RoadsFile;
  const townById = new Map(data.towns.map((t) => [t.id, t]));

  // National outline and the km plane around its centre.
  const admin0 = await loadNE('10m', 'admin_0_countries');
  const nation = admin0.features.find((f) => f.properties?.ADM0_A3 === cfg.adm0);
  if (!nation) throw new Error(`No Natural Earth admin-0 feature ${cfg.adm0}`);
  const polys = polygonsOf(nation.geometry);
  const all = polys.flat(2);
  const lons = all.map((p) => p[0]);
  const lats = all.map((p) => p[1]);
  const plane = kmPlane((Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lons) + Math.max(...lons)) / 2);
  const polysKm = polys.map((p) => p.map((ring) => ring.map(plane.toKm)));
  const inside = (pKm: Position) =>
    pointInPolygons(pKm[0], pKm[1], polysKm) || distToRings(pKm[0], pKm[1], polysKm) <= CLIP_BUFFER_KM;
  /** Splits a km line into the runs that lie inside the buffered outline. */
  const clip = (line: Position[]): Position[][] => {
    const parts: Position[][] = [];
    let cur: Position[] = [];
    for (const p of line) {
      if (inside(p)) cur.push(p);
      else if (cur.length) {
        parts.push(cur);
        cur = [];
      }
    }
    if (cur.length) parts.push(cur);
    return parts.filter((p) => p.length > 1);
  };
  const townKm = (id: string) => {
    const t = townById.get(id)!;
    return plane.toKm([t.lon, t.lat]);
  };

  // Natural Earth roads with the same number, inside the country.
  const neRoads = await loadNE('10m', 'roads');
  const neByRef = new Map<string, Position[][]>();
  for (const f of neRoads.features) {
    const tokens = String(f.properties?.routeraw ?? '').split(/[\s,;/]+/);
    for (const net of cfg.networks)
      for (const road of data.roads.filter((r) => r.network === net.id))
        if (tokens.includes(net.neRef(road.ref)))
          for (const l of linesOf(f.geometry)) {
            const km = l.map(plane.toKm);
            if (km.some(inside)) (neByRef.get(road.id) ?? neByRef.set(road.id, []).get(road.id)!).push(...clip(km));
          }
  }

  const lines: string[] = [];
  const log = (s = '') => {
    console.log(s);
    lines.push(s);
  };
  log(`# build:roads report: ${country}, ${new Date().toISOString().slice(0, 10)}`);
  log();

  // OSM extract.
  const courses: RoadCourses = {};
  const osmLength = new Map<string, number>();
  const osmGaps = new Map<string, number[]>();
  const osmSources: string[] = [];
  let osmAvailable = true;
  const mismatches: string[] = [];
  /** Numbers OSM puts on a road that roads.json does not list: suggestions for review, never written. */
  const suggested = new Map<string, { road: string; ref: string; kind: string; relations: number[] }>();
  for (const net of cfg.networks) {
    const osm = input
      ? { file: input, data: JSON.parse(readFileSync(input, 'utf8')) as { elements: OverpassRelation[] } }
      : await loadOsm(country, cfg, net, refresh);
    if (!osm) {
      osmAvailable = false;
      printFallback(country, cfg, net);
      continue;
    }
    osmSources.push(osm.file);
    const relations = osm.data.elements.filter((e) => e.type === 'relation');
    // A relation's `ref` may list several numbers ("A 1;A 3"), and `int_ref` holds E-routes
    // ("E 45;E 43"). It belongs to every road whose primary ref is one of its `ref` numbers.
    const byRef = new Map<string, OverpassRelation[]>();
    for (const r of relations)
      for (const one of splitRefs(r.tags?.ref))
        (byRef.get(normRef(one)) ?? byRef.set(normRef(one), []).get(normRef(one))!).push(r);
    const netRoads = data.roads.filter((r) => r.network === net.id);
    for (const r of relations) {
      const refs = splitRefs(r.tags?.ref);
      // A mismatch only when none of the numbers is a road's primary ref or known altRef.
      if (refs.some((ref) => data.roads.some((road) => refMatchesRoad(ref, road)))) continue;
      for (const ref of refs.filter((x) => /^\D+\s?\d{1,2}$/.test(x)))
        mismatches.push(`OSM relation ${r.id} ref ${ref} has no road in roads.json`);
    }
    for (const road of netRoads) {
      const rels = byRef.get(normRef(road.ref)) ?? [];
      for (const rel of rels)
        for (const ref of [...splitRefs(rel.tags?.ref), ...splitRefs(rel.tags?.int_ref)]) {
          if (refMatchesRoad(ref, road)) continue;
          const other = data.roads.find((x) => x.id !== road.id && normRef(x.ref) === normRef(ref));
          const kind = other ? 'concurrent' : /^E\s?\d+$/i.test(ref) ? 'european' : '?';
          const key = `${road.ref}|${normRef(ref)}`;
          const seen = suggested.get(key);
          if (seen) seen.relations = [...new Set([...seen.relations, rel.id])];
          else suggested.set(key, { road: road.ref, ref, kind, relations: [rel.id] });
        }
      if (!rels.length) continue;
      const ways: Position[][] = [];
      for (const rel of rels)
        for (const m of rel.members ?? [])
          if (m.type === 'way' && (m.role === '' || m.role === 'forward') && m.geometry?.length)
            ways.push(m.geometry.map((g) => plane.toKm([g.lon, g.lat])));
      const parts = orient(road, chainLines(ways, JOIN_KM).flatMap(clip), townKm)
        .map((p) => douglasPeucker(p, cfg.toleranceKm[road.class]).map((i) => p[i]))
        .filter((p) => lineLength(p) >= MIN_PART_KM);
      if (!parts.length) continue;
      osmLength.set(road.id, parts.reduce((s, p) => s + lineLength(p), 0));
      osmGaps.set(road.id, gapsOf(parts));
      courses[road.id] = {
        osm: {
          relations: rels.map((r) => r.id),
          // The one ref of a multi-valued tag ("A 1;A 3") that matched this road.
          ref: splitRefs(rels[0].tags?.ref).find((x) => normRef(x) === normRef(road.ref))!,
        },
        course: parts.map((p) =>
          p.map((q) => {
            const [lon, lat] = plane.toLonLat(q);
            return [round(lat, 3), round(lon, 3)] as [number, number];
          }),
        ),
      };
    }
  }

  // Per-road table.
  log('| Road | Class | Sourced km | OSM km | NE km | NE parts | Towns > 10 km from NE line | OSM gaps > 5 km |');
  log('|---|---|---|---|---|---|---|---|');
  const missingNe: string[] = [];
  const missingOsm: string[] = [];
  for (const road of data.roads) {
    const ne = chainLines(neByRef.get(road.id) ?? [], JOIN_KM * 10);
    const neKm = ne.reduce((s, l) => s + lineLength(l), 0);
    if (!ne.length) missingNe.push(road.ref);
    if (osmAvailable && !courses[road.id]) missingOsm.push(road.ref);
    const far = ne.length
      ? road.towns
          .map((id) => ({ id, d: distToLines(...(townKm(id) as [number, number]), ne) }))
          .filter((x) => x.d > TOWN_NEAR_KM)
          .map((x) => `${townById.get(x.id)!.name} ${Math.round(x.d)}`)
      : ['(no NE line)'];
    const osmKm = osmLength.get(road.id);
    const gaps = osmGaps.get(road.id) ?? [];
    log(
      `| ${road.ref} | ${road.class} | ${road.lengthKm ?? ''} | ${osmKm === undefined ? (osmAvailable ? 'none' : 'n/a') : Math.round(osmKm)} | ${ne.length ? Math.round(neKm) : 'none'} | ${ne.length || ''} | ${far.join(', ')} | ${osmAvailable ? gaps.map((g) => Math.round(g)).join(', ') : 'n/a'} |`,
    );
  }
  log();
  log(`Roads without a Natural Earth line: ${missingNe.join(', ') || 'none'}`);
  if (osmAvailable) {
    log(`Roads without an OSM relation: ${missingOsm.join(', ') || 'none'}`);
    log(`Ref mismatches: ${mismatches.join('; ') || 'none'}`);
    log();
    log('Suggested altRefs (OSM `ref` / `int_ref` numbers not in roads.json; not written: check the');
    log('stretch and a second source, then add them to roads.json and RESEARCH.md by hand):');
    if (!suggested.size) log('none');
    else {
      log('| Road | Number | Kind (guess) | Relations |');
      log('|---|---|---|---|');
      for (const x of suggested.values()) log(`| ${x.road} | ${x.ref} | ${x.kind} | ${x.relations.join(', ')} |`);
    }
  }

  if (!osmAvailable) {
    log();
    log('OSM unavailable: roads.osm.json was not written; the OSM lengths, gaps and size are pending.');
    writeReport(country, lines);
    process.exit(2);
  }

  const json = JSON.stringify(courses).replace(/\},"/g, '},\n"') + '\n';
  const gz = gzipSync(json).length;
  log();
  log(`Extract: ${osmSources.join(', ')}; networks ${cfg.networks.map((n) => `network=${n.osmNetwork}`).join(', ')}`);
  log(`Tolerance: ${JSON.stringify(cfg.toleranceKm)} km; clip buffer ${CLIP_BUFFER_KM} km; parts < ${MIN_PART_KM} km dropped`);
  log(`roads.osm.json: ${Object.keys(courses).length} roads, ${(json.length / 1024).toFixed(1)} KB raw, ${(gz / 1024).toFixed(1)} KB gzip (budget ${(cfg.budgetGzip / 1024).toFixed(0)} KB gzip): ${gz <= cfg.budgetGzip ? 'OK' : 'OVER BUDGET'}`);
  writeFileSync(join(dataDir, 'roads.osm.json'), json);
  writeReport(country, lines);
  if (gz > cfg.budgetGzip) process.exit(1);
}

/**
 * Orders and orients parts so the course runs from the `from` town to the `to` town:
 * parts sorted by where they start along the from→to axis, each reversed if it runs backwards.
 */
function orient(road: RoadEntry, parts: Position[][], townKm: (id: string) => Position): Position[][] {
  const a = townKm(road.from);
  const b = townKm(road.to);
  const ax = [b[0] - a[0], b[1] - a[1]];
  const along = (p: Position) => (p[0] - a[0]) * ax[0] + (p[1] - a[1]) * ax[1];
  return parts
    .map((p) => (along(p[0]) > along(p[p.length - 1]) ? p.slice().reverse() : p))
    .sort((p, q) => along(p[0]) - along(q[0]));
}

/** Distances between the end of each part and the start of the next. */
function gapsOf(parts: Position[][]): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < parts.length; i++) {
    const e = parts[i - 1][parts[i - 1].length - 1];
    const s = parts[i][0];
    const d = Math.hypot(e[0] - s[0], e[1] - s[1]);
    if (d > GAP_KM) gaps.push(d);
  }
  return gaps;
}

function writeReport(country: string, lines: string[]) {
  mkdirSync(OSM_CACHE, { recursive: true });
  const file = join(OSM_CACHE, `report-${country}.md`);
  writeFileSync(file, lines.join('\n') + '\n');
  console.log(`\nReport written to ${file}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
