# Claim Source Trail — polish round 1 handoff

## Repair

Repaired every finding in `.factory/review-1.md` and the earlier verification trail. The product now has deterministic source testing, route focus/announcement behavior, qualified storage wording, complete claim inventory, real `?demo=1` isolation, completed 404 metadata/skeleton, plain-language README copy, consistent Param Factory/version footer, and the required Docker/data defaults.

## Verification

- Fresh-clone evidence: cloned `b41802ce11d69bc6dd79b18a807830abbfabb63c` into `/tmp/claim-source-trail-clean-tNol63`; `npm ci` passed with 0 audit vulnerabilities, then `npm run build` passed.
- `npm test` — 11 Vitest and 7 Rust tests passed.
- `npm run build` — passed; `dist/` produced. Initial JS is 32.26 kB raw / 11.02 kB gzip and CSS is 15.73 kB raw / 4.19 kB gzip.
- Local `npm run test:e2e` — 60/60 desktop and 390px browser tests passed.
- Every command in `.factory/claims.json` ran separately from that fresh clone and passed: the 16 Playwright/Vitest claim commands plus the Rust page-count schema assertion. Logs: `/tmp/claim-source-trail-claim-*.log`.
- `cargo fmt --all -- --check` and `cargo clippy --all-targets --all-features -- -D warnings` — passed.
- `npm run test:billing` — passed: $18 product, Dodo redirect, verification endpoint.
- Live `BASE_URL=https://claim-source-trail.sociobot.in npm run test:e2e` — 60/60 desktop and 390px browser tests passed on 2026-08-30.
- `/opt/fleet/lib/verify-url.sh https://claim-source-trail.sociobot.in /tmp/claim-source-trail-live-TR6lK9` — passed: HTTP 200, 614 ms load, no console/page errors, title/lang/one h1/main/alt/button checks all clean. Cold desktop/mobile screenshots and JSON are in that directory.
- Playwright Axe checks have zero serious/critical violations locally and live. The standalone `@axe-core/cli` could not launch Selenium Chrome in this worker; Playwright uses the provisioned Chromium successfully.
- `npx autocannon -c 20 -d 5 http://127.0.0.1:18080/health` — 156k requests, 0.1 ms mean latency.

## Run

```bash
npm ci
npm run build
PORT=8080 ./target/release/claim-source-trail
```

The service needs only `PORT`. It uses `/data/claim-source-trail-v2.db` when `/data` is mounted, otherwise local `data/` for development. The container runs as an unprivileged user and mounts its durable SQLite directory at `/data`.

## Deployment

The review-closure repair is deployed and cold-checked at <https://claim-source-trail.sociobot.in>. The verified live revision was `f0262841cbc2ef3a5967d73dfb3654c193933384`; it includes the review closure commit `2237553`. Current `main` is `b41802ce11d69bc6dd79b18a807830abbfabb63c` (`fix: allow normal page-view burst rate`) and is pushed to `origin/main`. Deployment infrastructure is factory-owned; no unrelated resource, DNS, billing, or secret was accessed.

## Known gaps

None in the product scope. Lighthouse could not attach to the worker’s standalone Chromium process; prior browser-level performance budgets and the current build asset sizes pass, while browser accessibility is covered by the passing Playwright Axe suite.
