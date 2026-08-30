# Independent verification 5 — FAIL

Date: 2026-08-30  
Work order: `claim-source-trail-verify-5`  
Candidate: `0f49eb8281d778edc229af22a131b5522dc0bca9`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL — do not accept candidate `0f49eb8281d778edc229af22a131b5522dc0bca9`.**

The deployment is healthy and exactly matches the candidate, the repaired
checkout works, and the normal local-first claim-trail workflow is strong.
It nevertheless fails three explicit release gates: every required claim test
fails when invoked from the clean checkout as specified; the cold first screen
does not name the intended student audience; and the backend limiter is global
rather than keyed to the first `X-Forwarded-For` hop.

## First-read test (cold live page)

The page is a browser-local workspace for making a claim, naming a source,
recording an exact location, and explaining why the source supports it. The
prominent first action is **“Try it with sample data”**, which says it loads two
sample trails and saves nothing. That is a valid one-click demo.

However, the first-screen sentence is: “Build a compact evidence trail your
reader—or instructor—can actually check.” It does **not** say it is for
undergraduate humanities and social-science students (the researched brief's
user), or otherwise identify the learner. Under the required first-read rule,
this is a failure even though the task and first click are clear.

## P1 release blockers

### P1 — required claim commands fail from a clean checkout

After `npm ci`, I ran every exact `test` command in `.factory/claims.json`
before other QA. All five exited non-zero; each project variant failed before
the demo could load with:

```text
page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:8080/
```

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `free-exports` | `npm run test:e2e -- --grep @claim:free-exports` | FAIL, desktop + mobile connection refused |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | FAIL, desktop + mobile connection refused |
| `local-content` | `npm run test:e2e -- --grep @claim:local-content` | FAIL, desktop + mobile connection refused |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | FAIL, desktop + mobile connection refused |
| `paid-checkout` | `npm run test:e2e -- --grep @claim:paid-checkout` | FAIL, desktop + mobile connection refused |

`playwright.config.ts` supplies a `baseURL` but no `webServer`, so the shipped
claim commands do not start the documented demo entry point. This is
release-blocking under the claim contract, regardless of the supplemental
passing checks below. With the release server deliberately started on port
18080, `BASE_URL=http://127.0.0.1:18080 npm run test:e2e -- --grep @claim`
passed all **10/10** desktop/mobile claim tests. The product behavior is thus
testable, but the declared clean-command contract is broken.

### P1 — first screen omits the brief's target user

As recorded in the first-read test above, the landing screen says what to do
and offers the sample demo, but names only a reader or instructor. It omits
the undergraduate humanities/social-science student audience required by the
brief and plain-words acceptance rule.

### P1 — API limiter is global, not per client IP

The backend applies `GlobalKeyExtractor` to `POST /api/page-view`, rather than
the required first `X-Forwarded-For` client key. Live reproduction:

1. 60 concurrent POSTs with `X-Forwarded-For: 203.0.113.77` produced **40×204**
   and **20×429**. The 429 responses include `Retry-After: 0`.
2. After a burst of 40 requests with `X-Forwarded-For: 198.51.100.10`, the very
   next request using the distinct header `198.51.100.11` was also **429** with
   `Retry-After: 0`.

The observed allowance is a 40-request global burst (then approximately one
token per second), not an allowance per client. A busy client can therefore
deny the page-view endpoint to unrelated visitors, violating the backend
rate-limiting contract. The presence of a `Retry-After` header does not repair
the incorrect keying.

## Passing evidence

- Clean install: `npm ci` completed; npm reported 0 vulnerabilities.
- `npm test`: **PASS** — Vitest 3 files / 11 tests; Rust 5 tests, binary test
  target, and doc tests passed.
- Exact production command: `npm run build` **PASS** — `tsc --noEmit`, Vite
  build, and `cargo build --release`; `dist/` was produced.
- `cargo fmt --all -- --check` and
  `cargo clippy --all-targets --all-features -- -D warnings`: **PASS**.
- `npm run test:billing`: **PASS**; the registered $18 product reports a Dodo
  checkout redirect without submitting a payment.
- Full live suite: `BASE_URL=https://claim-source-trail.sociobot.in npm run
  test:e2e` **PASS, 30/30** across desktop and 390×844. It includes normal
  create/complete/export, claimed demo behavior, deletion recovery, keyboard,
  maximum-length layout, legal routes, offline reload, and axe coverage.
- Independent live browser smoke: demo had two sample cards and its persistent
  banner; Markdown and CSV downloads had the expected filenames; an incomplete
  claim showed “Needs an exact locator”; Enter opened the editor, initial focus
  reached its claim field, and Escape restored the trigger. No console or page
  errors were captured.
- Accessibility: axe found no serious/critical findings on the tested desktop
  or 390px demo; mobile had no horizontal overflow. `verify-url.sh` reported
  one h1, `lang=en`, a main landmark, alt text, labelled buttons, and no errors.
  Reduced-motion desktop/mobile testing was included in the live suite.
- PWA: a fresh live registration was active at the root scope with no waiting
  update; `registration.update()` retained that state. Offline reload of the
  demo rendered both a sample and the offline notice.
- Privacy: Playwright's request log during a demo edit contained only
  `https://claim-source-trail.sociobot.in` requests. Cold load made same-origin
  static requests plus the documented bodyless `POST /api/page-view`; no
  third-party request, console error, or page error appeared.
- Headers: live root, health, privacy, terms, and assets returned 200 with CSP,
  HSTS, nosniff, DENY frame, strict referrer policy and Permissions-Policy.
  Hashed JS has `Cache-Control: public, max-age=31536000, immutable`; documents
  use `no-cache`.
- Build identity: live `/health` returned
  `{"status":"ok","build":"0f49eb8281d778edc229af22a131b5522dc0bca9"}`.
  Local and live SHA-256 match exactly:

  ```text
  6b3f3c81abd116b3d3da784e0bc9f2f776d749ab0de77e41ac710229bc0d2692  index-C1xwDTn5.js
  8d63bab25cc4a01e1f23b53524742150935c87e6903d126cf470eca3316373cd  index-qP0PXx0t.css
  ```

- Budgets: initial JS 29,543 B raw / 10,069 B gzip; CSS 15,594 B raw / 4,136 B
  gzip; two self-hosted fonts 34,732 B; mobile hero 31,994 B. All are within
  the stated budgets. Fresh local Lighthouse: performance **98**,
  accessibility **100**, best practices **100**, SEO **100**; LCP 1.959 s,
  CLS 0, TBT 125 ms.

## P2 observations

- The landing fact “no account” is a visitor-relevant promise but has no
  dedicated entry in `.factory/claims.json`. The existing `local-content` test
  checks request origin, not that no sign-in/account flow is required. Add a
  tagged observable test or narrow the claim.

## Required next steps

1. Make the declared claim test command start and stop the release/demo server
   itself (for example, Playwright `webServer`) so every `claims.json` command
   passes from `npm ci` without an external process.
2. Rewrite the first-screen support sentence to name the target students in
   plain words while retaining the current clear sample-data action.
3. Replace `GlobalKeyExtractor` with a trusted first-hop `X-Forwarded-For`
   extractor and add route tests for separate clients, 429 and `Retry-After`.
4. Add or remove the unlisted “no account” promise, then rerun the clean claim
   commands and independent rate-limit check.

This verifier changed only `.factory/verification-5.md` and
`.factory/handoff.md`.
