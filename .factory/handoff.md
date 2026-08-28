# Claim Source Trail — build handoff

## Repair 2 — 2026-08-28

**PASS — the release-blocking findings in independent verifier report commit
`4c92b7b757292269f7154b103cdfd7c8732625d0` are repaired and deployed.**
The deployed application source commit is
`0223ccea4f0b3a2f501593e9f416877499b719d8` (`fix: clear all local data and
restore contrast`). The original local-first workflow, Rust/Axum container
artifact class, paid-license contract, and researched brief are unchanged.

### Repairs

- **P1 privacy/deletion:** “Delete all local data” now removes every
  product-owned localStorage namespace: saved trails/settings, the daily
  page-count marker, `sb_license:claim-source-trail`, and its cached verdict.
  It also clears the in-memory Instructor kit state immediately. A completed
  billing verification cannot recreate a verdict if deletion (or token
  replacement) happened while the request was in flight.
- **P1 accessibility:** counterevidence uses `#BD3D2A` rather than `#D94F36`.
  White label text is now **5.44:1**, and the design thesis records the
  measured contrast.
- **P3 font caching:** versioned self-hosted font URLs are preloaded and served
  with `Cache-Control: public, max-age=31536000, immutable`; this also removes
  the first-load font-swap layout shift found during repair QA.

### Exact regression coverage

- Storage unit test seeds trail/settings, license token, cached verdict, and
  page marker; it proves complete product-key deletion while retaining an
  unrelated product key.
- License unit test proves a verification response in flight cannot restore a
  deleted verdict.
- The Playwright suite saves a real counterevidence card and runs axe against
  that persisted card, then tests the native-confirmed “Delete all local data”
  action in both desktop and 390px projects and asserts no product-owned keys
  remain.
- Rust integration test verifies versioned WOFF2 delivery gets immutable
  caching.

### Fresh verification

| Check | Result |
| --- | --- |
| Clean install / dependency audit | `npm ci` completed; `npm audit --omit=dev` found 0 vulnerabilities. |
| Unit + integration | `npm test`: Vitest **3 files / 10 tests**; Rust **5 tests** plus doc tests, all passed. |
| Type / production build | `npm run build` passed `tsc --noEmit`, Vite, and Cargo release. |
| Bundle budgets | JS **26.87 KB raw / 9.38 KB gzip**; CSS **14.64 KB raw / 3.97 KB gzip**; fonts **34.73 KB**; mobile hero **31.99 KB** — all within budget. |
| Browser / keyboard / offline / update | `BASE_URL=http://127.0.0.1:18080 npm run test:e2e`: **14/14** passed across desktop and 390×844 mobile, including create/edit/export, native delete confirmation, keyboard dialog focus, reduced-motion, offline cached reload, legal routes, and service-worker registration. |
| Axe | Home, editor, and persisted counterevidence card: 0 serious/critical issues in both browser projects. |
| Local response/privacy policy | `/`, `/privacy`, `/terms`, `/sw.js`, `robots.txt`, and versioned fonts returned 200; only same-origin product resources are used; GET `/api/page-view` returned 405 and POST returned 204; CSP, nosniff, DENY frame, and strict referrer headers present. |
| Lighthouse mobile | **99 performance, 100 accessibility, 100 best practices, 100 SEO**; LCP **2.0 s**, CLS **0**, TBT **0 ms**. |
| Public smoke | `verify-url.sh https://claim-source-trail.sociobot.in`: HTTP 200 in 608 ms, title/lang/one h1/main present, 0 missing image alts, 0 unlabeled buttons, 0 console/page errors. |
| Live identity / headers | `/health` returned `{"status":"ok","build":"0223ccea4f0b3a2f501593e9f416877499b719d8"}`. Live versioned WOFF2 returned one-year immutable caching; shell/service worker retain `no-cache`; security headers and CSP are present. |

### Deployment

- Container App: `sf-claim-source-trail--0000004`, provisioning state
  `Succeeded`.
- Image: `sociobotregistry.azurecr.io/sf-claim-source-trail:0223ccea4f0b`
  (`sha256:5b721fb0c021886be4b1cad7452af088f1568842905e525e6563edd39e570344`).
- Public URL: <https://claim-source-trail.sociobot.in>.

## Independent verification 2 — 2026-08-28

**FAIL — candidate `c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5` at
<https://claim-source-trail.sociobot.in> is not accepted.** Fresh clean-build
tests, production build, 10/10 local production E2E tests, live health identity,
and live JS/CSS hashes passed. The deployment is this exact candidate.

Release blockers found independently:

- **P1 privacy:** “Delete all local data” leaves
  `sb_license:claim-source-trail` and its cached verdict in localStorage.
- **P1 accessibility:** the saved counterevidence badge is an axe serious
  `color-contrast` result (white on `#d94f36` is 4.09:1, below 4.5:1).

There is also a **P3** font caching issue: static WOFF2 files use `no-cache`.
See [`.factory/verification-2.md`](verification-2.md) for exact commands,
fresh reproduction, deployment identity, all passing evidence, and required
next steps. This verifier changed documentation only.

## Verification status — 2026-08-28

**FAIL — candidate `c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5` must not be
accepted.** Independent verification against
<https://claim-source-trail.sociobot.in> confirmed the live health build SHA
and exact JS/CSS hashes match this candidate, and its clean tests/build/browser
suite otherwise passed. However, the product's **Delete all local data** action
leaves `sb_license:claim-source-trail` and its cached verdict in localStorage.
This violates the privacy-first brief's clear-deletion requirement and leaves a
reusable credential after the user asked to delete all local data.

See [`.factory/verification.md`](verification.md) for the reproduction,
complete command results, passing evidence, and the non-blocking font caching
finding. The required next step is a targeted complete-deletion fix and a new
candidate verification; no product code was changed by this verifier.

Date: 2026-08-27

Work order: `claim-source-trail-build-1`

Artifact: container (`web-with-backend`)

## What shipped

- A complete local-first claim-card workflow: create, edit, draft, delete with confirmation and 10-second undo, delete all, search, status filter, counterevidence label, and exact-location/reasoning completeness feedback.
- Free Markdown and CSV exports containing source metadata, locator, excerpt/paraphrase, reasoning, counterevidence role, and trail status.
- A worked example that opens as an editable unsaved draft rather than silently polluting student storage.
- First-class empty, no-results, corrupt-storage, offline, form-error, invalid-license, and license-network-error states.
- Responsive keyboard-operable interface verified at 390×844 and desktop, native dialog focus behavior, visible focus rings, semantic landmarks, one `<h1>` per route, and reduced-motion handling.
- Original generated research-desk hero art with prompt, model, date, review notes, and optimized 32/62 KB WebP variants. The complete product-specific system is in `.factory/design.md`.
- `/privacy` and `/terms` routes with plain-language local-storage, anonymous counting, copyright, billing, and deletion disclosures.
- $18 one-time Instructor kit through the Sociobot billing contract: hosted buy link, return-token capture and URL cleanup, local token storage, daily cached verification, optimistic offline unlock, invalid/revoked fallback, and paste-to-restore. It adds a local cohort pulse, course label, and automatic retention; core exports remain free.
- Axum server with SQLite migration, `/health` build SHA, aggregate-only `/api/page-view`, global page-count rate limiting, structured JSON logs, graceful shutdown, SPA fallback, cache policy, and security headers. Claim content never reaches the server.
- Multi-stage Alpine Dockerfile that builds frontend/backend, runs as a non-root user, persists only `/app/data`, and listens on port 8080.

## Verification

Commands run successfully:

```text
npm test
  Vitest: 3 files, 8 tests passed
  Cargo: 4 route/database tests passed; doc tests passed

npm run build
  TypeScript clean
  Vite production output written to dist/
  Cargo release build completed

npm run test:e2e
  Playwright: 10 desktop + 390px create/edit/export, offline, legal-route, keyboard-dialog, overflow, and axe checks passed
  Axe: no serious or critical violations on home or open editor

npm audit --omit=dev
  0 vulnerabilities
```

Production asset budgets:

- Initial JS: 26.57 KB raw / 9.30 KB gzip (budget ≤200 KB)
- CSS: 14.63 KB raw / 3.96 KB gzip (budget ≤50 KB)
- Fonts: 34.72 KB total WOFF2 (budget ≤120 KB)
- Hero: 62 KB desktop, 32 KB mobile WebP (budget ≤300 KB)

Lighthouse 13.4.1, mobile defaults, production Axum server:

- Performance: **99**
- Accessibility: **100**
- Best practices: **100**
- SEO: **100**
- LCP: **1.8 s**
- CLS: **0**
- Total blocking time: **0 ms**

Load smoke against the release `/health` route (`autocannon`, 100 concurrent connections, 5 seconds): 150k requests, ~30,064 requests/sec average, 2.76 ms average latency, 9 ms p99, 55 ms max.

Runtime smoke confirmed `200` for `/`, JSON health response, CSP/referrer/frame/MIME headers, daily page-view increment, no page-load console errors, and successful offline-shell registration in production mode.

## Run and deploy

```bash
npm ci
npm test
npm run build
PORT=8080 DATABASE_URL=sqlite://data/claim-source-trail.db DIST_DIR=dist target/release/claim-source-trail
```

Or build the root `Dockerfile`; deployment should mount a writable volume at `/app/data`. The exact application build command is `npm run build`, and frontend output is `dist/` with `dist/index.html` at its root.

## Known gaps and release notes

- The factory still needs to register `claim-source-trail` and its $18 one-time price in the Sociobot billing engine. Until then, checkout/verification cannot complete in production; the free workspace is unaffected. No product ID or payment-provider code is hardcoded.
- Student trails intentionally do not sync between devices. Users should export before clearing browser data; multi-user hosted cohorts are outside v1.
- Automatic metadata lookup, paywalled-source scraping, truth checking, essay generation, and bibliography-manager behavior are explicit non-goals.
- Docker could not be executed in this worker because no Docker/Podman CLI is installed. The release binary and frontend were built and served together locally, and the Dockerfile was reviewed for the specified multi-stage/non-root contract.

## Repair QA — 2026-08-28

Work order: `claim-source-trail-repair-1`

Release status: **passed product QA and deployed**. The original product brief, neo-brutalist research-desk design system, local-first behavior, Rust/Axum backend, and container artifact class were preserved. No product behavior was redesigned.

### Delivery repair

- Recovered immutable candidate `3cf85103746730d93b84d4a0d1db75f8f9c3dcb8` from ACR. The deployed image is pinned by digest: `sociobotregistry.azurecr.io/sf-claim-source-trail@sha256:3d0ad3c1d86a6d22e7a4f2e3874d48052e5a069e3d1a55cfe7fa14ca70c23196`.
- Reused the fixed worker container path. It supplies `BUILD_SHA` when building, registers the custom hostname before issuing its managed certificate, then binds the certificate.
- Container App ready revision: `sf-claim-source-trail--0000002`; managed certificate is SNI-enabled for `claim-source-trail.sociobot.in`.

### Exact QA evidence

| Check | Result |
| --- | --- |
| Clean dependency install | `npm ci` completed; audit reported 0 vulnerabilities. |
| Frontend and backend unit/integration tests | `npm test`: Vitest 3 files / 8 tests passed; Cargo 4 route/database tests plus doc tests passed. |
| Production build | `npm run build` passed TypeScript, Vite, and Rust release build. Output: JS 26.57 KB raw / 9.30 KB gzip; CSS 14.63 KB raw / 3.96 KB gzip. |
| Browser product QA | Production-style local Axum run with `npm run test:e2e`: 10/10 passed across desktop and 390px mobile, including create/edit/export, offline, keyboard-dialog, legal routes, and axe checks. |
| Public smoke | `GET https://claim-source-trail.sociobot.in/` → HTTP 200. |
| Public health identity | `GET https://claim-source-trail.sociobot.in/health` → HTTP 200, `{"status":"ok","build":"3cf85103746730d93b84d4a0d1db75f8f9c3dcb8"}`. |
| Public browser/accessibility smoke | `verify-url.sh`: title present, `lang=en`, one h1, main landmark, 0 images missing alt, 0 unlabeled buttons, 0 console errors; load 630 ms. Playwright axe scan: 0 serious/critical violations. |

The standalone `@axe-core/cli` could not locate a system Chrome binary in this worker; the equivalent Playwright axe scan used the installed worker Chromium and passed against the public URL.

### How to verify

```bash
curl -i https://claim-source-trail.sociobot.in/
curl -s https://claim-source-trail.sociobot.in/health
```

Expected health payload includes the immutable candidate SHA above.
