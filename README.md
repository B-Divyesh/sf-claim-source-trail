# Claim Source Trail

Claim Source Trail is a private workspace for humanities and social-science students.

Record a claim, its source, the exact location, and why the source matters. See all four parts together before you write.

The app records what you enter. It does not generate essays, score truth, or manage a bibliography.

Live product: <https://claim-source-trail.sociobot.in>

Try the isolated sample workspace: <https://claim-source-trail.sociobot.in/?demo=1#workspace>. It opens two sample trails and leaves your real workspace unchanged.

## Product behavior

- Create, revise, search, filter, and reversibly delete claim trails.
- Mark a source that challenges a claim and see which part needs work.
- Export every trail as Markdown or CSV for free.
- Create and export a trail without an account.
- Keep claim and source content in this browser.
- Use the saved app and both exports offline after the first visit.
- Optionally buy the $18 one-time Instructor kit through Sociobot billing.

The Instructor kit imports student CSV exports in this browser. It previews each file, labels submissions from filenames, skips duplicate trails, shows totals, and lets the instructor undo an import. It also adds course labels to Markdown and 7/30/90-day local deletion choices. Both student exports remain free.

## Student submission format

A student selects **Export CSV** and sends that file to the instructor. The instructor selects **Preview CSV files** and can choose several files at once.

The import accepts Claim Source Trail CSV headers, including `claim`, `sourceTitle`, `locator`, `evidence`, `reason`, and `counterevidence`. A row needs a claim and source title. The preview reports new, duplicate, and invalid rows before anything is saved. The filename becomes the submission label.

## Backend

The backend serves the frontend and `/health`. It stores one aggregate page-count row per date in SQLite. It never receives claim, source, or imported submission content.

## Local development

Requirements: Node.js 22+, npm, and the current stable Rust toolchain.

```bash
npm ci
npm run dev          # Vite frontend on http://localhost:5173
npm run dev:server   # Axum API on http://localhost:8080 (second terminal)
```

Vite proxies `/api` and `/health` to the Axum process. For a production-style local run:

```bash
npm run build
PORT=8080 cargo run --release
```

Configuration is environment-only:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | HTTP listener port |
| `DATABASE_URL` | `/data/claim-source-trail-v2.db` when `/data` exists; otherwise `data/claim-source-trail-v2.db` | Aggregate page-count database |
| `DIST_DIR` | `dist` | Built frontend directory |
| `RUST_LOG` | `info,tower_http=info` | Structured JSON log filter |
| `BUILD_SHA` | `development` | Value returned by `/health` when compiled |

## Verify

```bash
npm test              # Vitest units + Rust route/integration tests
npm run build         # type-check, Vite -> dist/, release Rust binary
npm run test:e2e      # release server, desktop + 390px flows, axe checks
npm run test:billing  # product registration and checkout redirect, without payment
npm audit --omit=dev
```

Run a load smoke after starting the release server:

```bash
npx autocannon -c 20 -d 10 http://127.0.0.1:8080/health
```

The page-count route uses the first `X-Forwarded-For` client IP. Each client gets a 40-request burst before HTTP 429 with `Retry-After`.

Set `BASE_URL` to test an already-running server. Browser tests require Playwright Chromium 1.58.2.

## Container

```bash
docker build --build-arg BUILD_SHA=$(git rev-parse --short HEAD) -t claim-source-trail .
docker run --rm -p 8080:8080 -v claim-source-data:/data claim-source-trail
```

The release container uses a non-root app user. It serves the app and health route on port 8080. Deployment infrastructure and DNS stay outside this repository.

## Privacy, billing, and licenses

The app sends one anonymous page-count request at most once per browser day. The request has no body. The server stores only the date and total count.

License tokens use `sb_license:claim-source-trail`. Verification sends a token only to the product’s Sociobot endpoint and reuses a verdict for at most one day.

No payment-provider script or frame loads on the product page. Selecting **Buy Instructor kit** opens Sociobot/Dodo checkout. Review the checkout terms before paying. If Sociobot verification reports an inactive license, the Instructor kit locks.

## Licenses and artwork

The application code is MIT licensed; see [LICENSE](LICENSE). Atkinson Hyperlegible is licensed under SIL OFL 1.1; see [`public/fonts/OFL.txt`](public/fonts/OFL.txt).

The original generated hero art and complete visual system are documented in [`.factory/design.md`](.factory/design.md).
