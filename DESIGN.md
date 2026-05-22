# DESIGN.md

Design system for the editorial-brutalist register defined in [PRODUCT.md](./PRODUCT.md), tuned against three saved references: Mike (warm cream, illustration, italic-emphasis), Zwinkle (display-sans + photo grid + numbered indices), and Luxespace (one decisive accent, ornament marks, asymmetric collage).

Direction is locked: warm-paper neutrals, **fanta-pink accent**, PP Neue Montreal + PP Editorial New italic, compass-rose ornament, count-down N-index, bio-first home.

## The signature move

Every page should be identifiable as Nadia's from one element alone:

> **Big sans display heading interrupted by an italic-serif phrase mid-sentence.**

Example: *I build things at the edge of finance and infrastructure.* — where "edge of finance" is set in italic serif and the rest in sans display. This is the load-bearing typographic gesture. Use it on the home hero, on every section opener, and once per essay header. Used sparingly enough that it never becomes wallpaper.

## Avoiding the trope

The three references live in a saturated lane. To not be the 100th version, the site holds **two** signatures the trope doesn't own:

1. **The compass rose ornament.** A small four-point star with the long axis slightly longer than the short, drawn as a single inline SVG, used once per section opener as an anchor. Not a generic asterisk, not a sparkle, not the awwwards-default sun-burst.
2. **Numbered indices count down, not up.** Work entries are labeled `N1`, `N2`, `N3` *from the most recent* — newest is `N1`. The N stands for Nadia and reads as a personal catalog, not a chronological CV.

Drop either of these and the site collapses back into the trope. Hold them across every surface.

## Color

**Strategy: Committed.** One fanta-pink accent owns 8–12% of any given page, plus warm-paper neutrals and a near-black ink. The accent is unmissable when it appears, and the rest of the surface stays out of its way. The choice of pink (over the saturated orange the references default to) is itself a trope-breaker — orange-on-cream is the awwwards 2024–25 reflex; warm pink in the same role is rarer and more identifiable.

All color in OKLCH. Chroma drops near the lightness extremes.

```css
/* Neutrals — warm paper. Every value tints toward 80° hue. */
--paper:        oklch(96.8% 0.008 80);   /* page background, off-white with warmth */
--paper-deep:   oklch(93.5% 0.010 80);   /* secondary surfaces, asides */
--paper-soft:   oklch(89%   0.012 80);   /* hairline-section blocks, photo gutters */
--rule:         oklch(82%   0.012 80);   /* dividers */
--ink-mute:     oklch(55%   0.014 80);   /* captions, meta, index labels */
--ink:          oklch(20%   0.012 80);   /* body text, near-black, warm */
--ink-deep:     oklch(12%   0.010 80);   /* display headings */

/* Accent — fanta pink. Saturated, candy-pop, leaning warm. Used decisively, never decoratively. */
--accent:        oklch(64%   0.220 2);   /* primary accent */
--accent-deep:   oklch(52%   0.200 2);   /* hover / pressed state */

/* Black slab — the closer. Footer surface only. */
--slab:          oklch(16%   0.008 80);
--slab-ink:      oklch(94%   0.008 80);
```

### Where the accent is allowed

- The compass-rose ornament, every appearance.
- Section-opener labels (`[ N1 SELECTED WORK ]`) — the brackets, not the words.
- The current nav item's underline.
- Link underlines on hover (not at rest — at rest, links use `--ink-deep` with a permanent 1px underline).
- Selection highlight.

### Where the accent is banned

- Buttons (there are no styled buttons in v1; affordances are links and rules).
- Body paragraphs (no colored emphasis — italic serif handles emphasis instead).
- Backgrounds of any block.
- Imagery filters or overlays.

## Theme

**Light, committed.** The scene: someone reads this in a bright room in the middle of an afternoon, on a laptop or a phone held in good light. The page is paper. A dark theme is not on the roadmap for v1; if added later it inverts the lightness scale, never the hue.

## Typography

The pairing carries the brand. Two families, used at distinct sizes for distinct jobs.

```css
--font-display: 'PP Neue Montreal', 'Inter Tight', system-ui, sans-serif;
--font-body:    'PP Neue Montreal', 'Inter', system-ui, sans-serif;
--font-italic:  'PP Editorial New', 'EB Garamond', Georgia, serif;  /* italic style only */
--font-mono:    'JetBrains Mono', ui-monospace, monospace;          /* index labels, code blocks */
```

Locked pairing: **PP Neue Montreal** (display + body) + **PP Editorial New Italic** (emphasis only) + **JetBrains Mono** (index labels). All three Pangram Pangram fonts are free for personal use, which fits a personal portfolio cleanly. Verify the license terms before any commercial use of the site.

The italic serif appears only in italic style. Never set the serif as upright running text — that drifts toward Stripe Press editorial and away from the reference lane.

### Scale

Hierarchy comes from scale + weight + family contrast. Ratio ≥ 1.33 between display steps, ≥ 1.25 between body steps.

```css
--text-2xs:   0.6875rem;  /* 11 — index labels, caps */
--text-xs:    0.8125rem;  /* 13 — captions, meta */
--text-sm:    0.9375rem;  /* 15 — secondary body */
--text-base:  1.0625rem;  /* 17 — body */
--text-lg:    1.3125rem;  /* 21 — lead paragraph */
--text-xl:    1.75rem;    /* 28 — h3 */
--text-2xl:   2.5rem;     /* 40 — h2 */
--text-3xl:   3.75rem;    /* 60 — h1 */
--text-4xl:   5.5rem;     /* 88 — display hero */
--text-5xl:   8rem;       /* 128 — display hero, desktop only */
```

Body sits at 17/1.6 on desktop, 16/1.55 on mobile. Measure capped at **68ch**.

Display sizes are tight: `line-height: 0.95` for `--text-5xl`, `1.0` for `--text-4xl`, `1.05` for `--text-3xl`. Letter-spacing `-0.025em` on the top two, `-0.015em` on `--text-3xl`, neutral elsewhere.

### Weight

- Display sans: 500 (Medium) is the default; 600 (Semibold) only for the largest display step.
- Body sans: 400 (Regular) for prose, 500 for UI labels and nav. No bold body text.
- Italic serif: 400 italic only. One weight. Never roman, never bold.

## Layout

- **No outer page container.** The body is the canvas; only prose needs a measure.
- **Margins scale with viewport.** Outer padding: `clamp(1.25rem, 4vw, 4rem)`. The widest viewport leaves real breathing room at the edges — but display headings can break the gutter to push toward the edge for impact (the way "THE LIFE OF A MOTO" hangs over the page in the Zwinkle ref).
- **Two-column allowed, sparingly.** The home and the work-detail pages can split into an asymmetric grid (e.g., a wide left column for the heading + a narrow right rail for the index). Essays stay single-column.
- **No cards as a default container.** Project entries are list rows with hairline rules above and below — the Zwinkle photo grid is the model, not a SaaS card grid.
- **Asymmetric photo blocks.** When imagery appears, it is not boxed and labeled identically across the page. Some photos are large and bleed near the gutter; others are small and indexed. The grid breaks alignment on purpose.
- **Vertical rhythm varies.** Sections breathe at `margin-block: 6rem` desktop / `3.5rem` mobile. Paragraphs sit close at `1em` between.

## Imagery

Imagery is load-bearing in this register — not decoration.

- **No stock photography.** Real photos, real illustrations, or no image at all.
- **Captions are part of the image.** Set in `--text-2xs` mono, ink-mute, placed below the image with a small numeric index (`N1 / 06`). The caption is structural, not optional.
- **Photo treatment.** Subtle warm grain is acceptable in v2 — flagged, not done yet. No duotone, no heavy filter, no rounded corners over `4px`.
- **Black-and-white reserved.** B&W appears only in the testimonial-row pattern (small portraits) — color photography elsewhere.

## Ornament

Exactly one ornament shape: the **compass rose**. Inline SVG, sized to match the cap-height of the surrounding text or set as a single anchor at the top of a section.

- Appears at section openers and as the favicon mark.
- Color: `--accent` always.
- Size: `1em` inline; `clamp(2rem, 4vw, 3.5rem)` standalone.
- Never animated except a single static rotation on page load if reduced-motion is off (10° rotation, 800ms ease-out-quart, once).
- Never repeated as a pattern or border.

## Section labels

A consistent typographic mark for every section opener.

```
[ N1   SELECTED WORK ]
```

- Set in `--font-mono`, `--text-2xs`, uppercase, letter-spacing `0.08em`.
- Brackets in `--accent`, content in `--ink-mute`.
- One space inside each bracket. The index lives inside the brackets.
- Appears once at the top of every major section. Never used at sub-section level (sub-sections use h3, no label).

## Numbered indices

Work entries and image captions all carry an `N#` index. The catalog counts **down from newest**:

- Newest project: `N1`.
- Second-newest: `N2`.
- And so on.

The index is set in mono (`--font-mono`), small (`--text-2xs`), ink-mute, with a thin rule between index and title in list rows.

## Elevation

There is no elevation system. No shadows, no glass, no blur. Depth comes from a hairline rule in `--rule` or a small lightness shift to `--paper-deep`. That's it.

## Motion

One vocabulary across the page. Three gestures, repeated. No grab-bag of effects.

### The three gestures

1. **Rise** (the signature). Text reveals by translating up out of an `overflow: hidden` parent. `translateY(110%) → 0`, 640ms ease-out-quart. Whole phrases, never word-by-word. Used for: wordmark, the three hero display lines, section labels, footer email, footer wordmark. No opacity fade pairs with this — the visual move is the mask itself.
2. **Draw** (the structural beat). Hairline rules scale `scaleX(0) → 1` with `transform-origin: left`, 720–760ms ease-out-quart. Implemented as pseudo-elements (`::before` / `::after`), never as animated `border` properties. Used for: header bottom rule, work-list top rule, every work-row bottom rule, footer meta top rule. The page assembles its own structure as you scroll.
3. **Hush** (the supporting motion). Body copy: `opacity: 0 → 1` plus `translateY(6px → 0)`, 480ms ease-out-quart. Used for: hero lead paragraph, work-row content, footer eyebrow / links / meta, the footer's compass-rose. Forgettable on purpose; it just gets out of the way.

### Standing motions (not part of the reveal system)

- **Compass-rose load.** `rotate(-14deg) scale(0.85) → 0/1`, 880ms ease-out-quart, fires once on mount. The page's first beat.
- **Link underlines.** Draw in on hover from left via `right: 100% → 0`, 240ms. Used on nav, footer links, footer email.
- **Work-row hover tint.** Background color shifts to `--paper-deep`, 220ms.

### Orchestration

- **Hero and header**: play on mount via `immediate: true`. Total ~1.2s from page load to lead paragraph hush-in.
- **Selected Work and Footer**: play once per page session when scrolled to 15% in view, via `IntersectionObserver`. Total ~1.0–1.1s per section from trigger to last element.
- **Delays inside a section** stagger 80–140ms apart so the eye finishes one element before the next starts. Set per-element via inline `--delay` CSS custom property.
- The `useReveal` hook in `src/hooks/useReveal.ts` wires both modes (mount vs. scroll). Sections drive the `.is-revealed` class on themselves; children animate via the descendant selector.

### Constraints

- Transform and opacity only. Never layout properties (width, height, top, margin).
- Easing is always `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart). No bounce, no elastic, no other curves.
- Durations live between 220ms (hover) and 880ms (compass-rose). The bulk of reveals are 480–760ms.
- One play per element. No re-trigger on scroll-back.

### Reduced motion

`prefers-reduced-motion: reduce` collapses everything to its final state. `rise-inner` → `translateY(0)`, `hush` → `opacity: 1`, draws → `scaleX(1)`, compass-rose → static. No animation, no transition, no surprise.

## Components (minimum set)

The portfolio is small. The component set is too.

- **Page header.** Lowercase wordmark `nadia` in display sans, four nav links, single hairline rule under the row. No logo, no search, no theme toggle, no mobile hamburger that collapses to a sheet — at mobile, nav wraps to a second line in smaller type.
- **Hero display.** Multi-line display heading with the signature italic-serif interruption. Compass-rose anchor in the top-left. No background image — the type IS the hero.
- **Section opener.** Bracketed label + N-index + h2 + optional one-line dek in italic serif.
- **Work entry (list row).** `N#  ·  TITLE  ·  short context  ·  YEAR` — full-width, hairline rule above each row, becomes a two-line stack on mobile. Hover lifts the title to `--ink-deep` and draws the underline.
- **Prose block.** Long-measure container for essays and bio. Handles `p`, `h2`–`h4`, `blockquote`, `ul/ol`, `figure`, `code`, `a`. Italic serif used for in-paragraph emphasis (`em`); bold reserved for `strong` and pulled toward `--ink-deep`.
- **Image block.** Figure with image, caption in mono with N-index, optional second caption line. Spans the prose measure, with `data-size="bleed"` allowed to break to viewport width minus outer padding.
- **Testimonial row.** (Only if testimonials exist — optional for v1.) Three to five small B&W portraits in a horizontal rule, each with name + role + one-line quote underneath. Mirrors the Mike ref pattern.
- **Footer slab.** Inverted block in `--slab` / `--slab-ink`. Contact email, three off-site links, copyright with current year, wordmark repeated large. Compass-rose in `--accent` as the closer.

## Bans (project-specific, on top of the shared design laws)

- No gradient anywhere. Not in text, not in backgrounds, not behind the hero.
- No icon-and-label feature grid. Capabilities, if listed, are prose.
- No "Read more →" arrow links. Link text carries the affordance; if it doesn't, the link text is wrong.
- No dark mode toggle in v1.
- No animated scroll indicator, no scroll snap, no "scroll down" caret in the hero.
- No card with a colored side-stripe border (shared law, restating).
- No serif body text. Serif appears only in italic, only for emphasis.
- No second accent color. The vermillion is alone. Adding teal or yellow makes it a palette and breaks the register.

## Home-page lead

The home opens with **bio first, then work list**. This is the deliberate split from the references — Zwinkle and Luxespace lead with display-plus-product, but Nadia's site is about the person, not a service. The display hero carries the bio sentence (with the italic-serif interruption as the signature gesture), and the work list follows below as `[ N1  SELECTED WORK ]`.
