import Link from 'next/link';
import { listPosts } from '@/modules/content';
import { formatDate } from '@/shared/config/date';
import { Search } from './Search';
import styles from './blog-index.module.css';
export function BlogIndexPage() {
  return (
    <>
      <header className={styles.header}>
        <h1>Notes from the frontend.</h1>
        <p>
          In this small corner of the internet, I write about things that interest me. Here are some
          of my posts:
        </p>
      </header>
      <Search />
      <ul className={styles.list}>
        {listPosts().map((post) => (
          <li key={post.id}>
            <article className={styles.post}>
              <h2>
                <Link href={`/blog/${post.slug}`} prefetch={false}>
                  {post.title}
                </Link>
              </h2>
              <p>{post.description}</p>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
