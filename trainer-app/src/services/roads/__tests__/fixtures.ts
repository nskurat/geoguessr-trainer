import roads from '../../../data/germany/roads.json';
import type { RoadEntry } from '../../../types/geo';

/** Germany's road entries (no courses yet), for tests that run the services on real data. */
export const germanyRoadEntries = roads.roads as RoadEntry[];
