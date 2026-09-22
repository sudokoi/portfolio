import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { getCliClient } from 'sanity/cli';

loadEnvFile(fileURLToPath(new URL('../../.env.local', import.meta.url)));
const client = getCliClient({ apiVersion: '2025-08-04' }).withConfig({
  useProjectHostname: false,
  useCdn: false,
});
const { projectId, dataset, token } = client.config();
const publishingToken = process.env.CONTENT_PUBLISH_TOKEN;
if (!token || !publishingToken)
  throw new Error('Sanity login and CONTENT_PUBLISH_TOKEN are required.');
const uri = `/hooks/projects/${projectId}`;
const name = 'Portfolio published snapshot';
type Hook = { id: string; name: string };
const hooks = await client.request<Hook[]>({ url: uri });
const matches = hooks.filter((hook) => hook.name === name);
if (matches.length > 1) throw new Error('Duplicate publishing hooks; reconcile in Sanity Manage.');
const body = {
  name,
  description: 'Export the current published website snapshot to sudokoi/portfolio.',
  dataset,
  url: 'https://api.github.com/repos/sudokoi/portfolio/dispatches',
  httpMethod: 'POST',
  apiVersion: 'v2021-03-25',
  includeDrafts: false,
  includeAllVersions: false,
  isDisabledByUser: false,
  rule: {
    on: ['create', 'update', 'delete'],
    filter:
      '_type in ["post", "profile"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))',
    projection: '{"event_type": "sanity-published"}',
  },
  headers: {
    Authorization: `Bearer ${publishingToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
};
const existing = matches[0];
// Do not log the request/response: webhook headers contain the dispatch credential.
try {
  await client.request({
    url: existing ? `${uri}/${existing.id}` : uri,
    method: existing ? 'PATCH' : 'POST',
    body: existing ? body : { ...body, type: 'document' },
  });
  console.log(`Configured published-only webhook for ${projectId}/${dataset}.`);
} catch (error) {
  const status =
    error && typeof error === 'object' && 'statusCode' in error ? error.statusCode : 'unknown';
  const message =
    error instanceof Error
      ? error.message.replaceAll(publishingToken, '[redacted]').replaceAll(token, '[redacted]')
      : 'Unknown error';
  throw new Error(`Webhook configuration failed (HTTP ${status}): ${message}`);
}
