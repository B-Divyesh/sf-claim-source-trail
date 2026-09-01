# Claim Source Trail — review 2 handoff

## Outcome

Review 2 is complete with a **FAIL** verdict. The full report is in
`.factory/review-2.md`. Product code was not modified.

The cold mobile and desktop first screen is clear, the demo is useful and
isolated, all 17 registered claim commands pass, the full deployed browser
suite passes 60/60, and local tests/build pass. The report records nine
blocking claim/product-scope findings and three minor copy/layout findings.

The most important remaining work is to make the paid cohort description match
a complete instructor workflow, replace or confirm the refund promise, and add
the missing public claims to `.factory/claims.json` with observable tests.

## Verification performed

- Fresh Chromium contexts at 390×844 and 1440×900 for cold first read.
- One-click demo, sample edit, Reset demo, Start for real, storage namespaces,
  and request logs.
- Every command in `.factory/claims.json` from a fresh local clone.
- `npm test` — 11 Vitest and 7 Rust tests passed.
- `npm run build` — passed and produced `dist/`.
- Live Playwright suite — 60/60 passed across desktop and 390px.
- Live URL verifier — 200, one h1, `lang=en`, main landmark, complete image and
  button names, no console/page errors.
- Internal routes/assets, both sample sources, and the product-scoped checkout
  path were checked and returned successful destinations.
- Earlier Review 1 findings were checked in the live product and source; all
  are fixed except the refund portion of F-1-6, which is only text-confirmed.

## Reproduce

```bash
npm ci
npm test
npm run build
BASE_URL=https://claim-source-trail.sociobot.in npm run test:e2e
```

Claim-by-claim logs are under `/tmp/claim-source-trail-review-2/` in this
worker. The clean clone used was
`/tmp/claim-source-trail-review2-clean-DiiERf/repo`.

## Known gaps

See F-2-1 through F-2-12 in `.factory/review-2.md`. No product code, deployed
resource, configuration, database, secret, DNS, or billing state was changed.
