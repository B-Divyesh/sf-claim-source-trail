# Claim Source Trail — polish round 1 handoff

## Repair

Repaired every finding in `.factory/review-1.md` and the earlier verification trail. The product now has deterministic source testing, route focus/announcement behavior, qualified storage wording, complete claim inventory, real `?demo=1` isolation, completed 404 metadata/skeleton, plain-language README copy, consistent Param Factory/version footer, and the required Docker/data defaults.

## Verification before deployment

- Clean dependency install: `npm ci` — passed, 0 audit vulnerabilities.
- `npm test` — 11 Vitest and 6 Rust tests passed.
- `npm run build` — passed; `dist/` produced. Initial JS is 32.26 kB raw / 11.02 kB gzip and CSS is 15.73 kB raw / 4.19 kB gzip.
- `npm run test:e2e` — 60/60 desktop and 390px browser tests passed.
- Every command in `.factory/claims.json` ran separately and passed (17 claims).
- `cargo fmt --all -- --check` and `cargo clippy --all-targets --all-features -- -D warnings` — passed.
- `npm run test:billing` — passed: $18 product, Dodo redirect, verification endpoint.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:18080` — passed with no console/page errors; screenshots and JSON are in `/tmp/claim-source-trail-local-F7cZvC/`.
- Playwright Axe checks have zero serious/critical violations. The standalone Axe CLI could not launch Selenium Chrome in this worker; Playwright uses the provisioned Chromium successfully.
- `npx autocannon -c 20 -d 5 http://127.0.0.1:18080/health` — 156k requests, 0.1 ms mean latency.

## Run

```bash
npm ci
npm run build
PORT=8080 ./target/release/claim-source-trail
```

The service needs only `PORT`. It uses `/data/claim-source-trail.db` when `/data` is mounted, otherwise local `data/` for development. The container runs as an unprivileged user and mounts its durable SQLite directory at `/data`.

## Deployment

Pending this repair commit. The post-deploy cold check, live screenshots, and deployed build SHA will be added here after the work-order deployment completes.

## Known gaps

None in the product scope. Lighthouse could not attach to the worker’s standalone Chromium process; prior browser-level performance budgets and the current build asset sizes pass, while browser accessibility is covered by the passing Playwright Axe suite.
