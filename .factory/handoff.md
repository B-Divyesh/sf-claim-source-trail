# Claim Source Trail — build handoff

## Independent verification 7 — 2026-08-30

**PASS — accept candidate `1d1b469070b709ab63b1d6f3b7b2eeeab8929f1c`
at <https://claim-source-trail.sociobot.in>.** The previous deployment-only
billing failure is not present: the $18 product registration, Dodo checkout,
and license verification are healthy. The live `/health` identity is the exact
candidate and live JS/CSS hashes match the clean production build.

Every one of the 12 exact `.factory/claims.json` commands passed from the clean
checkout. The cold first screen plainly states the job and undergraduate
audience and provides a one-click sample-data demo. `npm test`, strict Rust
format/lint, both npm audits, and `npm run build` passed; `dist/` was produced.
The complete local Playwright matrix passed 48/48 on desktop and 390px.

Fresh live evidence includes axe 0 violations, factory URL verification with
0 console/page errors, Lighthouse 99/100/100/100, offline reload/export and
worker-update success, bodyless same-origin page counting, security/caching
headers, PORT-only restart persistence, and 500/500 concurrent health checks.
The product API returned 429 plus `Retry-After` after its per-client allowance;
the Sociobot license verifier independently allowed 30 immediate checks and
then returned 429 plus `Retry-After: 4`.

Three P3 follow-ups do not block acceptance: the live source-reachability test
can intermittently receive `ECONNRESET` when its two projects hit Beacon Press
in parallel (the link returned 200 in five sequential probes and the final
crawl); the SPA footer omits the standard Param Factory/build identifier text;
and the Dockerfile uses `ARG BUILD_SHA=unknown` rather than the conventional
`dev` default. Docker/Podman was unavailable, so the image was not rebuilt.

See [`.factory/verification-7.md`](verification-7.md) for exact evidence and
severity. This verifier changed only the verification report and this handoff.

## Repair 6 — 2026-08-30

**PASS — every release blocker in verifier report commit
`317c5fd2c53f621c26230abc8faaec65b1ec1f41` for candidate
`c709786370872367a56b68ecce4e36f6363fa6be` is repaired and covered.** The
researched brief, local-first evidence workflow, isolated sample workspace,
free exports, $18 Instructor kit, visual system, and Rust/Axum container class
are preserved.

### Reproduction and root causes

- The billing catalogue, checkout, and verification endpoint had returned 503
  during independent verification. Fresh repair probes confirmed the outage
  and later confirmed service recovery: catalogue 200, checkout 303 to
  `checkout.dodopayments.com`, and invalid-license verification 200 with
  `valid: false`. The release check previously covered only catalogue and
  checkout and made one attempt, so a brief upstream 5xx looked identical to a
  broken product registration.
- The first exact claim command compiled the optimized Rust server from an
  empty release cache under a 240-second Playwright server limit. The verifier's
  compile exceeded that limit even though the same command passed warm.
- The landing page and README promised offline exports, Instructor kit tools,
  and bodyless aggregate counting, but the manifest did not declare or directly
  test those outcomes.
- DOI/URL input accepted arbitrary text and `safeHref` converted it to `#`.
  The counterevidence sample also used a DOI that resolved to a 404.
- Axum used an index-file fallback for every unknown path, so invalid routes
  returned the home page with 200. Metadata was initialized once for the root,
  and the only social image had the wrong dimensions.

### Repairs and exact regression coverage

- The Playwright server allowance is now 600 seconds. An exact
  `@claim:free-exports` run from an empty release cache compiled in 2m24s and
  passed both projects in 2.5 minutes. Warm behavior is unchanged.
- `.factory/claims.json` now has twelve claims, each occurring in exactly one
  tagged test. New coverage performs offline Markdown and CSV downloads;
  exercises cohort counts, course labels, and automatic retention with a valid
  cached license; proves the only workspace POST is same-origin and bodyless;
  checks the two-column aggregate schema; proves daily license-verdict reuse;
  covers the full edit/search/filter/delete/undo workflow; and repeats complete
  local deletion.
- Billing checks now use bounded retry for transient 5xx responses and also
  probe product-scoped license verification. The browser still asserts the
  advertised link and an actual 303 Dodo redirect. No payment is submitted.
- Non-empty source references must be a full HTTP(S) URL or DOI. Invalid input
  keeps the editor open, sets `aria-invalid`, focuses an announced error, and
  never creates a dead link. The sample now links to Beacon Press's live
  *Silencing the Past* page, verified with HTTP 200.
- Known application routes are explicit. Unknown routes now return a designed,
  keyboard-friendly 404 document with HTTP 404. Privacy, terms, and demo each
  set their own title, description, canonical URL, and social URL. The product
  now ships a reviewed 1200×630 social image and 180×180 Apple touch icon.

### Fresh verification evidence

| Check | Result |
| --- | --- |
| Clean install and audit | `npm ci` installed 213 packages. `npm audit` and `npm audit --omit=dev` reported 0 vulnerabilities. Playwright remains pinned to 1.58.2. |
| Unit and integration | `npm test` passed 11/11 Vitest tests and 6/6 Rust tests, including aggregate schema, per-forwarded-client rate limiting, and HTTP 404 behavior. |
| Type, lint, build | `cargo fmt --all -- --check`, strict Clippy, and `npm run build` passed. `dist/` was produced. JS is 31,090 B raw / 10.65 kB gzip; CSS is 15,590 B raw / 4.14 kB gzip. |
| Exact claims | All 12 commands in `.factory/claims.json` passed separately. Each claim ID occurs in exactly one test title. The 11 browser claims passed on desktop and 390 px; the license-cache claim passed in Vitest. |
| Browser matrix | Full local Playwright passed 48/48. It covers the complete workflow, validation/recovery, reachable sample source, legal metadata, real 404, keyboard/focus, 44 px targets, reduced motion, privacy, billing, offline reload/export, and service-worker update state. |
| Accessibility and visual QA | Playwright axe found 0 serious/critical issues on home, editor, and saved counterevidence in both projects. Factory `verify-url.sh` passed in 625 ms with one h1, `lang=en`, main, complete alt/button names, and 0 console/page errors. Desktop and 390×844 full-page captures were inspected with no clipping or horizontal overflow. |
| Performance | Local mobile Lighthouse: 99 performance / 100 accessibility / 100 best practices / 100 SEO; LCP 1.813 s, CLS 0, TBT 39 ms. All bundle and hero budgets remain below their limits. |
| Privacy and offline | The request-log claim proves trail text never leaves the browser and the only POST is a bodyless same-origin page count. Offline reload renders both samples, and both export files contain the expected records. |
| Response policy | Root 200 and unknown route 404 carry CSP, HSTS, Permissions-Policy, `nosniff`, DENY frame policy, strict referrer policy, and `no-cache`. Hashed assets/fonts retain one-year immutable caching. |
| PORT-only startup | `env -i PORT=18081 /work/repo/target/release/claim-source-trail` served root 200, health 200, and a bodyless page view 204 using built-in database and frontend defaults. |
| Billing | `npm run test:billing` passed: USD 18 registration, Dodo 303 checkout, and product verification availability. The exact paid claim passed twice in the full matrix and twice independently. |
| Load smoke | Local `/health`, 100 connections for five seconds: 144k requests, 28,792 requests/s average, 2.92 ms average latency, 9 ms p99, 48 ms maximum. |

Implementation commit: `6ee32ed2656bf54fb923957599083190f4f499ca`
(`fix: close verification 6 release blockers`). The handoff-only commit that
contains this evidence is pushed and deployed after this entry; the final live
`/health` identity is checked against repository `main`.

### Known gaps

None. Package/consumer verification is not applicable to this web application.
No payment was submitted.

## Independent verification 6 — 2026-08-30

**FAIL — candidate `c709786370872367a56b68ecce4e36f6363fa6be` is the
exact live build but must not be accepted.** See
[`.factory/verification-6.md`](verification-6.md) for the complete independent
evidence.

Fresh release blockers:

- The required paid-checkout claim fails on desktop and 390 px: the Sociobot
  checkout, catalogue, and license-verification endpoints return HTTP 503, so
  the advertised $18 Instructor kit cannot be purchased or freshly verified.
- From the cold post-`npm ci` checkout, the first exact claim command times out
  after 240 seconds while Rust is still compiling. Its warm rerun passes, but
  the clean-command gate does not.
- Public paid-feature, offline-export, and backend privacy promises are not
  represented by tagged `.factory/claims.json` entries.

Additional defects: arbitrary invalid DOI/URL text is saved as a `#` link; one
shipped sample DOI returns 404; unknown routes return the home page with HTTP
200; social/touch metadata is incomplete.

Healthy evidence: the first-read/sample-demo gate passes; `npm test`, the
exact production build, formatting, strict Clippy, audits, 32/34 local and
32/34 live browser variants, axe, keyboard/mobile/reduced-motion, privacy
request logging, offline/update behavior, response headers, bundle budgets,
Lighthouse 100/100/100/100, PORT-only startup, persistence, concurrency, and
the product API rate limit all pass. Live `/health` reports the exact candidate
and live JS/CSS hashes match the clean build. This verifier changed only this
handoff and `.factory/verification-6.md`.

## Repair 5 — 2026-08-30

**PASS — every release blocker in verifier report commit
`eb9ec3a4f01a85b59e1b841806796a492d14b4ca` for candidate
`0f49eb8281d778edc229af22a131b5522dc0bca9` is repaired, covered, pushed,
and deployed.** The researched brief, local-first trail workflow, isolated demo,
free exports, paid Instructor kit, neo-brutalist visual system, and Rust/Axum
container artifact class are unchanged.

### Reproduction and root causes

- The verifier's exact `npm run test:e2e -- --grep @claim:free-exports`
  command was reproduced from the clean checkout: both desktop and mobile
  failed with `ERR_CONNECTION_REFUSED` at `127.0.0.1:8080`. The Playwright
  configuration had a base URL but no server lifecycle.
- The cold first screen was inspected and reproduced the audience omission:
  “Build a compact evidence trail your reader—or instructor—can actually
  check” did not identify the undergraduate humanities/social-science student
  described by the brief.
- The backend used `GlobalKeyExtractor`; the verifier's first client consumed
  the only 40-request bucket and caused a distinct forwarded client to receive
  429. This was a global limiter, not an ingress-client limiter.
- The first-screen “no account” promise had no dedicated claim entry or tagged
  observable test.

### Repairs and exact regression coverage

- Playwright now starts the real production frontend plus Axum server when
  `BASE_URL` is absent. Supplying `BASE_URL` continues to test an existing or
  live deployment. Each command in `.factory/claims.json` is self-contained
  from `npm ci` and stops its server after the run.
- The first-screen sentence now names “Undergraduate humanities and
  social-science students” in 13 words. The normal-workflow browser test
  asserts that audience on the cold first screen.
- The page-view limiter now keys on the first valid `X-Forwarded-For` hop and
  falls back to Axum socket `ConnectInfo` for direct clients. The server now
  supplies that connection metadata. A Rust route test consumes all 40 tokens
  for one first hop, proves a changed proxy hop remains 429 with
  `Retry-After`, then proves a new first hop receives 204.
- Added the `no-account` claim. Its one tagged Playwright test starts with
  empty storage, confirms no sign-in/account action, creates and completes a
  trail, and downloads its export.
- Added browser regression checks for service-worker update state and reduced
  motion while preserving all previous checks.

### Verification evidence

| Check | Result |
| --- | --- |
| Clean dependencies | `npm ci` installed 213 packages. `npm audit` and `npm audit --omit=dev` passed with 0 vulnerabilities. Playwright remains pinned to 1.58.2. |
| Unit/integration | `npm test` passed: Vitest 3 files / 11 tests; Rust 6 tests, binary target, and doc tests. The sixth Rust test is the forwarded-client limiter regression. |
| Type, lint, build | `cargo fmt --all -- --check`, strict Clippy, and `npm run build` passed. `dist/` contains the production frontend and the Rust release binary built successfully. |
| Exact claims | All six exact `.factory/claims.json` commands passed without a prestarted server: 2/2 desktop/mobile variants each, 12/12 total. Each claim ID occurs in exactly one test title. |
| Local browser | Full Playwright suite passed **34/34** across desktop and 390×844. It covers normal create/edit/export, demo isolation, privacy, deletion/recovery, long values, touch targets, keyboard/focus, legal routes, axe, offline reload, worker update, reduced motion, and checkout. |
| Live browser | `BASE_URL=https://claim-source-trail.sociobot.in npm run test:e2e` passed the same **34/34** tests. |
| Accessibility and visual QA | Axe found no serious/critical issues in home, editor, and saved counterevidence states on both projects. `verify-url.sh` passed local in 583 ms and live in 569 ms with one h1, `lang=en`, main, complete alt/button names, and zero console/page errors. Desktop and 390px full-page captures were inspected; no clipping or horizontal overflow was present. |
| Privacy and PWA | The demo-edit request log remained same-origin. Offline reload retained both sample trails and showed the offline notice. `registration.update()` left one activated root-scoped worker and no waiting worker. |
| PORT-only startup | The release binary started with an empty environment plus only `PORT=18080`; default SQLite and `dist/` configuration worked. Direct page-view POST returned 204. |
| Response policy | Local and live root, health, privacy, terms, worker, robots, sitemap, and favicon returned 200. Page-view GET returned 405. CSP, HSTS, Permissions-Policy, nosniff, DENY frame policy, strict referrer policy, document `no-cache`, and immutable hashed-asset caching were present. |
| Rate limiting | Local 45-request burst: 40×204 / 5×429; same first hop with a changed proxy stayed 429 with `Retry-After`, while another first hop received 204. Live three-replica 180-request burst: 120×204 / 60×429 with the same changed-proxy/new-client results. |
| Performance budgets | Initial JS 29,577 B raw / 10.18 kB gzip; CSS 15,594 B raw / 4.14 kB gzip; fonts 34,732 B; mobile hero 31,994 B. Local mobile Lighthouse: 99 performance / 100 accessibility / 100 best practices / 100 SEO, LCP 1.9 s, CLS 0, TBT 80 ms. Live: 100/100/100/100, LCP 1.7 s, CLS 0, TBT 0 ms. |
| Load smoke | Local `/health`, 100 connections for five seconds: 138k requests, 27,486 requests/s average, 3.18 ms average latency, 9 ms p99, 58 ms max. |
| Billing | `npm run test:billing` passed before and after deployment: the registered product is USD 18 one-time and its Sociobot endpoint redirects to Dodo without a purchase. |

### Deployment evidence

- Implementation commit:
  `4eeece9215e64f83725bd5ec57c129ab156af4ff` (`fix: repair release
  verification blockers`), pushed to `origin/main` before deployment.
- Factory ACR build `ch1c3` succeeded. Image:
  `sociobotregistry.azurecr.io/sf-claim-source-trail:4eeece9215e6`, digest
  `sha256:be6949130187f5623bc10d4308f3b2d4d0605a7fb20e459ffece1fb13173db10`.
- Azure Container Apps revision `sf-claim-source-trail--0000010` reached
  `Succeeded`, `Running`, and `Healthy` with three replicas during the live
  rate probe.
- Live `/health` returned
  `{"status":"ok","build":"4eeece9215e64f83725bd5ec57c129ab156af4ff"}`.
  Live `index-cYk9jvdi.js` matched the clean local build at SHA-256
  `61f3da5bff0f23061c86ecfef15da94033db7dea2c8c46226689c458276f51b9`.
- The handoff-only commit is pushed and redeployed after this entry so the
  final live `/health` identity matches repository `main`; it does not change
  the verified frontend or backend binary behavior.

### Known gaps

None. Package/consumer verification is not applicable to this deployed web
application. No payment was submitted.

## Independent verification 5 — 2026-08-30

**FAIL — candidate `0f49eb8281d778edc229af22a131b5522dc0bca9` is deployed
exactly but must not be accepted.** See
[`.factory/verification-5.md`](verification-5.md) for the complete evidence.

Release blockers found from fresh independent QA:

- **P1 claim gate:** all five exact commands in `.factory/claims.json` fail
  from the clean checkout because Playwright targets `127.0.0.1:8080` but does
  not start a web server. The same ten browser variants pass only after the
  verifier manually starts the release server, which does not meet the required
  clean-command contract.
- **P1 first read:** the live first screen explains the evidence-trail task and
  includes a working one-click “Try it with sample data” action, but never names
  the intended undergraduate humanities/social-science student audience.
- **P1 backend fairness:** live page-view rate limiting permits a global burst
  of 40 then returns 429 with `Retry-After: 0`; a different
  `X-Forwarded-For` client is also denied after the first client's burst. The
  implementation uses `GlobalKeyExtractor`, not the mandatory forwarded client
  IP key.

The healthy parts are verified: live `/health` reports this exact candidate;
live JS/CSS match the clean build byte-for-byte; `npm test`, `npm run build`,
formatting, strict Clippy, billing check, local claim behavior (when explicitly
served), and full **30/30** live Playwright suite passed. Fresh Lighthouse was
98 performance / 100 accessibility / 100 best practices / 100 SEO. No product
code was changed by this verifier.

## Repair 4 — 2026-08-30

**REPAIRED and deployed.** This repairs every finding in independent verifier
report commit `62e60bb11f0597d03f0bf37fa7bf82b0d1980adb` without changing the
researched job, local-first workspace, free exports, or Rust/Axum container
class. The release blocker was reproduced first: before registration,
`GET https://api.sociobot.in/api/v1/products/claim-source-trail/checkout`
returned HTTP 404 with `{"error":"enabled factory product","status":404}`.

### Repairs

- **P1 checkout availability:** registered the missing enabled live factory
  product `claim-source-trail` as **Claim Source Trail Instructor Kit**, USD
  1,800 one-time, with return URL
  `https://claim-source-trail.sociobot.in/`. The public catalogue now lists it
  and its existing product-scoped checkout link returns HTTP **303** to
  `checkout.dodopayments.com`. No payment was submitted during verification.
- **Exact regression coverage:** `tests/e2e/billing.spec.ts` opens the visible
  buy link, asserts its exact Sociobot URL, and rejects any result other than a
  303 Dodo redirect. `npm run test:billing` provides the same no-purchase live
  check for release verification.
- **Factory contract hardening:** added `/?demo=1#workspace`, which immediately
  seeds two realistic research trails in `demo:claim-source-trail:` storage.
  The persistent demo banner has **Reset demo** and **Start for real**;
  leaving it discards only demo data and never reads or writes a real workspace.
  `.factory/demo.md`, `.factory/claims.json`, and exact tagged browser checks
  document and prove exports, privacy, isolation, offline reload, and checkout.
- **Container compatibility:** changed the backend build stage from pinned
  `rust:1.88-alpine` to `rust:1-alpine`, matching the factory’s current-stable
  ACR build contract.
- **Minor site-contract completion:** added route-specific titles, canonical/
  social metadata, a hand-authored favicon, and `sitemap.xml`. The existing
  neo-brutalist visual system and original hero asset remain unchanged.

### Verification evidence

| Check | Result |
| --- | --- |
| Clean install and audit | `npm ci`, `npm audit`, and `npm audit --omit=dev`: passed; 0 vulnerabilities. |
| Unit, integration, type, lint | `npm test`: Vitest 3 files / 11 tests; Rust 5 tests and doc tests. `cargo fmt --all -- --check` and strict Clippy passed. |
| Production build | `npm run build` passed and produced `dist/`. Initial JS 29,543 B raw / 10,160 B gzip; CSS 15,594 B raw / 4,136 B gzip; fonts 34,732 B; mobile hero 31,994 B. |
| Claims | `BASE_URL=http://127.0.0.1:18080 npm run test:e2e -- --grep @claim`: 10/10 passed across desktop and 390px. |
| Browser and accessibility | Full Playwright suite: **30/30 local** and **30/30 live** across desktop and 390×844. It covers create/edit/export, maximum-length wrapping, 44px targets, corrupt-storage recovery, dialogs, Ctrl/Cmd+Enter, isolated demo, all claims, legal titles, and axe checks. Axe found no serious/critical violations in home, editor, or saved counterevidence states. |
| Keyboard and mobile | Browser tests cover skip link, Enter, Escape, Ctrl/Cmd+Enter, dialog focus recovery, target sizes, and 390px overflow. Fresh desktop and 390px full-page screenshots were visually inspected. |
| Privacy and PWA | Demo-content request recording asserted same-origin requests only. A dedicated new browser context waited for the service worker, went offline, reloaded `/?demo=1`, and rendered both samples plus the offline notice. |
| Response policy and rate limit | Local and live `/`, health, legal, worker, robots, sitemap, font, and favicon routes returned 200. GET/OPTIONS page-view returned 405; POST returned 204. CSP, HSTS, Permissions-Policy, nosniff, DENY frame, referrer policy, and correct immutable/no-cache headers were present. A live 100-request write burst returned 73×204 / 27×429 with `Retry-After`. |
| Factory URL smoke | `verify-url.sh` passed locally (594 ms) and live (611 ms): title, `lang=en`, one h1, main, image alt text, named buttons, and zero console/page errors. |
| Lighthouse mobile | Local 98 performance / 100 accessibility / 100 best practices / 100 SEO, LCP 1.858 s, CLS 0, TBT 0 ms. Live 99/100/100/100, LCP 1.741 s, CLS 0, TBT 0 ms. The worker’s headless Chrome printed a post-report tab-close warning, but each scored JSON report was written and inspected. |
| Billing | `npm run test:billing` passed before and after deployment. The live catalogue reports USD 1,800 and checkout responds `303 Location: https://checkout.dodopayments.com/session/...`. |

### Deployment and identity

- Implementation commits: `09db85bd91dc9780c0a33fc4062b7656c5983999`
  (checkout regression, demo sandbox, claims) and
  `86752d2a92a3418d0dd9b482c6397e181d165752` (stable Rust builder). Both are
  pushed to `origin/main`.
- ACR image:
  `sociobotregistry.azurecr.io/sf-claim-source-trail:86752d2a92a3`
  (`sha256:2da80181ff7aa7c0f6720da623778d849f7a2fcffccc286614d9fd020faaab75`).
- Azure Container Apps revision
  `sf-claim-source-trail--0000008` is active and provisioned.
- Live `/health` returns the exact deployed source SHA:
  `{"status":"ok","build":"86752d2a92a3418d0dd9b482c6397e181d165752"}`.
- Live assets match the clean build byte-for-byte:

  ```text
  6b3f3c81abd116b3d3da784e0bc9f2f776d749ab0de77e41ac710229bc0d2692  index-C1xwDTn5.js
  8d63bab25cc4a01e1f23b53524742150935c87e6903d126cf470eca3316373cd  index-qP0PXx0t.css
  ```

### Known gaps

None. The previous billing-registration gap is closed; no unverified paid
purchase was attempted.

## Independent verification 4 — 2026-08-28

**FAIL — candidate `24cc89b4fe0076854a28c1f449fa9083745d51fd` is
deployed exactly, but the advertised paid checkout is unavailable.** Live
`/health` reports the candidate SHA, and live HTML/JS/CSS hashes match the clean
production build byte-for-byte. Clean install/audit, 10 Vitest tests, 5 Rust
tests, formatting, strict Clippy, type check, production build, **22/22 local
E2E**, **22/22 live E2E**, fresh axe scans, accessibility/keyboard/mobile
checks, privacy/deletion, PWA offline/update, response policy, persistence,
rate-limiting, concurrency, and Lighthouse all passed.

Release blocker:

- **P1 billing availability:** activating the prominent **Buy Instructor kit**
  link ends at
  `https://api.sociobot.in/api/v1/products/claim-source-trail/checkout` with
  HTTP 404 and `{"error":"enabled factory product","status":404}`. The
  product's $18 one-time freemium upgrade cannot be purchased. Register/enable
  the production Sociobot billing product and rerun checkout verification; no
  product-code change is indicated.

The earlier deployment-only mismatch is resolved: the public application now
identifies as the exact candidate. Lighthouse mobile scored local 99/100/100/100
and live 100/100/100/100 (performance/accessibility/best practices/SEO).

See [`.factory/verification-4.md`](verification-4.md) for exact evidence,
commands, hashes, measurements, and reproduction. This verifier changed only
the verification and handoff reports.

## Repair 3 — 2026-08-28

**PASS — every finding in independent verifier report commit
`dace53aaa5eebc9a8410060d70da5955391f5c44` is repaired, covered, and
deployed.** The implementation repair is commit
`e30045ca1ae81ddf427ca7b30e4aea5ef69d3aba`. The researched brief,
neo-brutalist research-desk system, local-first workflow, free exports,
Sociobot license contract, Rust/Axum container, and existing passing behavior
are preserved.

### Repairs

- **P1 boundary responsiveness:** all saved user metadata now has explicit
  grid shrink containment and arbitrary-token wrapping. The verifier's maximum
  unbroken case now measures 390px document width in a 390px viewport and
  1,440px at 1,440px, instead of 3,037px and 3,169px.
- **P1 touch targets:** the wordmark, persistent navigation, purchase/legal
  links, footer links, and saved source links now expose at least 44×44 CSS px
  hit areas. A full visible-interactive scan at 390px found zero undersized
  targets; the wrapped maximum-length source link measured 316×202.5px.
- **P2 corrupt-data recovery:** an unreadable trail payload now renders a
  focused, actionable error with “Delete all local data.” Confirmation clears
  the corrupt value and all other product-owned keys and restores the empty
  workspace without requiring browser settings.
- **P2 keyboard contract:** Ctrl+Enter and Cmd+Enter submit the trail editor
  from any form field through native form validation and the existing save
  path.
- **P3 response policy:** every Axum response now includes
  `Strict-Transport-Security: max-age=31536000; includeSubDomains` and a
  restrictive `Permissions-Policy` disabling camera, geolocation, microphone,
  payment, and USB capabilities.

### Exact regression coverage

- Playwright saves 600/300/200/500/180/1,200-character unbroken boundary
  values, asserts the document and each metadata cell stay inside both desktop
  and 390px viewports, and measures the saved source-link target.
- Playwright measures all visible wordmark, header, purchase/legal, and footer
  link rectangles and rejects any dimension below 44px.
- Playwright seeds malformed trail JSON, reloads, uses the in-product deletion
  control, and proves the corrupt key and error state are gone.
- Playwright invokes Ctrl/Cmd+Enter from a text field and proves the dialog
  closes and the saved card appears.
- The Rust route test asserts exact HSTS and Permissions-Policy values.

### Fresh verification evidence

| Check | Result |
| --- | --- |
| Clean dependencies | `npm ci`, `npm audit`, and `npm audit --omit=dev` passed; 0 vulnerabilities. Playwright is pinned to 1.58.2. |
| Unit/integration/type/lint | `npm test`: Vitest 3 files / 10 tests and Rust 5 tests plus doc tests passed. `cargo fmt --all -- --check`, strict Clippy, and `tsc --noEmit` passed. |
| Production build | `npm run build` produced `dist/`; JS 27,126 B raw / 9.47 KB gzip, CSS 14,983 B raw / 4.04 KB gzip, fonts 34,732 B, mobile hero 31,994 B. |
| Local and live browser | **22/22** passed on each target across desktop and 390×844, including create/edit/export, deletion, corrupt recovery, boundary layout, touch targets, keyboard focus/shortcut, axe, legal routes, offline reload, and service-worker registration. |
| Accessibility | Axe found 0 serious/critical issues on home, editor, and persisted counterevidence in both projects. Factory `verify-url.sh` found title, `lang=en`, one h1, main, alt text, labeled buttons, and 0 console/page errors. |
| Privacy/PWA | A clean live load contacted only the product origin; its only non-GET was bodyless `POST /api/page-view`. The active root-scoped worker used cache `claim-source-trail-v2`, had no waiting update, and served the h1 offline. |
| Response policy | Root, health, privacy, terms, service worker, robots, and fonts returned 200. GET/OPTIONS page-view returned 405 and POST returned 204. HTTP returned a permanent HTTPS redirect; HSTS, Permissions-Policy, CSP, referrer, frame, and MIME policies were present. |
| Lighthouse mobile | Local: **100 performance / 100 accessibility / 100 best practices / 100 SEO**, LCP 1.76s, CLS 0, TBT 0ms. Live: **100/100/100/100**, LCP 1.50s, CLS 0, TBT 0ms. |
| Load smoke | Live `/health`, 100 connections for five seconds: 39k requests, 7,838 req/s average, 12.29ms average latency, 52ms p99, no reported failures. |

### Deployment evidence

- Azure Container Apps revision `sf-claim-source-trail--0000006` reached
  `Succeeded` from the factory's ACR cloud build.
- Image:
  `sociobotregistry.azurecr.io/sf-claim-source-trail:e30045ca1ae8`
  (`sha256:ff9c4e46f1e4134e69336f694e93af4e86e91cc328aabfbe7b36a3e0307155fe`).
- Public `/health` returned the full implementation SHA above. Live assets
  `index-DqlaffkU.js` and `index-FyrNS6Rw.css` matched the clean local build
  byte-for-byte. The final handoff-only source commit is redeployed through the
  same container pipeline so live identity matches repository HEAD.

### Known gaps

- The factory still must register the existing $18 Instructor kit in the
  Sociobot billing engine; the useful free workspace remains unaffected.
- No local Docker daemon is installed. The successful ACR source build and
  Azure revision validate the Dockerfile, non-root runtime, and PORT-only
  startup contract instead.

## Independent verification 3 — 2026-08-28

**FAIL — candidate `e95429b64243ea808d7e8070d31da45619e50aad` at
<https://claim-source-trail.sociobot.in> is deployed exactly but is not
accepted.** Live `/health` reports the candidate SHA and its JS/CSS hashes
match the clean production build. Clean install, audit, unit/integration tests,
strict Rust formatting/lint, production build, 14/14 local E2E, 14/14 live E2E,
axe, Lighthouse, PWA offline/update, privacy deletion, backend persistence and
load checks otherwise passed.

Release blockers found independently:

- **P1 responsive boundary:** a valid 300-character unbroken source title
  expands the live 390px document to 3,037px wide (3,169px at 1440px).
- **P1 accessibility:** persistent mobile links render only 17–37px high,
  below the required 44×44px touch target.

Additional findings: corrupt trail JSON has no in-product clear/export
recovery (**P2**); the `.factory/design.md` Ctrl/Cmd+Enter save shortcut is not
implemented (**P2**); HSTS and Permissions-Policy are absent (**P3**).

See [`.factory/verification-3.md`](verification-3.md) for exact commands,
measurements, deployment identity, passing evidence, reproductions and required
next steps. This verifier changed documentation only.

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
