import type { LatLon, Point } from '../../types/geo';

const RAD = Math.PI / 180;

/**
 * Mercator coordinates in degrees, with longitude scaled by cos(refLat) so a
 * degree of longitude and of latitude have the same length at `refLat`.
 */
export function mercatorPlane(lat: number, lon: number, refLat: number): Point {
  return [lon * Math.cos(refLat * RAD), Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)) / RAD];
}

/** Solves the 3×3 linear system M·x = v by Gauss–Jordan elimination with partial pivoting. */
export function solve3(M: number[][], v: number[]): number[] {
  const m = M.map((row, i) => [...row, v[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i;
    for (let j = i + 1; j < 3; j++) if (Math.abs(m[j][i]) > Math.abs(m[p][i])) p = j;
    [m[i], m[p]] = [m[p], m[i]];
    for (let j = 0; j < 3; j++) {
      if (j === i) continue;
      const f = m[j][i] / m[i][i];
      for (let k = i; k < 4; k++) m[j][k] -= f * m[i][k];
    }
  }
  return m.map((row, i) => row[3] / row[i]);
}

/** A known geographic position and where it sits on the map. */
export interface Anchor {
  lat: number;
  lon: number;
  x: number;
  y: number;
}

export interface Projection {
  project(lat: number, lon: number): Point;
  unproject(x: number, y: number): LatLon;
}

/**
 * Fits the affine map from `mercatorPlane` coordinates to map units that best
 * matches the anchors (least squares). A second pass drops anchors more than
 * twice the RMS error away, so a few badly placed anchors do not skew it.
 *
 * The trainer anchors each department's prefecture to the centre of its
 * outline's bounding box: crude per department, but accurate in aggregate.
 */
export function fitProjection(anchors: Anchor[], refLat: number): Projection {
  let pts = anchors.map((a) => ({ p: mercatorPlane(a.lat, a.lon, refLat), s: [a.x, a.y] as Point }));
  let A: number[][] = [];
  const apply = (p: Point): Point => [
    A[0][0] * p[0] + A[0][1] * p[1] + A[0][2],
    A[1][0] * p[0] + A[1][1] * p[1] + A[1][2],
  ];
  for (let pass = 0; pass < 2; pass++) {
    const M = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const vx = [0, 0, 0];
    const vy = [0, 0, 0];
    for (const q of pts) {
      const r = [q.p[0], q.p[1], 1];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) M[i][j] += r[i] * r[j];
        vx[i] += r[i] * q.s[0];
        vy[i] += r[i] * q.s[1];
      }
    }
    A = [solve3(M, vx), solve3(M, vy)];
    if (pass === 0) {
      const err = pts.map((q) => {
        const s = apply(q.p);
        return Math.hypot(s[0] - q.s[0], s[1] - q.s[1]);
      });
      const rms = Math.sqrt(err.reduce((sum, e) => sum + e * e, 0) / err.length);
      pts = pts.filter((_, i) => err[i] < 2 * rms);
    }
  }
  const [a, b] = A[0];
  const [c, d] = A[1];
  const det = a * d - b * c;
  const inv = [d / det, -b / det, -c / det, a / det];
  const k = Math.cos(refLat * RAD);

  return {
    project: (lat, lon) => apply(mercatorPlane(lat, lon, refLat)),
    unproject: (x, y) => {
      const u = x - A[0][2];
      const v = y - A[1][2];
      const px = inv[0] * u + inv[1] * v;
      const py = inv[2] * u + inv[3] * v;
      return [(2 * Math.atan(Math.exp(py * RAD)) - Math.PI / 2) / RAD, px / k];
    },
  };
}

/** Great-circle distance in km. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const x =
    Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(((lon2 - lon1) * RAD) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
