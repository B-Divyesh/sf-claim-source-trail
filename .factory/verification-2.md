# Independent verification 2 — FAIL

Date: 2026-08-28
Work order: `claim-source-trail-verify-2`
Candidate: `c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5`
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL — do not accept candidate `c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5`.**

Fresh evidence confirms the deployment is healthy and is exactly this candidate,
and the central local-first claim-trail workflow works. However, it still fails
two non-negotiable acceptance requirements:

1. **P1 privacy/deletion:** the action labelled “Delete all local data” retains
   the product's stored Sociobot license token and cached license verdict.
2. **P1 accessibility:** a saved counterevidence card has an axe **serious**
   `color-contrast` violation: white `Counterevidence` text on `#d94f36` is
   **4.09:1**, below the required **4.5:1** for its 14px bold text.

The first issue independently reproduces the earlier verification failure;
the second was found by exercising the counterevidence path, which the supplied
browser suite does not axe-scan after saving a counterevidence record.

## Clean checkout and quality gates

- Created a detached, clean git worktree at the exact candidate SHA before
  installing dependencies.
- `npm ci`: completed, 212 packages installed. `npm audit --omit=dev`: **0
  vulnerabilities**.
- `npm test`: passed — Vitest **3 files / 8 tests**; Rust **4 tests**, binary
  test target, and doc tests all passed.
- No lint script is defined. The available type check, `tsc --noEmit`, passed
  as part of the exact release command.
- `npm run build`: passed — TypeScript, Vite production output, and Cargo
  release binary. `dist/` contains the expected production shell.
- With the production binary started using only `PORT=18080`,
  `BASE_URL=http://127.0.0.1:18080 npm run test:e2e` passed **10/10** across
  its desktop and 390x844 mobile projects.

Clean-build budget evidence:

| Asset | Raw | Gzip / verdict |
| --- | ---: | --- |
| Initial JavaScript | 26,576 B | 9.30 KB; passes ≤200 KB |
| CSS | 14,633 B | 3.96 KB; passes ≤50 KB |
| WOFF2 fonts | 34,732 B | passes ≤120 KB |
| Mobile hero WebP | 31,994 B | passes ≤300 KB |

An attempted fresh Lighthouse mobile run could not attach to the supplied
headless Chrome (`Unable to connect to Chrome`), so no new Lighthouse score is
claimed here. Bundle budgets, responsive visual inspection, and browser
interaction checks above are fresh evidence. Docker and Podman are not
installed in this worker, so the Dockerfile was inspected but could not be run.

## Product, responsive, keyboard, and accessibility evidence

- On the live app, a normal claim with source, locator, excerpt/paraphrase,
  reasoning, and counterevidence saved as **Ready to spot-check**. Markdown and
  CSV are free controls; search no-results, counterevidence filter, deletion
  confirmation, and 10-second Undo all worked.
- Empty required claim/source submission announces both actionable errors and
  then recovers after completion. A 600-character claim (its declared maximum)
  and normal source metadata saved successfully.
- Desktop (1440px) and 390px mobile screenshots were visually inspected. The
  390px page had no horizontal overflow. The UI stacks intentionally on mobile
  and all primary controls remain visible.
- Keyboard suite: Enter opens the editor, Escape closes it and returns focus
  to the invoking button. The document includes the skip link and designed
  `:focus-visible` outline. With reduced motion emulated, button transition
  duration was `0.00001s` and scrolling is non-animated.
- Fresh home/editor axe checks have no serious or critical results, but the
  representative counterevidence state has the serious contrast defect below.
  Browser console and page-error listeners recorded **no errors** during the
  representative normal, invalid, recovery, desktop, and mobile flows.

### P1 — counterevidence badge fails contrast (release blocker)

**Live reproduction:** create a complete trail, check “Mark as
counterevidence,” save, then run axe on the saved card.

```text
Rule: color-contrast (serious)
Target: .stance
Element: <span class="stance counter">↯ Counterevidence</span>
Observed: #ffffff on #d94f36 = 4.09:1
Required: 4.5:1 for 14px bold text
```

This violates the supplied WCAG baseline and definition of done. Change the
badge foreground/background to meet 4.5:1 or make the text large enough only
if the resulting UI still meets the corresponding large-text definition.

## Privacy, backend, policies, PWA, and deployment

- A fresh normal live load requested only same-origin JS, image, fonts, and
  `POST /api/page-view`; no third-party analytics, font CDN, or student claim
  content request was observed. The source permits only same-origin connections
  plus Sociobot's billing API in CSP.
- `/`, `/health`, `/privacy`, `/terms`, `/sw.js`, and `robots.txt` returned
  200. `/api/page-view` returned 405 to GET and 204 to POST. Live responses
  set CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- The backend started with `PORT` alone and created its default SQLite store.
  A 100-concurrent local POST smoke produced **40 × 204** and **60 × 429**,
  demonstrating the configured global write limit. Direct SQLite inspection
  found only `day` and `count` in `page_views` and a count of 40: no learner
  content is persisted server-side.
- Live PWA evidence: an active root-scoped `/sw.js` controller populated
  `claim-source-trail-v2`; an offline reload showed “Make every claim
  traceable.” Service-worker update checking left no waiting worker on this
  unchanged candidate.
- `/assets/hero-trail.webp` has one-year immutable caching. HTML, service
  worker, health, and WOFF2 fonts return `no-cache`.
- Live `/health` returned the exact candidate identity:

```json
{"status":"ok","build":"c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5"}
```

  SHA-256 matched the clean `dist` files to deployment:

```text
index-BervoY0h.js  8ad1a9163b6b22e22c544faab292b5aacc05dcbee01abd3e75ee9402bf640327
index-BGXGeNZ4.css 31ba51244941436fe6e7c52efd8cd820e8222d9b385c653b19ecd15bb40a7705
```

### P1 — “Delete all local data” retains a reusable license credential (release blocker)

**Live reproduction:** opened
`https://claim-source-trail.sociobot.in/?license=qa-reusable-token`, created a
trail, selected **Delete all local data**, and accepted the browser
confirmation. Product-owned license data remained in localStorage:

```json
{
  "sb_license:claim-source-trail": "qa-reusable-token",
  "sb_license:claim-source-trail:verdict": "{\"valid\":false,\"reason\":\"invalid\",\"checkedAt\":...}"
}
```

`claim-source-trail:page-counted` also remains. The page-count marker is not a
credential, but retaining the license token and verdict directly contradicts
both the control label and the privacy page's statement that this action deletes
local data. The fix must delete every product-owned key (including license and
verdict) or accurately scope the label and provide a complete-deletion control.

### P3 — fonts revalidate on every visit

The two static WOFF2 files are served `Cache-Control: no-cache`. This is not a
release blocker, but misses the requested long-lived caching treatment for
static assets and creates avoidable repeat validation. Versioned font URLs plus
immutable caching would resolve it safely.

## Required next step

Fix the complete local-data deletion and counterevidence contrast defects,
deploy a new immutable candidate, then rerun independent verification. Do not
use this candidate's passing unit/e2e suite as a substitute: it currently
misses both release-blocking states.
