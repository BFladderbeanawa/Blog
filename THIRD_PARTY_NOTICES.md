# Third-party notices

## Arcadi4/blog

Source: https://github.com/Arcadi4/blog

`src/components/site/HomeDeck.tsx` adapts the native scroll-snap, visible-ratio scene state, and detented-wheel detection patterns from `src/components/home/HomeSlideDeck.tsx`. Scene reveal choreography was informed by `src/components/animations/SceneReveal.tsx`. The separation between normal-flow scene content and an independent persistent background layer follows `src/components/animations/ScenePersistentElement.tsx`, and the intro's state-driven panel sweep and reveal ordering follow that layer's timing and easing (`cubic-bezier(.76, 0, .24, 1)`, 900ms upstream, 620ms here); this site's bounded sticky background and scene-state CSS transitions do not copy the reference's generic DOM capture/reconciliation implementation. These sources were checked at upstream commit `aa88409c995e8459491a39f5a14b98b76c3d6cd5`. `src/components/site/CustomCursor.tsx` adapts the direct pointer-position and interactive-target approach from `src/components/layout/CustomCursor.tsx`. `src/components/site/ExploreLinks.tsx` takes the per-glyph pointer-proximity idea from the reference's `src/components/proximity/ProximityLink.tsx` and proximity shadow text; its local elliptical falloff and opposing two-color CSS text shadows are implemented here without the reference's font-weight interpolation or shared pointer infrastructure. The reference's content, illustrations, full UI, dependencies, and mobile gate were not copied.

MIT License

Copyright (c) 2026 4rcadia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Fonts and content assets

Syne font files under `public/fonts/Syne` predate this migration. Syne is distributed under the SIL Open Font License 1.1; see `public/fonts/Syne/OFL.txt`. It supplies the site's UI, display and prose typography. KaTeX supplies its own fonts and MIT license through the installed package.

Existing `src/assets` and `public/art` files are retained, not relicensed by the Arcadia software license. Their presence does not grant a new license to third-party artwork. No Arknights chapter artwork, game logo, or reference-site personal content is newly distributed by this implementation.

## Georges Seurat — La Grande Jatte

`public/la-grande-jatte.webp` is a cropped, compressed reproduction of Georges Seurat's *A Sunday on La Grande Jatte — 1884* (1884–86), Art Institute of Chicago, Helen Birch Bartlett Memorial Collection. `public/la-grande-jatte-static.webp` is this site's point-sampled derivative for the no-JavaScript background. The interactive canvas samples the same reproduction; its rendering and pointer interaction are original implementation.

Source: [Wikimedia Commons / Google Art Project reproduction](https://commons.wikimedia.org/wiki/File:Georges_Seurat_-_A_Sunday_on_La_Grande_Jatte_--_1884_-_Google_Art_Project.jpg). The source identifies the painting and faithful reproduction as public domain, including in the United States. The [museum's artwork record](https://api.artic.edu/api/v1/artworks/27992?fields=id,title,is_public_domain) independently marks the work as public domain. This attribution does not apply to the site's other images.

## Lucide Icons

The About page uses **Gamepad 2**, **Router**, and **Pickaxe** from [Lucide](https://lucide.dev/), stored under `src/assets/about/`. SVG paths are unchanged; stroke color is set to the site's violet (`#4930bc`) and stroke width to `1.25` for the shared line-art treatment. The saddle-surface SVG is original mathematical linework, not a Lucide icon. Sources:

- https://github.com/lucide-icons/lucide/blob/main/icons/gamepad-2.svg
- https://github.com/lucide-icons/lucide/blob/main/icons/router.svg
- https://github.com/lucide-icons/lucide/blob/main/icons/pickaxe.svg

ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

The existing `src/assets/illustration.png` depicts the site owner's OC. Its use on About does not imply the owner drew the image or grant visitors redistribution rights.
