import type { Metadata } from 'next';
import Image from 'next/image';
import { ClosingSocials } from '@/components/site/ClosingSocials';
import { ExploreLinks } from '@/components/site/ExploreLinks';
import { HomeDeck } from '@/components/site/HomeDeck';
import { PointillistLandscape } from '@/components/site/PointillistLandscape';
import { RouteLink } from '@/components/site/Navigation';
import { contactEmail, kaggleUrl, socials } from '@/data/site';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = await Promise.all(
    posts.slice(0, 3).map(async (post) => ({
      ...post,
      // Each Markdown file selects its image at runtime; a static import cannot select it.
      cover: post.heroImage
        ? post.heroImage.startsWith('/')
          ? post.heroImage
          : (await import(`@/assets/${post.heroImage}`)).default
        : undefined,
    })),
  );
  return (
    <HomeDeck
      articleCount={recentPosts.length}
      labels={[
        'Opening',
        'Explore',
        ...recentPosts.map((post) => `Recent writing: ${post.title}`),
        'Elsewhere',
      ]}
    >
      <div className="scene-content relative z-[3] isolate grid min-h-svh place-items-center pt-[calc(var(--scene-top)+40px)] pr-0 pb-[72px] pl-0 max-xs:pt-[calc(var(--scene-top)+32px)] max-xs:pb-12">
        <div className="opening-composition relative z-[1] w-[min(1000px,72vw)] max-xs:w-[calc(100%-80px)]">
          <h1 className="opening-handle font-scene text-[clamp(48px,5.6vw,88px)] leading-[1.08] font-bold tracking-[-0.055em] max-xs:text-[clamp(24px,6vw,42px)]">
            @BFladderbean
          </h1>
          <div className="opening-bio mt-[clamp(40px,7svh,72px)] ml-[12.5%] font-scene text-[clamp(18px,1.6vw,24px)] leading-[1.45] tracking-[-0.015em] [&_.highlight]:text-violet max-xs:mt-8 max-xs:ml-0 max-xs:text-[17px]">
            <p>
              Studying <span className="highlight">Computer Science</span>
            </p>
            <p>
              I was an <span className="highlight">OIer</span>.
            </p>
            <p>
              I am (<span className="highlight">becoming</span>) a{' '}
              <span className="highlight">machine learning researcher</span>.
            </p>
            <p>
              I play <span className="highlight">Minecraft</span>/
              <span className="highlight">Celeste</span>/<span className="highlight">Arcaea</span>.
            </p>
            <p>
              I am a hobbyist of <span className="highlight">graΦc design</span>.
            </p>
          </div>
          <a
            className="scroll-cue mt-[clamp(48px,10svh,96px)] flex min-h-[72px] items-center justify-end gap-6 border-t-2 border-current font-scene text-base font-bold hover:text-violet"
            href="#scene-1"
            aria-label="Scroll to explore the site"
          >
            <span>Scroll to explore</span>
            <svg
              className="h-10 w-10 fill-none stroke-current [stroke-linecap:square] [stroke-linejoin:miter] [stroke-width:2.5]"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="m6 7 10 10L26 7M6 17l10 10 10-10" />
            </svg>
          </a>
        </div>
      </div>
      <div className="scene-content relative z-[3] flex min-h-svh flex-col justify-center pt-[calc(var(--scene-top)+36px)] pr-[calc(var(--gutter)+42px)] pb-14 pl-(--gutter) wide:pr-[calc(var(--gutter)+80px)] max-xs:pt-[calc(var(--scene-top)+24px)] max-xs:pr-[52px] max-xs:pb-16 max-xs:pl-6">
        <ExploreLinks />
      </div>
      {recentPosts.map((post, index) => (
        <article
          className="scene-content writing relative z-[3] flex min-h-svh flex-col justify-stretch p-0"
          data-variant={index % 3}
          key={post.slug}
        >
          <div className="writing-composition relative grid min-h-0 flex-1 grid-cols-[24fr_46fr_30fr] grid-rows-[28fr_42fr_30fr] gap-(--writing-rule) bg-ink p-(--writing-rule) font-scene [--writing-rule:clamp(6px,0.55vw,12px)] [[data-variant='1']_&]:grid-cols-[34fr_36fr_30fr] [[data-variant='1']_&]:grid-rows-[34fr_36fr_30fr] [[data-variant='2']_&]:grid-cols-[26fr_50fr_24fr] [[data-variant='2']_&]:grid-rows-[26fr_50fr_24fr] max-xs:flex max-xs:flex-col max-xs:gap-0 max-xs:p-0">
            <div className="writing-id flex items-end bg-violet px-[clamp(18px,2vw,44px)] py-[clamp(16px,2.4vh,34px)] leading-[1.12] font-bold tracking-[-0.025em] text-paper transition-[background-color,color] duration-[520ms] ease-smooth [container-type:size] [grid-area:1/1] [[data-variant='1']_&]:items-start [[data-variant='1']_&]:[grid-area:1/3] [[data-variant='2']_&]:[grid-area:1/3] max-xs:order-0 max-xs:gap-3 max-xs:px-6 max-xs:py-3.5 max-xs:[container-type:inline-size]">
              <p className="m-0 text-[clamp(24px,min(11cqw,22cqh),44px)] text-balance">
                {index === 0 ? 'Latest work' : 'Recent writing'}
              </p>
            </div>
            <div className="writing-index flex flex-col items-start justify-center gap-[clamp(4px,0.8vh,12px)] overflow-clip bg-paper px-[clamp(18px,2vw,44px)] font-scene text-ink transition-opacity duration-[520ms] ease-smooth [container-type:size] [grid-area:2/1] [[data-variant='1']_&]:[grid-area:2/3] [[data-variant='2']_&]:[grid-area:2/1] max-xs:order-1 max-xs:items-start max-xs:justify-start max-xs:gap-3 max-xs:px-6 max-xs:py-5 max-xs:[container-type:inline-size]">
              <strong className="text-[clamp(56px,min(32cqw,42cqh),160px)] leading-[0.9] font-extrabold tracking-[-0.07em] max-xs:text-[clamp(84px,14vw,150px)]">
                {String(index + 1).padStart(2, '0')}
              </strong>
              <span className="text-[clamp(20px,min(8cqw,12cqh),32px)] whitespace-nowrap">
                / {String(recentPosts.length).padStart(2, '0')}
              </span>
            </div>
            <RouteLink
              className="writing-slab group/slab relative z-[4] flex items-end justify-between gap-[clamp(16px,2vw,40px)] bg-acid px-(--slab-pad-x) py-[clamp(20px,3vh,44px)] text-ink no-underline transition-[--sweep] duration-[520ms] ease-smooth [--arrow-w:clamp(40px,3.4vw,64px)] [--slab-pad-x:clamp(22px,2.4vw,56px)] [--slab-w:calc(100cqw_+_2_*_var(--slab-pad-x))] [--sweep:0%] [container-type:size] [grid-area:1/2/3/3] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-violet before:[clip-path:inset(0_calc(100%_-_var(--sweep))_0_0)] before:content-[''] hover:[--sweep:100%] focus-visible:-outline-offset-6 focus-visible:[--sweep:100%] focus-visible:outline-3 focus-visible:outline-paper [[data-variant='1']_&]:[grid-area:1/2/3/3] [[data-variant='2']_&]:[grid-area:1/1/2/3] max-xs:order-2 max-xs:gap-3 max-xs:p-6 max-xs:[--slab-pad-x:24px] max-xs:[container-type:inline-size]"
              href={`/posts/${post.slug}`}
              aria-label={`Read ${post.title}`}
            >
              <h2 className="writing-title relative z-[1] m-0 block min-w-0 bg-clip-text font-scene text-[clamp(40px,min(15cqw,25cqh),144px)] font-bold leading-[1.06] tracking-[-0.035em] text-balance text-transparent transition-[background-position,translate] duration-[520ms] ease-smooth [--ox:var(--slab-pad-x)] [background-image:linear-gradient(90deg,var(--color-paper)_0_var(--sweep),var(--color-ink)_var(--sweep)_100%)] [background-position:calc(-1*var(--ox))_0] [background-repeat:no-repeat] [background-size:var(--slab-w)_100%] [overflow-wrap:anywhere] group-hover/slab:translate-x-3.5 group-hover/slab:[background-position:calc(-1*var(--ox)_-_14px)_0] group-focus-visible/slab:translate-x-3.5 group-focus-visible/slab:[background-position:calc(-1*var(--ox)_-_14px)_0] [[data-variant='2']_&]:text-[clamp(40px,min(8cqw,46cqh),160px)] max-xs:text-[clamp(30px,9vw,64px)]">
                {post.title}
              </h2>
              {/* Drawn by a CSS mask so it shares the title's sweep paint. */}
              <span
                className="writing-arrow relative z-[1] mb-1.5 aspect-square w-(--arrow-w) flex-none transition-[background-position,translate] duration-[520ms] ease-smooth [--ox:calc(var(--slab-pad-x)_+_100cqw_-_var(--arrow-w))] [background-image:linear-gradient(90deg,var(--color-paper)_0_var(--sweep),var(--color-ink)_var(--sweep)_100%)] [background-position:calc(-1*var(--ox))_0] [background-repeat:no-repeat] [background-size:var(--slab-w)_100%] group-hover/slab:translate-x-3.5 group-hover/slab:[background-position:calc(-1*var(--ox)_-_14px)_0] group-focus-visible/slab:translate-x-3.5 group-focus-visible/slab:[background-position:calc(-1*var(--ox)_-_14px)_0]"
                aria-hidden="true"
              />
            </RouteLink>
            <div className="writing-note flex items-center bg-paper px-[clamp(22px,2.4vw,56px)] py-[clamp(18px,2.4vh,34px)] text-ink transition-opacity duration-[520ms] ease-smooth [container-type:size] [grid-area:3/2] [[data-variant='1']_&]:[grid-area:3/1/4/3] [[data-variant='2']_&]:[grid-area:2/2] max-xs:order-3 max-xs:px-6 max-xs:py-6 max-xs:[container-type:inline-size]">
              <p className="writing-lede m-0 max-w-[44ch] text-[clamp(22px,min(5.5cqw,16cqh),36px)] leading-[1.5]">
                {post.description}
              </p>
            </div>
            <div className="writing-meta flex flex-col justify-between gap-4 bg-ink px-[clamp(18px,2vw,44px)] py-[clamp(18px,2.4vh,34px)] leading-[1.4] text-paper transition-opacity duration-[520ms] ease-smooth [container-type:size] [grid-area:3/1] [[data-variant='1']_&]:[grid-area:3/3] [[data-variant='2']_&]:flex-row [[data-variant='2']_&]:items-baseline [[data-variant='2']_&]:justify-between [[data-variant='2']_&]:gap-6 [[data-variant='2']_&]:[grid-area:3/1/4/3] max-xs:order-4 max-xs:px-6 max-xs:py-6 max-xs:[container-type:inline-size]">
              <p className="m-0 text-[clamp(18px,min(7cqw,16cqh),26px)]">
                Published{' '}
                <time dateTime={post.pubDate}>
                  {new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  }).format(new Date(post.pubDate))}
                </time>
              </p>
              <RouteLink
                className="relative z-[5] self-start border-b border-current pb-1 text-[clamp(22px,min(10cqw,22cqh),32px)] font-bold"
                href="/all"
              >
                All posts ({posts.length})
              </RouteLink>
            </div>
            <div
              className="writing-visual relative overflow-hidden bg-violet-dark transition-opacity duration-[520ms] ease-smooth [grid-area:1/3/4/4] [[data-variant='1']_&]:[grid-area:1/1/3/2] [[data-variant='2']_&]:[grid-area:2/3/4/4] max-xs:order-5 max-xs:min-h-[32svh]"
              aria-hidden="true"
            >
              {post.cover ? (
                <Image
                  className="object-cover transition-[translate,transform] duration-[180ms,520ms] ease-smooth in-data-[cover-hover]:translate-x-[clamp(-14px,calc(var(--cover-x,0)*3%),14px)] in-data-[cover-hover]:translate-y-[clamp(-14px,calc(var(--cover-y,0)*3%),14px)] in-data-[cover-hover]:scale-[1.08]"
                  src={post.cover}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 58vw"
                />
              ) : null}
            </div>
            {/* The navigation's violet field settles into this cell, so only the
                first article carries it. */}
            {index === 0 ? <span className="writing-field" aria-hidden="true" /> : null}
            <RouteLink
              href={`/posts/${post.slug}`}
              className="writing-feature absolute inset-0 z-[3]"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </article>
      ))}
      <div className="scene-content closing relative z-[3] isolate flex min-h-svh flex-col bg-ink pt-[calc(var(--scene-top)+36px)] pr-[calc(var(--gutter)+42px)] pb-14 pl-(--gutter) wide:pr-[calc(var(--gutter)+80px)] max-xs:pt-[calc(var(--scene-top)+24px)] max-xs:pr-[52px] max-xs:pb-16 max-xs:pl-6">
        <PointillistLandscape />
        <h2 className="relative z-[3] my-auto font-scene text-[clamp(80px,10vw,160px)] leading-[1.02] tracking-[-0.055em] max-xs:text-[17vw]">
          Keep
          <br />
          in touch.
        </h2>
        <div className="closing-bottom relative z-[3] mt-10 w-[clamp(280px,30vw,420px)] max-xs:w-[min(100%,360px)]">
          <ClosingSocials>
            {socials.map((link) => (
              <a
                className="flex justify-between border-b border-current py-2 font-scene text-[30px] hover:text-paper max-xs:text-2xl"
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="closing-social-label pointer-events-none transition-transform duration-[240ms] ease-smooth [translate:calc(var(--social-x,0)*10px)_calc(var(--social-y,0)*3px)] [[data-parallax]_&]:duration-[100ms] motion-reduce:transition-none">
                  {link.name}
                </span>
                <span
                  className="closing-social-arrow pointer-events-none transition-transform duration-[240ms] ease-smooth [translate:calc(var(--social-x,0)*18px)_calc(var(--social-y,0)*5px)] [[data-parallax]_&]:duration-[100ms] motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            {kaggleUrl ? (
              <a
                className="flex justify-between border-b border-current py-2 font-scene text-[30px] hover:text-paper max-xs:text-2xl"
                href={kaggleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="closing-social-label pointer-events-none transition-transform duration-[240ms] ease-smooth [translate:calc(var(--social-x,0)*10px)_calc(var(--social-y,0)*3px)] [[data-parallax]_&]:duration-[100ms] motion-reduce:transition-none">
                  Kaggle
                </span>
                <span
                  className="closing-social-arrow pointer-events-none transition-transform duration-[240ms] ease-smooth [translate:calc(var(--social-x,0)*18px)_calc(var(--social-y,0)*5px)] [[data-parallax]_&]:duration-[100ms] motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
            {contactEmail ? (
              <a
                className="flex justify-between border-b border-current py-2 font-scene text-[30px] hover:text-paper max-xs:text-2xl"
                href={`mailto:${contactEmail}`}
              >
                <span className="closing-social-label pointer-events-none transition-transform duration-[240ms] ease-smooth [translate:calc(var(--social-x,0)*10px)_calc(var(--social-y,0)*3px)] [[data-parallax]_&]:duration-[100ms] motion-reduce:transition-none">
                  Email
                </span>
                <span
                  className="closing-social-arrow pointer-events-none transition-transform duration-[240ms] ease-smooth [translate:calc(var(--social-x,0)*18px)_calc(var(--social-y,0)*5px)] [[data-parallax]_&]:duration-[100ms] motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            ) : null}
          </ClosingSocials>
        </div>
        <small className="relative z-[3] pt-10 text-xs text-paper">
          BFladderbean © {new Date().getFullYear()}
        </small>
      </div>
    </HomeDeck>
  );
}
