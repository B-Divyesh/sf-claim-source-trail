import type { Trail } from './model';

const TRAILS_KEY = 'claim-source-trail:trails:v1';
const SETTINGS_KEY = 'claim-source-trail:settings:v1';

export interface Settings {
  courseLabel: string;
  retentionDays: number;
}

const defaults: Settings = { courseLabel: '', retentionDays: 0 };

export function loadTrails(): Trail[] {
  const raw = localStorage.getItem(TRAILS_KEY);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Saved trail data is not a list.');
  return value.filter((item): item is Trail => Boolean(
    item && typeof item === 'object' && 'id' in item && 'claim' in item && 'sourceTitle' in item
  ));
}

export function saveTrails(trails: Trail[]): void {
  localStorage.setItem(TRAILS_KEY, JSON.stringify(trails));
}

export function loadSettings(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearLocalData(): void {
  localStorage.removeItem(TRAILS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

export function applyRetention(trails: Trail[], days: number, now = Date.now()): Trail[] {
  if (!days) return trails;
  const cutoff = now - days * 86_400_000;
  return trails.filter((trail) => new Date(trail.updatedAt).getTime() >= cutoff);
}
