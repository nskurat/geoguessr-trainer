/** What is being studied. The short ids are persisted in settings and progress keys. */
export type StudySet = 'reg' | 'dep' | 'city' | 'riv' | 'tel' | 'nom';
export type Mode = 'learn' | 'practice';
/** Question type; labels differ per set (see app/trainer.ts `KIND_LABELS`). */
export type QuestionKind = 'find' | 'name' | 'town' | 'dot';

export const STUDY_SETS: readonly StudySet[] = ['reg', 'dep', 'city', 'riv', 'tel', 'nom'];
export const MODES: readonly Mode[] = ['learn', 'practice'];
export const QUESTION_KINDS: readonly QuestionKind[] = ['find', 'name', 'town', 'dot'];

/**
 * Result of one question: 0 = right first try, 1 = second try, 2 = third try, 3 = missed.
 * For distance questions, 0–2 are the distance bands and 3 is too far.
 */
export type Outcome = 0 | 1 | 2 | 3;
