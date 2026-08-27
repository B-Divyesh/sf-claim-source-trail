export const PRODUCT_SLUG = 'claim-source-trail';
export const BILLING_BASE = 'https://api.sociobot.in/api/v1';
export const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const DAY = 86_400_000;

interface Verdict {
  valid: boolean;
  checkedAt: number;
  reason?: string;
}

export interface LicenseState {
  unlocked: boolean;
  notice: string;
}

export function checkoutUrl(): string {
  return `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;
}

export function captureLicenseFromUrl(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function restoreLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return { unlocked: false, notice: '' };
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null;
    if (verdict?.valid) return { unlocked: true, notice: '' };
    if (verdict && Date.now() - verdict.checkedAt < DAY) {
      return { unlocked: false, notice: 'License no longer active.' };
    }
  } catch { /* verify below */ }
  return { unlocked: false, notice: 'Checking your Instructor kit license…' };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return { unlocked: false, notice: '' };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null;
    if (!force && cached && Date.now() - cached.checkedAt < DAY) {
      return { unlocked: cached.valid, notice: cached.valid ? '' : 'License no longer active.' };
    }
  } catch { /* fetch a fresh verdict */ }

  try {
    const response = await fetch(
      `${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!response.ok) throw new Error(`Verification returned ${response.status}`);
    const data = await response.json() as { valid: boolean; reason?: string };
    const verdict: Verdict = { valid: data.valid, reason: data.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return { unlocked: data.valid, notice: data.valid ? 'Instructor kit unlocked.' : 'License no longer active.' };
  } catch {
    const optimistic = cachedLicenseState();
    return {
      unlocked: optimistic.unlocked,
      notice: optimistic.unlocked
        ? 'Offline — using your last valid license check.'
        : 'Could not check this license. Your free workspace still works.'
    };
  }
}
