import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedLicenseState, checkoutUrl, LICENSE_KEY, LICENSE_VERDICT_KEY, restoreLicense, verifyLicense } from './license';

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

  it('sends the token only to Sociobot and reuses the daily verdict @claim:license-verification', async () => {
    restoreLicense('license-token');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: true, reason: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(verifyLicense(true)).resolves.toMatchObject({ unlocked: true });
    await expect(verifyLicense()).resolves.toMatchObject({ unlocked: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.sociobot.in/api/v1/products/claim-source-trail/verify?license=license-token');
    expect(cachedLicenseState().unlocked).toBe(true);
  });

  it('does not restore a cached license verdict after local data is cleared during verification', async () => {
    restoreLicense('license-token');
    let resolveFetch!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve; })));
    const verification = verifyLicense(true);
    localStorage.removeItem(LICENSE_KEY);
    localStorage.removeItem(LICENSE_VERDICT_KEY);
    resolveFetch(new Response(JSON.stringify({ valid: true, reason: 'ok' }), { status: 200 }));

    await expect(verification).resolves.toEqual({ unlocked: false, notice: '' });
    expect(localStorage.getItem(LICENSE_VERDICT_KEY)).toBeNull();
  });
});
