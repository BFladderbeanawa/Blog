import type { Metadata } from 'next';
import Image from 'next/image';
import { RouteLink } from '@/components/site/Navigation';
import { TableOfContents } from '@/components/site/TableOfContents';
import { ReadingProgress } from '@/components/site/ReadingProgress';
import { notFound } from 'next/navigation';
import { getPost, getPosts, renderPost } from '@/lib/posts';
import { site } from '@/data/site';

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
    <main className="page-shell" id="main-content">
      <ReadingProgress key={post.slug} />
      <div className={`post-layout${headings.length ? '' : ' post-layout-single'}`}>
        {headings.length > 0 ? <TableOfContents headings={headings} /> : null}
        <article className="post-article">
          <header className="post-header">
            <RouteLink className="text-link" href="/all">
              All posts
            </RouteLink>
            <p className="post-meta">
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
            <h1 className="page-heading" lang={language}>
              {post.title}
            </h1>
            <p className="page-intro" lang={language}>
              {post.description}
            </p>
          </header>
          {hero ? (
            <figure className="post-hero">
              <Image src={hero} alt="" fill sizes="(max-width: 1080px) 100vw, 1000px" preload />
            </figure>
          ) : null}
          <div className="prose" lang={language} dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </main>
  );
}
