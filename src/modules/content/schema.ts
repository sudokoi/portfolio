import { z } from 'zod';

const text = z.string().min(1);
const id = text.refine(
  (value) => !/^(drafts|versions)\./.test(value),
  'Only published IDs are allowed',
);
const date = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/.test(value)) return false;
  const parsed = new Date(value);
  return (
    Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value.slice(0, 10)
  );
}, 'Expected a real ISO date');
export const safeHref = z
  .string()
  .refine(
    (value) => /^(https?:\/\/|mailto:|\/(?!\/)|#)/.test(value) && !/[\u0000-\u0020\\]/.test(value),
    'Unsafe URL',
  );
export const reference = z.object({ _type: z.literal('reference'), _ref: id });
export const span = z.object({
  _type: z.literal('span'),
  _key: text,
  text: z.string(),
  marks: z.array(z.string()),
});
export const richText = z
  .object({
    _type: z.literal('block'),
    _key: text,
    style: z.enum(['normal', 'h2', 'h3', 'h4', 'blockquote']),
    listItem: z.enum(['bullet', 'number']).optional(),
    level: z.number().int().min(1).max(6).optional(),
    markDefs: z.array(z.object({ _type: z.literal('link'), _key: text, href: safeHref })),
    children: z.array(span),
  })
  .superRefine((block, ctx) => {
    const known = new Set([
      'strong',
      'em',
      'code',
      'underline',
      'strike-through',
      ...block.markDefs.map((mark) => mark._key),
    ]);
    for (const child of block.children)
      for (const mark of child.marks) {
        if (!known.has(mark))
          ctx.addIssue({ code: 'custom', message: `Unknown text mark: ${mark}` });
      }
  });
export const image = z.object({
  _type: z.literal('image'),
  _key: text,
  asset: reference,
  alt: text,
  caption: z.string().optional(),
  href: safeHref.optional(),
});
export const articleBlock = z.union([
  richText,
  image,
  z.object({ _type: z.literal('code'), _key: text, code: z.string(), language: text }),
  z.object({ _type: z.literal('gallery'), _key: text, images: z.array(image).min(1) }),
  z.object({
    _type: z.literal('table'),
    _key: text,
    rows: z
      .array(
        z.object({
          _key: text,
          cells: z.array(z.object({ _key: text, content: z.array(richText).min(1) })).min(1),
        }),
      )
      .min(1),
  }),
  z.object({
    _type: z.literal('demo'),
    _key: text,
    variant: z.enum(['halo', 'prominent', 'wrong-image', 'wrong-box']),
  }),
  z.object({ _type: z.literal('divider'), _key: text }),
]);
export const postSchema = z
  .object({
    id,
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: text,
    description: text,
    publishedAt: date,
    updatedAt: date.optional(),
    tags: z.array(text),
    body: z.array(articleBlock).min(1),
  })
  .refine(
    (post) => !post.updatedAt || new Date(post.updatedAt) >= new Date(post.publishedAt),
    'Update date precedes publication',
  );
const link = z.object({ label: text, href: safeHref });
const portfolioImage = z.object({ _type: z.literal('image'), asset: reference, alt: text });
const project = z.object({
  name: text,
  description: text,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  href: safeHref.optional(),
  playStoreUrl: z
    .url()
    .refine((value) => new URL(value).origin === 'https://play.google.com')
    .optional(),
  status: z.enum(['released', 'in-development']).optional(),
  platform: text.optional(),
  highlights: z.array(text).optional(),
  stack: z.array(text).optional(),
  icon: portfolioImage.optional(),
  screenshot: portfolioImage.optional(),
});
export const profileSchema = z.object({
  id,
  name: text,
  role: text,
  photo: portfolioImage.optional(),
  introduction: z.array(text).min(1),
  aside: text,
  experience: z.array(
    z.object({
      company: text,
      href: safeHref,
      role: text,
      period: text,
      highlights: z.array(text),
    }),
  ),
  projects: z.array(project),
  skills: z.array(text),
  links: z.array(link),
  resume: reference,
});
export const assetSchema = z
  .object({
    sourceId: id,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    path: z.string().regex(/^\/media\/[a-f0-9]{64}\.(png|jpe?g|webp|gif|svg|avif|pdf)$/),
    mimeType: z.enum([
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
      'application/pdf',
    ]),
    bytes: z
      .number()
      .int()
      .positive()
      .max(50 * 1024 * 1024),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  })
  .superRefine((asset, ctx) => {
    if (!asset.path.includes(asset.sha256))
      ctx.addIssue({ code: 'custom', message: 'Asset filename must contain its digest' });
    if (asset.mimeType.startsWith('image/') && (!asset.width || !asset.height))
      ctx.addIssue({ code: 'custom', message: 'Image dimensions are required' });
  });
export type ArticleBlock = z.infer<typeof articleBlock>;
export type TextBlock = z.infer<typeof richText>;
export type PublishedPost = z.infer<typeof postSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type AssetRecord = z.infer<typeof assetSchema>;
export type Snapshot = { posts: PublishedPost[]; profile: Profile; assets: AssetRecord[] };

export function assetReferences(value: unknown): Set<string> {
  const refs = new Set<string>();
  function visit(node: unknown) {
    if (!node || typeof node !== 'object') return;
    if ('_ref' in node && typeof node._ref === 'string') refs.add(node._ref);
    for (const child of Object.values(node)) visit(child);
  }
  visit(value);
  return refs;
}

export function validateSnapshot(input: unknown): Snapshot {
  const data = z
    .object({ posts: z.array(postSchema), profile: profileSchema, assets: z.array(assetSchema) })
    .parse(input);
  for (const [label, values] of [
    ['slug', data.posts.map((post) => post.slug)],
    ['document ID', [...data.posts.map((post) => post.id), data.profile.id]],
    ['asset ID', data.assets.map((asset) => asset.sourceId)],
  ] as const) {
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`);
  }
  const assets = new Map(data.assets.map((asset) => [asset.sourceId, asset]));
  for (const ref of assetReferences([data.posts, data.profile]))
    if (!assets.has(ref)) throw new Error(`Missing asset: ${ref}`);
  if (assets.get(data.profile.resume._ref)?.mimeType !== 'application/pdf')
    throw new Error('Resume must reference a PDF asset');
  if (
    data.profile.photo &&
    !assets.get(data.profile.photo.asset._ref)?.mimeType.startsWith('image/')
  )
    throw new Error('Profile photo must reference an image asset');
  for (const project of data.profile.projects) {
    for (const image of [project.icon, project.screenshot]) {
      if (image && !assets.get(image.asset._ref)?.mimeType.startsWith('image/'))
        throw new Error('Project media must reference an image asset');
    }
  }
  return data;
}
