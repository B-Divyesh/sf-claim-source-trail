# Independent verification 3 — FAIL

Date: 2026-08-28  
Work order: `claim-source-trail-verify-3`  
Candidate: `e95429b64243ea808d7e8070d31da45619e50aad`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL — do not accept candidate `e95429b64243ea808d7e8070d31da45619e50aad`.**

The candidate is deployed, the prior privacy and contrast defects are fixed,
and the normal product workflow is healthy. Fresh boundary and accessibility
testing nevertheless found two release-blocking acceptance failures:

1. A source title accepted at its declared 300-character limit can expand a
   saved card to **3,037 CSS px in a 390px viewport** (and 3,169px at desktop),
   making the mobile workspace horizontally unusable.
2. Multiple persistent navigation and legal links have **17–37px-high** touch
   targets on the 390px layout, below the contract's non-negotiable 44×44px
   target size.

The repository's supplied browser suite does not cover either condition and
therefore passes despite these findings.

## Clean checkout and quality gates

- The provided checkout began clean on `main`, exactly at the candidate SHA;
  `origin/main` also resolved to that SHA. Installation began before any file
  was changed.
- Environment: Node `22.23.2`, npm `10.9.8`, Rust/Cargo `1.98.0`.
- `npm ci`: passed, 212 packages installed.
- `npm audit` and `npm audit --omit=dev`: **0 vulnerabilities**.
- `npm test`: passed — Vitest **3 files / 10 tests**; Rust **5 tests**, binary
  target and doc tests all passed.
- `cargo fmt --all -- --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- No npm lint script exists. Type checking is part of the exact build and
  passed.
- `npm run build`: passed — `tsc --noEmit`, Vite production build, and Cargo
  release build; `dist/` was produced.
- The first E2E invocation could not launch because this checkout resolves
  Playwright 1.62.1 while the worker image only had a 1.58.2 browser. Following
  the work-order instruction, `npx playwright install chromium` installed the
  matching browser. The final local and live results below are from that
  browser and are passing.
- Docker/Podman is unavailable in the worker, so the Dockerfile could not be
  executed. Inspection confirms multi-stage builds, no `.git` dependency,
  `ARG BUILD_SHA=unknown`, a non-root runtime user, port 8080, and the expected
  entrypoint. The release binary itself was exercised with only `PORT=18080`.

Clean-build budgets:

| Resource | Result | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 26,871 B raw / 9.38 KB gzip | ≤ 200 KB |
| CSS | 14,641 B raw / 3.97 KB gzip | ≤ 50 KB |
| Two WOFF2 fonts | 34,732 B total | ≤ 120 KB |
| Mobile hero WebP | 31,994 B | ≤ 300 KB |

Lighthouse 13 mobile results:

| Target | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local release | 97 | 100 | 100 | 100 | 1.99 s | 0 | 170 ms |
| Live deployment | 99 | 100 | 100 | 100 | 1.53 s | 0 | 129 ms |

## End-to-end product QA

`BASE_URL=http://127.0.0.1:18080 npm run test:e2e` and the same command against
the live URL each passed **14/14** across desktop and 390×844 projects. The
suite covers create/complete/export, empty/editor/counterevidence axe scans,
complete local-data deletion, dialog keyboard focus, cached offline reload,
and legal routes.

Additional independent local and live exercises established:

- A representative claim with DOI/source metadata, exact locator, paraphrase,
  reasoning and counterevidence persisted across reload and became “Ready to
  spot-check.” Markdown and CSV exports are available without payment; CSV
  included the locator and reason and used the expected filename.
- Empty claim/source submission produced both actionable errors, moved focus
  to the alert, and recovered after valid values were supplied.
- Search no-results and recovery, counterevidence filtering, named delete
  confirmation, cancel, delete and Undo all worked.
- A 600-character claim and 300-character source title were accepted and
  persisted. A `javascript:` source reference rendered with inert `href="#"`.
  The same boundary case exposed the P1 overflow defect below.
- Full keyboard traversal reached the skip link, primary navigation and editor;
  Enter opened the modal, initial focus moved to the claim field, Space toggled
  counterevidence, and Tab/Enter saved the trail. Escape/trigger focus recovery
  passed in the supplied suite. The keyboard shortcut promised by the design
  thesis did not work (P2 below).
- Keyboard-focused skip link had a visible 4px yellow outline plus a 7px ink
  halo. Under `prefers-reduced-motion: reduce`, transition duration was
  `0.00001s` and root scroll behavior was `auto`.
- Fresh live axe scans on home, open editor, and a saved counterevidence card
  found **0 serious/critical violations** on both desktop and 390px projects.
  Console errors and page errors were **0** in the representative normal,
  invalid, boundary, desktop and mobile flows.
- Fresh visual inspection of the normal 1366px and 390px screenshots found the
  intended neo-brutalist hierarchy and no normal-state clipping. The boundary
  screenshot visibly confirms the horizontal-layout failure below.

## Privacy, PWA, backend and deployment evidence

- A clean normal load contacted only the product origin. The only non-GET
  product request was same-origin `POST /api/page-view` with no body; no claim,
  source, locator or note content left the browser.
- A fake license return token was removed from the page URL, stored under the
  documented local key, and sent only to
  `https://api.sociobot.in/api/v1/products/claim-source-trail/verify`. The API
  returned an invalid verdict and the UI stayed usable. “Delete all local
  data” then left **zero** product-owned trail, marker, license or verdict keys.
- Live service worker evidence: active controller and root scope from
  `/sw.js`, cache `claim-source-trail-v2`, `registration.update()` produced no
  waiting worker for this unchanged shell, and an offline reload rendered
  “Make every claim traceable.” with no console/page errors.
- Local runtime with only `PORT` set created the default SQLite file and served
  successfully. Restarting the process retained the daily count. Direct DB
  inspection found exactly one table, `page_views`, with only `day` and `count`
  columns.
- A simultaneous 100-request page-view burst produced **40×204 / 60×429**,
  confirming the configured global burst limit. A 100-connection, five-second
  `/health` smoke completed **121k requests**, averaging 24,126 requests/s,
  3.57ms latency, 49ms p99 and zero reported request failures.
- `/`, `/health`, `/privacy`, `/terms`, `/sw.js`, `robots.txt`, and versioned
  fonts/assets returned 200. GET and OPTIONS `/api/page-view` returned 405;
  POST returned 204. HTTP redirects permanently to HTTPS.
- Root, API and health responses include CSP, `nosniff`, frame `DENY`, and
  `strict-origin-when-cross-origin`. CSP permits connections only to self and
  the Sociobot billing API. Hashed assets, hero art and versioned fonts use
  one-year immutable caching; HTML, health and the service worker use
  `no-cache`. No HSTS or Permissions-Policy header was observed (P3 below).
- Factory `verify-url.sh` passed against the live URL: HTTP 200 in 704ms,
  title/lang/one h1/main present, no missing image alt, no unlabeled buttons,
  and no console/page errors.

### Deployment identity

Live `/health` returned the exact candidate:

```json
{"status":"ok","build":"e95429b64243ea808d7e8070d31da45619e50aad"}
```

The live HTML named the same production assets as the clean build. Both hashes
matched byte-for-byte:

```text
08e9276f2f26c8bf7fa0afdd606f8c10f975084638cd7b85fd942de009ca0758  index-CbhUDxDw.js
6efcc4dd05e29baca230b2de066dd9101de587cba298f02111b3c1729a0132fc  index-xEV_o0TD.css
```

## Defects

### P1 — valid boundary input destroys responsive layout (release blocker)

Reproduced identically in the clean local release and live deployment:

1. Add a claim.
2. Enter any valid claim, a source title containing 300 unbroken characters
   (the field's declared `maxlength`), and otherwise valid optional fields.
3. Save and inspect the workspace at desktop and 390px.

Observed document dimensions after save:

```text
1440px viewport -> 3169px document scroll width
 390px viewport -> 3037px document scroll width
```

The saved source `<dd>` does not wrap long tokens, so the card and page become
many screens wide. This violates the explicit mobile/no-overflow contract and
fails required boundary-value handling. Apply breaking/containment to all
user-rendered metadata (not only headings), then add an E2E assertion after
saving maximum-length unbroken values.

### P1 — mobile touch targets are below the required 44×44px (release blocker)

At 390px, computed visible target rectangles included:

```text
Claim Source Trail home: 150×37
Workspace:                71×21
Privacy (header):         47×21
Terms (purchase copy):    37×17
Privacy (footer):         47×21
Terms (footer):           40×21
```

Saved source links are also only 18px high. These persistent controls violate
the attached accessibility baseline and design contract requiring touch/click
targets of at least 44×44 CSS px. Axe does not test this project-specific
44px rule, so its clean report does not negate the finding.

### P2 — corrupt local storage has no in-product recovery

With `claim-source-trail:trails:v1` set to malformed JSON, every reload shows
the local-data error but retains the corrupt value. The error says to “Export
or clear this browser’s site data,” while the UI renders **0 export controls**
and **0 “Delete all local data” controls** because no trails could be loaded.
Recovery requires browser settings rather than the product's promised clear
deletion control.

### P2 — documented Ctrl/Cmd+Enter save shortcut is absent

The source-of-truth design thesis promises “Ctrl/Cmd+Enter saves the editor.”
Fresh keyboard testing after filling the required fields left the dialog open
and saved zero cards. Tab to the visible Save button and Enter does work, so
this is a contract/documentation mismatch rather than a keyboard trap.

### P3 — strict browser transport/capability policies are incomplete

The HTTPS deployment redirects HTTP and has a strong CSP, but responses did
not include `Strict-Transport-Security` or `Permissions-Policy`. Add these at
the app or hosting edge and verify them on the public hostname.

## Required next step

Fix the boundary wrapping and 44px touch-target failures, add regression tests
that measure the post-save 390px state and persistent link rectangles, deploy a
new immutable candidate, and rerun independent verification. The corrupt-data
recovery and promised keyboard shortcut should be repaired in the same pass.
