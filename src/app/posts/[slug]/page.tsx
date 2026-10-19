import type { Metadata } from 'next';
import Image from 'next/image';
import { RouteLink } from '@/components/site/Navigation';
import { TableOfContents } from '@/components/site/TableOfContents';
import { ReadingProgress } from '@/components/site/ReadingProgress';
import { notFound } from 'next/navigation';
import { getPost, getPosts, renderPost } from '@/lib/posts';
import { site } from '@/data/site';
import { pageShell, textLink } from '@/lib/ui';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `${site.url}/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.pubDate,
      ...(post.updatedDate ? { modifiedTime: post.updatedDate } : {}),
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { html, headings } = await renderPost(post.content);
  const language = /\p{Script=Han}/u.test(post.content) ? 'zh-CN' : 'en';
  // Each Markdown file selects its hero at runtime; a static import cannot select it.
  const hero = post.heroImage
    ? post.heroImage.startsWith('/')
      ? post.heroImage
      : (await import(`@/assets/${post.heroImage}`)).default
    : undefined;

  return (
    <main className={pageShell} id="main-content">
      <ReadingProgress key={post.slug} />
      <div
        className={
          headings.length
            ? 'post-layout grid grid-cols-[200px_minmax(0,1000px)] items-start justify-center gap-x-[clamp(32px,4vw,72px)] max-lg:block'
            : 'post-layout post-layout-single block'
        }
      >
        {headings.length > 0 ? <TableOfContents headings={headings} /> : null}
        <article className="post-article min-w-0">
          <header
            className={`post-header mx-auto mt-6 max-w-[1000px] ${
              hero ? 'mb-10 max-xs:mb-6' : 'mb-20 max-xs:mb-12'
            }`}
          >
            <RouteLink className={textLink} href="/all">
              All posts
            </RouteLink>
            <p className="post-meta mt-8 flex flex-wrap gap-5 text-[13px] text-muted">
              Published{' '}
              <time dateTime={post.pubDate}>{dateFormatter.format(new Date(post.pubDate))}</time>
              {post.updatedDate ? (
                <>
                  {' '}
                  · Updated{' '}
                  <time dateTime={post.updatedDate}>
                    {dateFormatter.format(new Date(post.updatedDate))}
                  </time>
                </>
              ) : null}
            </p>
            <h1
              className="mt-8 mb-8 font-scene text-[clamp(44px,6vw,88px)] leading-[1.2] tracking-[-0.035em] max-xs:text-[40px]"
              lang={language}
            >
              {post.title}
            </h1>
            <p className="max-w-[36em] text-xl text-muted" lang={language}>
              {post.description}
            </p>
          </header>
          {hero ? (
            <figure className="post-hero relative mx-auto mb-20 aspect-video max-w-[1000px] overflow-hidden bg-violet-dark max-xs:mb-14 max-xs:aspect-[4/3]">
              <Image
                className="object-cover"
                src={hero}
                alt=""
                fill
                sizes="(max-width: 1080px) 100vw, 1000px"
                preload
              />
            </figure>
          ) : null}
          <div className="prose" lang={language} dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </main>
  );
}
