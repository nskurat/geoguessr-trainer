import type { RoadClass } from '../../types/geo';

/** When a road class is drawn and when its shields are, in visible map width (km). */
export interface RoadClassThreshold {
  /** Drawn when the view is at most this wide. */
  drawKm: number;
  /** Shields shown when the view is at most this wide. */
  shieldKm: number;
  /** And zoomed at least this far past the full country view. */
  minZoom: number;
}

/**
 * docs/specs/roads.md §2: class 1 (trunk) is always drawn with shields, because pattern
 * search needs the trunk network in sight; deeper classes appear as the player zooms.
 */
export const ROAD_CLASS_THRESHOLDS: Readonly<Record<RoadClass, RoadClassThreshold>> = {
  1: { drawKm: Infinity, shieldKm: Infinity, minZoom: 1 },
  2: { drawKm: 300, shieldKm: 200, minZoom: 1.3 },
  3: { drawKm: 120, shieldKm: 80, minZoom: 1.3 },
};

export const ROAD_CLASSES: readonly RoadClass[] = [1, 2, 3];

export interface RoadVisibility {
  /** Classes drawn at this view. */
  drawn: RoadClass[];
  /** Classes whose shields are shown at this view. */
  shields: RoadClass[];
}

/**
 * Which road classes are drawn and labelled at a view `viewWidthKm` wide, zoomed
 * `zoomRatio` times past the full country view. `narrowestViewKm` is the narrowest view the
 * map can reach: every threshold is raised to at least 1.5× it, so each class and its shields
 * can always be reached on a small country.
 */
export function roadVisibility(viewWidthKm: number, zoomRatio: number, narrowestViewKm = 0): RoadVisibility {
  const floor = 1.5 * narrowestViewKm;
  const drawn: RoadClass[] = [];
  const shields: RoadClass[] = [];
  for (const cls of ROAD_CLASSES) {
    const t = ROAD_CLASS_THRESHOLDS[cls];
    if (zoomRatio < t.minZoom) continue;
    if (viewWidthKm <= Math.max(t.drawKm, floor)) drawn.push(cls);
    if (viewWidthKm <= Math.max(t.shieldKm, floor)) shields.push(cls);
  }
  return { drawn, shields };
}
