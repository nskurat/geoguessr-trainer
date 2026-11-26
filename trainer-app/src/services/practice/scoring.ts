import type { Outcome } from '../../types/trainer';

/** Distance bands in km: [right, close, getting there]; anything further is a miss. */
export type DistanceBands = readonly [number, number, number];

export const CITY_DISTANCE_BANDS: DistanceBands = [25, 60, 120];
export const RIVER_TOWN_DISTANCE_BANDS: DistanceBands = [20, 45, 90];

export function distanceOutcome(km: number, bands: DistanceBands): Outcome {
  if (km <= bands[0]) return 0;
  if (km <= bands[1]) return 1;
  if (km <= bands[2]) return 2;
  return 3;
}

/**
 * Whether an outcome counts as a miss for spaced repetition and the round summary.
 * Distance questions are forgiving ("close" still counts); others need a first-try answer.
 */
export function isMiss(outcome: Outcome | undefined, distanceQuestion: boolean): boolean {
  if (outcome === undefined) return false;
  return outcome >= (distanceQuestion ? 2 : 1);
}
