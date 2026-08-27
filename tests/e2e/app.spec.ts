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
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  await page.getByRole('button', { name: 'Build a claim trail' }).click();
  results = await new AxeBuilder({ page }).include('#trail-dialog').analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('legal routes are real, readable pages', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy, by design' })).toBeVisible();
  await page.goto('/terms');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeVisible();
});
