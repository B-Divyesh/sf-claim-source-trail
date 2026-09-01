# Independent verification 10 — PASS

Date: 2026-09-01  
Work order: `claim-source-trail-verify-10`  
Candidate: `ce6e4a2d3f1edad2c620133171d4ed50cfe3b202`  
Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**PASS — accept candidate `ce6e4a2d3f1edad2c620133171d4ed50cfe3b202`.**

No release-blocking defects were found. This verification changed no product
code.

## Required opening checks

### Claims — PASS

`.factory/claims.json` exists and has 24 claims. From this clean checkout,
after `npm ci`, I ran every declared command individually. All passed. I also
ran `npm run test:e2e -- --grep '@claim:'`: **40/40** desktop and 390 px claim
tests passed.

| Claims | Result |
| --- | --- |
| `free-exports`, `demo-isolated`, `demo-sample-count`, `saved-trails-only` | PASS |
| `local-content`, `no-account`, `trail-workflow`, `offline-reload`, `offline-export` | PASS |
| `paid-checkout`, `inactive-license-lock`, `license-verification`, `no-embedded-payment-provider` | PASS |
| `hero-art-provenance`, `no-ai-routing`, `manual-reasoning`, `publisher-content-local` | PASS |
| `instructor-tools`, `instructor-import`, `complete-deletion` | PASS |
| `anonymous-page-count`, `daily-page-count`, `page-count-rate-limit`, `container-runtime` | PASS |

### Cold first read — PASS

In a fresh 1440×900 browser, the live first screen says it **“Connect[s] each
claim to its source”**, identifies **undergraduate humanities and
social-science students**, and makes **“Try it with sample data”** the first
action. Its adjacent explanation says it opens two sample trails without
changing the real workspace. One click opened `/?demo=1#workspace`, showing
two complete humanities examples and the persistent **Demo — sample data**
banner with **Reset demo** and **Start for real**.

## Local quality gates — PASS

- `npm ci` completed with 0 vulnerabilities.
- `npm test` passed: 15 Vitest and 7 Rust tests.
- `npm run build` passed (including TypeScript checking) and produced `dist/`.
- Production bundle: JavaScript 37,744 B raw / 12.56 kB gzip; CSS 17,171 B
  raw / 4.47 kB gzip; two self-hosted fonts total 34,732 B; mobile hero WebP
  31,994 B. All are within the stated budgets.

## Live product evidence — PASS

- `/health` returned `{"status":"ok","build":"ce6e4a2d3f1edad2c620133171d4ed50cfe3b202"}`;
  the footer displays the same build. The deployment therefore matches the
  candidate.
- A representative trail recovered correctly from an invalid source reference
  (announced error and `aria-invalid="true"`), then saved with DOI, locator,
  paraphrase, reason, and ready status. Delete and Undo both worked.
- Demo requests during cold load and editing were only same-origin. The only
  POST was the bodyless `/api/page-view`; no claim or source text was sent.
  Browser response headers include CSP, HSTS, `nosniff`, frame denial,
  strict-origin referrer policy, restrictive Permissions-Policy, and immutable
  one-year caching for fingerprinted assets.
- Desktop and 390×844 reduced-motion views have no horizontal overflow. Tab
  navigation exposes a visible yellow focus ring; Axe found zero serious or
  critical violations on the populated demo in both viewports. Application
  console/page errors were zero on root, demo, Privacy, and Terms.
- Root, demo query route, Privacy, Terms, and the designed 404 have correct
  titles, one h1, and a main landmark. The expected HTTP 404 is the browser's
  only console resource-status message when intentionally loading the unknown
  URL.
- Lighthouse (live mobile): Performance **93**, Accessibility **100**, LCP
  **1.54 s**, CLS **0**.

## Backend and rate-limit checks — PASS

The live `POST /api/page-view`, sent with one stable first
`X-Forwarded-For` address, returned 40 × `204` then 5 × `429`. Each limited
response included `Retry-After: 12`; the observed documented allowance is a
40-request burst per first forwarded client IP. `GET /health` remained 200
and exposed the candidate build identity. The claim suite additionally covers
the non-root container runtime, port 8080, and rate-limit key behavior.

## Defects by severity

### P0 / P1

None.

### P2 / P3

None.

## Scope

This is a web application with a backend, not a library or CLI. It needs no
sign-in, so Entra verification is not applicable. No resources, settings,
secrets, databases, or storage outside this product's allowed scope were read
or changed.
