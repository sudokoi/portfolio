import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getCliClient } from 'sanity/cli';

const { projectId, dataset, token } = getCliClient({ apiVersion: '2026-09-01' }).config();
if (!token) throw new Error('Sign in with sanity login and pass --with-user-token.');
execFileSync(process.execPath, ['--import', 'tsx', 'scripts/export-content.ts'], {
  cwd: fileURLToPath(new URL('../../', import.meta.url)),
  env: {
    ...process.env,
    SANITY_PROJECT_ID: projectId,
    SANITY_DATASET: dataset,
    SANITY_READ_TOKEN: token,
  },
  stdio: 'inherit',
});
