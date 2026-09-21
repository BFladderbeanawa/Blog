# Nippori Seminar Design System

Source: https://nippori.lamm.tokyo/

This document captures a starter design system extracted from the public Nippori Seminar website. It is a practical v1 for reuse: it records visible primitives, repeated composition patterns, and motion language from the homepage and shipped CSS. It is not a full component library or a guarantee that every page on the site uses only these rules.

## 1. Design Direction

The site feels like an experimental editorial radio zine: black-and-white structure, oversized type, rigid borders, playful rotations, and sudden saturated color fields. The visual system balances cultural seriousness with loose, handmade energy.

Core traits:

- High-contrast monochrome foundation: white backgrounds, black text, black rules, black bordered frames.
- Editorial density: large display headlines, long text blocks, vertical writing, tight line-height, and layered text.
- Anti-grid energy inside a controlled system: rotated labels, skewed cards, floating frames, and overlapping panels.
- Bright accent sections: muted but saturated red, green, sky, orange, pink, lemon, and gray blocks.
- Media-forward storytelling: thumbnail grids, portrait/background photography, masked image reveals, and image cards with visible borders.
- Interactive radio identity: fixed player, platform links, custom cursors, animated marquee loading, audio controls, and hover-reactive lines/images.

## 2. Color Tokens

### Core

```css
:root {
  --color-black: #000000;
  --color-white: #ffffff;
  --color-border: #000000;
  --color-muted-border: #e5e7eb;
  --color-placeholder: #9ca3af;
}
```

Usage:

- `--color-white`: page background, transition overlay, framed content cards.
- `--color-black`: primary text, borders, nav blocks, icon fills, buttons.
- `--color-border`: 1px default borders and 5-10px heavy editorial frames.
- `--color-placeholder`: inherited from the reset for form placeholder text.

### Accent Palette

```css
:root {
  --color-green-main: #8eb669;
  --color-sky-main: #74cfd4;
  --color-orange-main: #f2a167;
  --color-red-main: #a23737;
  --color-pink-main: #f890cd;
  --color-lemon-main: #e0e2ab;
  --color-gray-main: #959595;
  --color-gray-100: #f3f4f6;
}
```

Usage:

- `green-main`: major section backgrounds and masked type contrast.
- `sky-main`: supporting panels and horizontal information bands.
- `orange-main`: section headers, label strips, and panel overlays.
- `red-main`: loud editorial accents and title bands.
- `pink-main`: secondary content blocks.
- `lemon-main`: small high-contrast labels.
- `gray-main`: utility blocks and quieter metadata surfaces.

Guidance:

- Keep black and white dominant.
- Use accent colors as large flat planes, not gradients.
- Prefer abrupt adjacency between color blocks rather than soft blending.
- Use white text with `mix-blend-difference` where text crosses saturated blocks.

## 3. Typography

### Font Families

```css
:root {
  --font-serif-ja: "kozuka-mincho-pro", serif;
  --font-sans-en: Helvetica, sans-serif;
  --font-playfair: Playfair, serif;
}
```

Observed imports and usage:

- Adobe Typekit kit: `cqt0hlg`.
- Google font import: `Playfair` variable serif.
- Base body font: `kozuka-mincho-pro, serif`.
- English display and UI font: `Helvetica, sans-serif`.
- Radio/player decorative font: `Playfair, serif`.

### Type Roles

#### Japanese Body / Editorial Serif

Use `--font-serif-ja` for long Japanese editorial copy and default body text.

```css
.font-serif {
  font-family: var(--font-serif-ja);
}
```

Recommended values:

- Body size: `14px-16px`.
- Body line-height: `160%-180%`.
- Weight: regular to bold depending on emphasis.

#### English Display Sans

Use `--font-sans-en` for large English statements, section titles, nav labels, and rotated annotations.

```css
.font-en {
  font-family: var(--font-sans-en);
  text-transform: uppercase;
}
```

Recommended display values:

- Hero headline mobile: `calc(52 / 375 * 100vw)`.
- Hero headline desktop: `calc(205 / 1440 * 100vw)`.
- Large section title: `calc(135 / 1440 * 100vw)`.
- Personality names: `calc(85 / 1440 * 100vw)`.
- Leading: `0.75-0.95`.
- Letter spacing: `-0.02em` to `-0.05em` for oversized display type.

#### Playfair UI Accent

Use `--font-playfair` for the compact audio player, small nav counters, and soft editorial UI accents.

```css
.font-playfair {
  font-family: var(--font-playfair);
}
```

Recommended values:

- Small UI: `10px-16px`.
- Mobile menu labels: `20px`.
- Leading: `1`.

### Type Scale

```css
:root {
  --text-10: 0.625rem;
  --text-11: 0.6875rem;
  --text-12: 0.75rem;
  --text-13: 0.8125rem;
  --text-14: 0.875rem;
  --text-16: 1rem;
  --text-20: 1.25rem;
  --text-24: 1.5rem;
  --text-28: 1.75rem;
  --text-30: 1.875rem;
  --text-31: 1.9375rem;
  --text-36: 2.25rem;
  --text-40: 2.5rem;
  --text-48: 3rem;
  --text-56: 3.5rem;
  --text-75: 4.6875rem;
}
```

Responsive display sizes are viewport-derived rather than a simple modular scale. The site often maps design pixels directly to viewport units:

```css
--display-hero-sp: calc(52 / 375 * 100vw);
--display-hero-md: calc(205 / 1440 * 100vw);
--display-section-md: calc(135 / 1440 * 100vw);
--display-personality-sp: calc(36 / 375 * 100vw);
--display-personality-md: calc(85 / 1440 * 100vw);
```

## 4. Layout Tokens

### Breakpoints

The shipped CSS follows Tailwind-like breakpoints.

```css
:root {
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-2xl: 1536px;
}
```

### Root Sizing

```css
html,
body {
  font-size: calc(16 / 375 * 100vw);
}

@media (min-width: 768px) {
  html,
  body {
    font-size: max(calc(16 / 1440 * 100vw), 12px);
  }
}

@media (min-width: 1440px) {
  html,
  body {
    font-size: 1rem;
  }
}
```

### Container

```css
.container {
  padding-inline: calc(20 / 375 * 100vw);
}

@media (min-width: 768px) {
  .container {
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: calc(121 / 1440 * 100vw);
  }
}
```

### Spacing Scale

The site mixes rem-based utility spacing with viewport-derived positioning. Use exact viewport math for hero/media staging and rem values for UI controls.

```css
:root {
  --space-1: 0.25rem;
  --space-1-5: 0.375rem;
  --space-2: 0.5rem;
  --space-2-5: 0.625rem;
  --space-3: 0.75rem;
  --space-3-5: 0.875rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-11: 2.75rem;
  --space-12: 3rem;
  --space-20: 5rem;
}
```

Repeated layout values:

- Mobile page gutter: `20 / 375 * 100vw`.
- Desktop page gutter: `121 / 1440 * 100vw`.
- Header padding: `10px` mobile, `20px` desktop.
- Fixed platform links: bottom/right `10px` mobile, `20px` desktop.
- Section gaps often use `30 / 375 * 100vw` mobile and `60 / 1440 * 100vw` desktop.

## 5. Shape, Border, Shadow

The system is almost shadowless. Depth comes from overlap, stacking, borders, and motion rather than elevation.

```css
:root {
  --radius-none: 0;
  --radius-full: 9999px;
  --border-hairline: 1px;
  --border-heavy-sp: 5px;
  --border-heavy-md: 10px;
}
```

Rules:

- Default surfaces use square corners.
- Pills are used only for compact controls, especially audio/player CTAs.
- Image and content frames use black borders.
- Heavy frames use `5px` on mobile and `10px` on desktop.
- Avoid soft shadows; use bordered panels and z-index layering instead.

## 6. Component Patterns

### Fixed Audio Player

Visual anatomy:

- Fixed top-left control block.
- White background, black 1px border.
- Square thumbnail/control area with right border.
- Circular black play/pause button inside.
- Playfair label text.
- Compact CTA pill beside/under it.

Tokens:

```css
.audio-player {
  background: var(--color-white);
  border: 1px solid var(--color-black);
}

.audio-player__button {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-full);
  background: var(--color-black);
  color: var(--color-white);
}
```

Behavior:

- Thumbnail grayscale swaps on hover/play state.
- Controls remain fixed above content.
- Header wrapper disables pointer events except on actual links/buttons.

### Navigation

Desktop:

- Fixed bottom-center black strip.
- Links use Playfair `16px`, white text, all caps.
- Hover effect rolls the label vertically using duplicate pseudo text.
- Section counts appear as small black badges offset near labels.

Mobile:

- Full-screen white menu overlay.
- Black block links with white Playfair text.
- Simple `MENU` / `CLOSE` controls.

### Hero

Visual anatomy:

- White page with black editorial text.
- Massive uppercase English display headline.
- Japanese title/subtitle paired with English supporting phrases.
- Bordered image card overlapped near the headline.
- Crosshair-like diagonal lines in framed media placeholders.

Implementation notes:

- Use `font-en`, uppercase, tight tracking, and line-height below `1`.
- Avoid centered polished marketing layout.
- Let text fill the viewport width with controlled tension.
- Use absolute positioning and overlapping media to break the grid.

### Editorial Cards / Framed Panels

Visual anatomy:

- White background.
- Black heavy border.
- Oversized English title in Helvetica.
- Japanese body in serif.
- Optional vertical writing.
- Panels overlap and rotate slightly.

Rules:

- Use no border radius.
- Use `overflow: hidden`.
- Stack using z-index steps `10`, `20`, `30`, `40`.
- Use viewport-derived widths rather than fixed max-widths.

### Colored Block Sections

Visual anatomy:

- Full-width flat color fields.
- Huge white text with `mix-blend-difference`.
- Hard-edged overlay strips in red/orange/sky/lemon.
- Some text rotates or writes vertically.

Rules:

- Use large color planes.
- Keep typography compressed and loud.
- Let labels sit flush to edges.
- Prefer black/white contrast over subtle tonal changes.

### Episode / Story Lists

Observed structure:

- Dense list of radio episode links.
- Image thumbnails for guest, highlight, other story, and personality entries.
- Black typographic metadata and counters.
- Platform links for Stand FM, Spotify, Amazon, and Apple.

Rules:

- Treat each item as a media-and-text editorial tile.
- Keep borders and type strong.
- Use real photography thumbnails.
- Avoid card softness; use framed or flush image blocks.

### Personality Section

Visual anatomy:

- Dark/photographic background layer.
- White rotated Helvetica names and roles.
- Thin/wavy white connector lines.
- Hover swaps background images per person.
- Small biographical descriptions in light Helvetica.

Rules:

- Use absolute positioning.
- Rotate names aggressively, from subtle `3deg` to near-vertical.
- Keep body blurbs compact, around `11px-14px`.
- Lines can be straight on mobile and wavy SVG paths on desktop.

## 7. Motion System

### Easing

```css
:root {
  --ease-out-expressive: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-image: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-nav: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Timing

```css
:root {
  --duration-fast: 300ms;
  --duration-medium: 600ms;
  --duration-image: 1200ms;
  --duration-word: 800ms;
  --duration-line: 1100ms;
}
```

### Page Transition

- White full-screen overlay.
- Scales vertically from bottom.
- Loading marks fade and translate.
- Duration: `600ms`.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.

### Text Reveal

Patterns:

- Split-line reveal: words translate from `100%` to `0`.
- Split-word reveal: words translate from `115%` to `0`.
- Split-character reveal: character spans translate from `115%` to `0`.

Use stagger delays via CSS variables:

```css
transition-delay: calc(var(--left-delay) * 1ms);
transition-delay: calc(var(--center-delay) * 1ms);
transition-delay: calc(var(--top-delay) * 1ms);
```

### Image Reveal

```css
.effect-image {
  clip-path: inset(50%);
  overflow: hidden;
  transition: clip-path 1.2s var(--ease-image);
}

.effect-image img {
  transform: scale(1.2);
}

.is-active .effect-image {
  clip-path: inset(0);
}

.is-active .effect-image img {
  transform: scale(1);
  transition: transform 1.2s var(--ease-image);
}
```

### Marquee

The loading and content marquee uses linear infinite translation.

```css
@keyframes marquee {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-100%, 0, 0);
  }
}
```

Mobile loading marquee subtracts `8vw`; desktop subtracts `60 / 1440 * 100vw`.

### Hover Behavior

- Links fade to `0.6` opacity on hover.
- Black buttons invert to black background / white text.
- Arrow buttons slide the current arrow out and next arrow in.
- Nav labels roll vertically.
- Personality names swap background imagery on hover.
- Wavy lines respond to cursor movement.

## 8. Interaction Details

Custom cursors are part of the identity:

- `cursor-pointer.svg`
- `cursor-pointering.svg`
- `cursor-grabbing.svg`
- `cursor-grob.svg`

Use them sparingly for immersive sections and draggable/hover states. Standard UI controls should remain accessible and obvious.

Audio/player controls:

- Keep controls fixed.
- Ensure the audio fallback text remains available.
- Do not hide platform links behind hover-only interactions.

Reduced motion:

- The CSS includes a `prefers-reduced-motion` branch for link opacity.
- Extend that pattern to marquee, text reveals, image reveals, and page transitions when adapting this system.

## 9. Implementation Starter

```css
:root {
  color-scheme: light;

  --color-black: #000000;
  --color-white: #ffffff;
  --color-border: #000000;
  --color-green-main: #8eb669;
  --color-sky-main: #74cfd4;
  --color-orange-main: #f2a167;
  --color-red-main: #a23737;
  --color-pink-main: #f890cd;
  --color-lemon-main: #e0e2ab;
  --color-gray-main: #959595;

  --font-serif-ja: "kozuka-mincho-pro", serif;
  --font-sans-en: Helvetica, sans-serif;
  --font-playfair: Playfair, serif;

  --ease-out-expressive: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-image: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-nav: cubic-bezier(0.87, 0, 0.13, 1);

  --border-hairline: 1px;
  --border-heavy-sp: 5px;
  --border-heavy-md: 10px;
  --radius-full: 9999px;
}

html,
body {
  margin: 0;
  background: var(--color-white);
  color: var(--color-black);
  font-family: var(--font-serif-ja);
  font-size: calc(16 / 375 * 100vw);
  font-kerning: none;
  -webkit-font-smoothing: antialiased;
}

@media (min-width: 768px) {
  html,
  body {
    font-size: max(calc(16 / 1440 * 100vw), 12px);
  }
}

@media (min-width: 1440px) {
  html,
  body {
    font-size: 1rem;
  }
}

.ds-container {
  padding-inline: calc(20 / 375 * 100vw);
}

@media (min-width: 768px) {
  .ds-container {
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: calc(121 / 1440 * 100vw);
  }
}

.ds-display {
  font-family: var(--font-sans-en);
  font-size: calc(52 / 375 * 100vw);
  line-height: 0.9;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

@media (min-width: 768px) {
  .ds-display {
    font-size: calc(205 / 1440 * 100vw);
    line-height: 0.8;
  }
}

.ds-frame {
  background: var(--color-white);
  border: var(--border-heavy-sp) solid var(--color-black);
  overflow: hidden;
}

@media (min-width: 768px) {
  .ds-frame {
    border-width: var(--border-heavy-md);
  }
}

.ds-pill {
  border: 1px solid var(--color-black);
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--color-black);
}

.ds-pill:hover {
  background: var(--color-black);
  color: var(--color-white);
}
```

## 10. Do / Do Not

Do:

- Use hard black borders.
- Use oversized Helvetica display type.
- Pair English display typography with Japanese serif body copy.
- Use real images and thumbnails.
- Use saturated accent blocks as flat planes.
- Use rotation, overlap, vertical writing, and tight line-height for editorial tension.
- Use clip-path image reveals and marquee motion.

Do not:

- Add soft shadows, glassmorphism, gradients, or rounded cards.
- Replace the photographic/editorial feel with generic SaaS components.
- Smooth out every irregular layout choice.
- Use a one-color palette.
- Make the UI feel like a conventional podcast landing page.
- Overuse accent colors in small decorative fragments; they work best as committed blocks.
