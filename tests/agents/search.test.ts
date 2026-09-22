import { expect, it } from 'vitest';
import { searchPosts } from '../../src/shared/search';
it('ranks published titles and topics deterministically with bounded responses', () => {
  const posts = [
    {
      id: 'halo',
      slug: 'halo-effect',
      title: 'Halo effect',
      description: 'CSS demonstrations',
      tags: ['CSS'],
      text: 'Building a CSS halo',
      url: 'https://sudh.online/blog/halo-effect',
    },
    {
      id: 'react',
      slug: 'react',
      title: 'React experiments',
      description: 'Component patterns',
      tags: ['React'],
      text: 'Other examples include the halo effect',
      url: 'https://sudh.online/blog/react',
    },
  ];
  expect(searchPosts(posts, '')).toEqual([]);
  expect(searchPosts(posts, 'no-matching-token-here')).toEqual([]);
  expect(searchPosts(posts, 'halo')[0]?.slug).toBe('halo-effect');
  expect(searchPosts(posts, 'React', 1)).toHaveLength(1);
  expect(searchPosts(posts, 'halo')[0]?.url).toBe('https://sudh.online/blog/halo-effect');
  expect(() => searchPosts(posts, 'a'.repeat(201))).toThrow();
});
