import { execFileSync } from 'node:child_process';
export const git = (root: string, ...args: string[]) =>
  execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
export function assertContentOnly(root: string) {
  const files = git(root, 'diff', '--cached', '--name-only', '-z').split('\0').filter(Boolean);
  if (
    files.some(
      (file) => !file.startsWith('content/published/') && !file.startsWith('public/media/'),
    )
  )
    throw new Error('Publication contains unexpected staged files');
  return files;
}
export function commitContent(root: string, expectedHead: string) {
  if (git(root, 'rev-parse', 'HEAD') !== expectedHead)
    throw new Error('HEAD moved; restart export from the latest main');
  if (git(root, 'diff', '--cached', '--name-only'))
    throw new Error('Refusing to mix existing staged work with publication');
  git(root, 'add', '-A', '--', 'content/published', 'public/media');
  const files = assertContentOnly(root);
  if (!files.length) return false;
  git(
    root,
    'commit',
    '-m',
    'chore(content): publish Sanity snapshot',
    '-m',
    '- Export published documents and verified original media.',
  );
  return true;
}
