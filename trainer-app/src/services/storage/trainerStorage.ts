import type { ProgressRecords } from '../practice/spacedRepetition';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Where settings and spaced-repetition progress live. Swap the adapter to sync elsewhere. */
export interface TrainerStorage {
  /** Raw persisted settings; validate with `normalizeSettings`. */
  loadSettings(): unknown;
  saveSettings(settings: object): void;
  loadProgress(): ProgressRecords;
  saveProgress(progress: ProgressRecords): void;
}

export const settingsKey = (countryId: string) => `geotrainer_${countryId}_settings`;
export const progressKey = (countryId: string) => `geotrainer_${countryId}_progress`;

function browserStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Accessing localStorage throws when site data is blocked.
    return null;
  }
}

/**
 * Keeps data in the browser's localStorage, per country. Falls back to memory
 * when storage is unavailable or throws (private windows, blocked site data,
 * quota), so the trainer always works, just without persistence.
 */
export class LocalTrainerStorage implements TrainerStorage {
  private memory = new Map<string, string>();
  private storage: StorageLike | null;
  private countryId: string;

  constructor(countryId: string, storage: StorageLike | null = browserStorage()) {
    this.countryId = countryId;
    this.storage = storage;
  }

  private read(key: string): unknown {
    let raw: string | null | undefined;
    try {
      raw = this.storage ? this.storage.getItem(key) : undefined;
    } catch {
      raw = undefined;
    }
    raw ??= this.memory.get(key) ?? null;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    const raw = JSON.stringify(value);
    this.memory.set(key, raw);
    try {
      this.storage?.setItem(key, raw);
    } catch {
      // Memory copy above keeps this session working.
    }
  }

  loadSettings(): unknown {
    return this.read(settingsKey(this.countryId));
  }

  saveSettings(settings: object): void {
    this.write(settingsKey(this.countryId), settings);
  }

  loadProgress(): ProgressRecords {
    const raw = this.read(progressKey(this.countryId));
    if (!raw || typeof raw !== 'object') return {};
    const out: ProgressRecords = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      const r = value as { box?: unknown; seenAt?: unknown };
      if (typeof r?.box === 'number' && typeof r.seenAt === 'number')
        out[key] = { box: r.box, seenAt: r.seenAt };
    }
    return out;
  }

  saveProgress(progress: ProgressRecords): void {
    this.write(progressKey(this.countryId), progress);
  }
}
