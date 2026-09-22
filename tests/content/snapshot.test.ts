import { describe, expect, it } from 'vitest';
import { validateSnapshot } from '../../src/modules/content/schema';

const post = {
  id: 'post-one',
  slug: 'one',
  title: 'One',
  description: 'A real article',
  publishedAt: '2024-05-07',
  tags: ['css'],
  body: [
    {
      _type: 'block',
      _key: 'p',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 's', text: 'Hello', marks: [] }],
    },
  ],
};
const profile = {
  id: 'profile',
  name: 'Sudhanshu',
  role: 'Engineer',
  introduction: ['Hello'],
  aside: 'Forms',
  experience: [],
  projects: [],
  skills: [],
  links: [],
  resume: { _type: 'reference', _ref: 'resume' },
};
const asset = {
  sourceId: 'resume',
  sha256: 'a'.repeat(64),
  path: `/media/${'a'.repeat(64)}.pdf`,
  mimeType: 'application/pdf',
  bytes: 100,
};
export const seed = () => ({
  posts: [structuredClone(post)],
  profile: structuredClone(profile),
  assets: [structuredClone(asset)],
});

describe('published snapshot contract', () => {
  it('accepts a complete published snapshot', () =>
    expect(validateSnapshot(seed()).posts).toHaveLength(1));
  it.each(['drafts.post-one', 'versions.release.post-one'])('rejects private ID %s', (id) => {
    const data = seed();
    data.posts[0].id = id;
    expect(() => validateSnapshot(data)).toThrow();
  });
  it('rejects duplicates, impossible dates and unknown blocks', () => {
    const data = seed();
    data.posts.push(data.posts[0]);
    expect(() => validateSnapshot(data)).toThrow(/slug|duplicate/i);
    data.posts.pop();
    data.posts[0].publishedAt = '2024-02-31';
    expect(() => validateSnapshot(data)).toThrow();
    expect(() =>
      validateSnapshot({ ...seed(), posts: [{ ...post, body: [{ _type: 'executable' }] }] }),
    ).toThrow();
  });
  it('rejects missing media and unsafe links', () => {
    expect(() => validateSnapshot({ ...seed(), assets: [] })).toThrow(/asset/i);
    expect(() =>
      validateSnapshot({
        ...seed(),
        profile: { ...profile, links: [{ label: 'Oops', href: 'javascript:alert(1)' }] },
      }),
    ).toThrow();
  });
  it('requires real image assets and alt text for optional portfolio media', () => {
    const portrait = {
      _type: 'image',
      asset: { _type: 'reference', _ref: 'photo' },
      alt: 'Sudhanshu Ranjan',
    };
    const imageAsset = {
      ...asset,
      sourceId: 'photo',
      mimeType: 'image/png',
      path: `/media/${asset.sha256}.png`,
      width: 400,
      height: 400,
    };
    const data = {
      ...seed(),
      profile: {
        ...profile,
        photo: portrait,
        projects: [
          {
            name: 'Private project',
            slug: 'private-project',
            description: 'In development',
            icon: portrait,
          },
        ],
      },
      assets: [asset, imageAsset],
    };
    expect(validateSnapshot(data).profile.photo?.alt).toBe('Sudhanshu Ranjan');
    expect(() => validateSnapshot({ ...data, assets: [asset] })).toThrow(/Missing asset/);
    expect(() =>
      validateSnapshot({ ...data, profile: { ...data.profile, photo: { ...portrait, alt: '' } } }),
    ).toThrow();
    expect(() =>
      validateSnapshot({
        ...data,
        profile: { ...data.profile, photo: { ...portrait, asset: profile.resume } },
      }),
    ).toThrow(/image asset/);
  });
});
