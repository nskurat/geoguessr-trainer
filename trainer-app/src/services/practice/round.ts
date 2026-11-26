import type { Outcome } from '../../types/trainer';
import { shuffle, type Rng } from '../../utils/random';

/** A missed item comes back at most this many extra times in one round. */
export const MAX_REPEATS = 2;

export interface RoundState {
  items: string[];
  /** Items still to ask, in order. */
  queue: string[];
  /** Outcome of each item's first attempt; this is what scores the round. */
  first: Record<string, Outcome>;
  /** Latest outcome of each item, used to colour the map. */
  shown: Record<string, Outcome>;
  repeats: Record<string, number>;
  /** Items right first time. */
  score: number;
}

export function createRound(items: string[], rng: Rng): RoundState {
  return { items, queue: shuffle(items.slice(), rng), first: {}, shown: {}, repeats: {}, score: 0 };
}

/**
 * Records an answer, updating `round` in place. A missed item is put back
 * 3–5 places down the queue (up to `MAX_REPEATS` times).
 * Returns true if this was the item's first attempt in the round.
 */
export function recordOutcome(
  round: RoundState,
  item: string,
  outcome: Outcome,
  missed: boolean,
  rng: Rng,
): boolean {
  const firstAttempt = !(item in round.first);
  if (firstAttempt) {
    round.first[item] = outcome;
    if (outcome === 0) round.score++;
  }
  round.shown[item] = outcome;
  const repeats = round.repeats[item] || 0;
  if (missed && repeats < MAX_REPEATS) {
    round.repeats[item] = repeats + 1;
    round.queue.splice(Math.min(round.queue.length, 3 + Math.floor(rng() * 3)), 0, item);
  }
  return firstAttempt;
}
