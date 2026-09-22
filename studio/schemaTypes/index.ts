import { defineType, defineField, defineArrayMember } from 'sanity';

const requiredText = (name: string, title?: string) =>
  defineField({ name, title, type: 'string', validation: (rule) => rule.required() });
const url = (name = 'href') =>
  defineField({
    name,
    type: 'url',
    validation: (rule) =>
      rule.required().uri({ scheme: ['http', 'https', 'mailto'], allowRelative: true }),
  });
const richText = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Paragraph', value: 'normal' },
    { title: 'Heading', value: 'h2' },
    { title: 'Subheading', value: 'h3' },
    { title: 'Small heading', value: 'h4' },
    { title: 'Quote', value: 'blockquote' },
  ],
  marks: {
    decorators: [
      { title: 'Bold', value: 'strong' },
      { title: 'Italic', value: 'em' },
      { title: 'Code', value: 'code' },
      { title: 'Strikethrough', value: 'strike-through' },
    ],
    annotations: [{ name: 'link', type: 'object', fields: [url()] }],
  },
});
const imageFields = [
  requiredText('alt', 'Alternative text'),
  defineField({ name: 'caption', type: 'string' }),
  defineField({
    name: 'href',
    title: 'Optional image link',
    type: 'url',
    validation: (rule) => rule.uri({ scheme: ['http', 'https'], allowRelative: true }),
  }),
];
const articleImage = defineArrayMember({
  type: 'image',
  options: { hotspot: false },
  fields: imageFields,
  validation: (rule) => rule.required().assetRequired(),
});
const gallery = defineType({
  name: 'gallery',
  title: 'Screenshot gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      of: [articleImage],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});
const cell = defineArrayMember({
  type: 'object',
  name: 'cell',
  fields: [
    defineField({
      name: 'content',
      type: 'array',
      of: [richText],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare: ({ content }) => ({
      title: content?.[0]?.children?.map((span: { text: string }) => span.text).join('') || 'Cell',
    }),
  },
});
const row = defineArrayMember({
  type: 'object',
  name: 'row',
  fields: [
    defineField({
      name: 'cells',
      type: 'array',
      of: [cell],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});
const table = defineType({
  name: 'table',
  title: 'Table (first row is the header)',
  type: 'object',
  fields: [
    defineField({
      name: 'rows',
      type: 'array',
      of: [row],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});
const demo = defineType({
  name: 'demo',
  title: 'Live CSS demonstration',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      type: 'string',
      initialValue: 'halo',
      options: {
        list: [
          { title: 'Halo (solution)', value: 'halo' },
          { title: 'Prominent pink halo', value: 'prominent' },
          { title: 'Attempt 1: pulsing image', value: 'wrong-image' },
          { title: 'Attempt 2: square halo', value: 'wrong-box' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
const divider = defineType({
  name: 'divider',
  type: 'object',
  fields: [defineField({ name: 'label', type: 'string', hidden: true, initialValue: 'Divider' })],
  preview: { prepare: () => ({ title: 'Divider' }) },
});
const post = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  fields: [
    requiredText('title'),
    defineField({
      name: 'slug',
      type: 'slug',
      description:
        'Keep this stable after publication. Published slug changes are rejected by the exporter.',
      options: { source: 'title', maxLength: 150 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publication date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'updatedAt', title: 'Last substantive update (optional)', type: 'date' }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      initialValue: [],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        richText,
        { type: 'code', options: { withFilename: false } },
        articleImage,
        { type: 'gallery' },
        { type: 'table' },
        { type: 'demo' },
        { type: 'divider' },
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
const profile = defineType({
  name: 'profile',
  title: 'Portfolio profile',
  type: 'document',
  fields: [
    requiredText('name'),
    requiredText('role'),
    defineField({
      name: 'photo',
      title: 'Profile photo (optional)',
      type: 'image',
      description:
        'Shown beside your introduction. A square head-and-shoulders portrait, at least 400 × 400 pixels, works best. Non-square images are center-cropped on the website. Remove this field to use the text-only layout.',
      options: { hotspot: false, accept: 'image/jpeg,image/png,image/webp,image/avif' },
      fields: [requiredText('alt', 'Alternative text')],
      validation: (rule) => rule.assetRequired(),
    }),
    defineField({
      name: 'introduction',
      type: 'array',
      of: [{ type: 'text' }],
      validation: (rule) => rule.required().min(1),
    }),
    requiredText('aside'),
    defineField({
      name: 'experience',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'experience',
          fields: [
            requiredText('company'),
            url(),
            requiredText('role'),
            requiredText('period'),
            defineField({ name: 'highlights', type: 'array', of: [{ type: 'string' }] }),
          ],
        },
      ],
    }),
    defineField({
      name: 'projects',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'project',
          fields: [
            requiredText('name'),
            defineField({
              name: 'slug',
              type: 'string',
              description: 'Stable section link, such as expense-buddy.',
              validation: (rule) => rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            }),
            defineField({
              name: 'description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'status',
              type: 'string',
              options: {
                list: [
                  { title: 'Released', value: 'released' },
                  { title: 'In development', value: 'in-development' },
                ],
              },
            }),
            defineField({ name: 'platform', type: 'string' }),
            defineField({
              name: 'highlights',
              title: 'What makes it useful',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'stack',
              title: 'Built with',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'href',
              title: 'Public source URL (optional)',
              type: 'url',
              validation: (rule) => rule.uri({ scheme: ['https'] }),
            }),
            defineField({
              name: 'playStoreUrl',
              title: 'Google Play URL (optional)',
              type: 'url',
              validation: (rule) =>
                rule
                  .uri({ scheme: ['https'] })
                  .custom(
                    (value) =>
                      !value ||
                      new URL(value).origin === 'https://play.google.com' ||
                      'Use a Google Play URL',
                  ),
            }),
            ...['icon', 'screenshot'].map((name) =>
              defineField({
                name,
                type: 'image',
                options: { hotspot: false },
                fields: [requiredText('alt', 'Alternative text')],
                validation: (rule) => rule.assetRequired(),
              }),
            ),
          ],
        },
      ],
    }),
    defineField({ name: 'skills', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'links',
      type: 'array',
      of: [{ type: 'object', name: 'link', fields: [requiredText('label'), url()] }],
    }),
    defineField({
      name: 'resume',
      type: 'file',
      options: { accept: 'application/pdf' },
      validation: (rule) => rule.required().assetRequired(),
    }),
  ],
});
export const schemaTypes = [post, profile, gallery, table, demo, divider];
