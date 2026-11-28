import {
  MODES,
  QUESTION_KINDS,
  STUDY_SETS,
  type Mode,
  type QuestionKind,
  type StudySet,
} from '../../types/trainer';

export type AskBy = 'name' | 'num' | 'mix';
export type LabelMode = 'auto' | 'num' | 'name' | 'off';
export type RoundSize = '10' | '20' | '40' | 'all';
export type PhoneFilter = 'border' | 'all';
/** Road class filter of the Roads set: a `RoadClass` as a string, or 'all'. */
export type RoadClassFilter = 'all' | '1' | '2' | '3';

/** Everything the control bar sets. Persisted per country. */
export interface Settings {
  set: StudySet;
  mode: Mode;
  kind: QuestionKind;
  /** Region key, or 'all'. */
  scope: string;
  ask: AskBy;
  labels: LabelMode;
  /** River id, or 'all'. */
  river: string;
  size: RoundSize;
  phoneFilter: PhoneFilter;
  /** Road id (Roads set picker), or 'all'. */
  road: string;
  roadClass: RoadClassFilter;
}

export const DEFAULT_SETTINGS: Settings = {
  set: 'reg',
  mode: 'learn',
  kind: 'find',
  scope: 'all',
  ask: 'name',
  labels: 'auto',
  river: 'all',
  size: '20',
  phoneFilter: 'border',
  road: 'all',
  roadClass: 'all',
};

const oneOf = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/**
 * Settings from whatever was persisted, falling back to the default for any
 * field that is missing or no longer valid (e.g. a region key from older data, a road
 * the country no longer has, or a study set the country does not offer).
 */
export function normalizeSettings(
  raw: unknown,
  valid: { regionKeys: string[]; riverIds: string[]; roadIds?: string[]; sets?: readonly StudySet[] },
): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    set: oneOf(valid.sets ?? STUDY_SETS, r.set, (valid.sets ?? STUDY_SETS)[0]),
    mode: oneOf(MODES, r.mode, d.mode),
    kind: oneOf(QUESTION_KINDS, r.kind, d.kind),
    scope: oneOf(['all', ...valid.regionKeys], r.scope, d.scope),
    ask: oneOf(['name', 'num', 'mix'] as const, r.ask, d.ask),
    labels: oneOf(['auto', 'num', 'name', 'off'] as const, r.labels, d.labels),
    river: oneOf(['all', ...valid.riverIds], r.river, d.river),
    size: oneOf(['10', '20', '40', 'all'] as const, r.size, d.size),
    phoneFilter: oneOf(['border', 'all'] as const, r.phoneFilter, d.phoneFilter),
    road: oneOf(['all', ...(valid.roadIds ?? [])], r.road, d.road),
    roadClass: oneOf(['all', '1', '2', '3'] as const, r.roadClass, d.roadClass),
  };
}
