import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { codeInput } from '@sanity/code-input';
import { schemaTypes } from './schemaTypes';
export default defineConfig({
  name: 'portfolio',
  title: "Sudhanshu's Corner",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'unconfigured',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (builder) =>
        builder
          .list()
          .title('Content')
          .items([
            builder.documentTypeListItem('post').title('Articles'),
            builder
              .listItem()
              .title('Portfolio profile')
              .child(builder.document().schemaType('profile').documentId('profile')),
          ]),
    }),
    codeInput(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((template) => template.schemaType !== 'profile'),
  },
  document: {
    actions: (actions, context) =>
      context.schemaType === 'profile'
        ? actions.filter(
            (action) =>
              action.action !== 'duplicate' &&
              action.action !== 'delete' &&
              action.action !== 'unpublish',
          )
        : actions,
  },
});
