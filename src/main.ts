import './style.css';
import {
  createTrail, readyRate, statusLabel, toCsv, toMarkdown, trailStatus, type Trail, type TrailStatus
} from './model';
import {
  applyRetention, clearLocalData, loadSettings, loadTrails, saveSettings, saveTrails, type Settings
} from './storage';
import {
  cachedLicenseState, captureLicenseFromUrl, checkoutUrl, restoreLicense, verifyLicense, type LicenseState
} from './license';

const app = document.querySelector<HTMLDivElement>('#app')!;
let trails: Trail[] = [];
let settings: Settings = loadSettings();
let license: LicenseState = cachedLicenseState();
let storageError = '';
let editingId: string | null = null;
let deletedTrail: Trail | null = null;
let undoTimer = 0;
let previousFocus: HTMLElement | null = null;

try {
  trails = loadTrails();
} catch {
  storageError = 'Your saved trails could not be read. Delete the unreadable local data below, then start again.';
}

const capturedLicense = captureLicenseFromUrl();
if (capturedLicense) license = { unlocked: false, notice: 'Checking your new license…' };

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]!);
}

function shell(content: string, page: 'home' | 'privacy' | 'terms'): string {
  return `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Claim Source Trail home">
        <span class="trail-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        Claim Source Trail
      </a>
      <nav aria-label="Primary navigation">
        ${page === 'home' ? '<a href="#workspace">Workspace</a><a href="#instructor">Instructor kit</a>' : '<a href="/">Workspace</a>'}
        <a href="/privacy" ${page === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a>
      </nav>
    </header>
    ${content}
    <footer>
      <div><strong>Claim Source Trail</strong><br><span>Reasoning practice, not truth verification.</span></div>
      <nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      <p>Hero art generated for this product with Azure OpenAI. No student work is sent to an AI model.</p>
    </footer>`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const isPrivacy = kind === 'privacy';
  const content = isPrivacy ? `
    <p class="kicker">Plain-language policy</p>
    <h1>Privacy, by design</h1>
    <p class="legal-lead">Your claims, sources, excerpts, and notes stay in this browser. We cannot read them.</p>
    <h2>What is stored</h2>
    <p>Your trail cards and Instructor kit settings use local browser storage. A pasted license token is also stored locally and sent only to Sociobot’s billing API to check whether the unlock is active.</p>
    <h2>What reaches our server</h2>
    <p>On a visit, the app sends one anonymous page-count event. The server stores only a date and a total count—no IP address, user agent, source text, or persistent visitor identifier. Normal short-lived infrastructure logs may exist for security and reliability.</p>
    <h2>Delete your data</h2>
    <p>Use “Delete all local data” in the workspace. You can also clear this site’s storage in your browser. Either action is immediate and cannot be undone.</p>
    <h2>Publisher material</h2>
    <p>Record only the excerpts you are permitted to use. This tool does not fetch, scrape, or redistribute publisher content.</p>
  ` : `
    <p class="kicker">Fair-use terms</p>
    <h1>Terms of use</h1>
    <p class="legal-lead">Use Claim Source Trail to practice evidence reasoning—not to outsource judgment.</p>
    <h2>The service</h2>
    <p>The free workspace stores claim trails locally and includes Markdown and CSV export. It does not verify whether a claim is true, guarantee citation accuracy, or replace your instructor’s requirements.</p>
    <h2>Instructor kit purchase</h2>
    <p>The Instructor kit costs $18 as a one-time purchase and unlocks the classroom overview, course label, and automatic local retention settings for the current product. Sociobot/Dodo is the merchant of record and handles checkout and refunds. A refund revokes the license.</p>
    <h2>Your responsibilities</h2>
    <p>You are responsible for checking sources, respecting copyright and access terms, protecting exported files, and following your institution’s academic-integrity policies.</p>
    <h2>Availability</h2>
    <p>The service is provided “as is” without a promise of uninterrupted availability. Export important work regularly. These terms are governed by applicable law.</p>
  `;
  return shell(`<main id="main" class="legal-page">${content}<p><a class="text-link" href="/">← Return to workspace</a></p></main>`, kind);
}

function statusClass(status: TrailStatus): string {
  return status === 'ready' ? 'complete' : status === 'draft' ? 'draft' : 'attention';
}

function trailCard(trail: Trail): string {
  const status = trailStatus(trail);
  const source = [trail.authors, trail.sourceTitle, trail.year].filter(Boolean).join(' · ');
  return `<article class="trail-card" data-id="${trail.id}">
    <div class="card-topline">
      <span class="status ${statusClass(status)}"><span aria-hidden="true">${status === 'ready' ? '✓' : '!'}</span> ${statusLabel(status)}</span>
      <span class="stance ${trail.counterevidence ? 'counter' : ''}">${trail.counterevidence ? '↯ Counterevidence' : '→ Supporting evidence'}</span>
    </div>
    <h3>${esc(trail.claim)}</h3>
    <dl class="trail-steps">
      <div><dt><span>2</span> Source</dt><dd>${esc(source || trail.sourceRef)}</dd>${trail.sourceRef ? `<dd><a href="${safeHref(trail.sourceRef)}" target="_blank" rel="noopener noreferrer">${esc(trail.sourceRef)}</a></dd>` : ''}</div>
      <div><dt><span>3</span> Exact location</dt><dd>${esc(trail.locator) || '<em>Not recorded yet</em>'}</dd></div>
      <div><dt><span>3b</span> Excerpt / paraphrase</dt><dd>${esc(trail.evidence) || '<em>Not recorded yet</em>'}</dd></div>
      <div><dt><span>4</span> Why it supports the claim</dt><dd>${esc(trail.reason) || '<em>Not recorded yet</em>'}</dd></div>
    </dl>
    <div class="card-actions">
      <button class="button small edit-trail" type="button" data-id="${trail.id}">Edit trail</button>
      <button class="text-button delete-trail" type="button" data-id="${trail.id}">Delete</button>
      <time datetime="${trail.updatedAt}">Updated ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(trail.updatedAt))}</time>
    </div>
  </article>`;
}

function safeHref(ref: string): string {
  const value = ref.trim();
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? esc(url.href) : '#';
  } catch {
    const doi = value.replace(/^doi:\s*/i, '');
    return /^10\.\d{4,9}\/.+/.test(doi) ? `https://doi.org/${encodeURIComponent(doi)}` : '#';
  }
}

function emptyState(): string {
  return `<section class="empty-state" aria-labelledby="empty-title">
    <div class="empty-numeral" aria-hidden="true">01</div>
    <div><h3 id="empty-title">Start with one arguable claim</h3>
    <p>Attach the exact place in a source—not only the source itself—then explain the connection in your own words.</p>
    <div class="button-row"><button class="button primary add-trail" type="button">Add your first claim</button><button class="text-button example-trail" type="button">Open a worked example</button></div></div>
  </section>`;
}

function paidPanel(): string {
  if (license.unlocked) {
    return `<section id="instructor" class="instructor unlocked" aria-labelledby="instructor-title">
      <div><p class="eyebrow">Instructor kit · unlocked</p><h2 id="instructor-title">Make the trail visible at cohort scale</h2>
      <p>This overview is calculated on this device. No student work is uploaded.</p></div>
      <div class="pulse-grid" aria-label="Local trail overview">
        <div><strong>${trails.length}</strong><span>Total trails</span></div>
        <div><strong>${readyRate(trails)}%</strong><span>Ready to spot-check</span></div>
        <div><strong>${trails.filter((trail) => trail.counterevidence).length}</strong><span>Counterevidence</span></div>
      </div>
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
    <p>Unlock a local cohort pulse, course labels on Markdown exports, and automatic 7/30/90-day retention. The complete student workspace and both exports remain free.</p></div>
    <div class="purchase-box">
      <a class="button primary" href="${checkoutUrl()}">Buy Instructor kit</a>
      <button class="text-button show-restore" type="button">Have a license? Restore it</button>
      <form id="restore-form" class="restore-form" hidden>
        <label for="license-token">License token</label>
        <div><input id="license-token" name="license" autocomplete="off" required><button class="button" type="submit">Verify license</button></div>
      </form>
      ${license.notice ? `<p class="license-notice" role="status">${esc(license.notice)} <a href="${checkoutUrl()}">View purchase</a></p>` : ''}
      <p class="microcopy">One-time purchase. Checkout and refunds are handled by Sociobot/Dodo. See <a href="/terms">terms</a>.</p>
    </div>
  </section>`;
}

function editorDialog(): string {
  return `<dialog id="trail-dialog" aria-labelledby="dialog-title">
    <form id="trail-form" method="dialog" novalidate>
      <div class="dialog-head"><div><p class="eyebrow">Evidence builder</p><h2 id="dialog-title">Add a claim trail</h2></div><button class="icon-button close-dialog" type="button" aria-label="Close editor">×</button></div>
      <p class="form-guide">Fields marked “required” must be present to save. Locator, excerpt, and reasoning can begin as a draft, but the trail will show what is missing.</p>
      <div id="form-errors" class="form-errors" role="alert" tabindex="-1" hidden></div>
      <fieldset><legend><span>1</span> State the claim</legend>
        <label for="claim">Arguable claim <small>Required</small></label>
        <textarea id="claim" name="claim" rows="3" maxlength="600" required></textarea>
        <p class="hint">One precise idea that needs evidence—not the essay topic.</p>
      </fieldset>
      <fieldset><legend><span>2</span> Name the source</legend>
        <label for="source-title">Source title <small>Required</small></label><input id="source-title" name="sourceTitle" maxlength="300" required>
        <div class="two-columns"><label for="authors">Author(s)<input id="authors" name="authors" maxlength="200"></label><label for="year">Year<input id="year" name="year" inputmode="numeric" maxlength="20"></label></div>
        <label for="source-ref">DOI or URL<input id="source-ref" name="sourceRef" maxlength="500" placeholder="https://… or 10.…"></label>
      </fieldset>
      <fieldset><legend><span>3</span> Pinpoint the evidence</legend>
        <label for="locator">Exact locator<input id="locator" name="locator" maxlength="180" placeholder="p. 42, para. 3 · section ‘Methods’"></label>
        <label for="evidence">Short excerpt or close paraphrase<textarea id="evidence" name="evidence" rows="3" maxlength="1200"></textarea></label>
        <p class="hint">Keep quotations short and respect the source’s access and copyright terms.</p>
      </fieldset>
      <fieldset><legend><span>4</span> Explain the link</legend>
        <label for="reason">Why does this evidence support or complicate the claim?<textarea id="reason" name="reason" rows="4" maxlength="1200"></textarea></label>
        <label class="check-label"><input id="counterevidence" name="counterevidence" type="checkbox"><span><strong>Mark as counterevidence</strong><small>This source complicates or challenges the claim.</small></span></label>
      </fieldset>
      <div class="dialog-actions"><button class="text-button close-dialog" type="button">Cancel</button><button class="button primary" type="submit">Save trail</button></div>
    </form>
  </dialog>`;
}

function deleteDialog(): string {
  return `<dialog id="delete-dialog" aria-labelledby="delete-title"><div class="confirm-box">
    <p class="eyebrow">Delete local trail</p><h2 id="delete-title">Delete this claim?</h2><p id="delete-claim"></p>
    <div class="dialog-actions"><button class="text-button cancel-delete" type="button">Keep it</button><button class="button danger confirm-delete" type="button">Delete trail</button></div>
  </div></dialog>`;
}

function homePage(): string {
  return shell(`<main id="main">
    <section class="hero">
      <div class="hero-copy"><p class="kicker">Claim → source → location → reasoning</p><h1>Make every claim traceable.</h1>
      <p class="lead">Build a compact evidence trail your reader—or instructor—can actually check. Your work stays in this browser.</p>
      <div class="button-row"><button class="button primary add-trail" type="button">Build a claim trail</button><a class="button ghost" href="#how-it-works">See the four steps</a></div>
      <p class="privacy-note"><span aria-hidden="true">●</span> Local-first · no account · free Markdown & CSV export</p></div>
      <figure class="hero-art"><picture><source media="(max-width: 640px)" srcset="/assets/hero-trail-640.webp"><img src="/assets/hero-trail.webp" width="960" height="640" alt="A blank index card connected by a blue paper trail to an open research book and evidence note" fetchpriority="high" decoding="async"></picture><figcaption>Follow the blue trail: claim, source, location, reason.</figcaption></figure>
    </section>
    <section id="how-it-works" class="how-it-works" aria-labelledby="how-title"><p class="eyebrow">The reasoning chain</p><h2 id="how-title">A citation is only one link.</h2><ol>
      <li><span>1</span><strong>Claim</strong><p>Write one idea that needs evidence.</p></li><li><span>2</span><strong>Source</strong><p>Name where the evidence comes from.</p></li><li><span>3</span><strong>Exact place</strong><p>Record the page, section, or paragraph.</p></li><li><span>4</span><strong>Reason</strong><p>Explain the connection in your words.</p></li>
    </ol></section>
    <section id="workspace" class="workspace" aria-labelledby="workspace-title">
      <div class="section-head"><div><p class="eyebrow">Private workspace</p><h2 id="workspace-title">Your claim trails</h2><p id="trail-summary">${trails.length ? `${trails.length} ${trails.length === 1 ? 'trail' : 'trails'} · ${readyRate(trails)}% ready to spot-check` : 'Nothing is stored until you save a trail.'}</p></div><button class="button primary add-trail" type="button">+ Add claim</button></div>
      ${storageError ? `<div class="error-banner" role="alert"><strong>Local data error.</strong> ${esc(storageError)}<button class="text-button delete-all" type="button">Delete all local data</button></div>` : ''}
      <div class="toolbar" ${trails.length ? '' : 'hidden'}><label for="search-trails">Search trails<input id="search-trails" type="search" placeholder="Search claims or sources"></label><label for="filter-trails">Show<select id="filter-trails"><option value="all">All trails</option><option value="ready">Ready to spot-check</option><option value="needs-locator">Missing locator</option><option value="counter">Counterevidence</option></select></label><div class="export-group"><button class="button export-md" type="button">Export Markdown</button><button class="button export-csv" type="button">Export CSV</button></div></div>
      <div id="filter-note" class="filter-note" role="status"></div>
      <div id="trail-list" class="trail-list">${trails.length ? trails.map(trailCard).join('') : emptyState()}</div>
      ${trails.length && !storageError ? '<button class="text-button delete-all" type="button">Delete all local data</button>' : ''}
    </section>
    ${paidPanel()}
  </main>${editorDialog()}${deleteDialog()}<div id="toast" class="toast" role="status" aria-live="polite" hidden></div>`, 'home');
}

function render(): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/privacy') app.innerHTML = legalPage('privacy');
  else if (path === '/terms') app.innerHTML = legalPage('terms');
  else app.innerHTML = homePage();
  bindGlobalEvents();
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
    const subject = storageError ? 'the unreadable local data' : `all ${trails.length} local claim trails, settings, and this device's Instructor kit license`;
    if (confirm(`Delete ${subject}? This cannot be undone.`)) {
      clearLocalData(); trails = []; settings = loadSettings(); license = { unlocked: false, notice: '' }; storageError = ''; render(); announce('All local data was deleted.');
    }
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

function saveEditor(event: SubmitEvent): void {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const claim = String(data.get('claim') || '').trim();
  const sourceTitle = String(data.get('sourceTitle') || '').trim();
  const errors: string[] = [];
  if (!claim) errors.push('Write the claim you want to connect.');
  if (!sourceTitle) errors.push('Name the source title.');
  const errorBox = document.querySelector<HTMLElement>('#form-errors')!;
  if (errors.length) { errorBox.innerHTML = `<strong>Fix ${errors.length === 1 ? 'this item' : 'these items'}:</strong><ul>${errors.map((error) => `<li>${error}</li>`).join('')}</ul>`; errorBox.hidden = false; errorBox.focus(); return; }
  const values = {
    claim, sourceTitle, authors: String(data.get('authors') || '').trim(), sourceRef: String(data.get('sourceRef') || '').trim(),
    year: String(data.get('year') || '').trim(), locator: String(data.get('locator') || '').trim(), evidence: String(data.get('evidence') || '').trim(),
    reason: String(data.get('reason') || '').trim(), counterevidence: data.get('counterevidence') === 'on'
  };
  if (editingId) trails = trails.map((trail) => trail.id === editingId ? { ...trail, ...values, updatedAt: new Date().toISOString() } : trail);
  else trails = [createTrail(values), ...trails];
  try { saveTrails(trails); } catch { announce('Could not save. Check this browser’s storage settings.'); return; }
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
  trails = trails.filter((trail) => trail.id !== removed.id); saveTrails(trails);
  document.querySelector<HTMLDialogElement>('#delete-dialog')?.close(); render();
  announce('Trail deleted.', 'Undo', () => { trails = [removed, ...trails]; saveTrails(trails); render(); announce('Trail restored.'); });
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
  saveSettings(settings); announce('Instructor settings saved locally.');
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

if (license.unlocked && settings.retentionDays) {
  const retained = applyRetention(trails, settings.retentionDays);
  if (retained.length !== trails.length) { const count = trails.length - retained.length; trails = retained; saveTrails(trails); render(); announce(`${count} expired local ${count === 1 ? 'trail was' : 'trails were'} deleted by your retention setting.`); }
}

if (localStorage.getItem('claim-source-trail:page-counted') !== new Date().toISOString().slice(0, 10)) {
  fetch('/api/page-view', { method: 'POST', keepalive: true }).then((response) => {
    if (response.ok) localStorage.setItem('claim-source-trail:page-counted', new Date().toISOString().slice(0, 10));
  }).catch(() => undefined);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);

if (localStorage.getItem('sb_license:claim-source-trail')) {
  verifyLicense(capturedLicense).then((state) => { license = state; if ((location.pathname.replace(/\/$/, '') || '/') === '/') render(); });
}
