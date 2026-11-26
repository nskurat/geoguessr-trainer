import { describe, expect, it } from 'vitest';
import { fitProjection, haversineKm, mercatorPlane, solve3, type Anchor } from '../projection';

const REF_LAT = 46.5;

describe('solve3', () => {
  it('solves the identity system', () => {
    expect(
      solve3(
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
        [4, 5, 6],
      ),
    ).toEqual([4, 5, 6]);
  });

  it('solves a general system', () => {
    // x + y + z = 6, 2y + 5z = -4, 2x + 5y - z = 27  ->  x = 5, y = 3, z = -2
    const x = solve3(
      [
        [1, 1, 1],
        [0, 2, 5],
        [2, 5, -1],
      ],
      [6, -4, 27],
    );
    expect(x[0]).toBeCloseTo(5, 10);
    expect(x[1]).toBeCloseTo(3, 10);
    expect(x[2]).toBeCloseTo(-2, 10);
  });

  it('pivots when a leading entry is zero', () => {
    const x = solve3(
      [
        [0, 2, 0],
        [3, 0, 0],
        [0, 0, 4],
      ],
      [4, 9, 8],
    );
    expect(x[0]).toBeCloseTo(3, 10);
    expect(x[1]).toBeCloseTo(2, 10);
    expect(x[2]).toBeCloseTo(2, 10);
  });
});

/** A known affine map from mercatorPlane coordinates to map units (with a y flip). */
const truth = { a: 12, b: 0.5, c: 40, d: -0.3, e: -13, f: 700 };
const toMap = (lat: number, lon: number) => {
  const [px, py] = mercatorPlane(lat, lon, REF_LAT);
  return { x: truth.a * px + truth.b * py + truth.c, y: truth.d * px + truth.e * py + truth.f };
};
const grid: Anchor[] = [];
for (let lat = 42; lat <= 51; lat += 1.5) {
  for (let lon = -4; lon <= 8; lon += 2) grid.push({ lat, lon, ...toMap(lat, lon) });
}

describe('mercatorPlane', () => {
  it('maps the equator/prime meridian to the origin', () => {
    const [x, y] = mercatorPlane(0, 0, REF_LAT);
    expect(x).toBeCloseTo(0, 12);
    expect(y).toBeCloseTo(0, 12);
  });

  it('scales longitude by cos(refLat)', () => {
    expect(mercatorPlane(10, 10, 60)[0]).toBeCloseTo(5, 10);
  });
});

describe('fitProjection', () => {
  it('recovers a known affine transform from exact anchors', () => {
    const proj = fitProjection(grid, REF_LAT);
    for (const probe of [
      [48.85, 2.35],
      [43.3, 5.37],
      [47.2, -1.55],
    ]) {
      const [x, y] = proj.project(probe[0], probe[1]);
      const expected = toMap(probe[0], probe[1]);
      expect(x).toBeCloseTo(expected.x, 6);
      expect(y).toBeCloseTo(expected.y, 6);
    }
  });

  it('round-trips project and unproject within 1e-6', () => {
    const proj = fitProjection(grid, REF_LAT);
    for (const [lat, lon] of [
      [48.857, 2.352],
      [43.296, 5.37],
      [42.7, 9.45],
      [51, -4],
    ]) {
      const [x, y] = proj.project(lat, lon);
      const [lat2, lon2] = proj.unproject(x, y);
      expect(lat2).toBeCloseTo(lat, 6);
      expect(lon2).toBeCloseTo(lon, 6);
    }
  });

  it('rejects outlier anchors in the second pass', () => {
    const outliers: Anchor[] = [
      { lat: 45, lon: 2, ...toMap(45, 2), x: toMap(45, 2).x + 300 },
      { lat: 49, lon: 5, ...toMap(49, 5), y: toMap(49, 5).y - 300 },
    ];
    const proj = fitProjection([...grid, ...outliers], REF_LAT);
    const [x, y] = proj.project(48.85, 2.35);
    const expected = toMap(48.85, 2.35);
    expect(Math.hypot(x - expected.x, y - expected.y)).toBeLessThan(0.5);
  });

  it('is distorted by the same outliers if they are not rejected (sanity check of the fixture)', () => {
    // Two outliers alone (no good anchors to dominate) would be fit as truth: the pass only helps in aggregate.
    const few = grid.slice(0, 4);
    const proj = fitProjection(few, REF_LAT);
    const [x, y] = proj.project(few[0].lat, few[0].lon);
    expect(x).toBeCloseTo(few[0].x, 6);
    expect(y).toBeCloseTo(few[0].y, 6);
  });
});

describe('haversineKm', () => {
  it('measures Paris to Marseille at about 661 km', () => {
    expect(Math.abs(haversineKm(48.857, 2.352, 43.296, 5.37) - 661)).toBeLessThan(5);
  });

  it('is zero for identical points', () => {
    expect(haversineKm(48.857, 2.352, 48.857, 2.352)).toBe(0);
  });

  it('is symmetric', () => {
    expect(haversineKm(48.857, 2.352, 43.296, 5.37)).toBeCloseTo(
      haversineKm(43.296, 5.37, 48.857, 2.352),
      10,
    );
  });

  it('covers a degree of latitude at about 111 km', () => {
    expect(haversineKm(0, 0, 1, 0)).toBeCloseTo(111.19, 1);
  });
});
