import { describe, expect, it } from 'vitest';
import { ROAD_CLASS_THRESHOLDS, ROAD_CLASSES, roadVisibility } from '../visibility';

describe('roadVisibility', () => {
  it('always draws class 1 with shields, even at the full view', () => {
    expect(roadVisibility(900, 1)).toEqual({ drawn: [1], shields: [1] });
  });

  it('needs both a narrow view and some zoom for deeper classes', () => {
    expect(roadVisibility(250, 1).drawn).toEqual([1]);
    expect(roadVisibility(250, 1.3)).toEqual({ drawn: [1, 2], shields: [1] });
    expect(roadVisibility(150, 2)).toEqual({ drawn: [1, 2], shields: [1, 2] });
    expect(roadVisibility(100, 3)).toEqual({ drawn: [1, 2, 3], shields: [1, 2] });
    expect(roadVisibility(60, 5)).toEqual({ drawn: [1, 2, 3], shields: [1, 2, 3] });
  });

  it('raises thresholds to 1.5× the narrowest reachable view', () => {
    // A view that can never get narrower than 70 km still shows class-3 shields at 100 km.
    expect(roadVisibility(100, 3, 70).shields).toEqual([1, 2, 3]);
  });

  it('has a threshold for every class', () => {
    for (const cls of ROAD_CLASSES) expect(ROAD_CLASS_THRESHOLDS[cls]).toBeDefined();
  });
});
