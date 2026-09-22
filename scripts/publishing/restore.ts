import type { Snapshot } from '../../src/modules/content/schema';

export function restoreDocuments(snapshot: Snapshot, assets: Record<string, string>) {
  function remap(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(remap);
    if (value && typeof value === 'object') {
      if ('_ref' in value && typeof value._ref === 'string') {
        if (!assets[value._ref]) throw new Error(`Missing restored asset mapping: ${value._ref}`);
        return { _type: 'reference', _ref: assets[value._ref] };
      }
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remap(item)]));
    }
    return value;
  }
  const posts = snapshot.posts.map(({ id, slug, ...post }) => ({
    ...post,
    _id: id,
    _type: 'post',
    slug: { _type: 'slug', current: slug },
  }));
  const { id, resume, ...profile } = snapshot.profile;
  // Sanity requires stable keys on object-valued array entries.
  const memberTypes: Record<string, string> = {
    rows: 'row',
    cells: 'cell',
    experience: 'experience',
    projects: 'project',
    links: 'link',
  };
  function keyed(value: unknown, field?: string): unknown {
    if (Array.isArray(value))
      return value.map((item, index) =>
        item && typeof item === 'object'
          ? {
              _key: `item${index}`,
              ...(field && memberTypes[field] ? { _type: memberTypes[field] } : {}),
              ...(keyed(item) as object),
            }
          : item,
      );
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, keyed(item, key)]),
      );
    return value;
  }
  return [
    ...posts,
    { ...profile, _id: id, _type: 'profile', resume: { _type: 'file', asset: resume } },
  ].map((doc) => keyed(remap(doc)) as Record<string, unknown> & { _id: string; _type: string });
}
