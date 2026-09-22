export type SearchDocument = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  text: string;
  url: string;
};
export function searchPosts(documents: SearchDocument[], query: string, limit = 10) {
  if (query.length > 200) throw new Error('Search query must be at most 200 characters');
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return documents
    .map((document) => {
      const title = document.title.toLocaleLowerCase();
      const tags = document.tags.join(' ').toLocaleLowerCase();
      const body = `${document.description} ${document.text}`.toLocaleLowerCase();
      const score = terms.reduce(
        (sum, term) =>
          sum +
          (title.includes(term) ? 10 : 0) +
          (tags.includes(term) ? 5 : 0) +
          (body.includes(term) ? 1 : 0),
        0,
      );
      return { document, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.document.slug.localeCompare(b.document.slug))
    .slice(0, Math.max(1, Math.min(20, limit)))
    .map(({ document }) => ({
      id: document.id,
      slug: document.slug,
      title: document.title,
      excerpt: document.description,
      url: document.url,
    }));
}
