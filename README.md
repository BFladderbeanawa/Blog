# BFladderbean's Digital Garden

A personal site built with Next.js App Router, React, and TypeScript. The interface is in English; articles retain their original language. Articles are local Markdown, rendered on the server and generated at build time. There is no MDX, CMS, database, or online editor.

## Requirements and commands

Use Node.js 24 LTS (24.11.0 or newer within the 24.x line) and the pnpm version declared in `package.json`. Vite+ is installed locally; `pnpm exec vp` works without a global installation.

```bash
pnpm install --frozen-lockfile
pnpm exec vp run dev
```

Open `http://localhost:3000`. Next.js owns the development server and production bundle. Use `vp run dev` and `vp run build`, **not** `vp dev` or `vp build`: those are Vite's built-in commands, not the package scripts.

```bash
# Comprehensive check: generated Next types, TypeScript, lint, format check
pnpm exec vp run check

# Typecheck only (includes Next-generated route types)
pnpm exec vp run typecheck

# Build and serve the production application
pnpm exec vp run build
pnpm exec vp run start

# Explicit maintenance commands
pnpm exec vp run lint
pnpm exec vp run fmt
```

`check` runs `next typegen && tsc --noEmit`, followed by Vite+ lint and a non-writing format check. A bare `vp check` is not the repository's comprehensive Next.js typecheck. `vite.config.ts` configures lint/format exclusions for generated files, content, assets, and agent skills; staged checks include TSX. Local `.vite-hooks/` files are ignored and are not installed by cloning the repository; CI runs the comprehensive check independently of local hooks.

GitHub Actions installs the frozen lockfile, runs the comprehensive check, and builds the production app. No React Doctor or Astro lifecycle remains in the application toolchain.

The current Vite+ release bundles Vite under its own `1.3.0` package version. pnpm can report an advisory peer-range mismatch from bundled Vitest packages expecting Vite 6–8; this repository does not use Vitest or Vite to build the app. The application uses Next.js, and dependency versions are recorded in the lockfile rather than bypassed with peer-warning suppression.

## Structure and routes

```text
src/app/                 App Router pages, shared layout, global styles, metadata
src/components/site/     Navigation, home scenes, cursor, and site components
src/data/site.ts         Typed identity, navigation, social, contact, project, friend data
src/lib/posts.ts         Server-only Markdown discovery, metadata, and rendering
src/content/blog/        Original Markdown articles
src/assets/              Preserved original assets
public/                  Public assets and local Syne display fonts
next.config.ts           Next.js configuration
vite.config.ts           Vite+ checks and staged-file configuration
```

| Route | Purpose |
| --- | --- |
| `/` | Introduction, navigation, recent writing |
| `/about` | Personal introduction |
| `/contact` | Confirmed contact and social links, without a sending form |
| `/projects` | Project collection |
| `/friends` | Friend links |
| `/all` | Complete article index |
| `/posts/<slug>` | Markdown article |

This is a clean cutover, not a dual-framework site. Retired `/blog`, `/search`, `/tags`, `/category`, and `/start-here` entry points have no aliases or redirects. Unknown routes return a real 404. Category/tag metadata remains in the article source but is not a separate navigation feature. There is one theme, no density toggle, and no retired status drawer, particle layer, or random transition system.

## Styling

- Tailwind CSS v4 runs through `@tailwindcss/postcss`; `src/app/globals.css` starts with `@import 'tailwindcss'`.
- Colors, fonts, easings, and responsive breakpoints live in the `@theme` block and are used as utilities (`bg-paper`, `font-scene`, `ease-panel`, `max-xs:`).
- Page and component layout, typography, spacing, and visual state are utility classes in the TSX. Semantic hooks such as `home-deck`, `writing-*`, `prose`, and `post-article` stay in the markup because scripts and generated Markdown select them.
- `globals.css` keeps only the base defaults, generated Markdown/syntax styles, and selectors that cannot be attached to markup: pseudo-elements, view-transition pseudos, scroll-driven keyframes, `:has`/attribute choreography, and reduced-motion or forced-colors fallbacks.

## Publishing articles

1. Add a UTF-8 `.md` file directly under `src/content/blog/`.
2. Supply the required frontmatter and write Markdown below it:

   ```yaml
   ---
   title: "Article title"
   description: "A short, accurate summary."
   pubDate: "2026-10-16"
   heroImage: "KSC-20261013-PH-SPX01_0007~orig.jpg" # Optional cover from src/assets/
   # Optional: updatedDate, category, tags, and other metadata
   ---
   ```

3. Filenames become slugs by removing `.md`, trimming, lowercasing, and replacing whitespace with hyphens. Use a unique stable filename; changing it changes the URL without creating a redirect.
4. Put new directly linked images in `public/`, for example `public/images/example.png`, and reference `/images/example.png`. Preserve existing article assets and source references when editing old posts.
5. Run the comprehensive check and production build, review the article in the running site, then commit and deploy. Publishing or updating content requires a new build/deployment.

The homepage features the three newest articles, one per scroll-snap scene. `heroImage` may be an image filename under `src/assets/` (as above), or a root-relative path such as `/images/example.png` for an image under `public/`. Omit it to show the article description instead. Cover images are decorative and cropped to fill the reserved area; keep important subjects away from the crop edges. The same field supplies article-page hero images before the Markdown body.

The Markdown pipeline supports GFM tables/lists, code highlighting, heading anchors, and KaTeX math. Raw HTML is not enabled. Keep article source as Markdown rather than JSX. Existing frontmatter is preserved even when it does not appear in the interface.

Desktop articles with `h2`/`h3` headings have a compact side drum. Drag anywhere in the contents area, including its label and blank space: pull upward for later headings and downward for earlier headings. Dragging and wheel input only browse the contents; neither changes the article position or URL. Release snaps the drum to a row and preserves that preview. Click a heading to position the article with smooth scrolling; ordinary article scrolling resumes contents tracking. The active-section marker follows the article rather than the preview. The custom cursor shows a vertical grab affordance and a held state, then resets on release, cancellation, or loss of focus. Reduced-motion mode uses a flat list and immediate click positioning; mouse dragging still works. Articles without headings omit the contents area.

Article pages replace the viewport scrollbar with a right-edge reading rail after the client indicator initializes. Its hollow circle follows progress from the article opening to the end of its scrollable content, with a `ΔH=50%`-style label and difference blending for automatic contrast. Drag the circle to scrub the article directly; arrow keys, Page Up/Down, Home, and End also work when it has keyboard focus. Wheel and normal page keyboard scrolling remain native. Nested code-block scrollbars are unchanged; forced-colors mode restores the native viewport scrollbar. Leaving the article restores the normal scrollbar.

The preserved articles map to `/posts/advance-calculus`, `/posts/blog-development-dairy-1`, and `/posts/pre-socratic-philosophy`. Original content and asset files remain in the repository; local migration notes under `docs/` are not published.

## Personal data and honest empty states

Edit `src/data/site.ts` rather than embedding accounts or project details in page components. GitHub and Bilibili use confirmed links from the previous implementation; Kaggle and the public email use user-confirmed details. The home closing scene and Contact page include all four destinations, display the email link as “Email”, and use the configured address only as its `mailto:` destination. Projects and friend links are empty typed collections. Their pages present explicit empty states instead of invented people or projects. Add only confirmed information to those fields and collections. Update `site.url` if deploying on another canonical domain; site metadata, sitemap, and robots use that value.

Noto Serif SC is packaged locally for Chinese reading. The display face uses the existing Syne files in `public/fonts/Syne`; no remote font service is required.

## Vercel and production

`vercel.json` declares the `nextjs` framework, installs with `pnpm install --frozen-lockfile`, and builds with `pnpm exec vp run build`. Configure the Vercel project's Node.js version to 24.x. Do not configure an Astro output directory or static export: Next.js manages its output and deployment integration. A commit message containing `[skip vercel]` retains the existing deployment-skip behavior.

For a self-hosted production process, run `pnpm exec vp run build` followed by `pnpm exec vp run start`. The deployment must include the installed dependencies and `.next` output. No environment variable is required for the current local-content/local-data setup.

## Desktop scope and accessibility

Desktop is the design and interaction acceptance target. Home scene scrolling is separate from ordinary article scrolling; links support direct navigation and browser history. Reduced-motion preferences simplify motion, and the custom pointer is limited to suitable mouse/hover devices with a native fallback. This scope does not claim mobile optimization or mobile acceptance, and it does not block mobile visitors.

The drag pointer uses a solid dot with vertical arrows instead of a hollow square; its center is approximately 18px on hover and 15px while held.

The home closing scene's social links use pointer-relative parallax: labels travel up to 10px horizontally / 3px vertically, while arrows travel up to 18px / 5px. Rules and link hit areas stay fixed. Leaving, scrolling, resizing, or losing focus resets the offsets; reduced-motion, coarse-pointer, and forced-colors modes keep the links static.

Selective reference-code reuse is documented in `THIRD_PARTY_NOTICES.md`; original content, public assets, and font files remain separate from that software reference license.

## Migration verification

The integration run executed `pnpm exec vp run check` (Next type generation, TypeScript, lint, format check) and `pnpm exec vp run build` successfully, then served the production output with `pnpm exec vp run start --hostname 127.0.0.1 --port 3100`.

Observed in desktop Chromium at 1440×900 and a 1024×768 resize:

- All six top-level content routes and all three article routes returned 200. Retired entries and missing articles returned 404 without redirects. Sitemap, robots, favicon and a local Syne font returned 200.
- The calculus article rendered its text and 130 KaTeX expressions without `.katex-error` nodes or page-wide horizontal overflow. Article sources have since been translated to English (titles, descriptions and bodies); formulas were kept verbatim. KaTeX still warns about existing `array` column declarations in the source; this warning is not suppressed.
- A temporary executable Markdown probe exercised headings, links, images, tables, quotes, lists, highlighted JavaScript and mathematics; it passed and was removed. The original articles contain no image references, so image support was probed rather than claimed from an existing article.
- Native pixel-wheel input, synthetic discrete-wheel bursts with immediate reversal, keyboard scene movement, scene selection, resize and 200% CSS zoom were exercised. Back/forward restored the writing scene after reading an article. Direct article access and refresh worked.
- Reduced-motion emulation produced automatic rather than smooth scene scrolling and no reveal/shard travel. Pointer movement mapped directly to the observed coordinates; hover/press states changed, pointer hit-testing passed through, blur restored the native cursor, and forced-colors emulation disabled the custom pointer.
- GitHub opened the confirmed external URL in a separate tab. Public contact, project and friend data remained honest empty states. Browser page-error capture was empty in the exercised scenarios.

Local ignored recordings: `.playwright-mcp/phase-scenes.webm` and `.playwright-mcp/phase-route-transition.webm`. They are review evidence, not deployed assets. Physical mouse/trackpad feel, mobile devices and a live Vercel deployment were not verified; synthetic input and local production startup do not establish those claims.
