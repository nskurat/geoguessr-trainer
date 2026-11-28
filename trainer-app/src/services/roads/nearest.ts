import type { Point } from '../../types/geo';

/** A polyline layer item in screen (or map) units: roads, and visual-meta's line layers. */
export interface LineItem<Id extends string = string> {
  id: Id;
  /** Each part is a polyline of at least one point. */
  parts: Point[][];
}

export interface LineHit<Id extends string = string> {
  id: Id;
  /** Distance from the point to the nearest part of the line, in the same units. */
  distance: number;
}

/** Distance from p to the segment a–b. */
export function segmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Distance from p to a polyline part, or Infinity when the part is farther than `limit` by its box. */
function partDistance(p: Point, part: Point[], limit: number): number {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of part) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (p[0] < minX - limit || p[0] > maxX + limit || p[1] < minY - limit || p[1] > maxY + limit) return Infinity;
  if (part.length === 1) return Math.hypot(p[0] - part[0][0], p[1] - part[0][1]);
  let best = Infinity;
  for (let i = 1; i < part.length; i++) best = Math.min(best, segmentDistance(p, part[i - 1], part[i]));
  return best;
}

/**
 * The lines nearest to `point` within `tolerance`, nearest first: the nearest one and every
 * other within `tie` of its distance (a shared section or the point of a crossing returns
 * all the lines there). Empty when no line is within tolerance (a neutral tap).
 * Work in screen units so the tolerance means the same at every zoom.
 */
export function nearestLines<Id extends string>(
  point: Point,
  lines: readonly LineItem<Id>[],
  tolerance: number,
  tie = 3,
): LineHit<Id>[] {
  const hits: LineHit<Id>[] = [];
  for (const line of lines) {
    let distance = Infinity;
    for (const part of line.parts) if (part.length) distance = Math.min(distance, partDistance(point, part, tolerance));
    if (distance <= tolerance) hits.push({ id: line.id, distance });
  }
  if (!hits.length) return hits;
  hits.sort((a, b) => a.distance - b.distance);
  const best = hits[0].distance;
  return hits.filter((h) => h.distance <= best + tie);
}

/**
 * The road a find tap answers: the target when it is among the nearest (within `tie`),
 * otherwise the single nearest line; undefined for a tap with no line in tolerance.
 */
export function tappedLine<Id extends string>(
  point: Point,
  lines: readonly LineItem<Id>[],
  tolerance: number,
  target: Id,
  tie = 3,
): Id | undefined {
  const hits = nearestLines(point, lines, tolerance, tie);
  if (hits.some((h) => h.id === target)) return target;
  return hits[0]?.id;
}
