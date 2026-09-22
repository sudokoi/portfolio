import { expect, it } from 'vitest';
import { readFile, readdir } from 'node:fs/promises';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import { convertMdx } from '../../scripts/migration/convert-mdx';
import { hash } from '../../scripts/publishing/snapshot';

it('preserves the six source dates, all code fences, galleries, captions and demo variants', async () => {
  const files = (await readdir('tests/fixtures/legacy'))
    .filter((file) => file.endsWith('.mdx'))
    .sort();
  expect(files).toHaveLength(6);
  for (const file of files) {
    const source = await readFile(`tests/fixtures/legacy/${file}`, 'utf8');
    const frontmatter = matter(source);
    const tree = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .parse(frontmatter.content) as Root;
    const post = await convertMdx(
      source,
      file.slice(5, -4),
      async (url) => `legacy-${hash(url).slice(0, 24)}`,
    );
    expect(post.title).toBe(frontmatter.data.title);
    const dates: Record<string, string> = {
      'expense-buddy': '2026-01-16',
      'og-image': '2024-09-04',
      'halo-effect': '2024-05-16',
      'improving-lcp': '2024-05-16',
      'use-imperative-handle': '2024-05-13',
      'weird-google-autocomplete': '2024-05-07',
    };
    expect(post.publishedAt).toBe(dates[post.slug]);
    expect(post.body.filter((block) => block._type === 'code').map((block) => block.code)).toEqual(
      tree.children.filter((node) => node.type === 'code').map((node) => node.value),
    );
    if (post.slug === 'halo-effect')
      expect(
        post.body.filter((block) => block._type === 'demo').map((block) => block.variant),
      ).toEqual(['halo', 'prominent', 'wrong-image', 'wrong-box', 'halo']);
    if (post.slug === 'expense-buddy')
      expect(
        post.body.filter((block) => block._type === 'gallery').flatMap((block) => block.images),
      ).toHaveLength(12);
    if (post.slug === 'improving-lcp')
      expect(post.body.find((block) => block._type === 'table')?.rows).toHaveLength(5);
    if (post.slug === 'weird-google-autocomplete')
      expect(
        post.body
          .filter((block) => block._type === 'image')
          .every((image) => image.caption && image.alt),
      ).toBe(true);
  }
});
it('fails rather than dropping unfamiliar executable JSX', async () => {
  const source = '---\ntitle: Test\ndescription: Test\ndate: May 7, 2024\n---\n\n<UnknownWidget />';
  await expect(convertMdx(source, 'test', async () => '')).rejects.toThrow(/unsupported/);
});
