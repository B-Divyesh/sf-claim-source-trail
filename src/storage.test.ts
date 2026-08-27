import { beforeEach, describe, expect, it } from 'vitest';
import { applyRetention, clearLocalData, loadSettings, loadTrails, saveSettings, saveTrails } from './storage';
import type { Trail } from './model';

const trail: Trail = {
  id: 'old', claim: 'Claim', sourceTitle: 'Source', authors: '', sourceRef: '', year: '', locator: '', evidence: '', reason: '',
  counterevidence: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
};

beforeEach(() => localStorage.clear());

describe('local persistence', () => {
  it('round-trips trails and settings without a network', () => {
    saveTrails([trail]); saveSettings({ courseLabel: 'SOC 101', retentionDays: 30 });
    expect(loadTrails()[0].claim).toBe('Claim');
    expect(loadSettings()).toEqual({ courseLabel: 'SOC 101', retentionDays: 30 });
    clearLocalData(); expect(loadTrails()).toEqual([]);
  });

  it('applies an explicit last-edited retention window', () => {
    const now = new Date('2026-02-15T00:00:00.000Z').getTime();
    expect(applyRetention([trail], 30, now)).toEqual([]);
    expect(applyRetention([trail], 0, now)).toHaveLength(1);
  });
});
