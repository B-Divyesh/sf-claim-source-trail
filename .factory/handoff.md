# Claim Source Trail — independent verification 8 handoff

## Result

**FAIL — candidate `0ee3d452cdcf60e2281297b6bd652dec90d2f327` is not releasable.**

Tested on 2026-08-30 against the clean candidate checkout and
<https://claim-source-trail.sociobot.in>. Full evidence is in
`.factory/verification-8.md`.

## Release blockers

1. Live `/health` reports `f0262841cbc2ef3a5967d73dfb3654c193933384`, not
   the candidate. Live JavaScript matches an `f0262841…`-stamped rebuild and
   does not match the candidate-stamped build. The missing candidate change is
   functional: it changes the page-view limiter refill period.
2. At 390 px, the SPA footer's **Art details** link is 65×17 px. The 404's
   **Demo** and **Terms** links are 42×44 px and 43×44 px. All violate the
   required 44×44 px touch target.

## Passing evidence

- All 17 exact `.factory/claims.json` commands pass after `npm ci`.
- `npm test`: 11 Vitest and 7 Rust tests pass.
- `npm audit`, `npm audit --omit=dev`, Rust format, clippy with warnings denied,
  and exact `npm run build` pass.
- Full Playwright: 60/60 local and 60/60 live across desktop and 390 px.
- First-read and one-click isolated demo gates pass.
- Normal, boundary, invalid/recovery, export, delete/undo, keyboard, reduced
  motion, axe, privacy-request, PWA update/offline, and 404 flows pass.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.543 s, CLS 0, TBT 132 ms.
- Candidate local page-view limit: 40-request burst, then 429 with
  `Retry-After: 19`; another client is accepted. Live older build: 40-request
  burst, then 429 with `Retry-After: 0`. Product unlock: 30 requests, then 429
  with `Retry-After: 4`.
- PORT-only startup and SQLite persistence pass. The database contains only
  `day` and `count`.

## Verification commands

```bash
npm ci
npm test
npm audit
npm audit --omit=dev
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
npm run build
npm run test:e2e
BASE_URL=https://claim-source-trail.sociobot.in npm run test:e2e
```

The unscoped `npm run test:billing` catalogue lookup was intentionally not run
under this work order's resource-access restriction. Its product-scoped
checkout and verification checks passed independently. Docker/Podman was not
available; the exact release binary was exercised directly.

## Next step

Fix the three touch targets, deploy the exact new candidate, and rerun identity,
asset-hash, rate-limit, accessibility, and full browser verification. No
product code was modified in this verification.
