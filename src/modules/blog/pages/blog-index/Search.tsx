'use client';
import { useState } from 'react';
import { loadSearchIndex } from '@/shared/search/client';
import { searchPosts } from '@/shared/search';
import styles from './blog-index.module.css';

export function Search() {
  const [results, setResults] = useState<ReturnType<typeof searchPosts>>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div className={styles.search}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const query = String(new FormData(event.currentTarget).get('query') ?? '').trim();
          if (!query) {
            setResults([]);
            setStatus('Enter a topic to search.');
            return;
          }
          setLoading(true);
          setStatus('Searching…');
          try {
            const found = searchPosts(await loadSearchIndex(), query);
            setResults(found);
            setStatus(
              found.length
                ? `${found.length} ${found.length === 1 ? 'post' : 'posts'} found.`
                : 'No posts found. Try another topic.',
            );
          } catch {
            setStatus('Search is unavailable. Try again, or browse the posts below.');
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <label htmlFor="search-posts">Search the journal</label>
          <input
            id="search-posts"
            name="query"
            type="search"
            maxLength={200}
            placeholder="CSS, React, performance…"
          />
        </div>
        <button className="self-end" disabled={loading} type="submit">
          Search
        </button>
      </form>
      <p role="status" aria-live="polite">
        {status}
      </p>
      {results.length ? (
        <ul aria-label="Search results">
          {results.map((result) => (
            <li key={result.id}>
              <a href={`/blog/${result.slug}`}>{result.title}</a>
            </li>
          ))}
        </ul>
      ) : null}
      <noscript>Search needs JavaScript. All posts are listed below.</noscript>
    </div>
  );
}
