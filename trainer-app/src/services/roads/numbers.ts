import type { Road, RoadAltRef } from '../../types/geo';
import { normalizeRef } from '../country/roads';

type Numbered = Pick<Road, 'id' | 'ref' | 'altRefs'>;

/**
 * Roads that share a stretch with `road` (a `concurrent` altRef either way). On that stretch
 * both are the same carriageway, so they are never decoys or wrong options for each other.
 */
export function concurrentRoadIds(road: Numbered, roads: readonly Numbered[]): string[] {
  const own = normalizeRef(road.ref);
  const listed = new Set(
    (road.altRefs ?? []).filter((a) => a.kind === 'concurrent').map((a) => normalizeRef(a.ref)),
  );
  return roads
    .filter(
      (r) =>
        r.id !== road.id &&
        (listed.has(normalizeRef(r.ref)) ||
          (r.altRefs ?? []).some((a) => a.kind === 'concurrent' && normalizeRef(a.ref) === own)),
    )
    .map((r) => r.id);
}

/**
 * The numbers worth saying next to the primary one ("also the E 45"): the E-routes and
 * shared numbers, each once, in data order; former numbers are left out.
 */
export function alsoRefs(road: Pick<Road, 'altRefs'>): string[] {
  const seen = new Set<string>();
  const refs: string[] = [];
  for (const alt of road.altRefs ?? []) {
    if (alt.kind === 'former' || seen.has(normalizeRef(alt.ref))) continue;
    seen.add(normalizeRef(alt.ref));
    refs.push(alt.ref);
  }
  return refs;
}

/** One line of the info card's "also numbered" list. */
export interface AltRefLine {
  ref: string;
  kind: RoadAltRef['kind'];
  /** Town names bounding the stretch; absent when the number applies to the whole road. */
  from?: string;
  to?: string;
}

/**
 * The info card's list of a road's other numbers with their stretches as town names, the
 * current ones first and former numbers last.
 */
export function altRefLines(road: Pick<Road, 'altRefs'>, townName: (id: string) => string | undefined): AltRefLine[] {
  const alts = road.altRefs ?? [];
  return [...alts.filter((a) => a.kind !== 'former'), ...alts.filter((a) => a.kind === 'former')].map((alt) => {
    const from = alt.from && townName(alt.from);
    const to = alt.to && townName(alt.to);
    return from && to ? { ref: alt.ref, kind: alt.kind, from, to } : { ref: alt.ref, kind: alt.kind };
  });
}
