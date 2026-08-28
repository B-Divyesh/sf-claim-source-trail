# Independent verification 4 — FAIL

Date: 2026-08-28

Work order: `claim-source-trail-verify-4`

Candidate: `24cc89b4fe0076854a28c1f449fa9083745d51fd`

Live URL: <https://claim-source-trail.sociobot.in>

## Verdict

**FAIL — do not accept candidate `24cc89b4fe0076854a28c1f449fa9083745d51fd`.**

The prior deployment mismatch is no longer present: `/health` reports the exact
candidate, and the live HTML, JavaScript, and CSS match the clean build
byte-for-byte. The free claim-trail workflow, previous repairs, accessibility,
privacy behavior, PWA, backend, and performance checks all pass.

Fresh end-to-end testing nevertheless found one release-blocking production
defect: the prominent **Buy Instructor kit** link ends at a JSON HTTP 404 from
the configured Sociobot checkout endpoint. The product advertises a $18
one-time unlock but cannot sell it, so the freemium workflow is incomplete.

## Clean checkout and quality gates

- The supplied checkout began clean on `main` at the candidate SHA;
  `origin/main` resolved to the same SHA before and after a fresh fetch.
- Environment: Node `22.23.2`, npm `10.9.8`, Rust/Cargo `1.98.0`.
- `npm ci`: passed, 213 packages audited.
- `npm audit` and `npm audit --omit=dev`: passed, **0 vulnerabilities**.
- `npm test`: passed — Vitest **3 files / 10 tests**; Rust **5 tests**, binary
  target and doc tests all passed.
- `cargo fmt --all -- --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- No npm lint script exists. `tsc --noEmit` is part of the production build and
  passed.
- `npm run build`: passed exactly as declared and produced `dist/` plus the
  optimized Rust release binary.
- Docker and Podman are unavailable in this worker, so a local image build was
  not possible. The exact release binary was exercised directly, and the live
  build identity plus byte hashes verify the deployed container artifact.

Clean-build budgets:

| Resource | Result | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 27,126 B raw / 9,404 B gzip | <= 200 KB |
| CSS | 14,983 B raw / 4,040 B gzip | <= 50 KB |
| Two WOFF2 fonts | 34,732 B total | <= 120 KB |
| Mobile hero WebP | 31,994 B | <= 300 KB |

Lighthouse 13.4.1 mobile results:

| Target | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local release | 99 | 100 | 100 | 100 | 1.860 s | 0 | 69 ms |
| Live deployment | 100 | 100 | 100 | 100 | 1.581 s | 0 | 18 ms |

## Product and accessibility QA

`BASE_URL=http://127.0.0.1:18080 npm run test:e2e` and the same command against
the live URL each passed **22/22** across desktop and 390x844 projects. This
covered create/complete/export, axe scans, complete local-data deletion,
keyboard dialogs and shortcut, maximum-length unbroken input, 44px targets,
corrupt-storage recovery, legal routes, service-worker registration, and
offline reload.

Independent browser exercises on the live deployment also established:

- A representative claim with author, year, source URL, exact locator,
  paraphrase, reasoning, and counterevidence saved as “Ready to spot-check,”
  survived reload, and exported correctly to both CSV and Markdown.
- Empty required fields produced specific claim and source errors, focused the
  alert, and recovered after correction. A `javascript:` source reference was
  rendered inert as `href="#"`.
- Search no-result and recovery states, named delete confirmation, cancel,
  delete, and Undo all worked.
- Maximum valid unbroken metadata remained within the 390px viewport
  (`innerWidth == scrollWidth == 390`). A scan of all visible links, buttons,
  inputs, selects, and text areas found **0 undersized effective touch targets**.
- Keyboard-only testing reached the skip link first; its focus indicator was a
  visible 4px signal-yellow outline and its target measured 195x51.5px. Editor
  focus moved to the claim field and Escape restored the trigger.
- With reduced motion requested, root scrolling was `auto` and button
  transitions were effectively instant (`0.00001s`).
- Fresh axe scans on home, open editor, and persisted counterevidence states
  found **0 violations of any severity** on desktop and 390px mobile.
- Representative desktop and 390px screenshots were visually inspected. The
  intended research-desk hierarchy remained coherent with no clipping or
  horizontal overflow.
- The factory `verify-url.sh` passed: HTTP 200 in 634ms, title, `lang=en`, one
  h1, main landmark and image alt were present, all buttons were named, and
  console/page errors were 0.

## Privacy, PWA, backend, and response policy

- A clean normal browser flow contacted only the product origin. Its only
  non-GET request was same-origin `POST /api/page-view` with no body; no claim,
  source, locator, excerpt, or reasoning left the browser.
- A fake license return token was stripped from the address bar, stored under
  the documented local key, and sent only to
  `https://api.sociobot.in/api/v1/products/claim-source-trail/verify`. The API
  returned a CORS-enabled, `no-store`, invalid verdict and the free workspace
  remained usable. The supplied deletion test proves all product-owned trail,
  marker, license, and verdict keys are removed.
- The live root-scoped `/sw.js` controlled the page and used cache
  `claim-source-trail-v2`. `registration.update()` left no waiting worker for
  the unchanged release. Offline reload rendered the main workspace and its
  explicit offline notice with no console/page errors.
- The release binary started with **only `PORT=18080`** and created its default
  SQLite database. Restart retained the aggregate count. Direct inspection
  found one application table, `page_views`, containing only `day` and `count`.
- A simultaneous 100-request local page-view burst returned **40x 204 / 60x
  429** and advanced the stored count by exactly 40. After another restart, a
  successful POST advanced 85 to 86. Concurrent `/health` checks returned
  **100/100 HTTP 200** locally and live.
- Root, health, privacy, terms, service worker, robots, font, and image routes
  returned 200. GET and OPTIONS `/api/page-view` returned 405; POST returned
  204. HTTP permanently redirected to HTTPS.
- Responses included CSP, HSTS, Permissions-Policy, `nosniff`, frame `DENY`,
  and strict-origin referrer policy. CSP limits connections to self and the
  Sociobot API. HTML, health, and the service worker use `no-cache`; hashed
  JS/CSS, fonts, and hero assets use one-year immutable caching.

## Deployment identity

Live `/health` returned the exact candidate:

```json
{"status":"ok","build":"24cc89b4fe0076854a28c1f449fa9083745d51fd"}
```

The live and clean-built files had identical SHA-256 hashes:

```text
37fe4796e64e895062bfe1dd767c19da49e743a2771abaa9241b54c4820aae9d  index.html
e1a3e89bbec5680754c93dfe93da7c09e0f9221bfa6878c4b34a3312a0ef3ebd  index-DqlaffkU.js
905c3c40170f36be4253b842a68c9f74b600e9613a7a1ca6035e2d5c1ae876a5  index-FyrNS6Rw.css
```

## Defect

### P1 — advertised Instructor kit checkout returns HTTP 404

Reproduced in a fresh browser on the live candidate:

1. Open the product home page.
2. Activate **Buy Instructor kit** in the “Instructor kit — $18 once” panel.
3. Observe the final page.

The product correctly links to the required Sociobot endpoint, but the endpoint
does not redirect to hosted checkout. It returns HTTP 404 and displays:

```json
{"error":"enabled factory product","status":404}
```

Direct evidence:

```text
href:      https://api.sociobot.in/api/v1/products/claim-source-trail/checkout
final URL: https://api.sociobot.in/api/v1/products/claim-source-trail/checkout
status:    404
```

This is a deployment/billing-registration defect rather than a frontend source
defect, but it is release-blocking: a prominent paid feature and the product's
declared freemium path cannot be completed. The verification endpoint itself
is live and correctly returns an invalid verdict for a fake token.

## Required next step

Register/enable `claim-source-trail` in the production Sociobot billing engine
with the advertised $18 one-time product and correct return URL. Confirm that
the existing checkout link redirects to hosted checkout, complete a test of the
return-token and restore flows, and rerun the checkout portion of independent
verification. No product-code change is indicated by this finding.
