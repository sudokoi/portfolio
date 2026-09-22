import { createClient } from '@sanity/client';
export function sanityClient(write = false) {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';
  if (!projectId || !/^[a-z0-9]+$/.test(projectId) || !/^[a-z0-9_-]+$/.test(dataset))
    throw new Error('Configure SANITY_PROJECT_ID and SANITY_DATASET first.');
  const token = write ? process.env.SANITY_WRITE_TOKEN : process.env.SANITY_READ_TOKEN;
  if (write && !token)
    throw new Error('SANITY_WRITE_TOKEN is required only for an explicit restore/import.');
  return createClient({
    projectId,
    dataset,
    apiVersion: '2026-09-01',
    useCdn: false,
    perspective: 'published',
    token,
  });
}
