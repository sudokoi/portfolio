import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getCliClient } from 'sanity/cli';

// Run via `sanity exec ... --with-user-token`; the credential stays in child-process memory.
const { projectId, dataset, token } = getCliClient({ apiVersion: '2026-09-01' }).config();
if (!token) throw new Error('Sign in with sanity login and pass --with-user-token.');
execFileSync(
  process.execPath,
  [
    '--import',
    'tsx',
    'scripts/restore-content.ts',
    process.argv.includes('--apply') ? '--apply' : '--dry-run',
  ],
  {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    env: {
      ...process.env,
      SANITY_PROJECT_ID: projectId,
      SANITY_DATASET: dataset,
      SANITY_WRITE_TOKEN: token,
    },
    stdio: 'inherit',
  },
);
