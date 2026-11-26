import { describe, expect, it } from 'vitest';
import type { Point } from '../../types/geo';
import { smoothPath } from '../svgPath';

const points: Point[] = [
  [0, 0],
  [10, 5],
  [20, 0],
  [30, 10.126],
];

describe('smoothPath', () => {
  it('starts with a move to the first point', () => {
    expect(smoothPath(points).startsWith('M0.00 0.00')).toBe(true);
  });

  it('has one cubic segment per gap between points', () => {
    expect(smoothPath(points).match(/C/g)).toHaveLength(points.length - 1);
  });

  it('ends exactly at the last point, rounded to 2 decimals', () => {
    expect(smoothPath(points).endsWith('30.00 10.13')).toBe(true);
  });

  it('rounds every number to 2 decimals', () => {
    const numbers = smoothPath([
      [0.123456, 1.987654],
      [3.14159, 2.71828],
      [5.55555, 0.00444],
    ]).match(/-?\d+(\.\d+)?/g)!;
    for (const n of numbers) expect(n).toMatch(/^-?\d+\.\d{2}$/);
  });

  it('draws a straight-looking curve for two points', () => {
    // With two points, neighbours default to the endpoints: control points are 1/6 along the chord.
    expect(
      smoothPath([
        [0, 0],
        [6, 12],
      ]),
    ).toBe('M0.00 0.00C1.00 2.00 5.00 10.00 6.00 12.00');
  });

  it('is deterministic', () => {
    expect(smoothPath(points)).toBe(smoothPath(points));
  });
});
