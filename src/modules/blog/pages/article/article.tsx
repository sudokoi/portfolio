import Link from 'next/link';
import { getProfile, listPosts, type PublishedPost } from '@/modules/content';
import { JsonLd } from '@/modules/seo';
import { canonical } from '@/shared/config/site';
import { formatDate } from '@/shared/config/date';
import { Body } from './Body';
import styles from './article.module.css';
export function ArticlePage({ post }: { post: PublishedPost }) {
  const posts = listPosts();
  const position = posts.findIndex((item) => item.id === post.id);
  const previous = posts[position + 1];
  const next = posts[position - 1];
  return (
    <article className={styles.article}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              datePublished: post.publishedAt,
              ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
              author: { '@type': 'Person', name: getProfile().name, url: canonical() },
              mainEntityOfPage: canonical(`/blog/${post.slug}`),
              image: canonical(`/blog/${post.slug}/opengraph-image`),
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Blogs', item: canonical('/blogs') },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: post.title,
                  item: canonical(`/blog/${post.slug}`),
                },
              ],
            },
          ],
        }}
      />
      <header className={styles.header}>
        <Link href="/blogs" className={styles.back}>
          ← All posts
        </Link>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        {post.updatedAt ? (
          <span>
            {' '}
            · Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
          </span>
        ) : null}
        <ul className={styles.tags} aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      </header>
      <Body body={post.body} />
      <footer className={styles.related}>
        <h2>Keep reading</h2>
        <nav aria-label="Adjacent articles">
          {previous ? (
            <div>
              <small>Previous post</small>
              <Link href={`/blog/${previous.slug}`} prefetch={false}>
                {previous.title}
              </Link>
            </div>
          ) : null}
          {next ? (
            <div>
              <small>Next post</small>
              <Link href={`/blog/${next.slug}`} prefetch={false}>
                {next.title}
              </Link>
            </div>
          ) : null}
        </nav>
      </footer>
    </article>
  );
}
