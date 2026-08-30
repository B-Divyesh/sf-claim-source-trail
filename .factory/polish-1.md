# Polish round 1 — review closure

Candidate repaired from `4176682a01b084e0baee66ac10baaacb8028752b` on 2026-08-30.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added History API navigation and `popstate` handling, a polite route announcer, and focus transfer to each new `<h1>`. | `route changes move focus to the new page heading and announce the destination`, live desktop + 390px pass. |
| F-1-2 | Replaced the parallel live publisher probe with a deterministic local URL/integrity assertion. | `the shipped counterevidence sample has a valid, documented source URL without reaching an external publisher`, live desktop + 390px pass. |
| F-1-3 | Put Param Factory provenance and version/build identity in the SPA footer; matched the 404 footer. | Live full browser suite; 404 metadata/footer assertion passes. |
| F-1-4 | Changed both Docker build-stage defaults to `ARG BUILD_SHA=dev`. | Fresh-clone `npm run build` pass. |
| F-1-5 | Rewrote the empty-state promise to “No claim trail is stored until you save it.” | `@claim:saved-trails-only`, live desktop + 390px pass. |
| F-1-6 | Added five missing proof records/tests: sample count, saved trails, refund terms, generated-art disclosure, and no-AI routing. | All 17 declared claim commands pass independently from a fresh clone. |
| F-1-7 | Replaced metaphor headings with “The four parts of a claim trail” and “Page not found.” | Live browser heading and 404 checks pass. |
| F-1-8 | Added 404 description, canonical, Open Graph/Twitter image, standard four-link header, footer/version, and assertions. | `unknown routes return the designed 404 document with complete metadata`, live desktop + 390px pass. |
| F-1-9 | Renamed “Keep it” to “Cancel deletion.” | Live full trail workflow and dialog keyboard suite pass. |
| F-1-10 | Rewrote the README opening in plain language; refreshed the copy audit. | `.factory/copy-audit.md`; no landing sentence exceeds 22 words. |
| verification-7 P3 footer/build | Closed with shared footer and build ID. | Full suite + 404 assertion pass. |
| verification-7 P3 Docker default | Closed with `BUILD_SHA=dev`. | `npm run build` pass. |
| verification-7 P3 flaky source probe | Closed with deterministic local test. | Full suite (60/60) pass. |
| verification 2–6 P1/P2/P3 | Retained prior fixes for deletion, contrast, mobile bounds/touch targets, recovery, shortcuts, headers, checkout, claims, source validation, metadata, and HTTP 404. | Full 60-test Playwright suite, 7 Rust tests, and all claim commands pass. |

Fresh-clone evidence: `/tmp/claim-source-trail-clean-tNol63`; individual claim command logs: `/tmp/claim-source-trail-claim-*.log`. Live evidence: `/tmp/claim-source-trail-live-TR6lK9/screenshot-desktop.png`, `/tmp/claim-source-trail-live-TR6lK9/screenshot-mobile.png`, `/tmp/claim-source-trail-live-TR6lK9/demo-mobile.png`, and `/tmp/claim-source-trail-live-TR6lK9/verify.json`. The live URL verifier reports one title, `lang=en`, one `<h1>`, `<main>`, image alt text, and no console/page errors. Live Playwright’s Axe integration found zero serious/critical violations on home, editor, and counterevidence states. The standalone Axe CLI could not start Selenium’s Chrome binary in this worker; the installed Playwright Chromium integration is the accessibility evidence used here.
