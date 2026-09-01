# Adversarial first-read review 3 — PASS

Date: 2026-09-01  
Reviewer context: first-time visitor, fresh Chromium contexts at 390×844 and 1440×900  
Live URL: <https://claim-source-trail.sociobot.in>  
Live build: `ce6e4a2d3f1edad2c620133171d4ed50cfe3b202`  
Reviewed revision: `2bde7c13dec56b62f914d041c91ea3783fb648da`

## Verdict

**PASS.** This review found zero blocking or minor findings. The cold first
screen names the job, audience, first action, and immediate result. The demo is
one click, visibly useful, isolated from real data, and resettable. All public
claims have a registered test that passed from a clean clone. Previous review
findings remain fixed in the live build and source.

## Cold first read

Before scrolling, at both 390px and desktop, the page answered all three
first-visit questions:

| Question | What the first screen says |
| --- | --- |
| What does it do? | “Connect each claim to its source.” |
| Who is it for? | “Undergraduate humanities and social-science students show where evidence supports each claim.” |
| What should I click first? | “Try it with sample data” — “Opens two sample trails. Your real workspace stays unchanged.” |

The mobile page was 390px wide with no horizontal overflow. Both cold loads
had no application console or page errors. The paper, ink, yellow controls,
heavy rules, and original research-desk artwork form a distinct visual system,
not a generic SaaS layout.

## Demo and sandbox verification

- One click from the hero opened `/?demo=1#workspace`.
- The first demo screen at 390px and desktop already showed the real workspace,
  its filters and export controls, and the first of exactly two realistic
  humanities claim trails.
- The persistent banner read “Demo — sample data. Your real workspace stays
  unchanged.” and contained **Reset demo** and **Start for real**.
- With a seeded real trail, demo mode showed only its samples in
  `demo:claim-source-trail:trails:v1`; the real
  `claim-source-trail:trails:v1` value remained byte-for-byte unchanged.
- Editing a demo card then choosing Reset restored the two shipped samples.
  Start for real removed the demo key and restored the seeded real workspace.
- The complete demo/edit/reset flow made only same-origin requests. It did not
  contact an AI, publisher, payment-provider, or other third-party endpoint.
- The clean-clone offline claim tests reloaded the cached demo and downloaded
  both exports while offline.

## Claims and clean-clone tests

Clean checkout used: `/tmp/claim-source-trail-review3-Gviiml/repo`.

- `npm ci` passed with zero audit vulnerabilities.
- `npm test` passed: 15 Vitest tests and 7 Rust tests.
- `npm run build` passed and produced `dist/`.
- Each of the 24 exact commands in `.factory/claims.json` passed independently:
  `free-exports`, `demo-isolated`, `demo-sample-count`, `saved-trails-only`,
  `local-content`, `no-account`, `trail-workflow`, `offline-reload`,
  `offline-export`, `paid-checkout`, `inactive-license-lock`,
  `hero-art-provenance`, `no-ai-routing`, `instructor-tools`,
  `instructor-import`, `anonymous-page-count`, `complete-deletion`,
  `license-verification`, `daily-page-count`, `page-count-rate-limit`,
  `container-runtime`, `no-embedded-payment-provider`,
  `publisher-content-local`, and `manual-reasoning`.
- `npm run test:e2e` passed 76 desktop and 390px browser tests. Its final
  Playwright result was `passed` with no failed tests.

No claim-like landing or README statement lacks coverage in the claim register.
The registered tests cover local-content and no-AI promises with request logs;
demo separation, counts, reset and real-data preservation with browser storage
inspection; offline behavior in a dedicated browser context; and checkout,
container, rate-limit, license, and export statements with observable tests.

## Copy audit

Counts use word-like tokens, treating hyphenated compounds as one word. Buttons
and headings were also reviewed for plain, result-naming wording. There are no
sentences over 22 words, banned marketing adjectives, ambiguous slogans,
metaphor headings, inconsistent location terms, or non-result-naming buttons.
Therefore there are no copy findings or proposed rewrites.

### Landing-page sentences

| Words | Sentence |
| ---: | --- |
| 6 | Connect each claim to its source. |
| 11 | Undergraduate humanities and social-science students show where evidence supports each claim. |
| 4 | Opens two sample trails. |
| 5 | Your real workspace stays unchanged. |
| 5 | Claims stay in this browser. |
| 6 | Works offline after the first visit. |
| 6 | Markdown and CSV exports are free. |
| 12 | Each trail records a claim, source, exact location, and why it matters. |
| 6 | Write one idea that needs evidence. |
| 6 | Name where the evidence comes from. |
| 6 | Record the page, section, or paragraph. |
| 6 | Explain the connection in your words. |
| 9 | No claim trail is stored until you save it. |
| 7 | Add the exact location in a source. |
| 8 | Then explain the connection in your own words. |
| 16 | Import student CSV files, see local totals, label Markdown exports, and set 7/30/90-day deletion. |
| 5 | Both student exports remain free. |
| 2 | One-time purchase. |
| 4 | Checkout opens Sociobot/Dodo. |
| 3 | Read purchase terms. |
| 7 | Records evidence links; does not judge truth. |
| 4 | Original generated hero art. |

Headings and labels are literal and contextual: **The four parts of a claim
trail**, **Your claim trails**, **Instructor kit — $18 once**, **Try it with
sample data**, **Build a claim trail**, **Delete trail**, **Cancel editing**,
and **Restore Instructor kit**.

### README sentences

| Words | Sentence |
| ---: | --- |
| 12 | Claim Source Trail is a private workspace for humanities and social-science students. |
| 13 | Record a claim, its source, the exact location, and why the source matters. |
| 8 | See all four parts together before you write. |
| 6 | The app records what you enter. |
| 11 | It does not generate essays, score truth, or manage a bibliography. |
| 5 | Try the isolated sample workspace. |
| 11 | It opens two sample trails and leaves your real workspace unchanged. |
| 9 | Create, revise, search, filter, and reversibly delete claim trails. |
| 13 | Mark a source that challenges a claim and see which part needs work. |
| 9 | Export every trail as Markdown or CSV for free. |
| 8 | Create and export a trail without an account. |
| 8 | Keep claim and source content in this browser. |
| 12 | Use the saved app and both exports offline after the first visit. |
| 10 | Optionally buy the $18 one-time Instructor kit through Sociobot billing. |
| 10 | The Instructor kit imports student CSV exports in this browser. |
| 20 | It previews each file, labels submissions from filenames, skips duplicate trails, shows totals, and lets the instructor undo an import. |
| 14 | It also adds course labels to Markdown and 7/30/90-day local deletion choices. |
| 5 | Both student exports remain free. |
| 12 | A student selects Export CSV and sends that file to the instructor. |
| 13 | The instructor selects Preview CSV files and can choose several files at once. |
| 16 | The import accepts Claim Source Trail CSV headers, including claim, sourceTitle, locator, evidence, reason, and counterevidence. |
| 8 | A row needs a claim and source title. |
| 12 | The preview reports new, duplicate, and invalid rows before anything is saved. |
| 6 | The filename becomes the submission label. |
| 7 | The backend serves the frontend and /health. |
| 10 | It stores one aggregate page-count row per date in SQLite. |
| 9 | It never receives claim, source, or imported submission content. |
| 11 | Requirements: Node.js 22+, npm, and the current stable Rust toolchain. |
| 9 | Vite proxies /api and /health to the Axum process. |
| 9 | The page-count route uses the first X-Forwarded-For client IP. |
| 11 | Each client gets a 40-request burst before HTTP 429 with Retry-After. |
| 8 | Set BASE_URL to test an already-running server. |
| 8 | Browser tests require Playwright Chromium 1.58.2. |
| 8 | The release container uses a non-root app user. |
| 10 | It serves the app and health route on port 8080. |
| 8 | Deployment infrastructure and DNS stay outside this repository. |
| 13 | The app sends one anonymous page-count request at most once per browser day. |
| 5 | The request has no body. |
| 9 | The server stores only the date and total count. |
| 6 | License tokens use sb_license:claim-source-trail. |
| 19 | Verification sends a token only to the product’s Sociobot endpoint and reuses a verdict for at most one day. |
| 10 | No payment-provider script or frame loads on the product page. |
| 8 | Selecting Buy Instructor kit opens Sociobot/Dodo checkout. |
| 6 | Review the checkout terms before paying. |
| 11 | If Sociobot verification reports an inactive license, the Instructor kit locks. |
| 8 | The application code is MIT licensed; see LICENSE. |
| 14 | Atkinson Hyperlegible is licensed under SIL OFL 1.1; see public/fonts/OFL.txt. |
| 15 | The original generated hero art and complete visual system are documented in .factory/design.md. |

## Structure, accessibility, privacy, and links

- Live `/`, `/privacy`, `/terms`, demo, and the designed unknown-route page
  have the expected title pattern, one h1, description, canonical, Open Graph
  data, favicon, and main landmark. The unknown route returns HTTP 404 with
  its own **Page not found** content and recovery links. The browser's expected
  network log for that HTTP 404 is not an application error.
- Live SPA navigation to Privacy and browser Back focused the new h1 and set
  the polite route announcement each time.
- Header/footer navigation is consistent, has a skip link, and includes
  Privacy, Terms, Param Factory provenance, art disclosure, version, and build
  ID. `robots.txt` and `sitemap.xml` are present.
- All same-origin links returned their intended status. The two sample-source
  links returned 200; checkout returned the expected 303 to Dodo without a
  payment. No dead link was found.
- Live headers use same-origin loading, a restrictive CSP including
  `frame-ancestors 'none'`, nosniff, referrer policy, HSTS, and permissions
  policy. Fonts and product assets are self-hosted.
- The full clean-clone browser suite reports zero serious or critical Axe
  violations in home, editor, counterevidence, and Instructor-import states.
  It also verifies keyboard dialogs, focus restoration, 44px controls,
  390px bounds, and reduced-motion behavior.

## Earlier finding confirmation

| Earlier ID | Live and source confirmation |
| --- | --- |
| F-1-1 | Privacy navigation and Back focus the h1 and announce the destination. |
| F-1-2 | Sample-source validation is local and deterministic; separately crawled source links returned 200. |
| F-1-3 | Every route and the 404 footer show Built by Param Factory plus version/build identity. |
| F-1-4 | Both Docker stages retain `ARG BUILD_SHA=dev`; the registered container test passes. |
| F-1-5 | Empty-state wording is “No claim trail is stored until you save it.” |
| F-1-6 | Retained product promises are registered and tested; the unsupported refund promise remains absent. |
| F-1-7 | Landing and 404 headings are literal and contextual. |
| F-1-8 | The 404 has metadata, consistent navigation/footer, recovery links, and HTTP 404 status. |
| F-1-9 | The deletion escape action is “Cancel deletion.” |
| F-1-10 | README opening and landing copy are short, concrete, and consistent. |
| F-2-1 | Instructor CSV preview/import, duplicate handling, labels, local totals, and undo work in the clean-browser test. |
| F-2-2 | Copy promises only the observable checkout result, not a refund outcome. |
| F-2-3 | Scope copy precisely states recording user input without essay generation or truth scoring; `manual-reasoning` passes. |
| F-2-4 | The unsupported accessibility entitlement is absent; free exports remain covered. |
| F-2-5 | `daily-page-count` proves the once-per-browser-day behavior. |
| F-2-6 | `page-count-rate-limit` is registered and passes. |
| F-2-7 | `container-runtime` is registered and passes. |
| F-2-8 | `no-embedded-payment-provider` is registered and passes. |
| F-2-9 | `publisher-content-local` is registered and passes. |
| F-2-10 | The 390px demo anchor leaves its heading visible below the banner. |
| F-2-11 | Public copy uses the consistent term “exact location” and explains specialist workflow terms. |
| F-2-12 | Public controls use explicit result-naming labels. |

## Missed leverage

No finding. The brief specifically values student-owned reasoning over an AI
essay writer; the product already includes the clearly implied local
import/export workflow. Adding an AI step would conflict with that scope.

## What would make this perfect

There is no concrete release-blocking change left from this review. Preserve
the same standard on future changes: rerun the claim inventory from a clean
clone, keep sample data isolated, and keep first-screen language as direct as
it is now.
