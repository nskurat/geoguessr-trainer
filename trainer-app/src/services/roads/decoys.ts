import type { LatLon, Road } from '../../types/geo';
import { shuffle, type Rng } from '../../utils/random';

/** The fields of a road that decide how confusable it is with another. */
export type DecoyRoad = Pick<Road, 'id' | 'network' | 'ref' | 'class' | 'codes' | 'between' | 'crosses'> & {
  course?: LatLon[][];
};

/** Roads whose courses come this close count as nearby (spec §3: "within ~100 km"). */
export const NEAR_KM = 100;

/**
 * The numbering band of a ref: the first digit and the digit count of its number, so A 44
 * and A 45 share band "4/2", PE-26 and PE-28A band "2/2", and every single-digit trunk
 * route band "x/1". Refs without a number have no band.
 */
export function refBand(ref: string): string | undefined {
  const digits = /\d+/.exec(ref)?.[0];
  if (!digits) return undefined;
  return digits.length === 1 ? 'x/1' : `${digits[0]}/${digits.length}`;
}

const KM_PER_DEG = 111.32;

/** Approximate shortest distance between two courses (vertex to vertex, km), Infinity if either is empty. */
export function courseGapKm(a: LatLon[][], b: LatLon[][], within = NEAR_KM): number {
  const pa = a.flat();
  const pb = b.flat();
  if (!pa.length || !pb.length) return Infinity;
  const box = (pts: LatLon[]) => {
    const lats = pts.map((p) => p[0]);
    const lons = pts.map((p) => p[1]);
    return [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  };
  const [aLat0, aLat1, aLon0, aLon1] = box(pa);
  const [bLat0, bLat1, bLon0, bLon1] = box(pb);
  const k = Math.cos((((aLat0 + aLat1) / 2) * Math.PI) / 180);
  const latGap = Math.max(0, bLat0 - aLat1, aLat0 - bLat1) * KM_PER_DEG;
  const lonGap = Math.max(0, bLon0 - aLon1, aLon0 - bLon1) * KM_PER_DEG * k;
  if (Math.hypot(latGap, lonGap) > within) return Infinity;
  let best = Infinity;
  for (const [lat1, lon1] of pa)
    for (const [lat2, lon2] of pb)
      best = Math.min(best, Math.hypot((lat2 - lat1) * KM_PER_DEG, (lon2 - lon1) * KM_PER_DEG * k));
  return best;
}

/**
 * How easily `other` is mistaken for `target` in the network's pattern: parallel in the
 * pattern (each other's `between`), same numbering band, nearby courses, a shared region,
 * crossing each other.
 */
export function confusability(target: DecoyRoad, other: DecoyRoad): number {
  let score = 0;
  if (target.between.includes(other.id) || other.between.includes(target.id)) score += 4;
  const band = refBand(target.ref);
  if (band && band === refBand(other.ref)) score += 3;
  if (target.course && other.course && courseGapKm(target.course, other.course) <= NEAR_KM) score += 2;
  if (target.codes.some((c) => other.codes.includes(c))) score += 1;
  if (target.crosses.includes(other.id) || other.crosses.includes(target.id)) score += 1;
  return score;
}

/**
 * Up to `count` road ids most confusable with `target`, best first: roads of the same
 * network and class, ranked by `confusability`, ties in random order; topped up from the
 * other classes only when the class is too small. Used for the find kind's unlabelled
 * decoys (3–5) and the name kind's wrong answers.
 */
export function pickRoadDecoys<R extends DecoyRoad>(target: R, roads: readonly R[], count: number, rng: Rng): string[] {
  const rank = (pool: R[]) =>
    shuffle(pool.slice(), rng)
      .map((road) => ({ id: road.id, score: confusability(target, road) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.id);
  const others = roads.filter((r) => r.id !== target.id);
  const same = others.filter((r) => r.class === target.class && r.network === target.network);
  const rest = others.filter((r) => !same.includes(r));
  return [...rank(same), ...rank(rest)].slice(0, Math.max(0, count));
}

/** The name kind's options: the answer and `count - 1` confusable numbers, shuffled. */
export function pickRoadChoices<R extends DecoyRoad>(target: R, roads: readonly R[], rng: Rng, count = 4): string[] {
  return shuffle([target.id, ...pickRoadDecoys(target, roads, count - 1, rng)], rng);
}
