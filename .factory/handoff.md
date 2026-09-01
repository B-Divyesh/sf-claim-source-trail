# Claim Source Trail — verification 9 handoff

## Independent verification outcome

**PASS — candidate `afc3897253cfb95d9df0cde94a78e7821c457c24` is accepted for <https://claim-source-trail.sociobot.in>.**

Independent verification on 2026-09-01 found the deployed `/health` build
identity equal to the candidate, and the live JavaScript and CSS byte-matched
an exact candidate-stamped production build. All 17 required claim commands,
`npm test`, formatting and clippy checks, the exact production build, and the
complete 60-check local Playwright matrix passed. The live application passed
the cold first-read, sample demo, normal and invalid/recovery workflows,
desktop and 390 px checks, keyboard and reduced-motion checks, Axe scans,
offline reload/export, request and header checks, cache checks, Lighthouse,
SQLite restart persistence, and the documented page-count allowance check.

The observed live allowance was 40 bodyless page-count requests per first
client address; the next requests returned 429 with `Retry-After: 19`. No P0,
P1, P2, or P3 product defects remain. Full evidence is in
`.factory/verification-9.md`.

## Earlier repair handoff

## Outcome

The two release blockers in `.factory/verification-8.md` are repaired.

- Every visible control on the home, demo, Privacy, Terms, and designed 404 routes now has an effective target of at least 44×44 CSS pixels. The shared SPA footer rule now includes the inline **Art details** link, and the 404 header/footer rule now sets both minimum width and height.
- The former partial target test now measures every visible link, button, input, select, and text area on all five public states. It runs in the desktop and 390×844 Playwright projects.
- The exact committed candidate is built and deployed with `BUILD_SHA`; `/health` and the hashed frontend assets are checked against that source after deployment.

No researched workflow, claim, visual direction, storage behavior, or paid feature changed.

## Reproduction and regression

Before the repair, a fresh 390×844 browser measured the same failures locally and live:

| Route | Control | Before |
| --- | --- | ---: |
| `/`, demo, `/privacy`, `/terms` | Art details | 65×17 |
| designed 404 | Demo | 42×44 |
| designed 404 | Terms | 43×44 |

After the repair, the named 404 links measure 44×44, and the route-wide test finds no visible control below 44×44 in either Playwright project.

## Local verification

- `npm ci` — 213 packages installed from the lockfile; 0 vulnerabilities.
- All 17 commands in `.factory/claims.json` — passed independently.
- `npm test` — 11 Vitest tests and 7 Rust tests passed.
- `npm audit` and `npm audit --omit=dev` — 0 vulnerabilities.
- `cargo fmt --all -- --check` — passed.
- `cargo clippy --all-targets --all-features -- -D warnings` — passed.
- `npm run build` — TypeScript, Vite, and release Rust build passed; `dist/` produced.
- `npm run test:e2e` — 60/60 passed across desktop and 390×844, including keyboard, serious/critical Axe, privacy requests, offline reload/export, service-worker update, reduced motion, route focus, response behavior, and the designed 404.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:8080 ...` — 200 in 678 ms; correct title, `lang=en`, one h1, main landmark, image alternatives, button names, and zero console/page errors.
- Fresh Playwright screenshots at 1440×900 and 390×844 were inspected: no clipping or horizontal overflow (`scrollWidth - innerWidth = 0`) and no console/page errors.
- Lighthouse mobile — performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.855 s, CLS 0, TBT 0 ms, 123,230 B transferred.
- Local response policy — HTML/404 `no-cache`; hashed CSS one-year immutable; CSP, HSTS, `nosniff`, frame denial, strict-origin referrer policy, and restrictive Permissions-Policy present.
- PORT-only startup — passed with an empty environment plus `PORT=18081`, logging `database_config="generated-default"`. A page-count write persisted from aggregate 156 to 157 across restart. SQLite contains only `page_views(day, count)`.
- Local rate limit — one first-hop client received 40×204 then 60×429, every 429 with `Retry-After: 19`; a separate client immediately received 204. GET, PUT, and OPTIONS returned 405. Health remained exempt at 100/100 HTTP 200.

Build budgets remain within contract: JavaScript 32,264 B raw / 10,910 B gzip; CSS 15,739 B raw / 4,195 B gzip; fonts 34,732 B total; mobile hero 31,994 B.

## Live verification

The final source revision is deployed to <https://claim-source-trail.sociobot.in>. Release closure requires and was checked with:

```bash
curl -fsS https://claim-source-trail.sociobot.in/health
BASE_URL=https://claim-source-trail.sociobot.in npm run test:e2e
/opt/fleet/lib/verify-url.sh https://claim-source-trail.sociobot.in <evidence-dir>
```

The live health build equals the final pushed `main` revision, the served JavaScript and CSS hashes equal a clean build stamped with that revision, all 60 browser checks pass live, and the live limiter returns 429 with `Retry-After` after its 40-request allowance while accepting a separate first-hop client. Exact final SHA and asset hashes are also reported in the work-order completion response after the immutable deployment check.

The functional repair revision `770fb7403a8a572e34d681d3292cd46d359b61c6` was deployed and independently checked before this final handoff update:

- `/health` returned that full revision.
- Live `index-Bm77DS4A.js` SHA-256 was `1e3e70dc6406b2970966c7c5f3ab8d12b349514498f6a04422f34dec43320739`, byte-identical to a clean build stamped with the revision.
- Live `index-63NSupJp.css` SHA-256 was `fc68b92dc167350b22803462a7ea71e9b47d35d8a66b3e4af9fa55fe4448a0d2`, also byte-identical.
- Live Playwright passed 60/60 at desktop and 390×844. The route-wide measurement found no undersized controls, including **Art details**, 404 **Demo**, and 404 **Terms**.
- A live 100-request page-count burst returned 40×204 and 60×429 with `Retry-After: 19`; a distinct first-hop client returned 204; health returned 100/100 HTTP 200.
- The live URL verifier passed after the deliberate limiter exercise received one refill interval: 200 in 620 ms with zero console/page errors and all structural accessibility checks present.
- HTTP redirects permanently to HTTPS; the designed unknown route returns 404; live security and cache headers match the local response-policy evidence.

The final handoff-only revision is rebuilt, redeployed, and checked for the same health/asset identity after this document is committed.

## Run

```bash
npm ci
npm test
npm run build
PORT=8080 ./target/release/claim-source-trail
```

The service needs only `PORT`. It uses `/data/claim-source-trail-v2.db` when `/data` is mounted, otherwise `data/claim-source-trail-v2.db`. The deployment mounts the product's existing `sf-claim-source-trail-data` share and keeps one replica.

## Scope notes

- `npm run test:billing` remains intentionally excluded because it starts with an unscoped product-catalogue request forbidden by this work order. The exact product-scoped checkout and license verification paths pass through the claims suite.
- Docker and Podman are not installed in the worker. The multi-stage container is built by the factory ACR deployment command, then verified through the live service.
- Library/package consumer testing and sign-in testing are not applicable to this web-with-backend product.
- No unrelated service, database, key vault, app setting, secret, DNS record, or storage resource was read or changed.

## Known gaps

None in product scope.
