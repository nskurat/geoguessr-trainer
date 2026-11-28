import type { Road } from '../../types/geo';

/** Localised sentence builders for the hint; refs are passed as signed ("A 7"). */
export interface RoadHintText {
  /** A rule's text in the active language, or undefined when it has none. */
  rule: (ruleId: string) => string | undefined;
  /** "the A 7 lies between the A 5 and the A 9" */
  between: (ref: string, a: string, b: string) => string;
  /** "the A 7 runs next to the A 5" */
  next: (ref: string, a: string) => string;
  /** "the A 7 crosses the A 4" — used only when the road has no neighbours in the pattern. */
  crosses: (ref: string, a: string) => string;
  /** Fallback for a road without a usable rule: "the A 7 runs through Hesse, Bavaria". */
  regions: (ref: string, codes: string[]) => string;
  /** Joins the sentences, e.g. with "; ". */
  join: (parts: string[]) => string;
}

export interface RoadHint {
  text: string;
  /** Roads to pulse on the map: the neighbours named in the hint. */
  pulse: string[];
}

/**
 * The find kind's hint after the second miss: the pattern, not the place (spec §3.5). The
 * road's most telling rule and its neighbours in the pattern; a crossing when it has no
 * neighbours; only for a road with no usable rule and no neighbours, the regions it crosses.
 */
export function roadPatternHint(
  road: Pick<Road, 'ref' | 'rules' | 'between' | 'crosses' | 'codes'>,
  roads: readonly Pick<Road, 'id' | 'ref'>[],
  text: RoadHintText,
): RoadHint {
  const refOf = new Map(roads.map((r) => [r.id, r.ref]));
  const rule = road.rules.map(text.rule).find((x) => x);
  const neighbours = road.between.filter((id) => refOf.has(id));
  const parts: string[] = [];
  let pulse: string[] = [];
  if (rule) parts.push(rule);
  if (neighbours.length >= 2) {
    parts.push(text.between(road.ref, refOf.get(neighbours[0])!, refOf.get(neighbours[1])!));
    pulse = neighbours.slice(0, 2);
  } else if (neighbours.length === 1) {
    parts.push(text.next(road.ref, refOf.get(neighbours[0])!));
    pulse = neighbours;
  } else if (rule) {
    const crossing = road.crosses.find((id) => refOf.has(id));
    if (crossing) {
      parts.push(text.crosses(road.ref, refOf.get(crossing)!));
      pulse = [crossing];
    }
  }
  if (!parts.length) parts.push(text.regions(road.ref, road.codes));
  return { text: text.join(parts), pulse };
}
