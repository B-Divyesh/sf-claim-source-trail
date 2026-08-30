# Independent verification 6 — FAIL

Date: 2026-08-30

Work order: `claim-source-trail-verify-6`

Candidate: `c709786370872367a56b68ecce4e36f6363fa6be`

Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL — do not accept candidate `c709786370872367a56b68ecce4e36f6363fa6be`.**

The live product is the exact candidate and the free local-first workflow is
usable, fast, accessible, private in the observed flows, and available
offline. The release still has blocking fresh failures: the paid checkout
claim returns 503, one exact claim test times out from the cold checkout, and
several public promises have no corresponding entry/test in
`.factory/claims.json`. The reported billing failure is therefore still
present; it is not a stale deployment mismatch.

No product code was modified during this verification.

## Mandatory first-read gate — PASS

Cold desktop and 390 px loads both show:

- What it does: **“Make every claim traceable.”** The screen explains the
  claim → source → location → reasoning chain.
- Who it is for: **“Undergraduate humanities and social-science students…”**
- What to click first: **“Try it with sample data”**, followed by “Loads two
  sample trails. Nothing is saved.”

One click opened `/?demo=1#workspace`, displayed the persistent “Demo — sample
data, nothing is saved” banner, and rendered two complete sample trails.

## P1 release blockers

### P1 — paid checkout claim fails consistently

The required `@claim:paid-checkout` test failed on desktop and 390 px locally
and against the live candidate. It expected HTTP 303 to Dodo and received HTTP
503. `npm run test:billing` independently failed because the Sociobot product
catalogue also returned 503.

Three fresh direct checkout requests returned 503 with no `Location` or
`Retry-After`. The product-scoped license-verification endpoint also returned
503. A crawl found the checkout is the only broken first-party/product link.
The $18 Instructor kit cannot be purchased or freshly verified, and the
external endpoint's required rate-limit behavior cannot be observed while it
is unavailable.

### P1 — an exact claim command fails from the cold checkout

After `npm ci`, every exact command in `.factory/claims.json` was run
separately. The first command, `npm run test:e2e -- --grep
@claim:free-exports`, timed out waiting 240 seconds for Playwright's web server
while the cold Rust release build was still compiling. A warm rerun passed
2/2, proving the export behavior but not the required clean-command contract.

| Claim | Cold exact result | Evidence |
| --- | --- | --- |
| `free-exports` | **FAIL** | web-server timeout at 240,000 ms; warm rerun 2/2 passed |
| `demo-isolated` | PASS | 2/2 desktop/mobile |
| `local-content` | PASS | 2/2 desktop/mobile |
| `no-account` | PASS | 2/2 desktop/mobile |
| `offline-reload` | PASS | 2/2 desktop/mobile |
| `paid-checkout` | **FAIL** | 2/2 failed: expected 303, received 503 |

The pre-install `@playwright/test` errors are not counted here; this table is
the post-`npm ci` run.

### P1 — public claims are missing from the claims manifest

The landing page and README make functional/privacy promises not represented
by any `.factory/claims.json` entry, contrary to the claims contract. Concrete
examples:

- The paid panel promises a cohort pulse, course labels in Markdown, and
  automatic 7/30/90-day retention. `paid-checkout` tests only a redirect.
- README says exports continue offline. `offline-reload` checks that the shell,
  sample, and notice render; it never performs an offline export.
- Privacy/README say the backend receives no claim content and persists only a
  date and aggregate count. Repository tests partially support this, but the
  promise is not listed/tagged as a claim.

Any unlisted claim is release-blocking under the supplied acceptance contract.

## P2 defects

### P2 — source-reference validation and sample integrity

Entering `this is not a DOI or URL` in the field labeled “DOI or URL” saves
without an error and renders a link whose `href` is `#`. The app therefore
accepts an unusable source reference without telling the student how to fix
it. Required-field validation does work and recovery succeeds.

The shipped counterevidence sample compounds this issue:
`https://doi.org/10.2307/j.ctv125j7k8` returns DOI.org's HTTP 404 “DOI Not
Found.” A one-click teaching demo should not model a dead source trail.

### P2 — no real 404 route

`/definitely-not-a-route` returns HTTP 200 and renders the normal home page
with its normal title. There is no designed not-found page or way to
distinguish an invalid route, despite the mandatory site-structure contract.

## P3 metadata gaps

- The Open Graph/Twitter image is the 960×640 hero, not the required 1200×630
  social image.
- There is no 180 px Apple touch icon.
- `/privacy`, `/terms`, and demo update the document title but retain the root
  canonical/social metadata.

## Passing evidence

### Clean repository gates

- Candidate and clean starting HEAD:
  `c709786370872367a56b68ecce4e36f6363fa6be`.
- `npm ci`: 213 packages installed; 0 vulnerabilities.
- `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities.
- `npm test`: PASS — 11/11 Vitest tests and 6/6 Rust tests; binary/doc targets
  also passed.
- `npm run build`: PASS — `tsc --noEmit`, Vite production build, and
  `cargo build --release`; `dist/` exists.
- `cargo fmt --check`: PASS.
- `cargo clippy --all-targets --all-features -- -D warnings`: PASS.
- Full local Playwright: 32/34 passed; only the two paid-checkout projects
  failed with 503.
- Full live Playwright: 32/34 passed with the same isolated checkout failures.
- Docker could not be built locally because this worker has no Docker client.

### End-to-end behavior and recovery

The passing desktop and 390 px runs cover real no-account creation, incomplete
and complete trails, counterevidence, edit, search/filter layout, Markdown and
CSV downloads, demo isolation/reset/exit, maximum-length values, delete-all,
corrupt-storage recovery, and legal routes. An independent empty-submit check
focused the announced alert and said exactly which two required fields to fix;
filling them then saved normally.

### Accessibility and responsive behavior

- Factory `verify-url.sh`: PASS in 626 ms; title, `lang=en`, one h1, main,
  image alt text, button names, and zero console/page errors.
- Axe: zero serious/critical findings on live desktop and 390 px home/editor,
  saved counterevidence, and an independently exercised demo state.
- Keyboard: first Tab exposes “Skip to main content” with a visible 4 px yellow
  focus outline; Enter/Escape dialog behavior and focus return pass; Ctrl/Meta
  + Enter saves.
- Reduced motion computes animation and transition durations as `0.00001s`.
- At 390 px, document width equals viewport width, including long boundary
  values. Touch-target regression tests pass.
- Full-page desktop/mobile captures were visually inspected; no clipped
  controls or horizontal overflow were found.

### Privacy, headers, PWA, and links

- A Playwright request log spanning cold load, demo entry, edit, invalid
  submit, recovery, and save contained only the product origin. The only
  non-GET was the documented bodyless `POST /api/page-view`. There were no
  console errors, page errors, or failed responses in that flow.
- Root, health, privacy, terms, worker, robots, sitemap, JS, and CSS return 200.
  HTTP redirects permanently to HTTPS.
- Responses include CSP, HSTS, `nosniff`, `DENY` frame policy, strict referrer
  policy, and restrictive Permissions-Policy. Documents/workers use
  `no-cache`; hashed assets/fonts use one-year immutable caching.
- Service-worker update tests pass with one active root-scoped worker and no
  waiting worker. A fresh context reloads the demo offline with both samples
  and the offline notice.

### Performance and build identity

- Live `/health` returns
  `{"status":"ok","build":"c709786370872367a56b68ecce4e36f6363fa6be"}`.
- Live/local hashes match exactly:
  - JS: `61f3da5bff0f23061c86ecfef15da94033db7dea2c8c46226689c458276f51b9`
  - CSS: `8d63bab25cc4a01e1f23b53524742150935c87e6903d126cf470eca3316373cd`
- Initial JS: 29,577 B raw / 10,088 B gzip; CSS: 15,594 B raw / 4,136 B
  gzip; fonts: 34,732 B; mobile hero: 31,994 B. All budgets pass.
- Fresh live mobile Lighthouse: performance 100, accessibility 100, best
  practices 100, SEO 100; LCP 1.680 s, CLS 0, TBT 0 ms.

### Backend behavior

- Live 180-request concurrent page-view burst from one forwarded client:
  120×204 and 60×429, every 429 with `Retry-After: 0`. The code configures a
  40-request burst per process; the live result is consistent with three
  replicas. A separate first-hop client was accepted with 204.
- The Rust integration test consumes one client's 40-token local allowance,
  proves the first `X-Forwarded-For` hop is the key, checks `Retry-After`, and
  proves a separate client remains accepted.
- The release binary started twice with an empty environment plus only
  `PORT=18081`. Its SQLite file persisted five writes across restart and then
  held six; the only columns are `day:TEXT,count:INTEGER`.
- A concurrent local `/health` smoke returned 500/500 HTTP 200 in 1.281 s.

## Required next steps

1. Restore the Sociobot catalogue, checkout, and verify endpoints; require the
   checkout test and external allowance check to pass before release.
2. Make the first exact claim invocation reliable from a cold Rust/npm cache,
   for example by increasing the Playwright server timeout or prebuilding in a
   declared setup step.
3. Add tagged manifest claims for every public functional/privacy promise, and
   test the promised outcome (including an actual offline export and paid
   feature behavior).
4. Validate DOI/URL input and replace the dead sample DOI with a resolvable
   source.
5. Add a real 404 route and complete route-specific/social metadata.
