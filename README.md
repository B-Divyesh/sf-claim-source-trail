# Claim Source Trail

Claim Source Trail is a private workspace for humanities and social-science students.

Record a claim, the source, its exact location, and why the source supports it. See all four parts together before you write.

It is not a fact checker, essay generator, or reference manager. It helps readers inspect the evidence reasoning behind a claim.

Live product: <https://claim-source-trail.sociobot.in>

Try the isolated sample workspace: <https://claim-source-trail.sociobot.in/?demo=1#workspace>. It opens two realistic research trails without reading or writing a real workspace.

## Product behavior

- Create, revise, search, filter, and delete claim trails, including counterevidence.
- See whether a trail is ready to spot-check or still needs a locator, evidence, or reasoning.
- Export all work as Markdown or CSV for free.
- Create and export a claim trail without an account. Claim/source content stays in browser `localStorage`.
- Continue using the cached app shell and exports offline.
- Optionally unlock the $18 one-time Instructor kit through Sociobot billing. It adds a local cohort pulse, course labels, and automatic retention settings; core export and accessibility are never gated.

The backend serves the frontend, exposes `/health`, and stores only a per-day aggregate page count in SQLite. It never receives student claim content.

## Local development

Requirements: Node.js 22+, npm, and Rust 1.88+.

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
| `DATABASE_URL` | `/data/claim-source-trail.db` when `/data` exists, otherwise `data/claim-source-trail.db` | Aggregate page-count database |
| `DIST_DIR` | `dist` | Built frontend directory |
| `RUST_LOG` | `info,tower_http=info` | Structured JSON log filter |
| `BUILD_SHA` | `development` | Value returned by `/health` when set at compile time |

## Verify

```bash
npm test              # Vitest units + Rust route/integration tests
npm run build         # type-check, Vite -> dist/, release Rust binary
npm run test:e2e      # Builds and starts the release server, then runs desktop + 390px flows and axe checks
npm run test:billing  # live product registration and no-purchase checkout redirect check
npm audit --omit=dev
```

For a simple load smoke after starting the release server:

```bash
npx autocannon -c 20 -d 10 http://127.0.0.1:8080/health
```

The page-count route is rate-limited per first `X-Forwarded-For` client IP. Set `BASE_URL` to test an already-running or live server. Browser tests require `npx playwright install chromium` once.

## Container

```bash
docker build --build-arg BUILD_SHA=$(git rev-parse --short HEAD) -t claim-source-trail .
docker run --rm -p 8080:8080 -v claim-source-data:/data claim-source-trail
```

The multi-stage image runs as an unprivileged user and serves both the Axum API and `dist/` on port 8080. Deployment infrastructure and DNS are managed outside this repository. The registered production Instructor kit is checked without submitting a payment by `npm run test:billing`.

## Privacy, billing, and licenses

The app makes no analytics or tracking requests beyond one anonymous daily page-count increment per browser. License tokens are stored under `sb_license:claim-source-trail` and verified directly with the Sociobot billing API at most once daily. Sociobot/Dodo is the merchant of record; no payment provider is embedded here.

The application code is MIT licensed (see [LICENSE](LICENSE)). The bundled Atkinson Hyperlegible font is copyright Braille Institute of America and licensed under SIL OFL 1.1; its full license is in `public/fonts/OFL.txt`. Generated hero-art provenance and the complete visual system are recorded in [`.factory/design.md`](.factory/design.md).
