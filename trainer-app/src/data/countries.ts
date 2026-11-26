import type { Country } from '../types/geo';

/** Every country the trainer offers. Each one's data loads only when it is picked. */
export const COUNTRIES: { id: string; name: string; load: () => Promise<Country> }[] = [
  { id: 'france', name: 'France', load: () => import('./france').then((m) => m.france) },
];

export const DEFAULT_COUNTRY = 'france';
