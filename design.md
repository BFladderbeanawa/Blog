# IRIS OBSERVATORY / 鸢尾観測站 Design System

## 1. Atmosphere & Identity

A minimalist surveying terminal for a personal archive: serif letterforms (elegance from tanh.moe) measured by mono instrument labels (Arknights tech UI), on an ice/slate/iris palette (Persona 3 Reload depth), with constructivist diagonal cuts retained sparingly as hairline guides. **Flat fills only.** Zero border-radius. No box-shadows. No soft gradients — only mechanical hairline patterns and constructivist geometry.

The signature: a **minimal registration cross** (+ marks at corners) plus a thin iris accent bar on editorial frames, with serif typography carrying all warmth against technical mono labels.

## 2. Color

### GLACIER (Light / modern)

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Canvas/primary | `--canvas` | `#edf1f7` | Main shell background |
| Canvas/raised | `--canvas-raised` | `#f7f9fc` | Cards, elevated panels |
| Canvas/inset | `--canvas-inset` | `#e0e7f0` | Code blocks, recessed regions |
| Surface | `--surface` | `#f7f9fc` | Default component surface |
| Surface/solid | `--surface-solid` | `#101a2c` | High-contrast ink plates |
| Text/primary | `--text-primary` | `#0f1b2d` | Headlines, body |
| Text/secondary | `--text-secondary` | `#3d4f68` | Secondary copy |
| Text/tertiary | `--text-tertiary` | `#71809a` | Captions, disabled |
| Text/ghost | `--text-ghost` | `rgba(15,27,45,0.07)` | Background letterforms |
| Border | `--border` | `#16233a` | Primary dividers |
| Border/subtle | `--border-subtle` | `rgba(15,27,45,0.18)` | Hairline divisions |
| Iris (primary accent) | `--accent-iris` | `#3b54d6` | CTAs, active states, focus |
| Ice (secondary accent) | `--accent-ice` | `#8fb7e6` | Accents, hover hints |
| Signal (alert) | `--accent-signal` | `#e0364c` | Warnings, live indicators |
| Wash | `--accent-wash` | `rgba(59,84,214,0.06)` | Hover backgrounds |

### ABYSS (Dark / nord)

| Role | Token | Value |
|------|-------|-------|
| Canvas | `--canvas` | `#05080f` |
| Surface | `--surface` | `#0c1424` |
| Surface/solid | `--surface-solid` | `#16233a` |
| Text/primary | `--text-primary` | `#e8edf6` |
| Iris | `--accent-iris` | `#7e97ff` |
| Ice | `--accent-ice` | `#9cc3ee` |
| Signal | `--accent-signal` | `#ff4d61` |

### Rules

- Use only flat fills. Gradients create mechanical hatch patterns or hairline grid overlays, never mood washes.
- Iris is structural: CTAs, active nav, focus rings, accent bars.
- Ice is atmospheric: hover hints, axis labels, coordinate readout, scanline.
- Signal is alert-only: pulse indicators, warning marks.
- No green, cyan, pink, or glows in production UI.

## 3. Typography

### Font Stacks

- **Display**: `"Playfair Display"`, `"Noto Serif SC"`, serif — page titles, post titles, hero display. Weight 600/700; Latin may italicize for flourish.
- **Body**: `"Noto Serif SC"`, `"Playfair Display"`, Georgia, serif — all body prose, line-height 1.85, size 1.0625rem.
- **Slab**: `"Syne"`, `"Arial Black"`, sans-serif — uppercase geometric slabs, ghost numerals, brand mark. Weight 700/800.
- **Mono**: `"JetBrains Mono"`, `"Fira Code"`, monospace — labels, axis readout, date pills, metadata.

### Type Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(4.5rem, 13vw, 12rem)` | 700 | 0.82 | -0.02em | Hero slabs (Syne) |
| H1 | `clamp(3rem, 8vw, 7rem)` | 600 | 0.88 | -0.02em | Page titles (serif) |
| H2 | `clamp(2rem, 5vw, 4rem)` | 600 | 0.95 | -0.02em | Section headers (serif) |
| H3 | `clamp(1.4rem, 3vw, 2.2rem)` | 600 | 1 | -0.01em | Card titles (serif) |
| Body | `1.0625rem` | 400 | 1.85 | 0 | Prose (serif) |
| Body/sm | `0.938rem` | 400 | 1.6 | 0 | Secondary text |
| Caption | `0.688rem` | 500 | 1.25 | 0.14em | Metadata (mono, uppercase) |
| Overline | `0.625rem` | 500 | 1.2 | 0.18em | Trilingual microcopy (mono) |

### Rules

- Headings are serif 600-700 (NOT 900 — serif 900 is blobby). Uppercase only for Syne slabs and mono labels; serif headings stay sentence-case or italic-flourished.
- Display tracking looser than old constructivist (-0.02em vs -0.06em). Serif reads warm; slab/mono read technical.
- Microcopy may mix Chinese, Japanese, English, separated by `//` or `／`.

## 4. Spacing & Layout

Base unit: **4px**. All spacing tokens unchanged from prior system (`--space-xs` through `--space-3xl`). Max content width `1360px`, breakpoints at `720px`, `900px`, `1280px`.

### Rules

- Diagonal `clip-path` cuts on signature slabs and cards only; routine controls stay rectangular.
- Layout alternates dense label clusters (mono) with large serif blocks.
- **Zero border-radius.**

## 5. Components

### Editorial Frame

- **Structure**: 1px hairline border + 3px iris left bar + corner registration crosses (+ marks, 10px, via ::before/::after with ice color) + small 12px clip corner top-right.
- **Spacing**: `--space-lg` padding.
- **States**: static informational pattern.
- **Accessibility**: semantic markup, visible focus.
- **Motion**: none.

### Section Rail

- **Structure**: 8px diamond node (iris, rotated 45deg) + trilingual mono label + 1px hairline gradient iris→ink.
- **Variants**: single iris theme.
- **Spacing**: gap `--space-md`, margin-bottom `--space-lg`.
- **Motion**: none.

### PostCard

- **Structure**: bordered anchor with corner bracket watermark (2px ice lines, 18px, top-right ::after), serif title 600, mono date pill, mono category label (iris), hairline borders.
- **Variants**: expanded/compact modes.
- **Spacing**: `--space-md` to `--space-lg`.
- **States**: hover translates (-2px, -2px) + border iris + ::before wash var(--accent-wash).
- **Motion**: 250ms transform, disabled under reduced motion.

### Header & Footer

- **Header**: 3px iris top edge, Syne 800 brand mark "BF" on ink plate, nav cells flat iris fill on hover/active.
- **Footer**: marquee mono strip (surface-solid bg, ice text, wraps in .marquee-track div), pulse-dot signal, drawer hairline borders.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 120ms | `cubic-bezier(0.4, 0, 0.6, 1)` | Color changes |
| Standard | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Card hover, drawer |
| Emphasis | 500ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Page transition |

### Rules

- Animate only `transform`, `opacity`, `filter`.
- Every interactive element has hover and focus-visible states.
- Respect `prefers-reduced-motion` (marquee/scanline/particles disable).

## 7. Depth & Surface

**Borders-only plus flat offset plates.** No shadows.

| Type | Value | Usage |
|------|-------|-------|
| Hairline | `1px solid var(--border-subtle)` | Secondary dividers |
| Frame | `2px solid var(--border)` | Cards, nav |
| Heavy accent | `3px solid var(--accent-iris)` | Header top edge, editorial left bar |
| Corner registration | `+` marks via ::before/::after, 10px, ice | Editorial frames |
| Hairline gradient | `linear-gradient(90deg, iris, ink)` | Section rails |
| Repeating hairline bar | `repeating-linear-gradient` iris/ink/ice | `<hr>` elements |

No blur, glassmorphism, soft elevation, or glow effects.

## 8. Pattern Library / Design Language

The **Observatory Instrument Vocabulary** enforces consistent visual grammar across all surfaces through a small set of reusable classes. Every content surface shares these patterns:

### The 5 Rules

1. **Records are rows, not cards.** Articles, categories, and search results render as registry rows (`.post-grid` rows): mono REC number | date | serif title (+1-line description) | category | arrow, hairline-separated. Boxes are reserved for **instruments only** (`.obs-frame`: author bio, status drawer, tag filter, search query, prev/next nav).
2. **Section transitions use `.obs-ruler`** tick ruler (never a plain `<hr>`).
3. **Every serif display heading is preceded by `.obs-eyebrow`** mono label with iris square node.
4. **Metadata rows use `.obs-stat`** — mono uppercase tertiary with bold iris values.
5. **Every registry list is numbered**: REC-01/02/03 via CSS counters on `.post-grid`, with a `.registry-head` mono column header (REC / Date / Record / Category) on full archive pages.

### Pattern Classes

| Class | Purpose | Anatomy | Usage |
|-------|---------|---------|-------|
| `.post-grid` | Registry list | Flex column; `counter-reset: obs-rec`; rows separated by hairlines | All article lists (archive, tags, categories, featured). Rows are PostCard registry entries. |
| `.registry-head` | Column header | Mono uppercase labels on 2px rule, same grid as rows (REC/Date/Record/Category/→) | Above `.post-grid` on full archive pages; hidden under 760px. |
| `.obs-frame` | Instrument frame | 1px hairline border + ice registration crosses (+ marks, 11px, top-left/bottom-right) | Instruments only: author bio, status drawer, tag filter, search query, hero editorial blocks, prev/next nav. NEVER for article/category entries. |
| `.obs-frame--powered` | Emphasized frame | Adds 3px iris left bar | Stack with `.obs-frame` for author bio, visitor widgets, search query. |
| `.obs-id` | Mono ID label | Absolute positioned at top border, iris uppercase mono, 0.625rem | Place inside `.obs-frame` (e.g., SYS.STATUS, LOG.ENTRY, FILTER.TAGS). |
| `.obs-ruler` | Section transition | Tick ruler: hairline base + 5px ticks every 8px + iris accent ticks every 40px | Replace plain `<hr>` between sections. |
| `.obs-eyebrow` | Section label | Iris 7px square node + mono label, 0.6875rem, 0.16em tracking | Precede serif headings; `.obs-eyebrow--signal` for signal-red variant. |
| `.obs-stat` | Metadata readout | Mono tertiary, 0.6875rem, 0.12em tracking, bold values iris | Dates, counts, coordinates, status rows. |
| `.obs-hover` | Interactive frame | Registration crosses expand outward on hover/focus; translate (-2px,-2px) + border iris | Stack with `.obs-frame` on clickable instruments. |
| `.calibrate` | Page-load reveal | Staggered fade-up: 0→1 opacity, translateY(10px)→0 | Hero blocks only; `.calibrate-2`/`.calibrate-3` for 80/160ms delays. |

### Registry Row Anatomy (PostCard / category rows / search rows)

```
┌──────────────────────────────────────────────────────────────────┐
│ REC-01  2026年2月8日 │ Construct the untidy notes      Tech   → │
│                       └ 1-line serif description                │
└──────────────────────────────────────────────────────────────────┘
```

- Columns: `4.5rem | 7.5rem | 1fr | auto | 2rem`; date column carries a right hairline.
- Hover/focus: `--accent-wash` background + 2px iris left bar (scaleY reveal) + arrow slides right and turns iris.
- Compact mode (`.compact-view`): strips description, tightens padding — single-line ledger.
- Mobile (<760px): REC/date/category collapse into one mono metadata line above the title.
- Category rows swap the REC column for a 7px cycled color marker (iris/ice/signal); search rows drop the date column.

### When to Use Each

- **`.post-grid` + registry rows**: every list of articles, categories, or search results.
- **`.obs-frame` + `.obs-id`**: instruments — hero editorial blocks, author bio, search input, status drawer, category archive heading, prev/next navigation.
- **`.obs-hover`**: stack with `.obs-frame` when the instrument is clickable.
- **`.obs-ruler`**: between major sections (after page titles, between dispatch/telemetry blocks).
- **`.obs-eyebrow`**: precede serif headings inside frames and sections.
- **`.obs-stat`**: any key/value or numeric metadata.
- **`.calibrate`**: hero blocks only.

### What NOT to Do

- Don't wrap articles/categories/search results in boxes or cards — they are registry rows. Boxes are for instruments.
- Don't nest `.obs-frame` inside `.obs-frame` (registration crosses conflict).
- Don't apply `.obs-hover` without `.obs-frame` (the crosses are required for the hover expansion).
- Don't use `.obs-eyebrow` as a heading replacement — it precedes headings.
- Don't add `.obs-frame` borders when the element already has a distinct background/clip-path identity (poster slabs, route links, mode-block).

### Page-Load Sequencing

Page-load reveals use `.calibrate` / `.calibrate-2` / `.calibrate-3` on major blocks only (hero + one level below, not every card). Example (index.astro):

```html
<header class="poster-title-block calibrate">...</header>
<aside class="manifesto-block calibrate-2">...</aside>
<a class="poster-route calibrate-3">...</a>
```

Respect `prefers-reduced-motion` — `.calibrate` animations disable automatically.
