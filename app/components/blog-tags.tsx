export function BlogTags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-secondary px-3 py-1 text-xs font-medium text-secondary"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
