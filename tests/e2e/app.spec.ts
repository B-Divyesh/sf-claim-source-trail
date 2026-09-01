import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('first screen names students and a trail can be created and exported without an account @claim:no-account', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await expect(page).toHaveTitle(/Claim Source Trail/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.lead')).toContainText('Undergraduate humanities and social-science students');
  await expect(page.getByRole('link', { name: /sign in|log in|create account/i })).toHaveCount(0);
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

test('trails can be revised, searched, filtered, and reversibly deleted @claim:trail-workflow', async ({ page }) => {
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('Archives can omit community memory.');
  await page.getByLabel('Source title Required').fill('Silencing the Past');
  await page.getByLabel('Exact locator').fill('Chapter 1, p. 26');
  await page.getByLabel('Short excerpt or close paraphrase').fill('Silences enter while sources are made.');
  await page.getByLabel('Why does this evidence support or complicate the claim?').fill('The passage identifies omissions in archive formation.');
  await page.getByLabel('Mark as counterevidence').check();
  await page.getByRole('button', { name: 'Save trail' }).click();
  await expect(page.locator('.status.complete')).toContainText('Ready to spot-check');
  await expect(page.locator('.stance.counter')).toContainText('Counterevidence');

  await page.getByRole('button', { name: 'Edit trail' }).click();
  await page.getByLabel('Arguable claim Required').fill('Archives can omit local community memory.');
  await page.getByRole('button', { name: 'Save trail' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Archives can omit local community memory.' })).toBeVisible();

  await page.getByLabel('Search trails').fill('nothing matches this');
  await expect(page.getByText('No trails match.')).toBeVisible();
  await page.getByLabel('Search trails').fill('local community');
  await page.getByLabel('Show').selectOption('counter');
  await expect(page.locator('.trail-card')).toHaveCount(1);

  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Archives can omit local community memory.');
  await page.getByRole('button', { name: 'Delete trail' }).click();
  await expect(page.getByText('Trail deleted.')).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Archives can omit local community memory.' })).toBeVisible();
});

test('sample trails export to useful Markdown and CSV @claim:free-exports', async ({ page }) => {
  await page.goto('/?demo=1#workspace');
  await expect(page).toHaveTitle('Demo — Claim Source Trail');
  await expect(page.getByText('Demo — sample data. Your real workspace stays unchanged.')).toBeVisible();
  await expect(page.locator('.trail-card')).toHaveCount(2);

  const markdownDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Markdown' }).click();
  const markdownPath = await (await markdownDownload).path();
  expect(markdownPath).not.toBeNull();
  expect(await readFile(markdownPath!, 'utf8')).toContain('The Uses of Heritage');

  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csvPath = await (await csvDownload).path();
  expect(csvPath).not.toBeNull();
  expect(await readFile(csvPath!, 'utf8')).toContain('Archives can leave out community memory.');
});

test('sample data is isolated and can be discarded before real work starts @claim:demo-isolated', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('claim-source-trail:trails:v1', JSON.stringify([{
    id: 'real-trail', claim: 'Real workspace trail', sourceTitle: 'Private source', authors: '', sourceRef: '', year: '', locator: '', evidence: '', reason: '', counterevidence: false,
    createdAt: '2026-08-29T00:00:00.000Z', updatedAt: '2026-08-29T00:00:00.000Z'
  }])));

  await page.goto('/?demo=1#workspace');
  await expect(page.getByText('Public memorials shape which histories a community treats as shared.')).toBeVisible();
  await expect(page.getByText('Real workspace trail')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('demo:claim-source-trail:trails:v1'))).not.toBeNull();

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('Real workspace trail')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('demo:claim-source-trail:trails:v1'))).toBeNull();
});

test('demo claim content makes no cross-origin request @claim:local-content', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1#workspace');
  await page.getByRole('button', { name: 'Edit trail' }).first().click();
  await page.getByLabel('Arguable claim Required').fill('A revised demo claim stays on this device.');
  await page.getByRole('button', { name: 'Save trail' }).click();

  const origin = new URL(page.url()).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
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

test('Delete all local data removes license credentials and every product-owned key @claim:complete-deletion', async ({ page }) => {
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

test('invalid source references are announced and never become dead links', async ({ page }) => {
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('Source references should lead to evidence.');
  await page.getByLabel('Source title Required').fill('Reference validation study');
  await page.getByLabel('DOI or URL').fill('this is not a DOI or URL');
  await page.getByRole('button', { name: 'Save trail' }).click();

  await expect(page.getByRole('alert')).toContainText('Enter a full http(s) URL or a DOI beginning with 10.');
  await expect(page.getByLabel('DOI or URL')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('DOI or URL').fill('10.4324/9780203602263');
  await page.getByRole('button', { name: 'Save trail' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.trail-steps a')).toHaveAttribute('href', 'https://doi.org/10.4324/9780203602263');
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
});

test('the shipped counterevidence sample has a valid, documented source URL without reaching an external publisher', async ({ page }) => {
  await page.goto('/?demo=1#workspace');
  const source = page.locator('.trail-card').filter({ hasText: 'Silencing the Past' }).locator('.trail-steps a');
  const href = await source.getAttribute('href');
  expect(href).toBe('https://www.beacon.org/Silencing-the-Past-P1851.aspx');
  expect(new URL(href!).protocol).toBe('https:');
});

test('every visible control on every public route has a 44px touch target', async ({ page }) => {
  for (const path of ['/', '/?demo=1#workspace', '/privacy', '/terms', '/definitely-not-a-route']) {
    await page.goto(path);
    const targets = await page.locator('a, button, input, select, textarea').evaluateAll((controls) => controls
      .map((control) => {
        const rect = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        return {
          name: (control.textContent || control.getAttribute('aria-label') || control.getAttribute('name') || control.tagName).trim(),
          visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
          width: rect.width,
          height: rect.height
        };
      })
      .filter(({ visible }) => visible));

    expect(targets.length, `${path} should expose interactive controls`).toBeGreaterThan(0);
    for (const target of targets) {
      expect(target.width, `${path} ${target.name} width`).toBeGreaterThanOrEqual(44);
      expect(target.height, `${path} ${target.name} height`).toBeGreaterThanOrEqual(44);
    }
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

test('cached demo workspace opens offline @claim:offline-reload', async ({ browser }) => {
  const offlineContext = await browser.newContext();
  try {
    const offlinePage = await offlineContext.newPage();
    await offlinePage.goto('/?demo=1#workspace');
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.reload();
    await offlineContext.setOffline(true);
    await offlinePage.reload();
    await expect(offlinePage.getByRole('heading', { level: 1, name: 'Connect each claim to its source.' })).toBeVisible();
    await expect(offlinePage.getByText('Public memorials shape which histories a community treats as shared.')).toBeVisible();
    await offlinePage.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(offlinePage.getByText('Offline — your local workspace and exports still work.')).toBeVisible();
  } finally {
    await offlineContext.close();
  }
});

test('sample Markdown and CSV exports still download offline @claim:offline-export', async ({ browser }) => {
  const offlineContext = await browser.newContext({ acceptDownloads: true });
  try {
    const offlinePage = await offlineContext.newPage();
    await offlinePage.goto('/?demo=1#workspace');
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.reload();
    await offlineContext.setOffline(true);
    await offlinePage.reload();

    const markdownDownload = offlinePage.waitForEvent('download');
    await offlinePage.getByRole('button', { name: 'Export Markdown' }).click();
    const markdownPath = await (await markdownDownload).path();
    expect(await readFile(markdownPath!, 'utf8')).toContain('The Uses of Heritage');

    const csvDownload = offlinePage.waitForEvent('download');
    await offlinePage.getByRole('button', { name: 'Export CSV' }).click();
    const csvPath = await (await csvDownload).path();
    expect(await readFile(csvPath!, 'utf8')).toContain('Archives can leave out community memory.');
  } finally {
    await offlineContext.close();
  }
});

test('a page count is bodyless and claim content never reaches the server @claim:anonymous-page-count', async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('claim-source-trail:page-counted'));
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({
    url: request.url(), method: request.method(), body: request.postData()
  }));
  await page.reload();
  await expect.poll(() => requests.filter((request) => request.url.endsWith('/api/page-view')).length).toBe(1);

  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('Private claim text must stay in the browser.');
  await page.getByLabel('Source title Required').fill('Private source title');
  await page.getByRole('button', { name: 'Save trail' }).click();

  const posts = requests.filter((request) => request.method === 'POST');
  expect(posts).toEqual([expect.objectContaining({ body: null })]);
  expect(posts[0].url).toBe(`${new URL(page.url()).origin}/api/page-view`);
  expect(JSON.stringify(requests)).not.toContain('Private claim text');
  expect(JSON.stringify(requests)).not.toContain('Private source title');
});

test('an active Instructor kit applies its local tools @claim:instructor-tools', async ({ page }) => {
  const now = new Date().toISOString();
  await page.evaluate(({ now }) => {
    const trail = (id: string, updatedAt: string) => ({
      id, claim: `${id} claim`, sourceTitle: `${id} source`, authors: '', sourceRef: '', year: '',
      locator: 'p. 4', evidence: 'Evidence', reason: 'Reason', counterevidence: id === 'recent',
      createdAt: updatedAt, updatedAt
    });
    localStorage.setItem('claim-source-trail:trails:v1', JSON.stringify([
      trail('old', '2020-01-01T00:00:00.000Z'), trail('recent', now)
    ]));
    localStorage.setItem('claim-source-trail:settings:v1', JSON.stringify({ courseLabel: '', retentionDays: 30 }));
    localStorage.setItem('sb_license:claim-source-trail', 'cached-valid-license');
    localStorage.setItem('sb_license:claim-source-trail:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  }, { now });
  await page.reload();

  await expect(page.getByText('Instructor kit · unlocked')).toBeVisible();
  await expect(page.getByLabel('Local trail overview')).toContainText('1Total trails');
  await expect(page.getByText('old claim')).toHaveCount(0);
  await expect(page.getByText('recent claim')).toBeVisible();
  await expect(page.getByLabel('Automatic local deletion').locator('option')).toHaveText([
    'Never', 'After 7 days', 'After 30 days', 'After 90 days'
  ]);

  await page.getByLabel('Course or assignment label').fill('HIST 201');
  await page.getByLabel('Course or assignment label').dispatchEvent('change');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Markdown' }).click();
  const path = await (await download).path();
  expect(await readFile(path!, 'utf8')).toContain('# HIST 201');
});

test('service worker update check keeps an active application shell', async ({ page }) => {
  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return {
      active: registration.active?.state,
      scope: registration.scope,
      waiting: registration.waiting?.state ?? null
    };
  });

  expect(worker.active).toBe('activated');
  expect(new URL(worker.scope).pathname).toBe('/');
  expect(worker.waiting).toBeNull();
});

test('reduced-motion preference removes interface transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motion = await page.locator('.button.primary').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationDuration: style.animationDuration, transitionDuration: style.transitionDuration };
  });

  expect(Number.parseFloat(motion.animationDuration)).toBeLessThanOrEqual(0.00001);
  expect(Number.parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.00001);
});

test('legal routes are real, readable pages', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Claim Source Trail');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy, by design' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://claim-source-trail.sociobot.in/privacy');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://claim-source-trail.sociobot.in/privacy');
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Claim Source Trail');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://claim-source-trail.sociobot.in/terms');
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Claim Source Trail');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://claim-source-trail.sociobot.in/?demo=1');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.webp$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes', '180x180');
});

test('route changes move focus to the new page heading and announce the destination', async ({ page }) => {
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy, by design' })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Privacy page loaded.');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Connect each claim to its source.' })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Claim Source Trail — connect claims to evidence page loaded.');
});

test('sample entry shows exactly two trails and keeps the real workspace unchanged @claim:demo-sample-count', async ({ page }) => {
  await page.goto('/?demo=1#workspace');
  await expect(page.locator('.trail-card')).toHaveCount(2);
  await expect(page.locator('.demo-banner')).toContainText('Your real workspace stays unchanged.');
  expect(await page.evaluate(() => localStorage.getItem('claim-source-trail:trails:v1'))).toBeNull();
});

test('the empty workspace qualifies what is and is not stored @claim:saved-trails-only', async ({ page }) => {
  await expect(page.getByText('No claim trail is stored until you save it.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('claim-source-trail:trails:v1'))).toBeNull();
  await page.getByRole('button', { name: 'Add your first claim' }).click();
  await page.getByLabel('Arguable claim Required').fill('Saving creates a claim trail.');
  await page.getByLabel('Source title Required').fill('Storage regression study');
  await page.getByRole('button', { name: 'Save trail' }).click();
  expect(await page.evaluate(() => localStorage.getItem('claim-source-trail:trails:v1'))).toContain('Saving creates a claim trail.');
});

test('the footer discloses the product-specific generated hero art @claim:hero-art-provenance', async ({ page }) => {
  await expect(page.locator('footer')).toContainText('Original generated hero art.');
  await expect(page.locator('.hero-art img')).toHaveAttribute('src', '/assets/hero-trail.webp');
  await page.getByRole('link', { name: 'Art details' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Artwork' })).toBeVisible();
});

test('purchase terms name the merchant of record and refund effect @claim:refund-policy', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.getByText('Sociobot/Dodo is the merchant of record and handles checkout and refunds.')).toBeVisible();
  await expect(page.getByText('A refund revokes the license.')).toBeVisible();
});

test('a complete demo flow sends no student work to an AI endpoint @claim:no-ai-routing', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1#workspace');
  await page.getByRole('button', { name: 'Edit trail' }).first().click();
  await page.getByLabel('Arguable claim Required').fill('A student writes the reasoning without an AI endpoint.');
  await page.getByRole('button', { name: 'Save trail' }).click();
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
  expect(requests.some((url) => /openai|azure|\/v1\/responses/i.test(url))).toBe(false);
});

test('unknown routes return the designed 404 document with complete metadata', async ({ page }) => {
  const response = await page.goto('/definitely-not-a-route');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Claim Source Trail');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /requested Claim Source Trail page/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://claim-source-trail.sociobot.in/404');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.webp$/);
  await expect(page.locator('header nav a')).toHaveCount(4);
  await expect(page.locator('footer')).toContainText('Built by Param Factory');
  await expect(page.locator('footer')).toContainText('Version 1.0.0');
  await expect(page.getByRole('link', { name: 'Return to workspace' })).toHaveAttribute('href', '/');
});
