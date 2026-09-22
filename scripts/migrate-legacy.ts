import { cp, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { convertMdx } from './migration/convert-mdx';
import { legacyProfile } from './migration/profile';
import { storeAsset } from './publishing/media';
import { readSnapshot, writeSnapshot, hash } from './publishing/snapshot';
import type { AssetRecord } from '../src/modules/content/schema';

const args = process.argv.slice(2);
const sourceIndex = args.indexOf('--source');
if (sourceIndex >= 0 && (!args[sourceIndex + 1] || args[sourceIndex + 1].startsWith('--')))
  throw new Error('--source requires a directory');
const source = path.resolve(sourceIndex >= 0 ? args[sourceIndex + 1] : '../portfolio-backup-remix');
const apply = args.includes('--apply');
if (apply && (existsSync('content/published') || existsSync('public/media')))
  throw new Error(
    'Initial migration requires an empty destination. Existing content will not be overwritten.',
  );
await mkdir('.staging', { recursive: true });
const stage = await mkdtemp(path.resolve('.staging/migrate-'));
try {
  const assets = new Map<string, AssetRecord>();
  async function resolveAsset(url: string) {
    if (assets.has(url)) return assets.get(url)!.sourceId;
    let bytes: Buffer;
    let mime: string;
    if (url.startsWith('/assets/')) {
      const file = path.resolve(source, 'public', url.slice(1));
      if (!file.startsWith(path.join(source, 'public/assets') + '/'))
        throw new Error('Unsafe migration asset path');
      bytes = await readFile(file);
      mime = url.endsWith('.svg')
        ? 'image/svg+xml'
        : /\.jpe?g$/.test(url)
          ? 'image/jpeg'
          : 'image/png';
    } else if (
      url ===
      'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'
    ) {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Badge download failed: ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
      mime = 'image/png';
    } else throw new Error(`Unrecognized migration media ${url}`);
    const asset = await storeAsset(stage, `legacy-${hash(url).slice(0, 24)}`, bytes, mime);
    assets.set(url, asset);
    return asset.sourceId;
  }
  const files = (await readdir(path.join(source, 'app/routes')))
    .filter((file) => /^blog\..+\.mdx$/.test(file))
    .sort();
  const posts = [];
  for (const file of files)
    posts.push(
      await convertMdx(
        await readFile(path.join(source, 'app/routes', file), 'utf8'),
        file.slice(5, -4),
        resolveAsset,
      ),
    );
  const resumeDirectory = path.join(source, 'app/assets/resume');
  const resumeFiles = (await readdir(resumeDirectory)).filter((file) => file.endsWith('.pdf'));
  if (resumeFiles.length !== 1) throw new Error('Expected one source resume');
  const resume = await storeAsset(
    stage,
    'legacy-resume',
    await readFile(path.join(resumeDirectory, resumeFiles[0])),
    'application/pdf',
  );
  await writeSnapshot(stage, {
    posts,
    profile: legacyProfile(resume.sourceId),
    assets: [...assets.values(), resume],
  });
  await readSnapshot(stage);
  console.log(
    `Validated migration: ${posts.length} posts, ${assets.size + 1} original media files.`,
  );
  if (apply) {
    // A fresh import only: never replace an existing author snapshot implicitly.
    await mkdir('content', { recursive: true });
    await cp(path.join(stage, 'content/published'), 'content/published', {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
    await cp(path.join(stage, 'public/media'), 'public/media', {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
    await cp(path.join(source, 'public/assets'), 'public/assets', {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  } else console.log('Dry run. Use --apply only for the initial migration.');
} finally {
  await rm(stage, { recursive: true, force: true });
}
