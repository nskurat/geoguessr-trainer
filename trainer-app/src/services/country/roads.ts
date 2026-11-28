import type { Road, RoadCourses, RoadData, RoadsFile } from '../../types/geo';

/** A road ref compared loosely: "A7", "A 7" and "a 7" are the same number. */
export function normalizeRef(ref: string): string {
  return ref.replace(/\s+/g, '').toUpperCase();
}

/** The numbers in an OSM `ref` / `int_ref` value, which may list several: "A 7;E 45" → ["A 7", "E 45"]. */
export function splitRefs(value: string | undefined): string[] {
  return (value ?? '')
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Whether `ref` is one of the road's numbers: its primary `ref` or any of its `altRefs`. */
export function refMatchesRoad(ref: string, road: Pick<Road, 'ref' | 'altRefs'>): boolean {
  const n = normalizeRef(ref);
  return normalizeRef(road.ref) === n || (road.altRefs ?? []).some((a) => normalizeRef(a.ref) === n);
}

/**
 * Whether an OSM `ref` (possibly a ";" list) agrees with our road: one of its numbers is the
 * primary `ref` or a known `altRefs` number. Unknown extra numbers are not a mismatch; the
 * build-roads report suggests them as altRefs.
 */
export function osmRefMatches(osmRef: string, road: Pick<Road, 'ref' | 'altRefs'>): boolean {
  return splitRefs(osmRef).some((ref) => refMatchesRoad(ref, road));
}

/**
 * Joins our own road data (`roads.json`) with its course files (`roads.osm.json`,
 * `roadCourses.json`) into the `RoadData` the trainer uses. Files stay separate on disk
 * (ODbL data is never merged into ours); this is only the in-memory join. A road without a
 * course gets `course: []`; validation reports it.
 */
export function joinRoads(file: RoadsFile, ...courseFiles: (RoadCourses | undefined)[]): RoadData {
  return {
    networks: file.networks,
    towns: file.towns,
    roads: file.roads.map((road) => {
      const entry = courseFiles.find((f) => f?.[road.id])?.[road.id];
      return { ...road, course: entry ? entry.course : [] };
    }),
  };
}
