# Independent verification — FAIL

Date: 2026-08-28  
Work order: `claim-source-trail-verify-1`  
Candidate: `c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL.** The core claim-trail workflow, release build, accessibility checks,
and deployed artifact work, but a release-blocking privacy/deletion defect
violates the brief's requirement to store learner data only with clear
deletion. The UI action named **“Delete all local data”** leaves the locally
stored Sociobot license token and license-verdict cache behind.

This report supersedes the PASS language in the earlier builder/repair
handoff for this candidate.

## Environment and build evidence

- Started from a fresh detached clone of the repository at the candidate SHA;
  `git status` was clean before installation.
- `npm ci` completed (212 packages); `npm audit --omit=dev` reported **0
  vulnerabilities**.
- `npm test` passed: Vitest **3 files / 8 tests**, Rust **4 tests**, and Rust
  doc tests all passed.
- No lint script exists. The available type check is included in the release
  build and passed.
- `npm run build` passed: `tsc --noEmit`, Vite production build, and Cargo
  release build. `dist/` was produced.
- Exact release binary plus `dist/` was served locally by Axum. Its full
  Playwright suite passed **10/10** in both desktop and 390x844 mobile
  projects: create/edit/export, keyboard dialog, offline reload, legal routes,
  overflow, and axe home/editor assertions.

Bundle / asset evidence from the clean build:

| Resource | Raw | Gzip / budget result |
| --- | ---: | --- |
| Initial JS | 26,576 B | 9.30 KB; passes 200 KB budget |
| CSS | 14,633 B | 3.96 KB; passes 50 KB budget |
| WOFF2 fonts total | 34,732 B | passes 120 KB budget |
| Mobile hero WebP | 31,994 B | passes 300 KB budget |

Lighthouse 13 mobile report against the local release server: **99
performance**, **100 accessibility**, LCP **1.873 s**, CLS **0**, TBT **102
ms**. (The runner printed a browser-tab-crash warning after producing this
report; the scored JSON report was retained and inspected.)

Docker/Podman is not installed in this verification worker, so the Dockerfile
could not be executed. The release binary was built and served directly.

## Product and browser QA

The following passed on the live deployment unless noted otherwise:

- Normal flow: create a claim with source metadata, then add locator,
  paraphrase, reasoning, and counterevidence; it changes from incomplete to
  “Ready to spot-check.” Markdown and CSV downloads use the expected names.
- Boundary/input flow: a 600-character claim and 300-character source title
  save; native required-field validation blocks an empty claim/source and
  permits recovery after filling both fields. A `javascript:` source reference
  renders as the inert `#` link rather than an executable URL.
- Recovery flow: delete requires a named confirmation and Undo restores the
  deleted trail. Counterevidence filtering returned `1 of 1 trails shown`.
- No console errors or page errors occurred in representative local or live
  browser runs. A normal fresh page load made no third-party requests; the
  only product telemetry request is same-origin `POST /api/page-view`.
- Keyboard checks passed: Enter opened the editor, Escape dismissed it and
  restored trigger focus. A focused skip link had a visible `4px` yellow
  outline with ink halo. At 390px there was no horizontal overflow
  (`scrollWidth == innerWidth == 390`).
- `prefers-reduced-motion: reduce` set button transitions to `0.00001s` and
  document scroll behavior to `auto`.
- Axe serious/critical findings: **0** on the home page and editor (in the
  passing desktop and mobile Playwright suite).
- Service worker check passed: active controller and scope are
  `https://claim-source-trail.sociobot.in/sw.js` and the origin root;
  `registration.update()` left no waiting worker. The full suite also passed
  cached offline reload on both viewports.

## Backend, privacy, policy, and deployment evidence

- Local release `/health` responded `200` (the direct non-Docker build reports
  `development`, as its compile-time `BUILD_SHA` was not supplied). The live
  endpoint responded `200` with exact candidate identity:
  `{"status":"ok","build":"c25f12c0ec3a0ec681ab4a1773c37abd3e3b04a5"}`.
- The deployed HTML advertises `index-BervoY0h.js` and `index-BGXGeNZ4.css`.
  SHA-256 comparison of both live files with the clean local `dist/` copies
  was identical. Their sizes also match. This confirms the live frontend
  matches the candidate build.
- The API route test proves the SQLite page-view table has only day and count,
  and stores no claim text. A local 100-request concurrent POST smoke yielded
  35 x `204` and 65 x `429`, confirming the configured global burst rate limit
  is active rather than exposing an unbounded write endpoint.
- Live `/`, `/health`, and `/api/page-view` responses set CSP,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict-origin
  referrer policy. CSP permits only self plus Sociobot's billing API for
  connections. `GET`/`OPTIONS /api/page-view` correctly returned `405`; POST
  returned `204`.
- Hashed JS/CSS assets are one-year immutable cached. HTML, service worker,
  health, and fonts are `no-cache`.
- `/privacy`, `/terms`, `robots.txt`, and service worker all returned `200`.

## Defects

### P1 — “Delete all local data” does not delete all local data (release blocker)

**Reproduction on live candidate**

1. Store a license token (for example by returning with `?license=...` or
   using the restore field), then create one local trail.
2. Choose **Delete all local data** and accept the browser confirmation.
3. Inspect origin localStorage or reload the page.

Observed residual keys after the action:

```text
sb_license:claim-source-trail = sensitive-license-token
sb_license:claim-source-trail:verdict = {"valid":false,"checkedAt":...}
claim-source-trail:page-counted = 2026-08-28
```

The implementation only removes the trail and instructor-settings keys.
Leaving the license token and verdict contradicts both the control's plain
language and the privacy page's claim that this action deletes local data.
At minimum the named action must either delete every product-owned key or be
renamed/scoped clearly and provide a separate complete deletion action. This
is especially material because a license token is a reusable credential.

### P3 — static fonts are not long-lived cached

`/fonts/atkinson-400.woff2` and `atkinson-700.woff2` are versionless files
served with `Cache-Control: no-cache`, unlike the immutable hashed JS/CSS
assets. This is not the reason for the FAIL, but it misses the stated static
asset caching policy and causes repeat revalidation.

## Required next step

Fix and test complete local-data deletion, including license and cached verdict
handling, then redeploy a new immutable candidate and rerun this verification.
