# First-read product QA review 2 — FAIL

Date: 2026-09-01  
Reviewer context: first-time visitor, fresh Chromium contexts at 390×844 and 1440×900  
Live URL: <https://claim-source-trail.sociobot.in>  
Live build: `afc3897253cfb95d9df0cde94a78e7821c457c24`  
Reviewed revision: `c46c41ca4b62e69c85ec60a64cc5302dbeeb81b6`

## Verdict

**FAIL.** The first screen is clear, the sample workspace is useful, every
registered claim command passes, and the site structure is sound. The public
copy still contains claims that are missing from the claim register or are not
confirmed by an observable test. The paid Instructor kit also describes a
cohort view without a way to bring a cohort's work into the browser. PASS
requires zero findings and no untested public claim.

## Cold first read

Before scrolling, at both sizes, I understood the product as a workspace that
helps undergraduate humanities and social-science students connect each claim
to a source and supporting evidence. It is for students who need to show where
their evidence supports a claim. The first action is **Try it with sample
data**. The nearby text says that this opens two samples and keeps the real
workspace unchanged.

This gate passes. The exact text that supplied the answers was:

- **What:** “Connect each claim to its source.”
- **For whom:** “Undergraduate humanities and social-science students show
  where evidence supports each claim.”
- **First action and result:** “Try it with sample data” and “Opens two sample
  trails. Your real workspace stays unchanged.”

The mobile page had no horizontal overflow or console error. The hero and
research-desk art form a distinct product identity rather than a generic
software template.

## Findings

### F-2-1 — BLOCKING — the paid “cohort” feature has no path for cohort work

**Exact quote/location:** Landing Instructor kit: “Unlock a local cohort pulse,
course labels on Markdown exports, and automatic 7/30/90-day retention.” The
unlocked heading in `src/main.ts:216` says “Make the trail visible at cohort
scale.”

**Check:** The unlocked overview counts only trails already stored in the same
browser. The product exports Markdown and CSV, but it cannot import a student's
export, combine several submissions, or otherwise place cohort work in the
instructor's local workspace. The registered test seeds trails directly in
local storage; it does not complete an instructor workflow using student
submissions.

**Why this matters:** An instructor can reasonably read “cohort pulse” and
“cohort scale” as a view across student work. The paid feature cannot reach
that state through the product.

**Concrete fix:** Add a local Instructor-kit import for a documented student
submission format, with duplicate handling, source labels, a clear preview,
and an undoable import. Confirm a clean browser can import several sample
submissions and produce the promised totals. If import is out of scope, remove
“cohort” and describe the feature as counts for trails on this browser.

### F-2-2 — BLOCKING — refund handling is still asserted rather than confirmed (reopens F-1-6)

**Exact quote/location:** Landing, `src/main.ts:243`: “Checkout and refunds are
handled by Sociobot/Dodo.” Terms, `src/main.ts:131`: “Sociobot/Dodo is the
merchant of record and handles checkout and refunds. A refund revokes the
license.”

**Check:** `@claim:paid-checkout` confirms the checkout redirect. The separate
`@claim:refund-policy` test at `tests/e2e/app.spec.ts:445` only confirms that
the terms page repeats the merchant and refund sentences. It does not confirm
a refund outcome or license revocation. This is a partial closure of Review 1
finding F-1-6.

**Why this matters:** Repeating a promise in a second page is not observable
evidence that the promised billing behavior occurs.

**Concrete fix:** Either change the landing copy to the confirmed result,
“Checkout opens Sociobot/Dodo,” or add a billing sandbox fixture that changes
a paid license to refunded and confirms that verification returns inactive.

### F-2-3 — BLOCKING — the scope limitation is an unlisted claim

**Exact quote/location:** `README.md:7`: “It is not a fact checker, essay
generator, or reference manager.” Terms, `src/main.ts:129`: “It does not verify
whether a claim is true, guarantee citation accuracy, or replace your
instructor’s requirements.”

**Check:** `.factory/claims.json` has no scope-limitations entry. The current
tests do not confirm that the product only records user-entered material and
does not generate essays, assess truth, or produce a reference-manager result.

**Why this matters:** These limitations are useful promises about what the
product will and will not do. They are not in the proof inventory.

**Concrete fix:** Add one `scope-limitations` claim covering both locations and
an observable test of the complete available action set, or rewrite the copy
as a direct instruction without unsupported product assurances.

### F-2-4 — BLOCKING — “accessibility is never gated” is an unlisted claim

**Exact quote/location:** `README.md:20`: “core export and accessibility are
never gated.”

**Check:** `free-exports` confirms free exports. Accessibility checks exist,
but no claim entry and tagged test confirm that the complete keyboard and
accessible-name workflow remains available without a license.

**Why this matters:** The sentence joins one confirmed entitlement with a
second unregistered entitlement.

**Concrete fix:** Split the sentence. Keep “Both exports remain free,” which is
covered by `free-exports`. Add a registered no-license accessibility test if
the accessibility entitlement remains public copy.

### F-2-5 — BLOCKING — the daily page-count frequency is not confirmed

**Exact quote/location:** `README.md:80`: “The app makes no analytics or
tracking requests beyond one anonymous daily page-count increment per
browser.”

**Check:** `anonymous-page-count` confirms one bodyless request during one
visit and confirms the SQLite columns. It does not reload twice on the same day
and confirm that the second visit sends no page-count request. Its registered
claim says “A visit sends one” rather than “at most once daily per browser.”

**Why this matters:** The daily frequency is a quantitative privacy promise
that the current registered test does not measure.

**Concrete fix:** Expand the registered claim and test: load twice on the same
UTC date and confirm one request, then advance the browser date and confirm one
new request.

### F-2-6 — BLOCKING — the documented page-count limit is not in the claim register

**Exact quote/location:** `README.md:67`: “The page-count route is rate-limited
per first `X-Forwarded-For` client IP.”

**Check:** A Rust test named
`page_view_limit_uses_first_forwarded_ip_and_keeps_clients_separate` passes,
but the statement has no `.factory/claims.json` entry and no `@claim:` tag.

**Why this matters:** The behavior is checked locally but omitted from the
required public claim inventory, so claim-by-claim verification cannot discover
it.

**Concrete fix:** Add a `page-count-rate-limit` claim entry pointing to the
existing test and tag that test, including the actual allowance and retry
behavior if those numbers are intended to be public.

### F-2-7 — BLOCKING — the unprivileged-container statement is unlisted

**Exact quote/location:** `README.md:76`: “The multi-stage image runs as an
unprivileged user and serves both the Axum API and `dist/` on port 8080.”

**Check:** The Dockerfile sets `USER app`, but no registered claim test starts
the built image and confirms its runtime identity and served routes.

**Why this matters:** This is a deployment-security statement that readers can
rely on, not merely a setup instruction.

**Concrete fix:** Register the statement and add a container smoke test that
confirms the numeric runtime user is not zero and `/` plus `/health` respond.
If the worker environment cannot run containers, move the check to the release
pipeline and point the claim entry to that deterministic check.

### F-2-8 — BLOCKING — the embedded-payment statement is unlisted

**Exact quote/location:** `README.md:80`: “no payment provider is embedded
here.”

**Check:** `paid-checkout` confirms the destination of the purchase link. It
does not confirm the absence of payment-provider frames, scripts, or requests
before the visitor chooses the purchase action. No claim entry states this
promise.

**Why this matters:** The current test proves where checkout opens, not what is
loaded before that action.

**Concrete fix:** Add a `no-embedded-payment-provider` entry and record the
home-page requests and frames before checkout. Confirm they are first-party and
that no payment-provider script or frame is present.

### F-2-9 — BLOCKING — the publisher-content behavior is unlisted

**Exact quote/location:** Privacy page, `src/main.ts:123`: “This tool does not
fetch, scrape, or redistribute publisher content.”

**Check:** The demo request log is first-party until a visitor chooses a source
link, and the shipped source URL test checks only its stored value. No claim
entry names all three promised behaviors.

**Why this matters:** This is a clear privacy and copyright assurance on a
public route, but it is absent from the proof inventory.

**Concrete fix:** Add a `publisher-content-local` entry. During create, edit,
view, search, and export, confirm that source URLs are rendered as links and no
publisher request occurs until the visitor activates one. Confirm exports
contain only the user's stored excerpt and metadata.

### F-2-10 — MINOR — the mobile demo anchor hides its section heading

**Exact location/evidence:** Open `/?demo=1#workspace` at 390×844 and wait for
the anchor scroll. The 137.5 px sticky demo banner covers “Private workspace”
and the full “Your claim trails” heading. The heading occupied y=104.3–133.7
while the banner occupied y=0–137.5. The summary begins below the banner, and
the first realistic claim begins at y=627.7.

**Why this matters:** The sample is visible in the first screen, so the demo
gate passes, but the section name is missing from that view.

**Concrete fix:** Give `#workspace` a mobile `scroll-margin-top` that includes
the demo banner, or place the banner in normal flow on demo entry. Add a 390px
test that confirms the workspace heading's top is at or below the banner's
bottom after the anchor settles.

### F-2-11 — MINOR — public copy uses jargon and three terms for one concept

**Exact quote/location:** Landing: “Local-first,” “The reasoning chain,” “local
cohort pulse,” “Exact place,” and the form label “Exact locator.” README:
“evidence reasoning,” “counterevidence,” “app shell,” and “local cohort pulse.”
The headline and card use “location,” while the form and README use “locator.”

**Why this matters:** A first-time student must translate technical or
specialist terms, and the same source-position concept changes names.

**Concrete rewrite:** Use **exact location** everywhere. Replace the fact line
with “Claims stay in this browser · works offline after the first visit ·
Markdown and CSV exports are free.” Delete “The reasoning chain.” Replace
“evidence reasoning” with “why each source supports or challenges a claim,”
“app shell” with “saved app,” “counterevidence” with “a source that challenges
a claim” on first use, and “local cohort pulse” with a literal list of the
counts provided.

### F-2-12 — MINOR — four controls do not use the same result-naming labels

**Exact quote/location:** Card action “Delete”; editor action “Cancel”; license
action “Have a license? Restore it”; 404 action “Try sample data.”

**Why this matters:** “Delete” and “Cancel” omit the affected object,
“Restore it” uses an unclear pronoun, and the 404 changes the established demo
action name.

**Concrete rewrite:** “Delete trail,” “Cancel editing,” “Restore Instructor
kit,” and “Try it with sample data.”

## Demo and storage checks

- One click from the cold home screen reached `/?demo=1#workspace`.
- After the browser's anchor scroll settled, the first mobile screen showed
  the workspace controls and the first realistic claim card. Desktop showed
  the heading, controls, and cards.
- The persistent banner said “Demo — sample data. Your real workspace stays
  unchanged.” It provided **Reset demo** and **Start for real**.
- A real trail was seeded before entering demo mode. Demo mode read and wrote
  `demo:claim-source-trail:trails:v1`, retained the real
  `claim-source-trail:trails:v1` value unchanged, and showed only the two
  samples.
- Editing a sample and choosing **Reset demo** restored both shipped samples.
  Choosing **Start for real** removed the demo key and showed the original real
  trail.
- The demo request log contained only same-origin document, font, script,
  style, and image requests. Normal entry added the documented bodyless
  same-origin `POST /api/page-view`. No student text appeared in request data.
- Offline reload and both offline exports passed in their own fresh browser
  contexts.

## Registered claim results

Every command in `.factory/claims.json` ran independently and sequentially
from fresh clone `/tmp/claim-source-trail-review2-clean-DiiERf/repo`.

| Claim ID | Registered command | Result |
| --- | --- | --- |
| `free-exports` | `npm run test:e2e -- --grep @claim:free-exports` | PASS |
| `demo-isolated` | `npm run test:e2e -- --grep @claim:demo-isolated` | PASS |
| `demo-sample-count` | `npm run test:e2e -- --grep @claim:demo-sample-count` | PASS |
| `saved-trails-only` | `npm run test:e2e -- --grep @claim:saved-trails-only` | PASS |
| `local-content` | `npm run test:e2e -- --grep @claim:local-content` | PASS |
| `no-account` | `npm run test:e2e -- --grep @claim:no-account` | PASS |
| `trail-workflow` | `npm run test:e2e -- --grep @claim:trail-workflow` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS |
| `offline-export` | `npm run test:e2e -- --grep @claim:offline-export` | PASS |
| `paid-checkout` | `npm run test:e2e -- --grep @claim:paid-checkout` | PASS |
| `refund-policy` | `npm run test:e2e -- --grep @claim:refund-policy` | PASS, but see F-2-2 |
| `hero-art-provenance` | `npm run test:e2e -- --grep @claim:hero-art-provenance` | PASS |
| `no-ai-routing` | `npm run test:e2e -- --grep @claim:no-ai-routing` | PASS |
| `instructor-tools` | `npm run test:e2e -- --grep @claim:instructor-tools` | PASS |
| `anonymous-page-count` | browser command plus `cargo test claim_anonymous_page_count_stores_only_day_and_count` | PASS, but see F-2-5 |
| `complete-deletion` | `npm run test:e2e -- --grep @claim:complete-deletion` | PASS |
| `license-verification` | `npx vitest run src/license.test.ts -t @claim:license-verification` | PASS |

Logs are in `/tmp/claim-source-trail-review-2/claim-*.log`; the summary is
`/tmp/claim-source-trail-review-2/claim-results.json`.

## Copy audit

Counts use word-like tokens. URLs, code blocks, field labels, and build hashes
are not sentences. The landing list covers the cold page, demo sample,
licensed state, editor guidance, empty/error states, offline notice, and
footer. No complete sentence exceeds 22 words.

### Landing and product-state sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Demo — sample data. | 3 | Pass. |
| Your real workspace stays unchanged. | 5 | Pass. |
| Two research trails are ready to inspect and export. | 9 | Pass. |
| Connect each claim to its source. | 6 | Pass. |
| Undergraduate humanities and social-science students show where evidence supports each claim. | 11 | Pass. |
| Opens two sample trails. | 4 | Pass. |
| Your real workspace stays unchanged. | 5 | Pass; repeated from the banner. |
| Each trail records a claim, source, location, and reason. | 9 | Pass. |
| Write one idea that needs evidence. | 7 | Pass. |
| Name where the evidence comes from. | 7 | Pass. |
| Record the page, section, or paragraph. | 7 | Pass. |
| Explain the connection in your words. | 7 | Pass. |
| No claim trail is stored until you save it. | 10 | Pass. |
| Attach the exact place in a source—not only the source itself—then explain the connection in your own words. | 18 | Terminology; F-2-11. |
| Public memorials shape which histories a community treats as shared. | 10 | Sample content; pass. |
| Heritage is described as a cultural process that produces meaning in the present. | 13 | Sample content; pass. |
| This links public memorials to active choices about collective historical understanding. | 11 | Sample content; pass. |
| Archives can leave out community memory. | 6 | Sample content; pass. |
| Silences enter the making of sources and archives. | 8 | Sample content; pass. |
| This complicates a claim that an archive is a complete record of the past. | 14 | Sample content; pass. |
| Unlock a local cohort pulse, course labels on Markdown exports, and automatic 7/30/90-day retention. | 14 | Jargon and product gap; F-2-1/F-2-11. |
| The complete student workspace and both exports remain free. | 9 | Covered by `free-exports`. |
| One-time purchase. | 2 | Pass. |
| Checkout and refunds are handled by Sociobot/Dodo. | 7 | Unsupported outcome; F-2-2. |
| See terms. | 2 | Pass. |
| This overview is calculated on this device. | 7 | Covered by `instructor-tools`. |
| No student work is uploaded. | 5 | Covered by `local-content` and `anonymous-page-count`. |
| Retention uses each trail’s last-edited date and runs when this app opens. | 12 | Covered by `instructor-tools`. |
| Fields marked “required” must be present to save. | 8 | Pass. |
| Locator, excerpt, and reasoning can begin as a draft, but the trail will show what is missing. | 17 | Terminology; F-2-11. |
| One precise idea that needs evidence—not the essay topic. | 10 | Pass. |
| Optional. | 1 | Pass. |
| Enter a full http(s) URL or a DOI beginning with 10. | 11 | Pass. |
| Keep quotations short and respect the source’s access and copyright terms. | 11 | Pass. |
| This source complicates or challenges the claim. | 8 | Pass. |
| No trails match. | 3 | Pass. |
| Try a different search or filter. | 6 | Pass. |
| Your saved trails could not be read. | 7 | Pass. |
| Delete the unreadable local data below, then start again. | 9 | Pass. |
| Could not save. | 3 | Pass. |
| Check this browser’s storage settings. | 5 | Pass. |
| Trail deleted. | 2 | Pass. |
| Trail restored. | 2 | Pass. |
| Demo reset with fresh sample trails. | 6 | Pass. |
| Instructor settings saved locally. | 4 | Pass. |
| Offline — your local workspace and exports still work. | 8 | Covered by the offline claims. |
| Reasoning practice, not truth verification. | 5 | Useful limitation. |
| Original generated hero art. | 4 | Covered by `hero-art-provenance`. |

Landing fragments/headings that require changes: “Local-first · no account ·
free Markdown & CSV export,” “The reasoning chain,” “Exact place,” “Exact
locator,” and “Make the trail visible at cohort scale” are covered by F-2-1
and F-2-11. Button text is covered by F-2-12.

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Claim Source Trail is a private workspace for humanities and social-science students. | 12 | Pass. |
| Record a claim, the source, its exact location, and why the source supports it. | 14 | Pass. |
| See all four parts together before you write. | 8 | Pass. |
| It is not a fact checker, essay generator, or reference manager. | 11 | Unlisted claim; F-2-3. |
| It helps readers inspect the evidence reasoning behind a claim. | 10 | Jargon; F-2-11. |
| Try the isolated sample workspace. | 5 | Pass. |
| It opens two realistic research trails without reading or writing a real workspace. | 13 | “Realistic” is unnecessary; use “sample.” |
| Create, revise, search, filter, and delete claim trails, including counterevidence. | 10 | Define counterevidence on first use; F-2-11. |
| See whether a trail is ready to spot-check or still needs a locator, evidence, or reasoning. | 16 | Terminology; F-2-11. |
| Export all work as Markdown or CSV for free. | 9 | Pass. |
| Create and export a claim trail without an account. | 9 | Pass. |
| Claim/source content stays in browser `localStorage`. | 7 | Technical term; use “this browser” in the introduction. |
| Continue using the cached app shell and exports offline. | 9 | “App shell” is jargon; F-2-11. |
| Optionally unlock the $18 one-time Instructor kit through Sociobot billing. | 10 | Pass. |
| It adds a local cohort pulse, course labels, and automatic retention settings; core export and accessibility are never gated. | 19 | Jargon and unlisted claim; F-2-1/F-2-4/F-2-11. |
| The backend serves the frontend, exposes `/health`, and stores only a per-day aggregate page count in SQLite. | 17 | Technical context; storage portion is covered by `anonymous-page-count`. |
| It never receives student claim content. | 6 | Covered by `anonymous-page-count`. |
| Requirements: Node.js 22+, npm, and Rust 1.88+. | 6 | Pass. |
| Vite proxies `/api` and `/health` to the Axum process. | 9 | Technical context; pass. |
| The page-count route is rate-limited per first `X-Forwarded-For` client IP. | 10 | Unlisted claim; F-2-6. |
| Set `BASE_URL` to test an already-running or live server. | 10 | Pass. |
| Browser tests require `npx playwright install chromium` once. | 8 | Pass. |
| The multi-stage image runs as an unprivileged user and serves both the Axum API and `dist/` on port 8080. | 19 | Unlisted claim; F-2-7. |
| Deployment infrastructure and DNS are managed outside this repository. | 9 | Scope note; pass. |
| The registered production Instructor kit is checked without submitting a payment by `npm run test:billing`. | 16 | Pass. |
| The app makes no analytics or tracking requests beyond one anonymous daily page-count increment per browser. | 16 | Frequency not confirmed; F-2-5. |
| License tokens are stored under `sb_license:claim-source-trail` and verified directly with the Sociobot billing API at most once daily. | 20 | Covered by `license-verification`. |
| Sociobot/Dodo is the merchant of record; no payment provider is embedded here. | 13 | Embedded-provider clause is unlisted; F-2-8. |
| The application code is MIT licensed. | 6 | Confirmed by `LICENSE`. |
| The bundled Atkinson Hyperlegible font is copyright Braille Institute of America and licensed under SIL OFL 1.1. | 17 | Confirmed by `public/fonts/OFL.txt`. |
| Its full license is in `public/fonts/OFL.txt`. | 7 | Confirmed. |
| Generated hero-art provenance and the complete visual system are recorded in `.factory/design.md`. | 11 | Confirmed by the design notes and source sidecar. |

No sentence exceeds 22 words. The terminology and claim flags above still
prevent a clean copy result.

## Earlier finding confirmation

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 route focus | Fixed. Click and Back focus the new h1 and update the polite announcement in both browser sizes. |
| F-1-2 external-source check | Fixed. The product test checks the stored URL without relying on the publisher response. Both shipped source links also returned 200 during this review's separate crawl. |
| F-1-3 footer provenance/build | Fixed. Home, demo, legal pages, and 404 show Param Factory and version information; SPA pages also show the live build. |
| F-1-4 Docker build default | Fixed. Both `ARG BUILD_SHA` declarations use `dev`. |
| F-1-5 storage promise | Fixed. The empty state says “No claim trail is stored until you save it.” |
| F-1-6 unlisted claims | Partly fixed. Sample count, saved-trail scope, art disclosure, and no-model routing have entries and tests. Refund handling remains unconfirmed; see F-2-2. |
| F-1-7 metaphor headings | Fixed. The h2 is “The four parts of a claim trail”; the 404 h1 is “Page not found.” |
| F-1-8 404 metadata/header | Fixed. The live 404 returns HTTP 404 with description, canonical, social metadata, standard navigation, and footer. |
| F-1-9 delete-dialog label | Fixed. The action is “Cancel deletion.” |
| F-1-10 README opening | Fixed. The opening uses two short concrete sentences. New jargon is listed separately in F-2-11. |

## Structure, accessibility, and link checks

- Home, demo, Privacy, Terms, and 404 use route-specific titles, one h1,
  `lang="en"`, main landmarks, descriptions, canonical URLs, Open Graph and
  Twitter metadata, the product social image, SVG favicon, and 180px touch
  icon.
- The sitemap lists home, demo, Privacy, and Terms. `robots.txt` allows the
  public site. The unknown route returned the designed 404 document with HTTP
  404.
- Client navigation, deep links, Back, h1 focus, and polite announcements
  passed. F-2-10 records the separate mobile demo-anchor overlap.
- All crawled internal pages/assets returned 200. Both sample source links
  reached 200 pages. The product-scoped checkout reached its hosted checkout
  page.
- The live request log had no third-party fonts, scripts, or tracking requests.
  The only normal-entry POST was the documented bodyless page count.
- `/opt/fleet/lib/verify-url.sh` reported a 612 ms load, one h1, `lang=en`, a
  main landmark, no missing image alternatives, no unnamed buttons, and no
  console/page errors.
- Playwright accessibility scans reported no serious or critical findings.
  Keyboard dialogs, 44px controls, reduced motion, and 390px width checks
  passed in the 60-test live suite.
- The visual system matches `.factory/design.md`: warm paper, heavy ink rules,
  yellow action color, self-hosted Atkinson Hyperlegible, offset paper-card
  shapes, and original research-desk art. It is visually distinct.

## Build and regression evidence

- `npm test`: PASS — 11 Vitest and 7 Rust tests.
- `npm run build`: PASS — `dist/` produced; initial JavaScript was 32.26 kB raw
  and 11.02 kB gzip.
- `BASE_URL=https://claim-source-trail.sociobot.in npm run test:e2e`: PASS —
  60/60 across desktop and 390px.
- All 17 registered claim commands: PASS from the fresh clone.
- Live `/health`: build
  `afc3897253cfb95d9df0cde94a78e7821c457c24`. The repository changes after
  that build are documentation-only.

## What would make this perfect

Make the Instructor kit complete a real local cohort workflow through import,
or remove the cohort wording. Replace the refund assurance with a result that
is confirmed, or add a billing sandbox result test. Register and test every
remaining public behavior claim. Keep the mobile workspace heading below the
demo banner, use one plain term for exact source location, remove the listed
jargon, and make the four control labels explicit. Then repeat the cold mobile
and desktop review, every claim command, the complete live browser suite, and
the request-log checks from fresh state.
