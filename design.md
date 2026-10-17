# BFladderbean / Phase study

This is the single visual system for the Next.js site. It replaces the former IRIS/GLACIER/ABYSS themes. `AGENTS.md` defines product scope; this file describes the implemented visual language.

## Direction

Swiss alignment and a restrained grid meet the high-contrast, sliced visual tension of Arknights chapter 17, “Critical Phase Transition.” Arcadia informs native snap scenes, visibility-driven scene state and a direct pointer, not the site's identity or content. No game artwork or logos are copied.

The opening is a full paper canvas, not a centered card: an oversized Syne handle, five compact lines of confirmed personal information indented beneath it, and a long rule ending in a visible scroll label and double chevron. Opaque acid and violet planes meet at the canvas edges; no floating circles, rotating objects, ornamental microcopy or continuous arrow bounce. The opening, navigation, writing and closing remain four real scenes. No terminal dashboard, particles, crosshair, scanning lines, random transition, gradients, theme switch, or generic card grid.

The homepage has no global header or separate wordmark; the opening's @BFladderbean is its primary identity, and the Navigation scene owns its five primary destinations. Every non-home route, including articles and 404s, has a shared top navigation in normal document flow: the site name links home, the five destinations reuse the local navigation data, and the current page or article's All Posts section is underlined and announced with `aria-current`. The header does not overlay reading content. The homepage side scene picker is the sole visible scene-progress indicator, with no numeric counter. Scene names remain announced to assistive technology.

## Tokens

| Semantic role | CSS token | Value |
|---|---|---|
| Reading / opening canvas | `--paper` | `#f5f5ef` |
| Text / closing canvas | `--ink` | `#17171a` |
| Edge planes / closing type | `--acid` | `#d9f542` |
| Navigation canvas / personal-information emphasis | `--violet` | `#4930bc` |
| Deep violet | `--violet-dark` | `#27165e` |
| Secondary reading text | `--muted` | `#62625e` |
| Editorial divider | `--line` | `#cecec6` |

These are scene roles in one theme, not selectable palettes. Color never carries scene state alone: the elongated scene tick and `aria-current` provide independent indicators.

## Type and grid

- Display: existing locally hosted Syne, weights 400/700/800. Heavy, tightly spaced, large Latin display; CSS uses Next's local font loader.
- Opening: the handle, biography and scroll cue all use Syne; the scroll cue uses the loaded 700 weight rather than a separate UI face or synthetic 600 weight.
- UI: Arial with Microsoft YaHei / PingFang SC fallbacks. No decorative monospace labels.
- Reading: locally bundled Noto Serif SC, 400/600, 18px and 1.95 line-height on desktop. KaTeX uses its own math fonts. Code uses system monospace.
- Side gutter: `clamp(24px, 5vw, 88px)`; document shell at most 1440px. Article body at most 760px.
- Spacing scale: 8/16/24/40/64px, with fluid display sizes and scene-dependent gaps.
- Layout: the opening uses a centered composition at most 1000px wide, with left-aligned display type and an indented biography; edge planes occupy separate space rather than sitting behind the text. Closing remains left-aligned; navigation splits heading and five links; recent writing uses three editorial columns with original-language titles, not artificial projects or images. Other routes use a quiet paper canvas and generous title spacing.

## Interaction responsibilities

- `HomeDeck.tsx`: native scroll container and CSS snap; unmodified intersection ratios choose `past / active / future`, following Arcadia's scene controller. All scene sections remain in normal flow; only the independent decorative background persists. Pixel trackpad gestures stay native and interrupt programmatic movement. First-scene button, keyboard, discrete-wheel and scroll-cue navigation uses an interruptible cubic ease-out scroll, capped at 620ms for a full scene and shortened in proportion to the remaining distance. Motion responds immediately rather than slowly accelerating. Reverse input retargets from the current position, not an animation queue. Other scene selection keeps native smooth scrolling. Keyboard arrows, Page Up/Down, Home/End and space provide scene movement outside links/controls. At high zoom tall scenes retain native scrolling. Focus does not overwrite the navigation target. Actual dimension changes preserve the last observed scene (or the in-flight target); initial resize observations do not reposition the deck. Each scene owns its normal snap target; there are no sticky scene sections, synthetic visibility corrections or extra snap anchors.
- Scene CSS: the opening and navigation share an overlapping scroll-driven intro sequence. Where CSS scroll timelines are supported, the paper canvas and edge planes remain fixed: opening text rolls upward over 0–45% of progress with the shared smooth-out curve; the violet rectangle expands over 8–68% with `cubic-bezier(0.65, 0, 0.35, 1)`, easing in, accelerating through the middle and decelerating into full coverage. These curves apply within their keyframe segments, not to the scroll timeline itself, so native gesture tracking remains intact. Navigation content appears over 58–90% with only a 16px local reveal offset. The final 10% follows the remaining native scene movement without a separate fade tail. These are scroll-progress ranges, not wall-clock durations. Reverse scrolling rewinds the same sequence. Navigation has no competing state-based reveal; later scenes retain their 760/900ms content settling curves. Reduced motion, forced colors and unsupported scroll timelines keep ordinary readable scenes. The initial introduction is visible without waiting for JavaScript; its scroll cue remains a semantic fragment link.
- `Navigation.tsx`: semantic Next links, native View Transition API where available, immediate router navigation; no custom history/router or loading-mask substitute. A browser without the API navigates normally. History is owned by Next/browser. Homepage restores its last observed scene through optional session storage.
- `CustomCursor.tsx`: position set directly from mouse coordinates, no spring/trailing interpolation. Interactive hover becomes an outlined circle; press becomes a compressed slab; prose gets an I-beam-like shape. The pointer cannot receive events. Native cursor remains until valid mouse coordinates initialize the custom layer, and returns on leave, blur, unsupported input or forced colors. Re-entry/focus restores the custom pointer when its known position remains valid; route changes refresh targeting and clear pressed state. A nonzero capture box preserves the pointer's named view-transition surface.
- Reduced motion: native immediate scene selection, no layer travel/reveal offsets, no spatial route transitions. Content remains readable and all navigation available.
- Keyboard focus is visible; a skip link reaches the main content. External links announce opening a new tab. Empty project/friend/contact fields are explicit and do not invent people or accounts.

## Reading and content

Article pages never inherit snap scrolling, opening edge planes, changing scene colors or reveal motion. Chinese articles stay Chinese. Headings are deep-linkable; formulas, code, tables, quotes and lists are server-rendered from Markdown. Tags and categories remain in source metadata but are not navigation features.

## Verification scope

Desktop browser verification is required for changes; the final delivery lists actual observations and commands. CSS includes narrow-window fallbacks to avoid deliberate blocking, but mobile support and real touch hardware are not accepted delivery claims. Physical mouse-wheel and touchpad feel still require real-device judgment; synthetic browser input is not hardware performance proof.

Sources and redistribution notices: `THIRD_PARTY_NOTICES.md`. Original article migration inventory: `docs/content-migration.md`.
