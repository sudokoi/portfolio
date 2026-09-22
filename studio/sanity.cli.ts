import { defineCliConfig } from 'sanity/cli';
export default defineCliConfig({
  deployment: { appId: 'bywe25l4l1yblljr29x5mop6' },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'unconfigured',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
});
