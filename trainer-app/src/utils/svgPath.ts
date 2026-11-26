import type { Point } from '../types/geo';

/**
 * A smooth SVG path through the points (Catmull–Rom spline as cubic Béziers),
 * used to draw rivers from a handful of waypoints. Coordinates are rounded to 2 decimals.
 */
export function smoothPath(points: Point[]): string {
  const f = (n: number) => n.toFixed(2);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i - 1] || points[i];
    const b = points[i];
    const c = points[i + 1];
    const e = points[i + 2] || c;
    d +=
      `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ` +
      `${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
  }
  return d;
}
