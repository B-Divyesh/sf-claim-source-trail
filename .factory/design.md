# Claim Source Trail — visual thesis

## Direction and rationale

**Neo-brutalist utility, shaped like a research desk.** The interface borrows the directness of an index card, a black felt-tip annotation, a highlighter, and a teacher's margin mark. Heavy rules make each reasoning step inspectable; slightly offset shadows suggest loose paper without imitating a generic dashboard. Decoration always explains the job: the hero illustration turns one claim into a visible chain of source, locator, and reasoning.

This is deliberately a focused single light treatment. A paper-and-ink environment is the product metaphor, and preserving stable evidence-status colors makes classroom projection and print exports predictable. The background is explicitly painted warm paper rather than inheriting a browser theme.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F4F0E6` | background |
| Card | `#FFFDF6` | working surfaces |
| Ink | `#171712` | primary text and 3px rules |
| Muted ink | `#5A584F` | explanatory text |
| Signal yellow | `#FFD84D` | primary action and active focus |
| Evidence blue | `#176B87` | links and source labels |
| Counter coral | `#BD3D2A` | counterevidence state |
| Verified green | `#287A4D` | complete trail state |
| Warning wash | `#FFF1B8` | missing-step notices |
| Danger | `#A52D21` | destructive actions/errors |

Ink on paper is above 13:1; muted ink on paper is above 6:1; white on evidence blue is above 5:1; white on counter coral is 5.44:1. Color is always paired with a word, symbol, or border treatment.

## Type and spacing

- Display and labels: self-hosted **Atkinson Hyperlegible**, 700, chosen for distinguishable letterforms in dense classroom work.
- Body and forms: self-hosted **Atkinson Hyperlegible**, 400. A single family keeps the utility fast and legible; metadata uses a system monospace stack for locator-like precision.
- Scale: 16px body, 18px lead, 20px section heading, clamp(32px–56px) display.
- Spacing follows an 8px rhythm with 4px half-steps. The wide canvas caps at 1180px; form measure caps near 72 characters.

## Interaction grammar

- Buttons are rectangular with 3px ink borders and 4px offset shadows. Pressing moves the control into its shadow by 2px.
- The four required reasoning steps are numbered and remain in a fixed reading order: claim → source → exact location → why it supports the claim.
- A saved card shows a plain-language completeness strip. Missing locator/reason fields remain visibly actionable; the product never labels a claim "true".
- Editing happens in one focused sheet. Destructive deletion requires a dialog naming the claim; a brief undo action follows deletion.
- Keyboard: visible yellow/ink focus ring, Escape closes dialogs, Ctrl/Cmd+Enter saves the editor.

## Motion policy

State changes use 160–220ms opacity and translate transitions with physical origins: the editor rises from the add action; cards enter from the top edge. No looped motion. Under `prefers-reduced-motion: reduce`, transforms, smooth scrolling, and nonessential transitions are removed; feedback remains through text and color-independent borders.

## Responsive intent

At 390px, the decorative hero art is simplified and placed below the call-to-action; header links become a compact row; two-column form fields stack; card actions wrap under evidence metadata. Nothing essential is removed. Touch targets stay at least 44px.

## Asset plan and provenance

- `hero-trail.webp`: an original generated editorial still life showing a blank claim card connected by a cobalt line to an open book, locator tab, and reasoning note. It reinforces the chain model without implying automatic verification. No readable generated text is used.
- Art direction prompt: “Top-down editorial still life of a student research desk in a bold neo-brutalist paper-cut collage style. One blank cream index card, an open book with abstract non-readable line marks, a bright yellow page tab, and a small reasoning note connected by one thick cobalt-blue trail. Black ink outlines, warm off-white paper background, signal yellow and muted coral accents, crisp hard side lighting, slight paper texture, deliberate imperfect cut edges, flat 35mm composition. No people, no hands, no text, no letters, no numbers, no logos, no watermark, no brand symbols, no gradients, no photoreal UI.”
- Generated with the factory Azure OpenAI image deployment (`factory-image`) on 2026-08-27. Original output and prompt sidecar are retained under `assets/src/`; optimized WebP is shipped. The generated image is original to this product and disclosed in the footer.
- UI icons are hand-authored inline SVG using simple strokes; no external icon set.
