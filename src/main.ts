import './style.css';
import {
  createTrail, previewTrailImports, readyRate, statusLabel, toCsv, toMarkdown, trailStatus,
  type ImportPreview, type Trail, type TrailStatus
} from './model';
import {
  applyRetention, clearLocalData, loadSettings, loadTrails, saveSettings, saveTrails, type Settings, type StorageScope
} from './storage';
import {
  cachedLicenseState, captureLicenseFromUrl, checkoutUrl, restoreLicense, verifyLicense, type LicenseState
} from './license';

const app = document.querySelector<HTMLDivElement>('#app')!;
const demoMode = new URLSearchParams(location.search).get('demo') === '1';
const storageScope: StorageScope = demoMode ? 'demo' : 'real';
const PRODUCT_VERSION = '1.0.0';
const BUILD_ID = import.meta.env.VITE_BUILD_SHA || 'dev';
let trails: Trail[] = [];
let settings: Settings = loadSettings(storageScope);
let license: LicenseState = demoMode ? { unlocked: false, notice: '' } : cachedLicenseState();
let storageError = '';
let editingId: string | null = null;
let deletedTrail: Trail | null = null;
let undoTimer = 0;
let previousFocus: HTMLElement | null = null;
let pendingImport: ImportPreview | null = null;

try {
  trails = loadTrails(storageScope);
} catch {
  storageError = 'Your saved trails could not be read. Delete the unreadable local data below, then start again.';
}

if (demoMode && !trails.length && !storageError) {
  trails = sampleTrails();
  saveTrails(trails, storageScope);
}

const capturedLicense = demoMode ? false : captureLicenseFromUrl();
if (capturedLicense) license = { unlocked: false, notice: 'Checking your new license…' };

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]!);
}

function shell(content: string, page: 'home' | 'privacy' | 'terms'): string {
  const workspaceHref = page === 'home' ? '#workspace' : '/#workspace';
  const instructorHref = page === 'home' ? '#instructor' : '/#instructor';
  return `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Claim Source Trail home">
        <span class="trail-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        Claim Source Trail
      </a>
      <nav aria-label="Primary navigation">
        <a href="${workspaceHref}">Workspace</a>
        <a href="/?demo=1#workspace">Demo</a>
        <a href="${instructorHref}">Instructor kit</a>
        <a href="/privacy" ${page === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a>
      </nav>
    </header>
    ${content}
    <footer>
      <div><strong>Claim Source Trail</strong><br><span>Records evidence links; does not judge truth.</span></div>
      <nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      <p>Built by Param Factory · Version ${PRODUCT_VERSION} · Build ${esc(BUILD_ID)}<br>Original generated hero art. <a href="/terms">Art details</a></p>
    </footer>`;
}

const SITE_ORIGIN = 'https://claim-source-trail.sociobot.in';
const SOCIAL_IMAGE = `${SITE_ORIGIN}/assets/social-preview.webp`;

function setMetadata(page: 'home' | 'demo' | 'privacy' | 'terms'): void {
  const metadata = {
    home: {
      title: 'Claim Source Trail — connect claims to evidence',
      description: 'Record each claim, its source, exact location, and why the evidence matters.',
      url: `${SITE_ORIGIN}/`
    },
    demo: {
      title: 'Demo — Claim Source Trail',
      description: 'Try two isolated sample claim trails without changing your real workspace.',
      url: `${SITE_ORIGIN}/?demo=1`
    },
    privacy: {
      title: 'Privacy — Claim Source Trail',
      description: 'See what Claim Source Trail stores locally and what reaches its server.',
      url: `${SITE_ORIGIN}/privacy`
    },
    terms: {
      title: 'Terms — Claim Source Trail',
      description: 'Read the terms for the free workspace and one-time Instructor kit.',
      url: `${SITE_ORIGIN}/terms`
    }
  }[page];
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', metadata.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', metadata.url);
  for (const [selector, value] of [
    ['meta[property="og:title"]', metadata.title],
    ['meta[property="og:description"]', metadata.description],
    ['meta[property="og:url"]', metadata.url],
    ['meta[property="og:image"]', SOCIAL_IMAGE],
    ['meta[name="twitter:title"]', metadata.title],
    ['meta[name="twitter:description"]', metadata.description],
    ['meta[name="twitter:image"]', SOCIAL_IMAGE]
  ] as const) document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const isPrivacy = kind === 'privacy';
  const content = isPrivacy ? `
    <p class="kicker">Plain-language policy</p>
    <h1>How your data stays private</h1>
    <p class="legal-lead">Your claims, sources, excerpts, and notes stay in this browser. We cannot read them.</p>
    <h2>What is stored</h2>
    <p>Your trail cards, imported submission labels, and Instructor kit settings use this browser’s storage. A pasted license token is stored here too.</p>
    <p>The token goes only to Sociobot’s billing API when the app checks whether the kit is active.</p>
    <h2>What reaches our server</h2>
    <p>At most once per browser day, the app sends one anonymous page-count event. The server stores only a date and total count.</p>
    <p>The event has no IP address, user agent, source text, or persistent visitor identifier. Normal short-lived infrastructure logs may exist for security.</p>
    <h2>Delete your data</h2>
    <p>Use “Delete all local data” in the workspace. You can also clear this site’s storage in your browser. The in-app deletion is immediate and cannot be undone.</p>
    <h2>Publisher material</h2>
    <p>Record only the excerpts you are permitted to use. This tool does not fetch, scrape, or redistribute publisher content.</p>
  ` : `
    <p class="kicker">Product terms</p>
    <h1>Terms of use</h1>
    <p class="legal-lead">Use Claim Source Trail to connect your own claims and sources.</p>
    <h2>The service</h2>
    <p>The free workspace stores claim trails locally and includes Markdown and CSV export. Enter and check your own work.</p>
    <p>The app records what you enter. It does not generate essays, score truth, or check citation accuracy.</p>
    <h2>Instructor kit purchase</h2>
    <p>The Instructor kit costs $18 once. It adds local CSV import, submission totals, a course label, and automatic deletion settings.</p>
    <p>Checkout opens Sociobot/Dodo. Review its terms before paying. If license verification reports an inactive license, the Instructor kit locks.</p>
    <h2>Your responsibilities</h2>
    <p>You are responsible for checking sources, respecting copyright and access terms, protecting exported files, and following your institution’s academic-integrity policies.</p>
    <h2>Availability</h2>
    <p>The service is provided “as is” without a promise of uninterrupted availability. Export important work regularly. These terms are governed by applicable law.</p>
    <h2>Artwork</h2>
    <p>The footer identifies the original generated hero art. Its prompt and creation record are in the product design notes.</p>
  `;
  return shell(`<main id="main" class="legal-page">${content}<p><a class="text-link" href="/">← Return to workspace</a></p></main>`, kind);
}

function statusClass(status: TrailStatus): string {
  return status === 'ready' ? 'complete' : status === 'draft' ? 'draft' : 'attention';
}

function trailCard(trail: Trail): string {
  const status = trailStatus(trail);
  const source = [trail.authors, trail.sourceTitle, trail.year].filter(Boolean).join(' · ');
  const sourceLink = sourceHref(trail.sourceRef);
  return `<article class="trail-card" data-id="${trail.id}">
    <div class="card-topline">
      <span class="status ${statusClass(status)}"><span aria-hidden="true">${status === 'ready' ? '✓' : '!'}</span> ${statusLabel(status)}</span>
      <span class="stance ${trail.counterevidence ? 'counter' : ''}">${trail.counterevidence ? '↯ Source challenges claim' : '→ Source supports claim'}</span>
    </div>
    <h3>${esc(trail.claim)}</h3>
    ${trail.importedFrom ? `<p class="import-source"><strong>Submission:</strong> ${esc(trail.importedFrom)}</p>` : ''}
    <dl class="trail-steps">
      <div><dt><span>2</span> Source</dt><dd>${esc(source || trail.sourceRef)}</dd>${sourceLink ? `<dd><a href="${esc(sourceLink)}" target="_blank" rel="noopener noreferrer">${esc(trail.sourceRef)}</a></dd>` : ''}</div>
      <div><dt><span>3</span> Exact location</dt><dd>${esc(trail.locator) || '<em>Not recorded yet</em>'}</dd></div>
      <div><dt><span>3b</span> Excerpt / paraphrase</dt><dd>${esc(trail.evidence) || '<em>Not recorded yet</em>'}</dd></div>
      <div><dt><span>4</span> Why it matters</dt><dd>${esc(trail.reason) || '<em>Not recorded yet</em>'}</dd></div>
    </dl>
    <div class="card-actions">
      <button class="button small edit-trail" type="button" data-id="${trail.id}">Edit trail</button>
      <button class="text-button delete-trail" type="button" data-id="${trail.id}">Delete trail</button>
      <time datetime="${trail.updatedAt}">Updated ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(trail.updatedAt))}</time>
    </div>
  </article>`;
}

function sourceHref(ref: string): string | null {
  const value = ref.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) ? url.href : null;
  } catch {
    const doi = value.replace(/^doi:\s*/i, '');
    return /^10\.\d{4,9}\/\S+$/.test(doi) ? `https://doi.org/${doi}` : null;
  }
}

function emptyState(): string {
  return `<section class="empty-state" aria-labelledby="empty-title">
    <div class="empty-numeral" aria-hidden="true">01</div>
    <div><h3 id="empty-title">Start with one arguable claim</h3>
    <p>Add the exact location in a source. Then explain the connection in your own words.</p>
    <div class="button-row"><button class="button primary add-trail" type="button">Add your first claim</button><button class="text-button example-trail" type="button">Open a worked example</button></div></div>
  </section>`;
}

function sampleTrails(): Trail[] {
  return [
    createTrail({
      claim: 'Public memorials shape which histories a community treats as shared.',
      sourceTitle: 'The Uses of Heritage', authors: 'Laurajane Smith', year: '2006', sourceRef: 'https://doi.org/10.4324/9780203602263',
      locator: 'Introduction, pp. 1–3', evidence: 'Heritage is described as a cultural process that produces meaning in the present.',
      reason: 'This links public memorials to active choices about collective historical understanding.', counterevidence: false
    }),
    createTrail({
      claim: 'Archives can leave out community memory.',
      sourceTitle: 'Silencing the Past', authors: 'Michel-Rolph Trouillot', year: '1995', sourceRef: 'https://www.beacon.org/Silencing-the-Past-P1851.aspx',
      locator: 'Chapter 1, p. 26', evidence: 'Silences enter the making of sources and archives.',
      reason: 'This complicates a claim that an archive is a complete record of the past.', counterevidence: true
    })
  ];
}

function demoBanner(): string {
  if (!demoMode) return '';
  return `<aside class="demo-banner" aria-label="Demo mode"><div><strong>Demo — sample data. Your real workspace stays unchanged.</strong><span>Two research trails are ready to inspect and export.</span></div><div class="demo-actions"><button class="text-button reset-demo" type="button">Reset demo</button><a class="text-button start-real" href="/">Start for real</a></div></aside>`;
}

function paidPanel(): string {
  if (license.unlocked) {
    const submissions = new Set(trails.map((trail) => trail.importedFrom).filter(Boolean)).size;
    return `<section id="instructor" class="instructor unlocked" aria-labelledby="instructor-title">
      <div><p class="eyebrow">Instructor kit · active</p><h2 id="instructor-title">Review imported student submissions</h2>
      <p>Import CSV exports from students. Previewed files stay on this device.</p></div>
      <div class="pulse-grid" aria-label="Local trail overview">
        <div><strong>${trails.length}</strong><span>Total trails</span></div>
        <div><strong>${submissions}</strong><span>Imported submissions</span></div>
        <div><strong>${readyRate(trails)}%</strong><span>Ready to review</span></div>
        <div><strong>${trails.filter((trail) => trail.counterevidence).length}</strong><span>Sources that challenge claims</span></div>
      </div>
      <div class="import-control"><div><h3>Import student CSV files</h3><p>Choose one or more CSV files exported from Claim Source Trail. Duplicates are skipped.</p></div><button class="button primary open-import" type="button">Preview CSV files</button></div>
      <div class="kit-controls">
        <label>Course or assignment label<input id="course-label" value="${esc(settings.courseLabel)}" maxlength="80"></label>
        <label>Automatic local deletion<select id="retention-days">
          ${[[0, 'Never'], [7, 'After 7 days'], [30, 'After 30 days'], [90, 'After 90 days']].map(([value, label]) => `<option value="${value}" ${settings.retentionDays === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select></label>
      </div>
      <p class="microcopy">Retention uses each trail’s last-edited date and runs when this app opens.</p>
    </section>`;
  }
  return `<section id="instructor" class="instructor" aria-labelledby="instructor-title">
    <div><p class="eyebrow">Optional one-time unlock</p><h2 id="instructor-title">Instructor kit — $18 once</h2>
    <p>Import student CSV files, see local totals, label Markdown exports, and set 7/30/90-day deletion. Both student exports remain free.</p></div>
    <div class="purchase-box">
      <a class="button primary" href="${checkoutUrl()}">Buy Instructor kit</a>
      <button class="text-button show-restore" type="button">Restore Instructor kit</button>
      <form id="restore-form" class="restore-form" hidden>
        <label for="license-token">License token</label>
        <div><input id="license-token" name="license" autocomplete="off" required><button class="button" type="submit">Verify license</button></div>
      </form>
      ${license.notice ? `<p class="license-notice" role="status">${esc(license.notice)} <a href="${checkoutUrl()}">View purchase</a></p>` : ''}
      <p class="microcopy">One-time purchase. Checkout opens Sociobot/Dodo. Read <a href="/terms">purchase terms</a>.</p>
    </div>
  </section>`;
}

function editorDialog(): string {
  return `<dialog id="trail-dialog" aria-labelledby="dialog-title">
    <form id="trail-form" method="dialog" novalidate>
      <div class="dialog-head"><div><p class="eyebrow">Evidence builder</p><h2 id="dialog-title">Add a claim trail</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close editor">×</button></div>
      <p class="form-guide">Fields marked “required” must be present to save. Location, excerpt, and explanation can start blank.</p>
      <div id="form-errors" class="form-errors" role="alert" tabindex="-1" hidden></div>
      <fieldset><legend><span>1</span> State the claim</legend>
        <label for="claim">Arguable claim <small>Required</small></label>
        <textarea id="claim" name="claim" rows="3" maxlength="600" required></textarea>
        <p class="hint">One precise idea that needs evidence—not the essay topic.</p>
      </fieldset>
      <fieldset><legend><span>2</span> Name the source</legend>
        <label for="source-title">Source title <small>Required</small></label><input id="source-title" name="sourceTitle" maxlength="300" required>
        <div class="two-columns"><label for="authors">Author(s)<input id="authors" name="authors" maxlength="200"></label><label for="year">Year<input id="year" name="year" inputmode="numeric" maxlength="20"></label></div>
        <label for="source-ref">DOI or URL<input id="source-ref" name="sourceRef" maxlength="500" placeholder="https://… or 10.…" aria-describedby="source-ref-hint"></label>
        <p class="hint" id="source-ref-hint">Optional. Enter a full http(s) URL or a DOI beginning with 10.</p>
      </fieldset>
      <fieldset><legend><span>3</span> Pinpoint the evidence</legend>
        <label for="locator">Exact location<input id="locator" name="locator" maxlength="180" placeholder="p. 42, para. 3 · section ‘Methods’"></label>
        <label for="evidence">Short excerpt or close paraphrase<textarea id="evidence" name="evidence" rows="3" maxlength="1200"></textarea></label>
        <p class="hint">Keep quotations short and respect the source’s access and copyright terms.</p>
      </fieldset>
      <fieldset><legend><span>4</span> Explain the link</legend>
        <label for="reason">Why does this evidence support or complicate the claim?<textarea id="reason" name="reason" rows="4" maxlength="1200"></textarea></label>
        <label class="check-label"><input id="counterevidence" name="counterevidence" type="checkbox"><span><strong>Mark as a source that challenges this claim</strong><small>Use this when the source complicates or challenges the claim.</small></span></label>
      </fieldset>
      <div class="dialog-actions"><button class="text-button close-dialog" type="button">Cancel editing</button><button class="button primary" type="submit">Save trail</button></div>
    </form>
  </dialog>`;
}

function importDialog(): string {
  return `<dialog id="import-dialog" aria-labelledby="import-title">
    <div class="import-sheet">
      <div class="dialog-head"><div><p class="eyebrow">Instructor kit</p><h2 id="import-title">Import student CSV files</h2></div><button class="icon-button close-import" type="button" aria-label="Close import">×</button></div>
      <p id="import-help">Select files students exported with “Export CSV.” Files are read only in this browser.</p>
      <label class="file-picker" for="submission-files">Student CSV files<input id="submission-files" type="file" accept=".csv,text/csv" multiple aria-describedby="import-help"></label>
      <div id="import-preview" class="import-preview" role="status" aria-live="polite"><p>No files selected.</p></div>
      <div class="dialog-actions"><button class="text-button close-import" type="button">Cancel import</button><button class="button primary confirm-import" type="button" disabled>Import new trails</button></div>
    </div>
  </dialog>`;
}

function deleteDialog(): string {
  return `<dialog id="delete-dialog" aria-labelledby="delete-title"><div class="confirm-box">
    <p class="eyebrow">Delete local trail</p><h2 id="delete-title">Delete this claim?</h2><p id="delete-claim"></p>
    <div class="dialog-actions"><button class="text-button cancel-delete" type="button">Cancel deletion</button><button class="button danger confirm-delete" type="button">Delete trail</button></div>
  </div></dialog>`;
}

function homePage(): string {
  return shell(`${demoBanner()}<main id="main">
    <section class="hero">
      <div class="hero-copy"><p class="kicker">Claim → source → location → why it matters</p><h1>Connect each claim to its source.</h1>
      <p class="lead">Undergraduate humanities and social-science students show where evidence supports each claim.</p>
      <div class="button-row"><a class="button primary" href="/?demo=1#workspace">Try it with sample data</a><button class="button add-trail" type="button">Build a claim trail</button><a class="button ghost" href="#how-it-works">See the four steps</a></div>
      <p class="action-note">Opens two sample trails. Your real workspace stays unchanged.</p>
      <ul class="fact-list"><li>Claims stay in this browser.</li><li>Works offline after the first visit.</li><li>Markdown and CSV exports are free.</li></ul></div>
      <figure class="hero-art"><picture><source media="(max-width: 640px)" srcset="/assets/hero-trail-640.webp"><img src="/assets/hero-trail.webp" width="960" height="640" alt="A blank index card connected by a blue paper trail to an open research book and evidence note" fetchpriority="high" decoding="async"></picture><figcaption>Each trail records a claim, source, exact location, and why it matters.</figcaption></figure>
    </section>
    <section id="how-it-works" class="how-it-works" aria-labelledby="how-title"><p class="eyebrow">How it works</p><h2 id="how-title">The four parts of a claim trail</h2><ol>
      <li><span>1</span><strong>Claim</strong><p>Write one idea that needs evidence.</p></li><li><span>2</span><strong>Source</strong><p>Name where the evidence comes from.</p></li><li><span>3</span><strong>Exact location</strong><p>Record the page, section, or paragraph.</p></li><li><span>4</span><strong>Why it matters</strong><p>Explain the connection in your words.</p></li>
    </ol></section>
    <section id="workspace" class="workspace" aria-labelledby="workspace-title">
      <div class="section-head"><div><p class="eyebrow">Private workspace</p><h2 id="workspace-title">Your claim trails</h2><p id="trail-summary">${trails.length ? `${trails.length} ${trails.length === 1 ? 'trail' : 'trails'} · ${readyRate(trails)}% ready to review` : 'No claim trail is stored until you save it.'}</p></div><button class="button primary add-trail" type="button">+ Add claim</button></div>
      ${storageError ? `<div class="error-banner" role="alert"><strong>Local data error.</strong> ${esc(storageError)}<button class="text-button delete-all" type="button">Delete all local data</button></div>` : ''}
      <div class="toolbar" ${trails.length ? '' : 'hidden'}><label for="search-trails">Filter trails by text<input id="search-trails" type="search" placeholder="Search claims or sources"></label><label for="filter-trails">Filter trails by status<select id="filter-trails"><option value="all">All trails</option><option value="ready">Ready to review</option><option value="needs-locator">Missing exact location</option><option value="counter">Sources that challenge claims</option></select></label><div class="export-group"><button class="button export-md" type="button">Export Markdown</button><button class="button export-csv" type="button">Export CSV</button></div></div>
      <div id="filter-note" class="filter-note" role="status"></div>
      <div id="trail-list" class="trail-list">${trails.length ? trails.map(trailCard).join('') : emptyState()}</div>
      ${trails.length && !storageError ? '<button class="text-button delete-all" type="button">Delete all local data</button>' : ''}
    </section>
    ${paidPanel()}
  </main>${editorDialog()}${deleteDialog()}${importDialog()}<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>`, 'home');
}

function render(): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/privacy') { setMetadata('privacy'); app.innerHTML = legalPage('privacy'); }
  else if (path === '/terms') { setMetadata('terms'); app.innerHTML = legalPage('terms'); }
  else { setMetadata(demoMode ? 'demo' : 'home'); app.innerHTML = homePage(); }
  bindGlobalEvents();
}

function focusRoute(): void {
  const heading = document.querySelector<HTMLElement>('main h1');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    const announcer = document.querySelector<HTMLElement>('#route-announcer');
    if (announcer) announcer.textContent = `${document.title.replace(' — Claim Source Trail', '')} page loaded.`;
  });
}

function navigate(url: URL): void {
  history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  render();
  focusRoute();
  if (url.hash) document.querySelector(url.hash)?.scrollIntoView();
}

function isSpaRoute(url: URL): boolean {
  return url.origin === location.origin && ['/', '/privacy', '/terms'].includes(url.pathname) &&
    !(url.pathname === '/' && url.searchParams.get('demo') === '1');
}

function bindGlobalEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.add-trail').forEach((button) => button.addEventListener('click', () => openEditor()));
  document.querySelector('.example-trail')?.addEventListener('click', () => openEditor({
    claim: 'Public memorials shape which histories a community treats as shared.',
    sourceTitle: 'The Uses of Heritage', authors: 'Laurajane Smith', year: '2006', sourceRef: 'https://doi.org/10.4324/9780203602263',
    locator: 'Introduction, pp. 1–3', evidence: 'Heritage is described as a cultural process that produces meaning in the present.',
    reason: 'This reframes a memorial as an active social practice, supporting the claim that it shapes collective historical understanding.', counterevidence: false
  }));
  document.querySelectorAll<HTMLButtonElement>('.edit-trail').forEach((button) => button.addEventListener('click', () => {
    const trail = trails.find((item) => item.id === button.dataset.id);
    if (trail) openEditor(trail);
  }));
  document.querySelectorAll<HTMLButtonElement>('.delete-trail').forEach((button) => button.addEventListener('click', () => openDelete(button.dataset.id!)));
  document.querySelector('.delete-all')?.addEventListener('click', () => {
    const subject = demoMode ? 'all sample data in this demo' : storageError ? 'the unreadable local data' : `all ${trails.length} local claim trails, settings, and this device's Instructor kit license`;
    if (confirm(`Delete ${subject}? This cannot be undone.`)) {
      clearLocalData(demoMode ? 'demo' : undefined); trails = []; settings = loadSettings(storageScope); license = { unlocked: false, notice: '' }; storageError = ''; render(); announce(demoMode ? 'Demo data was deleted.' : 'All local data was deleted.');
    }
  });
  document.querySelector('.reset-demo')?.addEventListener('click', () => {
    clearLocalData('demo'); trails = sampleTrails(); saveTrails(trails, 'demo'); storageError = ''; render(); announce('Demo reset with fresh sample trails.');
  });
  document.querySelector('.start-real')?.addEventListener('click', (event) => {
    event.preventDefault(); clearLocalData('demo'); location.assign('/');
  });
  document.querySelectorAll<HTMLButtonElement>('.close-dialog').forEach((button) => button.addEventListener('click', closeEditor));
  document.querySelector('.cancel-delete')?.addEventListener('click', () => (document.querySelector<HTMLDialogElement>('#delete-dialog')?.close()));
  document.querySelector('.confirm-delete')?.addEventListener('click', confirmDelete);
  const trailForm = document.querySelector<HTMLFormElement>('#trail-form');
  trailForm?.addEventListener('submit', saveEditor);
  trailForm?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      trailForm.requestSubmit();
    }
  });
  document.querySelector('.export-md')?.addEventListener('click', () => download('claim-source-trails.md', toMarkdown(trails, settings.courseLabel), 'text/markdown'));
  document.querySelector('.export-csv')?.addEventListener('click', () => download('claim-source-trails.csv', toCsv(trails), 'text/csv'));
  document.querySelector<HTMLInputElement>('#search-trails')?.addEventListener('input', filterTrails);
  document.querySelector<HTMLSelectElement>('#filter-trails')?.addEventListener('change', filterTrails);
  document.querySelector('.show-restore')?.addEventListener('click', () => {
    const form = document.querySelector<HTMLFormElement>('#restore-form'); if (form) { form.hidden = false; form.querySelector('input')?.focus(); }
  });
  document.querySelector<HTMLFormElement>('#restore-form')?.addEventListener('submit', handleRestore);
  document.querySelector<HTMLInputElement>('#course-label')?.addEventListener('change', saveKitSettings);
  document.querySelector<HTMLSelectElement>('#retention-days')?.addEventListener('change', saveKitSettings);
  document.querySelector('.open-import')?.addEventListener('click', openImport);
  document.querySelectorAll<HTMLButtonElement>('.close-import').forEach((button) => button.addEventListener('click', closeImport));
  document.querySelector<HTMLInputElement>('#submission-files')?.addEventListener('change', previewImports);
  document.querySelector<HTMLButtonElement>('.confirm-import')?.addEventListener('click', confirmImport);
}

function openEditor(prefill?: Partial<Trail>): void {
  const dialog = document.querySelector<HTMLDialogElement>('#trail-dialog');
  const form = document.querySelector<HTMLFormElement>('#trail-form');
  if (!dialog || !form) return;
  previousFocus = document.activeElement as HTMLElement;
  editingId = prefill?.id || null;
  (document.querySelector('#dialog-title') as HTMLElement).textContent = editingId ? 'Edit claim trail' : 'Add a claim trail';
  const fields: Array<keyof Pick<Trail, 'claim' | 'sourceTitle' | 'authors' | 'sourceRef' | 'year' | 'locator' | 'evidence' | 'reason'>> = ['claim', 'sourceTitle', 'authors', 'sourceRef', 'year', 'locator', 'evidence', 'reason'];
  fields.forEach((field) => { const element = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement; element.value = prefill?.[field] || ''; });
  (form.elements.namedItem('counterevidence') as HTMLInputElement).checked = prefill?.counterevidence || false;
  const errors = document.querySelector<HTMLElement>('#form-errors'); if (errors) errors.hidden = true;
  dialog.showModal();
  (form.elements.namedItem('claim') as HTMLElement).focus();
}

function closeEditor(): void {
  document.querySelector<HTMLDialogElement>('#trail-dialog')?.close();
  previousFocus?.focus();
}

function openImport(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#import-dialog');
  if (!dialog) return;
  previousFocus = document.activeElement as HTMLElement;
  pendingImport = null;
  dialog.showModal();
  document.querySelector<HTMLInputElement>('#submission-files')?.focus();
}

function closeImport(): void {
  document.querySelector<HTMLDialogElement>('#import-dialog')?.close();
  pendingImport = null;
  previousFocus?.focus();
}

async function previewImports(): Promise<void> {
  const input = document.querySelector<HTMLInputElement>('#submission-files');
  const preview = document.querySelector<HTMLElement>('#import-preview');
  const confirmButton = document.querySelector<HTMLButtonElement>('.confirm-import');
  if (!input || !preview || !confirmButton) return;
  const files = Array.from(input.files || []);
  if (!files.length) { pendingImport = null; preview.innerHTML = '<p>No files selected.</p>'; confirmButton.disabled = true; return; }
  try {
    pendingImport = previewTrailImports(await Promise.all(files.map(async (file) => ({ name: file.name, text: await file.text() }))), trails);
    const details = pendingImport.files.map((file) => `<li><strong>${esc(file.label)}</strong>: ${file.newCount} new, ${file.duplicateCount} ${file.duplicateCount === 1 ? 'duplicate' : 'duplicates'}, ${file.invalidCount} invalid</li>`).join('');
    preview.innerHTML = `<p><strong>${pendingImport.trails.length} new ${pendingImport.trails.length === 1 ? 'trail' : 'trails'} ready to import.</strong> ${pendingImport.duplicates} ${pendingImport.duplicates === 1 ? 'duplicate was' : 'duplicates were'} skipped.</p><ul>${details}</ul>${pendingImport.invalidRows ? '<p>Invalid rows need a claim and source title. Export them again after fixing those fields.</p>' : ''}`;
    confirmButton.disabled = pendingImport.trails.length === 0;
  } catch {
    pendingImport = null;
    preview.innerHTML = '<p>These files could not be read. Choose CSV files exported from Claim Source Trail.</p>';
    confirmButton.disabled = true;
  }
}

function confirmImport(): void {
  if (!pendingImport?.trails.length) return;
  const imported = pendingImport.trails;
  const importedIds = new Set(imported.map((trail) => trail.id));
  trails = [...imported, ...trails];
  try { saveTrails(trails, storageScope); } catch { announce('Could not import files. Check this browser’s storage settings.'); return; }
  document.querySelector<HTMLDialogElement>('#import-dialog')?.close();
  pendingImport = null;
  render();
  announce(`${imported.length} ${imported.length === 1 ? 'trail' : 'trails'} imported.`, 'Undo import', () => {
    trails = trails.filter((trail) => !importedIds.has(trail.id));
    saveTrails(trails, storageScope);
    render();
    announce('Import removed.');
  });
}

function saveEditor(event: SubmitEvent): void {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const claim = String(data.get('claim') || '').trim();
  const sourceTitle = String(data.get('sourceTitle') || '').trim();
  const sourceRef = String(data.get('sourceRef') || '').trim();
  const errors: string[] = [];
  if (!claim) errors.push('Write the claim you want to connect.');
  if (!sourceTitle) errors.push('Name the source title.');
  if (sourceRef && !sourceHref(sourceRef)) errors.push('Enter a full http(s) URL or a DOI beginning with 10.');
  const errorBox = document.querySelector<HTMLElement>('#form-errors')!;
  const sourceRefInput = form.elements.namedItem('sourceRef') as HTMLInputElement;
  sourceRefInput.setAttribute('aria-invalid', sourceRef && !sourceHref(sourceRef) ? 'true' : 'false');
  if (errors.length) { errorBox.innerHTML = `<strong>Fix ${errors.length === 1 ? 'this item' : 'these items'}:</strong><ul>${errors.map((error) => `<li>${error}</li>`).join('')}</ul>`; errorBox.hidden = false; sourceRefInput.setAttribute('aria-describedby', 'source-ref-hint form-errors'); errorBox.focus(); return; }
  const values = {
    claim, sourceTitle, authors: String(data.get('authors') || '').trim(), sourceRef,
    year: String(data.get('year') || '').trim(), locator: String(data.get('locator') || '').trim(), evidence: String(data.get('evidence') || '').trim(),
    reason: String(data.get('reason') || '').trim(), counterevidence: data.get('counterevidence') === 'on'
  };
  if (editingId) trails = trails.map((trail) => trail.id === editingId ? { ...trail, ...values, updatedAt: new Date().toISOString() } : trail);
  else trails = [createTrail(values), ...trails];
  try { saveTrails(trails, storageScope); } catch { announce('Could not save. Check this browser’s storage settings.'); return; }
  closeEditor(); render(); announce(editingId ? 'Trail updated.' : 'Trail saved locally.');
}

function openDelete(id: string): void {
  const trail = trails.find((item) => item.id === id); if (!trail) return;
  deletedTrail = trail;
  const dialog = document.querySelector<HTMLDialogElement>('#delete-dialog')!;
  document.querySelector('#delete-claim')!.textContent = `“${trail.claim}”`;
  dialog.showModal(); (dialog.querySelector('.cancel-delete') as HTMLElement).focus();
}

function confirmDelete(): void {
  if (!deletedTrail) return;
  const removed = deletedTrail;
  trails = trails.filter((trail) => trail.id !== removed.id); saveTrails(trails, storageScope);
  document.querySelector<HTMLDialogElement>('#delete-dialog')?.close(); render();
  announce('Trail deleted.', 'Undo', () => { trails = [removed, ...trails]; saveTrails(trails, storageScope); render(); announce('Trail restored.'); });
  deletedTrail = null;
}

function filterTrails(): void {
  const query = document.querySelector<HTMLInputElement>('#search-trails')?.value.toLowerCase().trim() || '';
  const filter = document.querySelector<HTMLSelectElement>('#filter-trails')?.value || 'all';
  let visible = trails.filter((trail) => [trail.claim, trail.sourceTitle, trail.authors, trail.locator].join(' ').toLowerCase().includes(query));
  visible = visible.filter((trail) => filter === 'all' || (filter === 'counter' ? trail.counterevidence : trailStatus(trail) === filter));
  document.querySelector('#trail-list')!.innerHTML = visible.length ? visible.map(trailCard).join('') : `<div class="no-results"><strong>No trails match.</strong><p>Try a different search or filter.</p></div>`;
  document.querySelector('#filter-note')!.textContent = query || filter !== 'all' ? `${visible.length} of ${trails.length} trails shown` : '';
  document.querySelectorAll<HTMLButtonElement>('.edit-trail').forEach((button) => button.addEventListener('click', () => { const trail = trails.find((item) => item.id === button.dataset.id); if (trail) openEditor(trail); }));
  document.querySelectorAll<HTMLButtonElement>('.delete-trail').forEach((button) => button.addEventListener('click', () => openDelete(button.dataset.id!)));
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
  announce(`${name} exported.`);
}

function announce(message: string, action?: string, callback?: () => void): void {
  const toast = document.querySelector<HTMLElement>('#toast'); if (!toast) return;
  window.clearTimeout(undoTimer); toast.replaceChildren(document.createTextNode(message));
  if (action && callback) { const button = document.createElement('button'); button.className = 'text-button'; button.textContent = action; button.addEventListener('click', callback, { once: true }); toast.append(button); }
  toast.hidden = false; undoTimer = window.setTimeout(() => { toast.hidden = true; }, 10_000);
}

async function handleRestore(event: SubmitEvent): Promise<void> {
  event.preventDefault(); const input = (event.currentTarget as HTMLFormElement).elements.namedItem('license') as HTMLInputElement;
  if (!input.value.trim()) return; restoreLicense(input.value); license = { unlocked: false, notice: 'Checking license…' }; render();
  license = await verifyLicense(true); render();
}

function saveKitSettings(): void {
  settings = {
    courseLabel: document.querySelector<HTMLInputElement>('#course-label')?.value.trim() || '',
    retentionDays: Number(document.querySelector<HTMLSelectElement>('#retention-days')?.value || 0)
  };
  saveSettings(settings, storageScope); announce('Instructor settings saved locally.');
}

function updateOnlineState(event?: Event): void {
  let banner = document.querySelector<HTMLElement>('#offline-banner');
  const isOffline = event?.type === 'offline' || !navigator.onLine;
  if (isOffline && !banner) { banner = document.createElement('div'); banner.id = 'offline-banner'; banner.className = 'offline-banner'; banner.setAttribute('role', 'status'); banner.textContent = 'Offline — your local workspace and exports still work.'; document.body.prepend(banner); }
  if (!isOffline) banner?.remove();
}

render();
updateOnlineState();
window.addEventListener('online', updateOnlineState);
window.addEventListener('offline', updateOnlineState);
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (!isSpaRoute(url) || (url.pathname === location.pathname && url.search === location.search && url.hash)) return;
  event.preventDefault();
  navigate(url);
});
window.addEventListener('popstate', () => {
  render();
  focusRoute();
});

if (!demoMode && license.unlocked && settings.retentionDays) {
  const retained = applyRetention(trails, settings.retentionDays);
  if (retained.length !== trails.length) { const count = trails.length - retained.length; trails = retained; saveTrails(trails, storageScope); render(); announce(`${count} expired local ${count === 1 ? 'trail was' : 'trails were'} deleted by your retention setting.`); }
}

if (!demoMode && localStorage.getItem('claim-source-trail:page-counted') !== new Date().toISOString().slice(0, 10)) {
  fetch('/api/page-view', { method: 'POST', keepalive: true }).then((response) => {
    if (response.ok) localStorage.setItem('claim-source-trail:page-counted', new Date().toISOString().slice(0, 10));
  }).catch(() => undefined);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);

if (!demoMode && localStorage.getItem('sb_license:claim-source-trail')) {
  verifyLicense(capturedLicense).then((state) => { license = state; if ((location.pathname.replace(/\/$/, '') || '/') === '/') render(); });
}
