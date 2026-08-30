# Independent verification 8 — FAIL

Date: 2026-08-30  
Work order: `claim-source-trail-verify-8`  
Candidate: `0ee3d452cdcf60e2281297b6bd652dec90d2f327`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL — do not accept candidate `0ee3d452cdcf60e2281297b6bd652dec90d2f327`.**

Two independent release blockers remain:

1. The live service is not the candidate. `/health` reports
   `f0262841cbc2ef3a5967d73dfb3654c193933384`, and the served JavaScript is
   byte-identical to a build stamped with that older SHA. The candidate has a
   functional backend rate-limit change after that revision.
2. Manual 390 px touch-target measurement finds the footer **Art details**
   link at 65×17 px on every SPA route. The designed 404 also has **Demo** at
   42×44 px and **Terms** at 43×44 px. These fail the supplied non-negotiable
   44×44 px accessibility baseline.

No product code was changed during verification.

## Mandatory first gates

### Claims manifest — PASS after clean install

The supplied checkout began clean at the exact candidate SHA. The first
pre-install invocation correctly exposed that dependencies were absent. After
`npm ci` from the lockfile, every exact command in `.factory/claims.json` was
run separately from the beginning. Every claim ID appears in exactly one
tagged test.

| Claim | Result |
| --- | --- |
| `free-exports` | PASS — desktop and 390 px |
| `demo-isolated` | PASS — desktop and 390 px |
| `demo-sample-count` | PASS — desktop and 390 px |
| `saved-trails-only` | PASS — desktop and 390 px |
| `local-content` | PASS — desktop and 390 px |
| `no-account` | PASS — desktop and 390 px |
| `trail-workflow` | PASS — desktop and 390 px |
| `offline-reload` | PASS — desktop and 390 px |
| `offline-export` | PASS — desktop and 390 px |
| `paid-checkout` | PASS — desktop and 390 px |
| `refund-policy` | PASS — desktop and 390 px |
| `hero-art-provenance` | PASS — desktop and 390 px |
| `no-ai-routing` | PASS — desktop and 390 px |
| `instructor-tools` | PASS — desktop and 390 px |
| `anonymous-page-count` | PASS — desktop, 390 px, and Rust schema assertion |
| `complete-deletion` | PASS — desktop and 390 px |
| `license-verification` | PASS — one Vitest assertion |

### Cold first read — PASS

The first 1440×900 live viewport answers all three required questions:

- What it does: **“Connect each claim to its source.”** The visible sequence
  adds source, location, and reasoning.
- Who it is for: **“Undergraduate humanities and social-science students…”**
- What to click first: **“Try it with sample data”**, followed by **“Opens two
  sample trails. Your real workspace stays unchanged.”**

One click opens `/?demo=1#workspace` with two complete humanities trails. The
persistent demo banner identifies the isolated sample state and provides
**Reset demo** and **Start for real**. The first screen remains clear at
390×844 with no horizontal overflow.

## Clean checkout and quality gates

- `npm ci`: PASS — 213 packages, 0 audit vulnerabilities.
- `npm test`: PASS — 11 Vitest tests and 7 Rust tests; binary and doc targets
  also pass.
- `npm audit` and `npm audit --omit=dev`: PASS — 0 vulnerabilities.
- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets --all-features -- -D warnings`: PASS.
- No separate lint script exists. `tsc --noEmit` is part of the production
  build and passes.
- Exact `npm run build`: PASS — Vite output exists in `dist/` and the release
  Rust binary builds.
- Complete local Playwright matrix: **60/60 passed**.
- Complete live Playwright matrix: **60/60 passed**.

Clean-build budgets:

| Resource | Observed | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 32,264 B raw / 11,022 B gzip | ≤ 200 KB |
| CSS | 15,730 B raw / 4,193 B gzip | ≤ 50 KB |
| Two WOFF2 fonts | 34,732 B | ≤ 120 KB |
| Mobile hero WebP | 31,994 B | ≤ 300 KB |

The social preview is 1200×630 and the Apple touch icon is 180×180.

The repository's `npm run test:billing` was not invoked because it begins by
reading the unscoped Sociobot product catalogue, which this work order forbids.
The product-scoped checkout and verification routes were tested directly:
checkout returned the required Dodo 303, invalid verification responded, and
the rate limit below was enforced.

Docker and Podman are not installed in this worker. The Dockerfile was
inspected; the exact release binary was exercised directly.

## End-to-end product evidence

Independent live testing, in addition to the 60-test matrices, confirmed:

- A representative claim with a source URL, exact locator, paraphrase,
  reasoning, and counterevidence saves locally as **Ready to spot-check**.
- An invalid source reference produces an announced actionable error, marks
  the field invalid, and recovers after a valid DOI URL is supplied.
- Search no-results and recovery, counterevidence filtering, named deletion,
  cancellation, deletion, and Undo all work.
- Markdown and CSV downloads contain the representative locator and reasoning.
- Maximum-length, unbroken values stay within the viewport in the supplied
  desktop and mobile regression suite.
- The demo has exactly two realistic trails, uses the separate demo storage
  namespace, resets, exits, and leaves the real workspace unchanged.
- All visible internal links returned 200; the designed unknown route returned
  404. The sample DOI redirected, the Beacon Press sample returned 200, and
  the product-scoped checkout returned a Dodo 303.
- Sign-in testing is not applicable: the complete free workflow and demo need
  no account. Library/CLI packaging is not applicable.
- The researched job does not benefit from an AI drafting step: the learner's
  own evidence reasoning is the core task, and no missed-leverage finding is
  warranted.

## Accessibility and responsive evidence

- `/opt/fleet/lib/verify-url.sh` passes when given its required existing
  evidence directory: 200 in 671 ms, title, `lang=en`, one h1, main landmark,
  image alternatives and button names present, with zero console/page errors.
- Playwright Axe finds zero serious or critical violations on home, editor,
  saved counterevidence, and populated demo states at desktop and 390 px.
- Keyboard behavior passes: the first Tab exposes **Skip to main content**;
  its focus treatment is a 4 px yellow outline plus a 7 px ink halo. Enter
  opens the editor, focus moves to the claim field, Escape restores the
  trigger, and Ctrl/Cmd+Enter saves.
- SPA route changes focus the destination h1 and announce it after the intended
  animation-frame handoff; Back restores the home route and heading.
- With reduced motion requested, animations and transitions compute to
  `0.00001s` and scroll behavior is `auto`.
- At 390 px, `scrollWidth == innerWidth == 390`, including the populated demo.
  Desktop and mobile captures were visually inspected with no clipped content.

### P1 — touch targets below 44×44 px

Fresh candidate-local and live 390×844 contexts measured every visible `a`,
`button`, `input`, `select`, and `textarea` on `/`, `/?demo=1#workspace`,
`/privacy`, `/terms`, and an unknown route.

Observed failures:

| Route(s) | Control | Measured box |
| --- | --- | ---: |
| `/`, demo, `/privacy`, `/terms` | Footer **Art details** | 65×17 px |
| Designed 404 | Header **Demo** | 42×44 px |
| Designed 404 | Footer **Terms** | 43×44 px |

The automated test only checks selected persistent navigation and legal links,
so it misses these controls. Increase the effective hit areas to at least
44×44 CSS px and add them to the mobile target-size regression test.

## Privacy, PWA, headers, and performance

- A fresh outgoing-request log across load, create, validation, save, search,
  export, delete/undo, and SPA navigation contained only the product origin.
  The sole non-GET is `POST /api/page-view`; it has no body. Representative
  claim and source text did not appear in any request. No AI, analytics, CDN,
  or tracker endpoint was contacted.
- Browser console errors and page errors: zero on cold load and the normal,
  invalid/recovery, desktop, and mobile flows.
- The root-scoped service worker is active with no waiting worker. A fresh
  context reloads the two-trail demo offline, shows the offline notice, and
  continues exporting both formats.
- Root, legal pages, health, service worker, fonts, images, robots, sitemap and
  the 404 return the expected statuses. HTTP redirects permanently to HTTPS.
- Live responses set CSP, HSTS, `nosniff`, frame `DENY`, strict-origin referrer
  policy, and restrictive Permissions-Policy. CSP permits connections only to
  self and the product's Sociobot billing API.
- HTML, health and the service worker use `no-cache`. Hashed assets, fonts and
  hero images use one-year immutable caching.
- Fresh live Lighthouse mobile: performance **99**, accessibility **100**, best
  practices **100**, SEO **100**; LCP **1.543 s**, CLS **0**, TBT **132 ms**,
  total transfer **118,448 B**.

## Backend, persistence, and rate limits

- The candidate release binary starts with an empty environment plus only
  `PORT=18081`, logs `database_config="generated-default"`, and shuts down
  cleanly.
- Because `/data` is absent in this worker, it correctly falls back to
  `data/claim-source-trail-v2.db`. Restart preserved the aggregate count from
  149 to 150. The only application table is `page_views`, with exactly
  `day TEXT` and `count INTEGER`.
- Candidate local page-count allowance: a simultaneous 100-request burst from
  one first-hop `X-Forwarded-For` client returned **40×204 / 60×429**; all 429s
  had `Retry-After: 19`. A distinct client immediately received 204. The
  candidate therefore has a 40-request burst and one-token-per-20-seconds
  refill (`tower_governor::per_second(20)` sets a period, not 20 requests per
  second). Health is exempt and returned **500/500 HTTP 200**.
- Deployed page-count allowance: a simultaneous 240-request burst returned
  **40×204 / 200×429**, every 429 with `Retry-After: 0`; a distinct client
  immediately received 204. The deployed older build uses a one-second token
  refill.
- Product-unlock allowance: 160 concurrent product-scoped invalid-license
  checks returned **30×200 / 130×429**, all 429s with `Retry-After: 4`.
- GET, PUT, and OPTIONS on `/api/page-view` return 405.

## P1 — deployed build does not match the candidate

Fresh live evidence:

```json
{"status":"ok","build":"f0262841cbc2ef3a5967d73dfb3654c193933384"}
```

Expected candidate:

```text
0ee3d452cdcf60e2281297b6bd652dec90d2f327
```

The frontend proves the same mismatch:

| Artifact | File | SHA-256 |
| --- | --- | --- |
| Live | `index-BcbetlEf.js` | `bcc52dce27555c856e93648f9329ae5bf169033775efe06ead7bae85c9aeaad8` |
| Rebuild stamped `f0262841…` | `index-BcbetlEf.js` | same hash |
| Rebuild stamped candidate | `index-DyKO3dJz.js` | `c78fafd01f61af0db24295490c72abbf9e1e504b9cc9132ef711c255b748c7a0` |

This is not a documentation-only difference. Commit `b41802c`, between the
live revision and candidate, changes the page-view governor from
`per_second(1)` to `per_second(20)`, which changes the observed refill period
from about one second to twenty seconds. Deploy the exact candidate, then
repeat identity, hash, persistence, and rate-limit checks.

## Defects by severity

### P0

None.

### P1

1. The live service and JavaScript build identity are `f0262841…`, not the
   requested candidate `0ee3d452…`; a functional backend change is missing.
2. Three mobile links have effective touch targets below 44×44 px.

### P2 / P3

None beyond the verification limitations stated above.

## Required next step

Increase the three touch targets, add regression coverage for every visible
mobile link, build and deploy a new immutable candidate, then verify that
`/health` and the served asset hashes identify that exact candidate before
rerunning independent QA.
