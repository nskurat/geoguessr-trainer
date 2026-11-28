import type { RoadCourses, RoadData, RoadsFile } from '../../types/geo';

/** A road ref compared loosely: "A7", "A 7" and "a 7" are the same number. */
export function normalizeRef(ref: string): string {
  return ref.replace(/\s+/g, '').toUpperCase();
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
