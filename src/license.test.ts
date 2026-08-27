import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedLicenseState, checkoutUrl, LICENSE_KEY, restoreLicense, verifyLicense } from './license';

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('Instructor kit licensing', () => {
  it('uses the product-scoped hosted checkout and local token key', () => {
    expect(checkoutUrl()).toBe('https://api.sociobot.in/api/v1/products/claim-source-trail/checkout');
    restoreLicense('license-token');
    expect(localStorage.getItem(LICENSE_KEY)).toBe('license-token');
    expect(cachedLicenseState().unlocked).toBe(false);
  });

  it('unlocks after Sociobot verifies the restored token', async () => {
    restoreLicense('license-token');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: true, reason: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(verifyLicense(true)).resolves.toMatchObject({ unlocked: true });
    expect(fetchMock.mock.calls[0][0]).toContain('/claim-source-trail/verify?license=license-token');
    expect(cachedLicenseState().unlocked).toBe(true);
  });
});
