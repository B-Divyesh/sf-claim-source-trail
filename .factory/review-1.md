# Adversarial first-read review 1 — FAIL

Date: 2026-08-30  
Reviewer: first-time mobile visitor / independent QA  
Live URL: <https://claim-source-trail.sociobot.in>  
Live build: `1d1b469070b709ab63b1d6f3b7b2eeeab8929f1c`

## Verdict

**FAIL.** The cold first read and one-click demo are clear, the declared
claims pass, and the product has a distinctive research-desk visual system.
It still has blocking routing, reliability, honesty, claim-inventory, and
previously-recorded handoff defects. PASS requires zero findings.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×900 loaded the live home page
before scrolling. I understood it as: a private tool for undergraduate
humanities and social-science students to connect a claim to a source, its
exact location, and their reason. The first click should be **“Try it with
sample data”**. Its adjacent result text, **“Loads two sample trails. Nothing
is saved.”**, makes the outcome clear. This gate passes.

The 390px page had a 390px scroll width, no console/page errors, and the
desktop and mobile captures show the intended neo-brutalist research-desk
identity rather than a generic SaaS template.

## Findings

### F-1-1 — BLOCKING — route changes leave keyboard and screen-reader focus on the document body

**Location/evidence:** On the live 390px site, activate Primary navigation →
Privacy, then browser Back. The URL and `<h1>` change, but `document.activeElement`
is `BODY` on both `/privacy` and `/`. The app has no route-change focus move or
announcement. This fails the required deep-link/back-button/focus behavior.

**Why this matters:** A keyboard or screen-reader visitor is deposited at the
top of a newly loaded document with no announced destination, rather than at
“Privacy, by design” or “Make every claim traceable.”

**Concrete fix:** Implement real client-side route handling (including
`popstate`) or a safe full-page equivalent that focuses a temporary
`tabindex="-1"` `<h1>` after route load and announces it through an
`aria-live="polite"` region. Add desktop and 390px tests for click, Back,
title, focus, and announcement.

### F-1-2 — BLOCKING — the prior external-source test remains nondeterministic and now fails

**Location/evidence:** This is the earlier `verification-7.md` finding
“P3 — live source-reachability test is nondeterministic.” A fresh local command

```text
npm run test:e2e -- --grep 'shipped counterevidence sample points to a reachable source'
```

failed both desktop and mobile with `apiRequestContext.get: read ECONNRESET`
from `https://www.beacon.org/Silencing-the-Past-P1851.aspx` at
`tests/e2e/app.spec.ts:229`. Three immediate sequential `curl -L` probes
returned 200, confirming that the dependency is intermittent rather than a
broken visible link. A quality gate that intermittently fails is still a
quality-gate failure.

**Concrete fix:** Do not make the product suite depend on an unowned publisher
at parallel test time. Assert the shipped URL locally, then either use a
recorded fixture or a bounded, serialized retry in a separately labelled
network check. Keep a human/link-monitor probe outside the deterministic
product test gate.

### F-1-3 — BLOCKING — the prior footer provenance/build finding is still present

**Location/evidence:** This is the earlier `verification-7.md` finding
“P3 — standard footer provenance/build text is incomplete.” The live SPA footer
reads **“Claim Source Trail / Reasoning practice, not truth verification. /
Privacy / Terms / Hero art generated…”**. It omits **“Built by Param Factory”**
and a visible build/version. The static 404 includes the factory credit but
also omits the build/version. Source: `src/main.ts` `shell()` and
`public/404.html`.

**Concrete fix:** Put the same footer on every route, including the 404, with
“Built by Param Factory” and a non-secret build/version identifier. Test its
presence on home, demo, Privacy, Terms, and the 404.

### F-1-4 — BLOCKING — the prior Docker build-argument convention remains unfixed

**Location/evidence:** This is the earlier `verification-7.md` finding
“P3 — Docker build-argument default differs from the written convention.”
`Dockerfile` still says `ARG BUILD_SHA=unknown`, while the product contract
requires the conventional local default `dev`.

**Concrete fix:** Change it to `ARG BUILD_SHA=dev` and add a Docker build/health
assertion when a container runtime is available.

### F-1-5 — BLOCKING — the landing makes a false storage promise before a trail is saved

**Exact quote/location:** Workspace empty state: **“Nothing is stored until you
save a trail.”**

**Evidence:** On a fresh normal load, before creating a trail, the page sends
bodyless `POST /api/page-view` and writes
`claim-source-trail:page-counted` to `localStorage`. The existing
`anonymous-page-count` claim correctly documents this. The quoted sentence is
therefore false as written.

**Why this matters:** A privacy-sensitive student is told that nothing is
stored, while a product-owned browser marker and a server-side aggregate event
already exist.

**Concrete rewrite:** “No claim trail is stored until you save it.” Keep the
page-count explanation beside the privacy link. Add a regression test that
loads an empty workspace and verifies the exact qualified wording.

### F-1-6 — BLOCKING — several claim-like landing statements have no matching claims.json entry

**Location/evidence:** `.factory/claims.json` has no entry whose `claim` and
test cover these live promises:

- **“Loads two sample trails.”**
- **“Nothing is saved.”**
- **“Checkout and refunds are handled by Sociobot/Dodo.”**
- **“Hero art generated for this product with Azure OpenAI.”**
- **“No student work is sent to an AI model.”**

The closest entries cover demo isolation, paid checkout, local claim/source
content, and Instructor tools, but do not assert the quoted count, absolute
storage wording, refund handling, asset provenance, or AI-routing promise.

**Concrete fix:** Remove promises that cannot be observed in a clean sandbox.
For promises retained, add one claim per promise and a tagged observable test:
for example, assert exactly two demo cards; make the storage sentence qualified
as in F-1-5; verify a documented refund route/merchant policy; retain a
provenance manifest for the asset; and record every request during the complete
demo flow while asserting no AI endpoint is contacted.

### F-1-7 — MINOR — two headings use a metaphor rather than naming their section

**Exact quote/location:** Landing “How it works” heading **“A citation is only
one link.”**; 404 `<h1>` **“That trail ends here.”**

**Why this matters:** Neither tells a screen-reader heading-list user what the
section contains. The 404 heading also does not say that the page is missing.

**Concrete rewrites:** “The four parts of a claim trail” and “Page not found”.

### F-1-8 — MINOR — the designed 404 lacks route metadata and the standard header

**Location/evidence:** `public/404.html` has a title, language, favicon, and
one `<h1>`, but no meta description, canonical URL, Open Graph/Twitter tags,
or social image. Its header contains only Demo and Privacy, unlike the
home/legal header’s main workspace link and product navigation.

**Concrete fix:** Add noindex-appropriate description/canonical/social tags to
the 404 and reuse the site’s standard header/footer navigation without making
the 404 look like the home page.

### F-1-9 — MINOR — one destructive-dialog button does not name its result

**Exact quote/location:** Delete confirmation button: **“Keep it”**.

**Why this matters:** It requires the visitor to infer that this cancels a
deletion; it fails the result-naming button rule.

**Concrete rewrite:** “Cancel deletion”.

### F-1-10 — MINOR — README opening copy is overlong and uses unexplained terms

**Exact quote/location:** README opening: **“Each compact trail connects an
arguable claim to a named source, an exact page/section locator, a short
excerpt or paraphrase, and the student’s own explanation of why the evidence
matters.”** (31 machine-counted words).

**Why this matters:** It exceeds the 22-word cap and asks a new reader to
parse “trail”, “arguable”, “locator”, and “paraphrase” before explaining the
job. The next sentence’s **“reasoning chain”** and **“implicit”** have the same
problem.

**Concrete rewrite:** “Record a claim, the source, its exact location, and why
the source supports it.” Then: “See all four parts together before you write.”

## Demo, claims, privacy, and product checks

- One click on `/?demo=1#workspace` opened two
  complete, realistic humanities trails immediately. The persistent banner
  said **“Demo — sample data, nothing is saved.”** and supplied **Reset demo**
  and **Start for real**.
- The declared `@claim:demo-isolated` command passed in desktop and mobile.
  Direct inspection found demo trails only in
  `demo:claim-source-trail:trails:v1`; the normal workspace was not read or
  written by the demo flow. Reset reseeds the samples; Start for real removes
  the demo namespace.
- Fresh request logs for normal and demo entry contained same-origin assets and
  the documented bodyless same-origin page-count POST only. No third-party
  fonts, trackers, AI endpoint, or claim/source text request was observed.
- All 12 declared claim commands passed from this clean, post-`npm ci`
  checkout: `free-exports`, `demo-isolated`, `local-content`, `no-account`,
  `trail-workflow`, `offline-reload`, `offline-export`, `paid-checkout`,
  `instructor-tools`, `anonymous-page-count` (including the Rust schema test),
  `complete-deletion`, and `license-verification`.
- `npm test` passed (11 Vitest and 6 Rust tests); `npm run build` passed and
  produced `dist/` (initial JS gzip: 10.65 kB). The specific full E2E
  source-reachability command in F-1-2 failed, so the E2E quality gate cannot
  be reported as clean.
- Links crawled from the landing returned 200, except the intended checkout
  303 to Dodo. `/privacy`, `/terms`, demo, sitemap, robots, favicon, and the
  designed unknown route behaved as expected; the unknown route returned 404.
- The brief does not imply an AI drafting step, sync, or import beyond the
  shipped Markdown/CSV export. No missed leverage finding is warranted.

## Earlier review/history check

Read all present `.factory/verification*.md`, `.factory/handoff.md`,
`.factory/demo.md`, and `.factory/copy-audit.md`; no earlier
`review-*.md` or `polish-*.md` exists. Live/code checks confirm the previous
deletion, counterevidence contrast, wrapping, 44px target, corrupt-storage
recovery, Ctrl/Cmd+Enter, security-header, checkout, clean claim-server,
audience, client-rate-limit, source-validation, social-image, and HTTP-404
findings are fixed. The three earlier P3 findings that remain are re-opened as
F-1-2, F-1-3, and F-1-4, per the review rule.

## Copy audit

Counts use word-like tokens; labels, URLs, code blocks, and table field names
are not sentences. The landing audit covers standard cold-home content plus
the demo banner/unlocked content that can appear on the same route.

### Landing sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Make every claim traceable. | 5 | `traceable` is vague; prefer “Connect each claim to its source.” |
| Undergraduate humanities and social-science students build evidence trails that readers and instructors can check. | 13 | Pass. |
| Your work stays in this browser. | 6 | Covered by `local-content`. |
| Loads two sample trails. | 5 | Unlisted claim; F-1-6. |
| Nothing is saved. | 4 | Unlisted/overbroad claim; F-1-5/F-1-6. |
| Follow the blue trail: claim, source, location, reason. | 8 | Metaphor; use “Each trail records a claim, source, location, and reason.” |
| A citation is only one link. | 6 | Metaphor heading; F-1-7. |
| Write one idea that needs evidence. | 7 | Pass. |
| Name where the evidence comes from. | 7 | Pass. |
| Record the page, section, or paragraph. | 7 | Pass. |
| Explain the connection in your words. | 6 | Pass. |
| Nothing is stored until you save a trail. | 9 | False/unlisted; F-1-5. |
| Attach the exact place in a source—not only the source itself—then explain the connection in your own words. | 18 | Pass. |
| Unlock a local cohort pulse, course labels on Markdown exports, and automatic 7/30/90-day retention. | 14 | Covered by `instructor-tools`. |
| The complete student workspace and both exports remain free. | 9 | Covered by `free-exports`. |
| One-time purchase. | 2 | Pass. |
| Checkout and refunds are handled by Sociobot/Dodo. | 7 | Unlisted refund promise; F-1-6. |
| See terms. | 2 | Pass. |
| Two research trails are ready to inspect and export. | 9 | Unlisted sample-count promise; F-1-6. |
| This overview is calculated on this device. | 7 | Covered by `instructor-tools`. |
| No student work is uploaded. | 5 | Covered by `local-content`. |
| Retention uses each trail’s last-edited date and runs when this app opens. | 12 | Covered by `instructor-tools`. |
| Reasoning practice, not truth verification. | 5 | Useful limitation; pass. |
| Hero art generated for this product with Azure OpenAI. | 9 | Unlisted provenance promise; F-1-6. |
| No student work is sent to an AI model. | 9 | Unlisted privacy/AI promise; F-1-6. |

Buttons checked: **Try it with sample data**, **Build a claim trail**, **See the
four steps**, **Add claim**, **Export Markdown**, **Export CSV**, **Buy
Instructor kit**, **Verify license**, and **Reset demo** name an outcome.
**Keep it** does not; see F-1-9.

### README sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Claim Source Trail is a privacy-first evidence-reasoning workspace for undergraduate humanities and social-science students. | 14 | Jargon: replace with “A private claim-and-source tool for undergraduate humanities and social-science students.” |
| Each compact trail connects an arguable claim to a named source, an exact page/section locator, a short excerpt or paraphrase, and the student’s own explanation of why the evidence matters. | 31 | Over 22 and jargon; F-1-10. |
| It is intentionally not a fact checker, essay generator, or reference manager. | 12 | Pass. |
| It helps a reader inspect the small reasoning chain that conventional citation tools often leave implicit. | 16 | Jargon; use the F-1-10 rewrite. |
| Try the isolated sample workspace. | 5 | Pass. |
| It opens two realistic research trails without reading or writing a real workspace. | 13 | Covered by `demo-isolated`. |
| Create, revise, search, filter, and delete claim trails, including counterevidence. | 10 | Covered by `trail-workflow`. |
| See whether a trail is ready to spot-check or still needs a locator, evidence, or reasoning. | 16 | Covered by `trail-workflow`. |
| Export all work as Markdown or CSV for free. | 9 | Covered by `free-exports`. |
| Create and export a claim trail without an account. | 9 | Covered by `no-account`. |
| Claim/source content stays in browser localStorage. | 7 | Covered by `local-content`. |
| Continue using the cached app shell and exports offline. | 9 | Covered by offline claims; “app shell” is developer jargon—use “Use the saved app and exports offline.” |
| Optionally unlock the $18 one-time Instructor kit through Sociobot billing. | 10 | Covered by `paid-checkout`. |
| It adds a local cohort pulse, course labels, and automatic retention settings; core export and accessibility are never gated. | 19 | Covered by `instructor-tools`; split into two sentences for easier reading. |
| The backend serves the frontend, exposes `/health`, and stores only a per-day aggregate page count in SQLite. | 17 | Technical README detail; covered by `anonymous-page-count`. |
| It never receives student claim content. | 6 | Covered by `local-content`. |
| Requirements: Node.js 22+, npm, and Rust 1.88+. | 6 | Pass. |
| Vite proxies `/api` and `/health` to the Axum process. | 9 | Technical setup; pass. |
| The page-count route is rate-limited per first `X-Forwarded-For` client IP. | 10 | Technical setup; pass. |
| Set `BASE_URL` to test an already-running or live server. | 10 | Pass. |
| Browser tests require `npx playwright install chromium` once. | 8 | Pass. |
| The multi-stage image runs as an unprivileged user and serves both the Axum API and `dist/` on port 8080. | 19 | Technical setup; pass. |
| Deployment infrastructure and DNS are managed outside this repository. | 9 | Pass. |
| The registered production Instructor kit is checked without submitting a payment by `npm run test:billing`. | 16 | Pass. |
| The app makes no analytics or tracking requests beyond one anonymous daily page-count increment per browser. | 16 | Covered by `anonymous-page-count`. |
| License tokens are stored under `sb_license:claim-source-trail` and verified directly with the Sociobot billing API at most once daily. | 20 | Covered by `license-verification`. |
| Sociobot/Dodo is the merchant of record; no payment provider is embedded here. | 13 | Pass. |
| The application code is MIT licensed. | 6 | Pass. |
| The bundled Atkinson Hyperlegible font is copyright Braille Institute of America and licensed under SIL OFL 1.1. | 17 | Pass. |
| Its full license is in `public/fonts/OFL.txt`. | 7 | Pass. |
| Generated hero-art provenance and the complete visual system are recorded in `.factory/design.md`. | 11 | Pass. |

## What would make this perfect

Make route changes announce and focus their new heading; make the test suite
deterministic; complete the common footer/build metadata and Docker default;
qualify the storage copy; give every remaining public promise a matching claim
test or remove it; and replace the two metaphor headings and README jargon.
Then rerun this whole review, including a fresh full E2E run, at 390px and
desktop.
