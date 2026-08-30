# Independent verification 7 — PASS

Date: 2026-08-30  
Work order: `claim-source-trail-verify-7`  
Candidate: `1d1b469070b709ab63b1d6f3b7b2eeeab8929f1c`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**PASS — accept candidate `1d1b469070b709ab63b1d6f3b7b2eeeab8929f1c`.**

The prior deployment-only billing failure is not present in fresh evidence.
The live health identity is the candidate, its frontend assets match the clean
build byte-for-byte, every mandatory claim command passes, the one-click demo
and complete claim-to-source workflow work, and the local and deployed
backends enforce their request allowances with 429 and `Retry-After`.

No product code was changed during this verification.

## Mandatory first gates

### Claims manifest — PASS

The clean checkout started at the candidate with no tracked changes. After
`npm ci`, all 12 commands from `.factory/claims.json` were run separately,
before the other QA. Every ID also occurs in exactly one tagged test.

| Claim | Result |
| --- | --- |
| `free-exports` | PASS — 2/2 desktop and mobile |
| `demo-isolated` | PASS — 2/2 desktop and mobile |
| `local-content` | PASS — 2/2 desktop and mobile |
| `no-account` | PASS — 2/2 desktop and mobile |
| `trail-workflow` | PASS — 2/2 desktop and mobile |
| `offline-reload` | PASS — 2/2 desktop and mobile |
| `offline-export` | PASS — 2/2 desktop and mobile |
| `paid-checkout` | PASS — 2/2 desktop and mobile |
| `instructor-tools` | PASS — 2/2 desktop and mobile |
| `anonymous-page-count` | PASS — 2/2 browser checks plus Rust schema test |
| `complete-deletion` | PASS — 2/2 desktop and mobile |
| `license-verification` | PASS — 1 Vitest assertion |

The first cold release compile completed inside the declared 600-second
Playwright allowance; `free-exports` passed in 4.9 minutes. Full logs were
captured as `/tmp/claim-<id>.log` during verification.

### First-read test — PASS

On a cold 1440×900 live page, the first viewport says:

- What it does: **“Make every claim traceable.”** and the visible
  claim → source → location → reasoning sequence.
- Who it is for: **“Undergraduate humanities and social-science students…”**
- What to click first: **“Try it with sample data”**, immediately followed by
  **“Loads two sample trails. Nothing is saved.”**

One click opened `/?demo=1#workspace`, already populated with two complete
humanities trails. The persistent banner says **“Demo — sample data, nothing
is saved”** and provides **Reset demo** and **Start for real**. The same content
fits at 390×844 without horizontal overflow.

## Clean checkout and build evidence

- Environment: Node 22.23.2, npm 10.9.8, Rust/Cargo 1.98.0, Playwright pinned
  to 1.58.2.
- `npm ci`: PASS — 213 packages; npm reported zero vulnerabilities.
- `npm test`: PASS — 11/11 Vitest tests and 6/6 Rust tests; binary and doc
  targets also passed.
- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets --all-features -- -D warnings`: PASS.
- No npm lint script exists. `tsc --noEmit` is part of the production build.
- `npm audit` and `npm audit --omit=dev`: PASS — zero vulnerabilities.
- `npm run build`: PASS — TypeScript, Vite, and optimized Rust; `dist/` exists.
- Docker and Podman are unavailable in this worker. The release binary was
  run directly and the deployed container was checked by build identity and
  byte-identical frontend assets.

Bundle and asset budgets from the clean build:

| Resource | Observed | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 31,093 B raw / 10,551 B gzip | ≤ 200 KB |
| CSS | 15,594 B raw / 4,136 B gzip | ≤ 50 KB |
| Two WOFF2 fonts | 34,732 B | ≤ 120 KB |
| Mobile hero WebP | 31,994 B | ≤ 300 KB |

The social image is 1200×630; the Apple touch icon is 180×180.

## Product and browser QA

- Complete local Playwright matrix: **48/48 passed** on desktop and 390px.
- The matrix covers create, revise, search, filter, readiness state,
  counterevidence, maximum-length values, invalid DOI/URL recovery, empty
  required fields, corrupt-storage recovery, named deletion, Undo, complete
  local deletion, Markdown/CSV downloads, demo reset/exit, legal routes, real
  404 handling, billing, offline reload/export, and service-worker update.
- Complete live matrix: **47/48 passed** initially. The sole failure was a
  direct Playwright request to the external Beacon Press sample page ending in
  `ECONNRESET`; the application portion of that test had already found the
  correct link. A targeted two-project rerun had one pass and one reset. Five
  sequential curl probes and the final link crawl all returned HTTP 200. This
  is recorded as a P3 nondeterministic external-test dependency below, not a
  broken shipped link or release blocker.
- A final crawl found root, demo, privacy, terms and all internal links healthy;
  the designed unknown route returned 404. The DOI redirects to Taylor &
  Francis, Beacon Press returned 200, and checkout returned the expected Dodo
  303 without a purchase.
- Invalid-license recovery on live sent the token only to the product-scoped
  Sociobot verification URL, displayed “License no longer active,” and left
  the free workspace usable.

## Accessibility and visual QA

- Factory `verify-url.sh`: PASS in 689 ms — title, `lang=en`, one h1, main,
  alt text and button names present; zero console/page errors.
- Independent axe scans on the populated demo and open editor found **zero
  violations of any severity** on desktop and 390px.
- Keyboard checks passed: the first Tab reveals the skip link, whose focus
  indicator is a visible 4px signal-yellow outline; Enter/Escape dialog
  behavior, focus restoration, and Ctrl/Cmd+Enter save pass in the suite.
- Forms have bound labels and actionable announced errors. Dialog initial
  focus, Escape, touch targets, 390px overflow, maximum-length reflow, and
  reduced-motion behavior pass.
- Desktop and mobile full-page captures were visually inspected. The
  product-specific research-desk/neo-brutalist hierarchy is clear and there is
  no clipping or horizontal overflow.
- Lighthouse 13 mobile on live: performance **99**, accessibility **100**,
  best practices **100**, SEO **100**; LCP **1.661 s**, CLS **0**, TBT **97 ms**.

## Privacy, PWA, headers, and identity

- A fresh Playwright request log across cold load and demo entry contained
  only the product origin. The sole non-GET was bodyless same-origin
  `POST /api/page-view`; no trail content appeared in any request.
- Normal live browsing produced no page errors or console errors. The only
  warnings in a separate first-read capture were intentionally caused by
  launching that context with service workers blocked.
- The privacy and terms pages are real URLs. The page-count database has only
  `day` and `count`; complete deletion removes trail, settings, daily-count,
  license, verdict, and demo namespaces as claimed.
- PWA update and offline tests pass in fresh contexts: the root-scoped worker
  remains active with no waiting update, the demo reloads offline, and both
  exports still download with their sample content.
- Root, legal pages, health, worker, robots, sitemap, fonts and assets return
  the expected statuses. Unknown routes return the designed HTTP 404. HTTP
  redirects permanently to HTTPS.
- Responses include CSP, HSTS, `nosniff`, frame `DENY`, strict referrer policy,
  and restrictive Permissions-Policy. Documents, health and worker use
  `no-cache`; hashed assets and self-hosted fonts use one-year immutable cache.
- Live `/health` returns
  `{"status":"ok","build":"1d1b469070b709ab63b1d6f3b7b2eeeab8929f1c"}`.
  Local/live SHA-256 hashes match:
  - JS: `ce4e2f44deb4dd21e56c107400d8d42ac086c27e45272ce0b95fa667d5269144`
  - CSS: `8d63bab25cc4a01e1f23b53524742150935c87e6903d126cf470eca3316373cd`

## Backend, persistence, billing, and limits

- The release binary started twice with an empty environment plus only
  `PORT=18081`, served root/health, shut down cleanly, and retained six
  page-count writes across restart. SQLite inspection found exactly
  `day TEXT` and `count INTEGER` in `page_views`.
- A 500-request concurrent live `/health` smoke returned 500×200 in 1.462 s.
- The page-count route is configured for a **40-request burst per process and
  one request/second refill per first `X-Forwarded-For` client**. A live
  240-request simultaneous burst from one client returned 120×204 and 120×429
  across the current three replicas; every 429 had `Retry-After: 0`. A distinct
  client immediately received 204. GET/OPTIONS/PUT return 405.
- The product-unlock verifier independently enforced an observed **30-request
  immediate allowance**: 160 concurrent invalid-token checks returned 30×200
  and 130×429, all with `Retry-After: 4`.
- `npm run test:billing`: PASS. The registered product is $18 USD, checkout
  returns 303 to `checkout.dodopayments.com`, and verification responds.
- Sign-in/Entra testing is not applicable: the complete free product and demo
  require no account. Library/CLI consumer packaging is not applicable.
- The brief does not need an AI action: the product teaches the student's own
  evidence reasoning and explicitly avoids fact checking or essay generation.

## Defects by severity

### P0 / P1 / P2

None.

### P3 — live source-reachability test is nondeterministic

`tests/e2e/app.spec.ts` sends the desktop and mobile checks to Beacon Press in
parallel with no retry. The publisher intermittently resets one connection.
The shipped link was consistently HTTP 200 when checked sequentially, so this
does not block the user workflow. A future maintenance change should serialize
that external assertion or apply the same bounded retry used for billing.

### P3 — standard footer provenance/build text is incomplete

The SPA footer contains its one-line limitation, Privacy, Terms, and generated
art provenance, but omits the standard **“Built by Param Factory”** and visible
version/build identifier. The static 404 footer includes the factory credit but
also lacks a build identifier. This is a minor site-structure compliance gap;
runtime build identity remains available and correct at `/health`.

### P3 — Docker build-argument default differs from the written convention

The Dockerfile correctly accepts and embeds `BUILD_SHA`, and production proves
the factory-supplied SHA works. Its local default is `unknown` rather than the
contract's conventional `dev`. This does not break local builds or deployed
identity but should be aligned in a later maintenance change.

## Known verification limitation

No container runtime was installed, so the Dockerfile could not be rebuilt in
this worker. The exact release binary, PORT-only startup, persisted database,
live build SHA, and byte-identical assets provide coverage of the deployed
artifact without changing product code.
