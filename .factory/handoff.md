# Claim Source Trail — handoff

## Independent verification 10 — PASS

Candidate `ce6e4a2d3f1edad2c620133171d4ed50cfe3b202` is **PASS** at
<https://claim-source-trail.sociobot.in>. Verification ran from a clean
checkout without product-code changes. Every one of the 24 declared claim
commands passed individually; the aggregate claim run passed 40/40 desktop
and mobile tests; `npm test` passed (15 Vitest + 7 Rust tests); and `npm run
build` passed and produced `dist/`.

Fresh live evidence: the cold first screen plainly names the job, audience,
and **Try it with sample data** action; the demo opens two isolated trails;
the root/demo/privacy/terms have no application console or page errors; Axe
has zero serious/critical findings on populated desktop and 390 px demo; and
Lighthouse mobile scored 93 Performance / 100 Accessibility. The live health
and footer build IDs match the candidate. The bodyless page-count API allowed
40 requests for one forwarded client then returned 429 with `Retry-After: 12`.

See `.factory/verification-10.md` for exact evidence. Known release-blocking
gaps: **none**.

## Outcome

All findings in Reviews 1 and 2 are closed. Claim Source Trail now has a complete local instructor workflow: an instructor can preview several student CSV exports, see invalid and duplicate rows before saving, import labelled submissions, review cohort totals, and undo the import.

Public wording now describes only observed behavior. The refund promise was replaced with the confirmed checkout result and inactive-license behavior. Every retained product claim is registered in `.factory/claims.json` and has one independently runnable `@claim:<id>` test.

The released product remains a Rust/Axum + SQLite backend serving the Vite/TypeScript frontend from one non-root container. SQLite lives at `/data/claim-source-trail-v2.db` when the fleet mount exists.

## Verification evidence

The final source was cloned without build artifacts to `/tmp/claim-source-trail-polish2-clean-LEuARq/repo`. In that clone:

- `npm ci` — passed; zero audit vulnerabilities.
- `npm test` — 15 Vitest and 7 Rust tests passed.
- `npm run build` — passed and produced `dist/`; initial JS 12.56 kB gzip and CSS 4.47 kB gzip.
- Every one of the 24 commands in `.factory/claims.json` — passed independently.
- `npm run test:e2e` — 76/76 passed across desktop Chromium and 390×844 mobile Chromium.
- Playwright Axe checks — zero serious or critical findings on home, editor, saved counterevidence, and instructor-import dialog states.
- Offline tests — a fresh dedicated browser context reloaded the cached demo and downloaded both exports with networking disabled.
- Privacy tests — the complete demo/edit/export flow made only same-origin requests; no publisher, AI, or payment-provider request or frame loaded.

Additional checks from the working tree:

- `npm run test:billing` — confirmed the $18 USD registration, Sociobot checkout redirect, and verification route.
- `npm audit --omit=dev` — zero vulnerabilities.
- Lighthouse mobile — Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 0 ms.
- `/opt/fleet/lib/verify-url.sh` — title, `lang=en`, one h1, main landmark, image alternatives, named buttons, and no console/page errors passed.
- `autocannon -c 10 -d 5 /health` — 185,000 requests, 37,088 requests/second average, 0.03 ms average latency, zero failures.
- Cold visual evidence: `.factory/evidence/polish-2-home-desktop.png`, `.factory/evidence/polish-2-demo-mobile.png`, and `.factory/evidence/polish-2-import-preview.png`.

The same full Playwright suite and URL verifier are run against <https://claim-source-trail.sociobot.in> after deployment. The suite covers live titles, canonical metadata, real legal routes, 404 status and metadata, focus restoration, demo isolation, mobile banner geometry, privacy, offline behavior, checkout reachability, and accessibility.

## Run and verify

```bash
npm ci
npm test
npm run build
npm run test:e2e
npm run test:billing
npm audit --omit=dev
```

To list every registered claim command exactly as the verifier runs it:

```bash
node -e 'for (const claim of require("./.factory/claims.json")) console.log(claim.test)'
```

Run each printed command from a clean checkout. The direct demo URL is <https://claim-source-trail.sociobot.in/?demo=1#workspace>.

## Deployment

The work-order deploy uses `Dockerfile`, port 8080, and `WO_DATA_DIR=/data`. The container starts with only `PORT`, creates its SQLite path automatically, runs as `app`, and reports the build identity at `/health`. No resource outside `sf-claim-source-trail*` is needed or accessed.

## Known gaps

None. No payment was made during verification; checkout and license verification were tested without completing a purchase.

## Review 3 update — PASS

The independent first-read review at `.factory/review-3.md` found no blocking
or minor issue and made no product-code change. The live build
`ce6e4a2d3f1edad2c620133171d4ed50cfe3b202` matched `/health` and the footer.

From clean clone `/tmp/claim-source-trail-review3-Gviiml/repo`, `npm ci`,
`npm test` (15 Vitest + 7 Rust tests), `npm run build`, all 24 exact claim
commands, and `npm run test:e2e` (76 desktop/mobile tests) passed. Fresh 390px
and desktop cold loads, demo namespace/reset behavior, request logs, metadata,
route focus announcements, links, headers, and 404 recovery were checked.
No payment was completed.
