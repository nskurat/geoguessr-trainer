import { describe, expect, it } from 'vitest';
import { germanyRoadEntries } from './fixtures';
import { roadPatternHint, type RoadHintText } from '../hint';

const rules: Record<string, string> = { odd: 'Odd numbers run north–south', band4: 'The 40s are in the Ruhr' };
const text: RoadHintText = {
  rule: (id) => rules[id],
  between: (ref, a, b) => `the ${ref} lies between the ${a} and the ${b}`,
  next: (ref, a) => `the ${ref} runs next to the ${a}`,
  crosses: (ref, a) => `the ${ref} crosses the ${a}`,
  regions: (ref, codes) => `the ${ref} runs through ${codes.join(', ')}`,
  join: (parts) => parts.join('; '),
};
const roads = [
  { id: 'a5', ref: 'A 5' },
  { id: 'a7', ref: 'A 7' },
  { id: 'a9', ref: 'A 9' },
  { id: 'a4', ref: 'A 4' },
];
const a7 = { ref: 'A 7', rules: ['odd', 'trunk'], between: ['a5', 'a9'], crosses: ['a4'], codes: ['HE', 'BY'] };

describe('roadPatternHint', () => {
  it('states the rule and the neighbours, and pulses the neighbours', () => {
    expect(roadPatternHint(a7, roads, text)).toEqual({
      text: 'Odd numbers run north–south; the A 7 lies between the A 5 and the A 9',
      pulse: ['a5', 'a9'],
    });
  });

  it('uses the first rule that has text, and one neighbour when there is one', () => {
    const hint = roadPatternHint({ ...a7, rules: ['ring', 'band4'], between: ['a9'] }, roads, text);
    expect(hint).toEqual({ text: 'The 40s are in the Ruhr; the A 7 runs next to the A 9', pulse: ['a9'] });
  });

  it('adds the first other numbers when the text supports it, never a former one', () => {
    const numbered = {
      ...a7,
      altRefs: [
        { ref: 'A 3', network: 'A', kind: 'former' as const },
        { ref: 'E 45', network: 'E', kind: 'european' as const },
        { ref: 'E 43', network: 'E', kind: 'european' as const, from: 't28', to: 't63' },
        { ref: 'E 532', network: 'E', kind: 'european' as const },
      ],
    };
    const also = (ref: string, refs: string[]) => `the ${ref} is also the ${refs.join(', ')}`;
    expect(roadPatternHint(numbered, roads, { ...text, also }).text).toBe(
      'Odd numbers run north–south; the A 7 lies between the A 5 and the A 9; the A 7 is also the E 45, E 43',
    );
    expect(roadPatternHint(numbered, roads, text).text).not.toContain('also');
  });

  it('falls back to a crossing when there are no neighbours', () => {
    expect(roadPatternHint({ ...a7, between: [] }, roads, text)).toEqual({
      text: 'Odd numbers run north–south; the A 7 crosses the A 4',
      pulse: ['a4'],
    });
  });

  it('falls back to the regions only without a usable rule or neighbours', () => {
    expect(roadPatternHint({ ...a7, rules: ['unknown'], between: [] }, roads, text)).toEqual({
      text: 'the A 7 runs through HE, BY',
      pulse: [],
    });
  });

  it('ignores neighbours that do not exist', () => {
    expect(roadPatternHint({ ...a7, between: ['zz'], crosses: [] }, roads, text).text).toBe(
      'Odd numbers run north–south',
    );
  });

  it('gives every German road a hint with a rule', () => {
    const all: Record<string, string> = new Proxy({}, { get: (_, id) => `rule ${String(id)}` });
    for (const r of germanyRoadEntries) {
      const hint = roadPatternHint(r, germanyRoadEntries, { ...text, rule: (id) => all[id] });
      expect(hint.text.startsWith('rule ')).toBe(true);
    }
  });
});
