import type { Trail } from './model';

const TRAILS_KEY = 'claim-source-trail:trails:v1';
const SETTINGS_KEY = 'claim-source-trail:settings:v1';
const PRODUCT_STORAGE_PREFIXES = ['claim-source-trail:', 'sb_license:claim-source-trail'];
const DEMO_PREFIX = 'demo:';

export type StorageScope = 'real' | 'demo';

export interface Settings {
  courseLabel: string;
  retentionDays: number;
}

const defaults: Settings = { courseLabel: '', retentionDays: 0 };

function scopedKey(key: string, scope: StorageScope): string {
  return scope === 'demo' ? `${DEMO_PREFIX}${key}` : key;
}

export function loadTrails(scope: StorageScope = 'real'): Trail[] {
  const raw = localStorage.getItem(scopedKey(TRAILS_KEY, scope));
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Saved trail data is not a list.');
  return value.filter((item): item is Trail => Boolean(
    item && typeof item === 'object' && 'id' in item && 'claim' in item && 'sourceTitle' in item
  ));
}

export function saveTrails(trails: Trail[], scope: StorageScope = 'real'): void {
  localStorage.setItem(scopedKey(TRAILS_KEY, scope), JSON.stringify(trails));
}

export function loadSettings(scope: StorageScope = 'real'): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(scopedKey(SETTINGS_KEY, scope)) || '{}') };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings, scope: StorageScope = 'real'): void {
  localStorage.setItem(scopedKey(SETTINGS_KEY, scope), JSON.stringify(settings));
}

function ownsProductKey(key: string, scope?: StorageScope): boolean {
  const isDemo = key.startsWith(DEMO_PREFIX);
  const unscoped = isDemo ? key.slice(DEMO_PREFIX.length) : key;
  const owned = PRODUCT_STORAGE_PREFIXES.some((prefix) => unscoped.startsWith(prefix));
  if (!owned) return false;
  return scope === undefined || (scope === 'demo' ? isDemo : !isDemo);
}

export function clearLocalData(scope?: StorageScope): void {
  // This is the complete-deletion control promised in the privacy policy. Keep
  // the namespace list here so future product-owned keys are cleared too. Demo
  // data may be reset independently and must never touch a real workspace.
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
    .filter((key): key is string => key !== null);
  keys
    .filter((key) => ownsProductKey(key, scope))
    .forEach((key) => localStorage.removeItem(key));
}

export function applyRetention(trails: Trail[], days: number, now = Date.now()): Trail[] {
  if (!days) return trails;
  const cutoff = now - days * 86_400_000;
  return trails.filter((trail) => new Date(trail.updatedAt).getTime() >= cutoff);
}
