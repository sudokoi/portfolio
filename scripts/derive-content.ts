import { writeFile, mkdir } from 'node:fs/promises';
import { readSnapshot, stableJson } from './publishing/snapshot';
import { articleText } from '../src/modules/content/text';
import { canonical } from '../src/shared/config/site';
const data = await readSnapshot();
await mkdir('src/modules/content', { recursive: true });
// Static imports let Next trace the exact snapshot without runtime source globs.
await writeFile(
  'src/modules/content/generated.ts',
  [
    `import profile from '../../../content/published/profile.json';`,
    `import assets from '../../../content/published/assets.json';`,
    ...data.posts.map(
      (post, index) =>
        `import post${index} from '../../../content/published/posts/${post.slug}.json';`,
    ),
    `export default { profile, assets, posts: [${data.posts.map((_, index) => `post${index}`).join(',')}] };`,
  ].join('\n'),
);
await writeFile(
  'public/search-index.json',
  stableJson(
    data.posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      tags: post.tags,
      text: articleText(post.body),
      url: canonical(`/blog/${post.slug}`),
    })),
  ),
);
console.log('Derived static content imports and lazy search index.');
