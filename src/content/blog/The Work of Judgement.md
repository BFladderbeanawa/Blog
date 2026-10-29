---
title: "The Work of Judgement"
description: "On AI, Design, and the Things We Cannot Delegate"
pubDate: "2026-10-29"
heroImage: "image.png"
tags: ["Philosophy", "Coding"]
category: "Tech"
---

After running into a flood of slop produced by "wishcoding" lately, I felt I had to write this. By *wishcoding* I mean tossing requirements at an AI like coins into a wishing fountain and shipping whatever comes back straight to production. It's a close cousin of vibe coding, except the wishcoder rarely even looks at the result.

Before we start, open this site: [KARDS Decker](https://1939.kardsdecker.com/), a deck-building tool for the card game KARDS.

Anyone with a discerning eye will see that something is off within seconds. With coding agents as capable as they are today, shipping a page like this is close to inexcusable. The AI did the implementation. Nobody did the judging. That missing judgment is what this essay is about.

Let's take it apart.

Start with the stack. There's no framework. Vite bundles everything into one 1.36 MB JavaScript file (358 KB compressed) and 270 KB of CSS holding nearly 1,900 rules. All fifteen "pages" (card collection, deck builder, AI deck assistant, deck plaza, news, gallery, API docs, two staff pages and more) are `<div class="page-view">` blocks living in a single HTML document, shown and hidden by script. The build even ships a separate legacy-browser polyfill bundle, as if true craftsmanship required compatibility with Internet Explorer 3.0. Someone, human or model, decided that framework-less code was the most maintainable way to build a fifteen-view application with accounts, a deck builder and an AI assistant.

Then the first screen. I have no idea what kind of seizure the LLM was having. The "向下滚动探索" (scroll down to explore) hint, which belongs at the bottom edge of the first screen, is pasted over the top-left corner of the "开始构筑" (Start Building) button. The tagline under the title is 13px, colored #6B6355 on a #0A0A0A background, for a contrast ratio of 3.3:1. The scroll hint is 12px at 3.15:1. WCAG AA asks for 4.5:1 for normal text. Submenu descriptions in the navigation bar shrink to 11px and the logo subtitle to 10px. Behind all of it sits a 2 MB PNG collage of card art, which the CSS then dims to 45% brightness and covers with a vignette. A floating "HONOR & CREDITS" card in the top-right corner links to the same credits page as the "鸣谢" (Credits) item in the navigation bar. The markup even contains an empty container named `home-floating-cards`, still waiting for cards that never arrived.

Scroll down and the homepage loads its product screenshots as full-resolution PNGs: 3.7 MB, 2.9 MB, 2.1 MB and 0.7 MB. The screenshots are 2864px wide and displayed at 559px. An A4 print preview is 2480 × 3508 pixels and displayed at 140 × 198. Together with the background image, that's over 11 MB of PNG on the homepage. When I tested it, each screenshot took 6 to 15 seconds to download, and until then the showcase sections show nothing but broken-image alt text.

This is a textbook ChatGPT wishcoded frontend. The site offers a lot of features across many views, and the prompt behind it was little more than "Build me a KARDS website with the following features...", probably without even a coherent bulleted list.

Faced with vague requirements, the model took the path of least resistance and piled up framework-less code. The creator couldn't judge how complex the project was, or say which technologies to use and how interactions should behave, so they had no way to constrain the model. Round after round of wishing, the codebase sagged under its own weight into the broken layouts and odd interactions it has now.

Now the user experience. Look at the navigation bar:

![Figure 1: The navigation menu and its hover behavior](./media/image.png)

Three navigation items, 画廊 (Gallery), 卡组构筑 (Deck Building) and 官文 (Official News), open a submenu on hover. The trigger is 82px wide. The submenu is 240px wide and centered under it, so reaching an item near the menu's edge means crossing a trapezoid-shaped area that belongs to neither. Well-built menus handle this by extending the hover area across that zone, or with a "safe triangle" (the trick Amazon's mega-menu made famous) that keeps the menu open while the cursor heads toward it. This menu does neither. Worse, there's a 4px strip between the bottom of the trigger and the top of the submenu that isn't part of the hover area at all. Move the cursor straight down toward the first item and the submenu starts fading out while you cross that strip. By the time you get there, it's gone.

The menus can also be opened by clicking the trigger, which pins them open. Click-to-open is a legitimate pattern, and the better one on touch screens. Here it's half-finished. Clicking empty space does close a pinned menu, but Escape doesn't. The triggers are bare `<a href="#">` links without `aria-expanded`, so a screen reader has no idea a menu exists. And if you pin one menu and then hover another trigger, the second menu opens beside the first, leaving two submenus on screen at once.

I have nothing against vanilla HTML. The personal site of Rasmus Andersson, creator of the Inter typeface, [rsms.me](https://rsms.me/), is built mostly with plain HTML. Strict Swiss-style typography, a few clever engineering touches and no complex routing to manage make it look effortless. In early 2023, a few months after ChatGPT launched and while its code was still crude, I built serviceable sites myself with vanilla code, iframes and manual DOM manipulation. Plain HTML is fine when the project fits it. A fifteen-view application with accounts and a deck builder doesn't.

Even if you insisted on fixing this site without a framework, the path is short (planned entirely by a human brain, zero tokens spent):

1. Navigation: every dropdown behaves the same way, so write it once as a single component with one set of layout rules (see [tanh.moe](https://tanh.moe/) for a reference implementation). Bridge the gap between trigger and submenu, close the menu on Escape and on outside click, close any open menu when another opens, and set `aria-expanded` on the trigger.
2. Visuals: black and gold can look expensive, but gold glow text over a dimmed photo collage with 3:1 gray body text reads as cheap and dated in 2026. Replace the background image with a solid dark surface, bring text up to at least 4.5:1, gather the hero content into one centered container, build a clear typographic hierarchy from weight, size and whitespace, and remove the duplicate credits card.
3. Assets: export the screenshots at the size they are displayed, as WebP or AVIF. That alone cuts the homepage by megabytes.

I mention these only to make a point: vanilla code is no excuse. The root cause is a lack of command over engineering and design.

Today we have a mature frontend ecosystem, off-the-shelf component libraries and AI assistants available around the clock. So why do mistakes this basic still ship untouched? When AI can carry most of the implementation, why do creators still stumble on elementary design and engineering judgment? I'm not interested in ranking React, Next.js and vanilla HTML against each other. I want to know where the judgment went.

Let's start with design.

Anyone who regularly generates web pages with AI has grown tired of the default AI look: bold oversized headings, rounded cards, soft diffused shadows, faint gradient backgrounds, generous padding and a safe sans-serif typeface.

Each of these choices is safe and balanced on its own. Replicated across millions of generated sites, they produce an internet where every page looks the same. That is the first byproduct of wishcoding: **visual sameness and mediocrity at scale**.

This visual language descends, more or less, from the Swiss Style. The grids, clear information hierarchies, sans-serif typefaces and love of order that modern web design relies on are all inherited from modernist graphic design. But left-aligning your text, slotting it into a grid and picking a default sans-serif font doesn't mean you've mastered the Swiss Style.

In my view, typography is the hardest design discipline to master. With no illustration or ornament to lean on, it builds visual order on a flat page from nothing but typeface, weight, size, tracking, line height and whitespace.

Breaking the grid can also produce masterpieces. Look at the freeform layouts in many Japanese magazines: text stops following uniform axes, images overlap, and the visual center of gravity is pushed toward the edge of the page. These layouts look spontaneous and restless, a rebellion against the cold order of modernism. Their freedom was never achieved by throwing elements at the page blindfolded.

There's an old saying in design: **"Breaking the rules is not the same as not knowing the rules."** You have to feel the pull of order before you can measure how far to stray from it. Otherwise, "breaking the grid" just looks like your hand slipped while aligning things.

Sticking to a grid doesn't make a design sophisticated, and neither does breaking it. Sophistication comes from the designer's command of how form, content and space relate, and from having a reason behind every visual decision.

Toss a hollow prompt like "make it modern and professional" at an AI, accept the first draft it returns, and you are guaranteed the lowest common denominator of its training data. In creative work, average has never had anything to do with excellent.

In §43 of *Philosophical Investigations*, Wittgenstein wrote (Anscombe's translation):

> For a large class of cases—though not for all—in which we employ the word "meaning" it can be defined thus: the meaning of a word is its use in the language.

He was writing about language, but the idea carries over to interaction design by analogy. Go back to the KARDS navigation bar and ask a Wittgensteinian question: what is a dropdown menu?

As a visual element on a static canvas, it's a bordered rectangle with a few rows of text, links or icons. In use, a dropdown menu is a **behavioral contract** with the user. It opens when you hover or click the trigger. It stays put while you move toward an item. It closes when you click elsewhere, press Escape or move focus away. It works the same with a keyboard and on a touch screen.

If something looks exactly like a dropdown menu but breaks that contract, is it still a dropdown menu? The same goes for buttons. However refined the border and however silky the hover animation, a button that gives no sensible feedback or state change when clicked is scrap metal as far as interaction is concerned.

This is why I've always opposed treating UI and UX as separate fields. Visual design isn't makeup applied to a page. It does real work. Font size, color temperature, contrast and the density of whitespace decide where the eye lands first, how the reader parses the hierarchy, and whether they find the action they came for within three seconds. A clear visual hierarchy guides interaction by itself, and chaotic typography and layout almost always turn into a bad user experience.

**A website is not a screenshot.** It isn't a mockup hung on Dribbble to be admired from a distance. It's a running system, tested by real clicks, real scrolls and real mistakes.

If design needs rules, how should we treat their edges?

Many beginners see design rules in black and white. The best example is an old Chinese folk saying: "红配绿，赛狗屁", roughly "red with green looks like crap."

But what counts as red, and what counts as green? Is magenta with acid green red and green? What if one hue loses lightness and saturation? What if the area ratio is 9:1, or the two are separated by large fields of black, white and gray?

Taken out of the specific relationships of hue, lightness, chroma, proportion and space, "red and green clash" is a crude rule of thumb, not a law of design. In the same way, overlapping layers, harsh contrast, unusual letter-spacing and broken grids can all work in the right context. Rule them out because a textbook says so, and design only gets more timid.

That doesn't mean we can throw the rules away.

In §§199–202 of *Philosophical Investigations*, Wittgenstein works through the paradox of rule-following. §201 states it:

> This was our paradox: no course of action could be determined by a rule, because every course of action can be made out to accord with the rule.

Every designer has seen this happen. Any layout, however broken, can be given a justification after the fact: the misalignment is "tension," the clashing fallback font is "texture," the unreadable gray is "restraint." If a rule can be stretched to cover anything, it no longer guides anything. Wittgenstein's way out, in §202, is that following a rule is something you do, not something you recite:

> And hence also "obeying a rule" is a practice. And to think one is obeying a rule is not to obey a rule.

Carry this over to design and two things follow. Knowing what a rule says and knowing how to apply it are different skills. And an airtight theory behind every decision still doesn't make a design good. Design doesn't validate itself with essays. It can only be judged by what it's like to use.

Anyone can memorize "Swiss Style uses grids," "headings need a size hierarchy" and "body text needs enough contrast" in five minutes. The hard part is the moment of execution. When do you obey the grid strictly? When do you break alignment on purpose to let the page breathe? When do you push contrast to make a focal point, and when do you hold back to keep the page quiet?

No formula answers these questions.

That's why I dislike two extremes equally. One knows none of the rules and piles elements together on instinct. The other treats Material Design or Apple's Human Interface Guidelines as scripture and recoils at any deviation. The first lacks judgment. The second has handed it over voluntarily.

None of this is meant to sneer at beginners.

Everyone starts somewhere. When you build your first pages, not noticing that a 2px spacing mismatch feels off, or that inconsistent font sizes break the reading rhythm, is normal. I made plenty of early work that makes me wince today, and a few years from now, what I'm making today will probably look naive too.

Mistakes are nothing to fear. Learning is trial and error.

What I can't understand is ignoring obvious flaws sitting right in front of you.

A beginner may not yet spot every design problem alone, but they can keep a critical habit. They can compare their work against mature open-source projects, ask experienced people for critique, or feed a screenshot back to an AI and ask for a visual review. With open-source components, design showcases and AI tools a click away, good feedback has never been cheaper to get.

The right attitude won't give anyone top-tier taste and engineering instinct overnight. Taste and judgment take years. But if you stop examining and refining your work the moment you hit "generate," that capacity never grows at all.

Steve Jobs closed his 2005 Stanford commencement address with "Stay Hungry. Stay Foolish.", the farewell printed on the back cover of the final issue of the *Whole Earth Catalog*. Let me adapt it:

**Stay Sharp. Stay Strange.**

**Stay Sharp** means examining your output with the most critical eye you have and refusing to let a single jarring detail slide. **Stay Strange** means refusing to be tamed by mediocre "best practices," and keeping the nerve to try unconventional expression.

Rigor isn't conservatism, and freedom isn't carelessness. Good work needs both at once.

Now to AI itself.

I'm not against building with AI, and I don't think using a coding agent is anything to be ashamed of. The biggest thing AI has done for software is drive the cost of turning an idea into code close to zero. We used to spend real effort hand-writing boilerplate, digging through API documentation and fighting build-tool configuration. That grunt work can now be handed off.

But getting the job done and knowing how it ought to be done are different things.

You no longer need to memorize every obscure CSS property or every React API detail. When an AI hands you a solution, though, you have to be able to judge it:

* Does a purely presentational static page need a server-side rendering (SSR) setup?
* Should an application with complex state be left to an AI piling up tens of thousands of lines of framework-less HTML and JavaScript?
* For a standard dropdown or modal, should you use a battle-tested component library, or let the AI improvise a brittle one from scratch?
* Is a new framework worth the abstraction and maintenance it brings?

"Let the AI write it" answers none of these.

Choosing technology is itself a test of engineering judgment. React, Next.js and the various UI libraries each have trade-offs and sweet spots. Pick a tool because it solves your project's problems, not because it's new, fast, or happens to be in the AI's default template.

So AI hasn't made engineering and design judgment less valuable. It has made it matter more.

Before AI, a beginner without architectural skill could write a mess, but slowly. Most projects stalled long before they grew big enough to collapse. Today anyone can spend an afternoon on a few dozen rounds of conversation and end up with dozens of pages, tangled state transitions and a sprawling dependency tree.

The code grows much faster than the author's understanding of it.

Past a certain size, an AI working within a limited context window starts playing whack-a-mole. It fixes one component's styling and breaks the global layout. It pulls in a new library for a minor problem and creates a conflict with the existing stack. By turn 50 of the conversation, it has forgotten the design system agreed on in turn 3.

AI lets people write code ten times faster, and pile up technical debt they can't debug ten times faster. It lowered the barrier to *making* something without lowering the barrier to *understanding and maintaining* it.

There's no need for gloom, though. AI has changed how we learn as well as how we build.

Learning a craft used to mean a lot of repetition and muscle memory. Now that AI handles that layer, learning has to move up a level. Let the AI write the easing functions, but you have to tell which animation guides the eye and which just drags. You don't need to memorize Flexbox and Grid properties, but you do need a feel for spatial rhythm, information hierarchy and visual balance. You don't need to code base components by hand, but you have to decide where component boundaries go, how modules separate, and whether the architecture will hold up.

Where does that higher-level judgment come from? The usual places: reading a lot, taking good work apart, comparing, trying, failing and thinking about why.

There are no shortcuts. AI only moves where the effort goes. It frees you from "how do I make this run" so you can spend your energy on "is plan A or plan B better." Used well, it's also a good sparring partner: it can produce five layout prototypes or architectural approaches in minutes for you to compare and reject.

That only works if you stay the one making the calls, and don't just approve whatever comes back.

This is why wishcoding is dangerous. Writing code in natural language isn't the problem. The problem is how easily it convinces you that "the AI produced something that runs" means "I've finished the work."

When creators have no aesthetic standards and no engineering floor of their own, a more powerful AI only magnifies what's missing. That's why more and more projects online look complete at a glance and fall apart on inspection, with no visual order and no interaction logic.

AI isn't to blame for this. The fault lies with the person who outsourced their judgment along with their code.

Look back at KARDS Decker. None of its problems are hard computer science or framework performance limits. It needed a little design common sense, a little engineering restraint, and ten minutes of actually clicking through the page before publishing.

We can't expect beginners to have a senior designer's or architect's eye on day one, and we shouldn't dismiss work just because AI was involved. Non-specialists make striking things with AI all the time. But rolling the dice and getting lucky once is very different from producing good work consistently.

AI has given us a great deal of creative freedom. We no longer carve every pixel or type every semicolon by hand.

But you still need to know where you're going.

You still need to know why an architecture is sound, why a layout feels refined, why an interaction feels natural, and, when something on screen feels off, where the problem actually is.

You can hand implementation to AI, hand exploration to AI, even hand the first review to AI. At the end, the person who decides what stays and what gets torn down, and who signs their name to the work, can only be you.

The tools have changed, the workflow has changed, and what we need to learn has shifted. Who answers for the work hasn't.

**You are still the one steering the ship.**
