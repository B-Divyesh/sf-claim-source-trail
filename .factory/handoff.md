# Claim Source Trail — build handoff

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
