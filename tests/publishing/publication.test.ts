import { afterEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { git, commitContent, assertContentOnly } from '../../scripts/publishing/git';
let root: string;
afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});
async function repo() {
  root = await mkdtemp(path.join(tmpdir(), 'portfolio-git-'));
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'user.email', 'test@example.com');
  await mkdir(path.join(root, 'content/published'), { recursive: true });
  await mkdir(path.join(root, 'public/media'), { recursive: true });
  await writeFile(path.join(root, 'content/published/post.json'), '{}');
  await writeFile(path.join(root, 'public/media/file.pdf'), 'pdf');
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'initial');
  return git(root, 'rev-parse', 'HEAD');
}
it('commits content atomically and leaves no-op HEAD unchanged', async () => {
  const head = await repo();
  expect(commitContent(root, head)).toBe(false);
  expect(git(root, 'rev-parse', 'HEAD')).toBe(head);
  await writeFile(path.join(root, 'content/published/post.json'), '{"title":"New"}');
  await writeFile(path.join(root, 'public/media/new.pdf'), 'new');
  expect(commitContent(root, head)).toBe(true);
  expect(git(root, 'show', '--pretty=', '--name-only', 'HEAD').split('\n')).toEqual([
    'content/published/post.json',
    'public/media/new.pdf',
  ]);
});
it('refuses staged code and a changed base', async () => {
  const head = await repo();
  await writeFile(path.join(root, 'code.ts'), 'export {};');
  git(root, 'add', 'code.ts');
  expect(() => assertContentOnly(root)).toThrow(/unexpected/);
  expect(() => commitContent(root, head)).toThrow(/staged/);
  git(root, 'commit', '-m', 'concurrent code');
  expect(() => commitContent(root, head)).toThrow(/HEAD moved/);
});
