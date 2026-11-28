import { describe, expect, it } from 'vitest';
import type { RoadAltRef } from '../../../types/geo';
import { germanyRoadEntries } from './fixtures';
import { alsoRefs, altRefLines, concurrentRoadIds } from '../numbers';

const alt = (ref: string, kind: RoadAltRef['kind'], from?: string, to?: string): RoadAltRef => ({
  ref,
  network: kind === 'european' ? 'E' : 'A',
  kind,
  ...(from && to ? { from, to } : {}),
});

describe('concurrentRoadIds', () => {
  it('finds roads that share a stretch, listed on either side', () => {
    const roads = [
      { id: 'a7', ref: 'A 7', altRefs: [alt('A 44', 'concurrent', 't61', 't61'), alt('E 45', 'european')] },
      { id: 'a44', ref: 'A 44' },
      { id: 'a5', ref: 'A 5', altRefs: [alt('E 35', 'european')] },
    ];
    expect(concurrentRoadIds(roads[0], roads)).toEqual(['a44']);
    expect(concurrentRoadIds(roads[1], roads)).toEqual(['a7']);
    expect(concurrentRoadIds(roads[2], roads)).toEqual([]);
  });

  it("pairs Germany's concurrent roads both ways", () => {
    for (const road of germanyRoadEntries)
      for (const id of concurrentRoadIds(road, germanyRoadEntries)) {
        const other = germanyRoadEntries.find((r) => r.id === id)!;
        expect(concurrentRoadIds(other, germanyRoadEntries)).toContain(road.id);
      }
  });
});

describe('alsoRefs and altRefLines', () => {
  const road = {
    altRefs: [
      alt('B 3', 'former'),
      alt('E 40', 'european', 't33', 't34'),
      alt('E 40', 'european', 't36', 't43'),
      alt('A 3', 'concurrent', 't8', 't8'),
    ],
  };
  const names: Record<string, string> = { t33: 'Aachen', t34: 'Olpe', t36: 'Eisenach', t43: 'Görlitz', t8: 'Köln' };

  it('lists current numbers once, without former ones', () => {
    expect(alsoRefs(road)).toEqual(['E 40', 'A 3']);
    expect(alsoRefs({})).toEqual([]);
  });

  it('gives the info card every number with its stretch, former numbers last', () => {
    expect(altRefLines(road, (id) => names[id])).toEqual([
      { ref: 'E 40', kind: 'european', from: 'Aachen', to: 'Olpe' },
      { ref: 'E 40', kind: 'european', from: 'Eisenach', to: 'Görlitz' },
      { ref: 'A 3', kind: 'concurrent', from: 'Köln', to: 'Köln' },
      { ref: 'B 3', kind: 'former' },
    ]);
  });
});
