# Independent verification 9 — PASS

Date: 2026-09-01  
Work order: `claim-source-trail-verify-9`  
Candidate: `afc3897253cfb95d9df0cde94a78e7821c457c24`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**PASS — accept candidate `afc3897253cfb95d9df0cde94a78e7821c457c24`.**

No release-blocking defects were found. This verification changed no product
code.

## Mandatory opening checks

### Claim manifest and demo checks — PASS

`.factory/claims.json` is present and contains 17 claims. After a clean
`npm ci`, I ran every listed command separately against the shipped demo
entry point. All passed.

| Claim | Result |
| --- | --- |
| `free-exports` | PASS — Markdown and CSV sample downloads on desktop and 390 px |
| `demo-isolated` | PASS — demo is separate and discards correctly |
| `demo-sample-count` | PASS — exactly two sample trails |
| `saved-trails-only` | PASS — no stored trail before save |
| `local-content` | PASS — recorded requests remain same-origin |
| `no-account` | PASS — create and export without sign-in |
| `trail-workflow` | PASS — create, revise, search, filter, delete, and undo |
| `offline-reload` | PASS — cached demo reloads offline |
| `offline-export` | PASS — both exports work offline |
| `paid-checkout` | PASS — product checkout responds with the documented Dodo redirect |
| `refund-policy` | PASS — terms identify the merchant and license result of a refund |
| `hero-art-provenance` | PASS — disclosure, shipped asset, and terms details are present |
| `no-ai-routing` | PASS — no model endpoint during sample editing |
| `instructor-tools` | PASS — local cohort, labels, and retention choices work |
| `anonymous-page-count` | PASS — browser flow plus Rust schema test |
| `complete-deletion` | PASS — all product-owned browser storage is removed |
| `license-verification` | PASS — product-scoped URL and daily cached verdict |

### Cold first read — PASS

I opened the live root in a fresh browser context at 1440×900. The first
screen says what it does: **“Connect each claim to its source.”** It names its
audience: **“Undergraduate humanities and social-science students…”** It gives
the first action: **“Try it with sample data”**, followed by the plain result:
**“Opens two sample trails. Your real workspace stays unchanged.”**

The action opens `/?demo=1#workspace` in one click, shows two realistic
humanities trails, and provides the persistent demo notice, **Reset demo**,
and **Start for real**.

## Clean checkout and production build — PASS

- `npm ci` installed 213 packages; `npm audit` and `npm audit --omit=dev`
  both reported 0 vulnerabilities.
- `npm test` passed: 11 Vitest tests and 7 Rust tests.
- `cargo fmt --all -- --check` and
  `cargo clippy --all-targets --all-features -- -D warnings` passed.
- The exact production build passed with
  `VITE_BUILD_SHA` and `BUILD_SHA` set to the candidate. It produced `dist/`.
- The full local Playwright matrix passed: 60/60 checks across desktop and
  390×844 (`test-results/.last-run.json` records `status: "passed"`).

| Resource | Observed | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 32,301 B raw / 11,060 B gzip | ≤ 200 KB |
| CSS | 15,739 B raw / 4,190 B gzip | ≤ 50 KB |
| Two self-hosted WOFF2 fonts | 34,732 B | ≤ 120 KB |
| Mobile hero WebP | 31,994 B | ≤ 300 KB |

`npm run test:billing` was not run because its first request is an unscoped
catalogue request outside this product’s permitted boundary. The exact
product-scoped checkout behavior is covered by `paid-checkout` above.

## Live identity and functional checks — PASS

- `/health` returned
  `{"status":"ok","build":"afc3897253cfb95d9df0cde94a78e7821c457c24"}`.
- A clean build stamped with that SHA byte-matches the live frontend:
  `index-BNRlbIdd.js` SHA-256
  `0fbef71994b1eb36759951f5d7e883dd8a77099fcf78816d9479b11978f2737c`, and
  `index-63NSupJp.css` SHA-256
  `fc68b92dc167350b22803462a7ea71e9b47d35d8a66b3e4af9fa55fe4448a0d2`.
- A live representative trail saved with a valid DOI, exact locator,
  paraphrase, reason, and counterevidence. It displayed **Ready to
  spot-check** and generated the documented DOI link.
- An invalid source reference kept the editor open, announced
  “Enter a full http(s) URL or a DOI beginning with 10.”, set
  `aria-invalid="true"`, and recovered after a valid DOI was entered.
- A fresh 390 px demo flow loaded two trails, revised a sample locally,
  exported Markdown, and discarded the demo namespace with Start for real.
- A fresh live offline check found an active root service worker with no
  waiting worker. The cached demo reloaded offline, showed the offline notice,
  and exported CSV containing the sample.

## Accessibility, privacy, routing, and performance — PASS

- `/opt/fleet/lib/verify-url.sh` passed for the live root: HTTP 200 in 676 ms,
  correct title and language, one h1, main landmark, image alternatives,
  labelled controls, and no application console or page errors.
- Independent Axe scans found zero serious or critical items on demo, Privacy,
  Terms, and the designed 404 at desktop and 390 px.
- All visible links, buttons, inputs, selects, and textareas on `/`, demo,
  Privacy, Terms, and the designed 404 measured at least 44×44 CSS px in both
  viewports. Both populated demo viewports had zero horizontal overflow.
- Keyboard checking confirmed the visible 4 px yellow focus outline, Enter to
  open the editor, initial focus on the claim field, and Escape returning
  focus to the trigger. Reduced motion computed to `0.00001s`.
- Recorded outgoing requests during live demo editing contained only
  `https://claim-source-trail.sociobot.in`. The sole POST was the bodyless
  `/api/page-view`; the representative claim and source text were absent.
- Root, Privacy, Terms, demo, service-worker, robots, sitemap, favicon,
  apple touch icon, and social image returned 200. The designed unknown route
  returned 404 with its own title and h1. Internal product links returned their
  expected 200 responses; the 404 page’s own skip link correctly retains 404.
- Live headers include CSP, HSTS, `nosniff`, frame denial, strict-origin
  referrer policy, and restrictive Permissions-Policy. HTML and health use
  `no-cache`; assets and fonts use one-year immutable caching.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100,
  SEO 100; LCP 1.577 s, CLS 0, TBT 96 ms, 118,465 B transferred.

## Backend, persistence, and allowance checks — PASS

- A clean local runtime started with an empty environment plus only
  `PORT=18081`. It served the candidate health identity before and after a
  controlled restart.
- The isolated local SQLite database retained three page-count increments
  across that restart. Its only table has exactly `day` and `count` columns.
- A live 50-request concurrent check from one first forwarded client address
  returned 40×204 and 10×429. Every 429 supplied `Retry-After: 19`. A separate
  client immediately received 204; `GET /api/page-view` returned 405; health
  remained 200. The observed allowance is therefore a 40-request burst per
  first client address.

## Defects by severity

### P0

None.

### P1

None.

### P2 / P3

None.

## Scope notes

The product is a web application with a backend, not a library or CLI. No
sign-in is required for the free workflow, so identity-provider checking is
not applicable. No unrelated service, database, key vault, secret, app
setting, or storage resource was read or changed.
