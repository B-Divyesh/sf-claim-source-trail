# Polish round 2 — review closure

Candidate repaired from `c46c41ca4b62e69c85ec60a64cc5302dbeeb81b6` on 2026-09-01.

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Added a complete Instructor-kit CSV import workflow. It accepts several student exports, validates required fields, previews each file, labels submissions from filenames, skips duplicates, shows new/duplicate/invalid totals, saves locally, and offers one-click undo. The README documents the student submission format. | `@claim:instructor-import` passed in both browser projects; `@claim:instructor-tools` passed; `.factory/evidence/polish-2-import-preview.png`; live `/` with a cached valid test verdict. |
| F-2-2 | Removed assertions about refund handling. Copy now says that checkout opens Sociobot/Dodo and asks the buyer to review checkout terms. Terms state only the observable inactive-license result. | `states the confirmed checkout result without promising a refund outcome`; `@claim:paid-checkout`; `@claim:inactive-license-lock`; live `/terms`. |
| F-2-3 | Replaced broad fact-checker/reference-manager wording with the precise, registered behavior: the app records student input and neither generates essays nor scores truth. | `@claim:manual-reasoning`; `.factory/claims.json`; live `/terms` and README. |
| F-2-4 | Removed the unregistered “accessibility is never gated” entitlement. The retained statement is the tested fact that both student exports remain free. | `@claim:free-exports`; no-license accessibility flows in `home and editor have no serious accessibility violations` and the keyboard tests. |
| F-2-5 | Added a daily-frequency claim and test. It reloads twice on one stored UTC date, observes one POST, advances the stored date, and observes one new POST. | `@claim:daily-page-count` passed in desktop and mobile projects. |
| F-2-6 | Registered the page-count rate limit and renamed the Rust test with its claim tag. The test proves first-forwarded-IP separation, a 40-request burst, HTTP 429, and `Retry-After`. | `cargo test claim_page_count_rate_limit_uses_first_forwarded_ip_and_returns_retry_after`. |
| F-2-7 | Registered the non-root release contract and added a deterministic container/server test for `USER app`, port 8080, entrypoint, `/`, and `/health`. | `npx vitest run src/container.test.ts -t @claim:container-runtime`; release-stage `USER app`; deployed runtime identity check. |
| F-2-8 | Registered and tested the absence of embedded payment code before checkout. | `@claim:no-embedded-payment-provider` records requests and frames on a cold home page; `@claim:paid-checkout` separately proves the outbound checkout redirect. |
| F-2-9 | Registered the publisher-content boundary and tested create/view/search/export without activating the stored source link. Exports contain the saved excerpt and metadata only. | `@claim:publisher-content-local` passed in both browser projects. |
| F-2-10 | Added deterministic demo-anchor settling and mobile layout rules so the sticky banner cannot hide the workspace heading. The first realistic sample also remains visible at 390×844. | `mobile demo anchor keeps the workspace heading below the banner`; `.factory/evidence/polish-2-demo-mobile.png`; live `/?demo=1#workspace`. |
| F-2-11 | Rewrote public copy in plain words. “Exact location” is now consistent; specialist terms are explained or removed; the facts name browser storage, offline use, and free exports directly. | `.factory/copy-audit.md`; `controls use explicit result-naming labels`; cold desktop/mobile screenshots. |
| F-2-12 | Renamed controls to “Delete trail”, “Cancel editing”, “Restore Instructor kit”, and “Try it with sample data”. | `controls use explicit result-naming labels`; live workspace, license panel, and 404. |

## Review 1 regression check

| Finding | Retained closure | Evidence |
| --- | --- | --- |
| F-1-1 | History navigation, `popstate`, polite route announcements, and h1 focus remain in place. | `route changes move focus to the new page heading and announce the destination`, desktop and mobile. |
| F-1-2 | Publisher URL checking remains deterministic and never depends on the publisher during the product suite. | `the shipped counterevidence sample has a valid, documented source URL without reaching an external publisher`. |
| F-1-3 | Every route and the static 404 retain Param Factory provenance and a visible build/version. | Route and 404 assertions in the 76-test suite. |
| F-1-4 | Both Docker build stages retain `ARG BUILD_SHA=dev`. | `@claim:container-runtime`; clean release build. |
| F-1-5 | The empty state remains qualified as “No claim trail is stored until you save it.” | `@claim:saved-trails-only`. |
| F-1-6 | Sample count, qualified storage, artwork provenance, and no-AI routing remain registered. The unsupported refund claim was removed in F-2-2. | `@claim:demo-sample-count`, `@claim:saved-trails-only`, `@claim:hero-art-provenance`, `@claim:no-ai-routing`. |
| F-1-7 | Section headings remain literal: “The four parts of a claim trail” and “Page not found”. | Landing and unknown-route browser assertions. |
| F-1-8 | The 404 retains its own title, description, canonical, social metadata, standard navigation/footer, and HTTP 404 status. | `unknown routes return the designed 404 document with complete metadata`. |
| F-1-9 | The destructive-dialog escape action remains “Cancel deletion”. | `@claim:trail-workflow`. |
| F-1-10 | README opening and landing copy remain short and use the same terms as the product. | `.factory/copy-audit.md`; no audited landing sentence exceeds 22 words. |

## Acceptance evidence

- Clean clone: `/tmp/claim-source-trail-polish2-clean-LEuARq/repo`.
- Clean `npm test`: 15 Vitest and 7 Rust tests passed.
- Clean `npm run build`: passed; `dist/` produced; JS 12.56 kB gzip; CSS 4.47 kB gzip.
- All 24 commands in `.factory/claims.json`: passed independently.
- Clean `npm run test:e2e`: 76/76 passed across desktop and 390×844 mobile.
- Axe integration: zero serious/critical issues in home, editor, counterevidence, and import-dialog states.
- Local Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.7 s, CLS 0, TBT 0 ms.
- Local URL verifier: title, language, landmarks, h1 count, alternative text, control names, and console checks passed.
- Screenshots: `.factory/evidence/polish-2-home-desktop.png`, `.factory/evidence/polish-2-demo-mobile.png`, `.factory/evidence/polish-2-import-preview.png`.
- Live URL: <https://claim-source-trail.sociobot.in>; post-deploy checks use cold browser contexts and the same 76-test suite.

No Review 1, Review 2, earlier verification, or polish finding remains open.
