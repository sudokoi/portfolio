import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="prose-page">
      <h1>This page isn’t here.</h1>
      <p>The link may be old, or the page may have moved.</p>
      <Link href="/blogs">Browse the journal →</Link>
    </div>
  );
}
