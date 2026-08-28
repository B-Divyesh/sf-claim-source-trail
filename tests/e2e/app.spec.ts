import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('creates, completes, and exports a claim trail', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await expect(page).toHaveTitle(/Claim Source Trail/);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Arguable claim Required').fill('Public memorials shape shared history.');
  await page.getByLabel('Source title Required').fill('The Uses of Heritage');
  await page.getByRole('button', { name: 'Save trail' }).click();
  await expect(page.getByText('Needs an exact locator')).toBeVisible();

  await page.getByRole('button', { name: 'Edit trail' }).click();
  await page.getByLabel('Exact locator').fill('Introduction, pp. 1–3');
  await page.getByLabel('Short excerpt or close paraphrase').fill('Heritage is a present-day cultural process.');
  await page.getByLabel('Why does this evidence support or complicate the claim?').fill('It shows that public memory is actively produced.');
  await page.getByRole('button', { name: 'Save trail' }).click();
  await expect(page.locator('.status.complete')).toContainText('Ready to spot-check');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Markdown' }).click();
  expect((await download).suggestedFilename()).toBe('claim-source-trails.md');
  expect(errors).toEqual([]);
});

test('home and editor have no serious accessibility violations', async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  await page.getByRole('button', { name: 'Build a claim trail' }).click();
  results = await new AxeBuilder({ page }).include('#trail-dialog').analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('saved counterevidence card has no serious accessibility violations', async ({ page }) => {
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('A public archive can exclude community memory.');
  await page.getByLabel('Source title Required').fill('Archive studies');
  await page.getByLabel('Exact locator').fill('p. 42');
  await page.getByLabel('Short excerpt or close paraphrase').fill('Archives also produce silences.');
  await page.getByLabel('Why does this evidence support or complicate the claim?').fill('It complicates a claim that archives are neutral records.');
  await page.getByLabel('Mark as counterevidence').check();
  await page.getByRole('button', { name: 'Save trail' }).click();

  await expect(page.locator('.stance.counter')).toContainText('Counterevidence');
  const results = await new AxeBuilder({ page }).include('.trail-card').analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('Delete all local data removes license credentials and every product-owned key', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('sb_license:claim-source-trail', 'reusable-license-token');
    localStorage.setItem('sb_license:claim-source-trail:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
    localStorage.setItem('claim-source-trail:page-counted', '2026-08-28');
  });
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('Deletion must include credentials.');
  await page.getByLabel('Source title Required').fill('Privacy policy');
  await page.getByRole('button', { name: 'Save trail' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete all local data' }).click();

  await expect(page.getByText('All local data was deleted.')).toBeVisible();
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter((key) =>
    key.startsWith('claim-source-trail:') || key.startsWith('sb_license:claim-source-trail')
  ))).toEqual([]);
});

test('keyboard opens and dismisses the editor without losing focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Build a claim trail' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Arguable claim Required')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Ctrl/Cmd+Enter saves the editor from a text field', async ({ page }) => {
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('Keyboard research workflows remain complete.');
  await page.getByLabel('Source title Required').fill('Keyboard interaction study');
  await page.getByLabel('Source title Required').press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');

  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('heading', { level: 3, name: 'Keyboard research workflows remain complete.' })).toBeVisible();
});

test('maximum-length unbroken metadata stays inside the viewport', async ({ page }) => {
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('C'.repeat(600));
  await page.getByLabel('Source title Required').fill('S'.repeat(300));
  await page.getByLabel('Author(s)').fill('A'.repeat(200));
  await page.getByLabel('Year').fill('2'.repeat(20));
  await page.getByLabel('DOI or URL').fill(`https://example.com/${'r'.repeat(480)}`);
  await page.getByLabel('Exact locator').fill('L'.repeat(180));
  await page.getByLabel('Short excerpt or close paraphrase').fill('E'.repeat(1200));
  await page.getByLabel('Why does this evidence support or complicate the claim?').fill('R'.repeat(1200));
  await page.getByRole('button', { name: 'Save trail' }).click();

  await expect(page.locator('.trail-card')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const metadataFits = await page.locator('.trail-steps dd').evaluateAll((items) => items.every((item) => {
    const rect = item.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= window.innerWidth;
  }));
  expect(metadataFits).toBe(true);
  const sourceLink = await page.locator('.trail-steps a').boundingBox();
  expect(sourceLink).not.toBeNull();
  expect(sourceLink!.width).toBeGreaterThanOrEqual(44);
  expect(sourceLink!.height).toBeGreaterThanOrEqual(44);
});

test('persistent navigation and legal links have 44px touch targets', async ({ page }) => {
  const selectors = ['.wordmark', '.site-header nav a', '.purchase-box .microcopy a', 'footer nav a'];
  for (const selector of selectors) {
    const sizes = await page.locator(selector).evaluateAll((links) => links.map((link) => {
      const rect = link.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }).filter(({ width, height }) => width > 0 && height > 0));
    expect(sizes.length).toBeGreaterThan(0);
    expect(sizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  }
});

test('corrupt local storage can be cleared in-product', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('claim-source-trail:trails:v1', '{not-json'));
  await page.reload();

  await expect(page.getByRole('alert')).toContainText('Your saved trails could not be read.');
  await expect(page.getByRole('button', { name: 'Delete all local data' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete all local data' }).click();

  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('All local data was deleted.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('claim-source-trail:trails:v1'))).toBeNull();
});

test('cached workspace opens offline', async ({ page, context }) => {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Make every claim traceable.' })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText('Offline — your local workspace and exports still work.')).toBeVisible();
  await context.setOffline(false);
});

test('legal routes are real, readable pages', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy, by design' })).toBeVisible();
  await page.goto('/terms');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeVisible();
});
