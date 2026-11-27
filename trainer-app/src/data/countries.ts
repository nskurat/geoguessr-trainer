import type { Country } from '../types/geo';
import type { Lang } from '../types/i18n';

/**
 * Every country the trainer offers. Each one's data loads only when it is picked; `name`
 * is shown in the picker before that, so it repeats each `copy.<lang>.countryName`
 * (`npm run validate:data` checks they match).
 */
export const COUNTRIES: { id: string; name: Record<Lang, string>; load: () => Promise<Country> }[] = [
  {
    id: 'france',
    name: { en: 'France', be: 'Францыя' },
    load: () => import('./france').then((m) => m.france),
  },
  { id: 'peru', name: { en: 'Peru', be: 'Перу' }, load: () => import('./peru').then((m) => m.peru) },
  {
    id: 'germany',
    name: { en: 'Germany', be: 'Германія' },
    load: () => import('./germany').then((m) => m.germany),
  },
];

export const DEFAULT_COUNTRY = 'france';
