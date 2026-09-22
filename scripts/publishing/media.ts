import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { assetSchema, type AssetRecord } from '../../src/modules/content/schema';
import { hash } from './snapshot';

const extensions: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};
export async function storeAsset(
  root: string,
  sourceId: string,
  bytes: Buffer,
  mimeType: string,
): Promise<AssetRecord> {
  const extension = extensions[mimeType];
  if (!extension || bytes.length > 50 * 1024 * 1024)
    throw new Error('Unsupported asset type or size');
  if (mimeType === 'application/pdf' && !bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
    throw new Error('Invalid PDF');
  const metadata = mimeType.startsWith('image/') ? await sharp(bytes).metadata() : undefined;
  if (
    metadata &&
    `image/${metadata.format === 'svg' ? 'svg+xml' : metadata.format === 'heif' ? 'avif' : metadata.format}` !==
      mimeType
  )
    throw new Error('Image format does not match its declared MIME type');
  const sha256 = hash(bytes);
  const asset = assetSchema.parse({
    sourceId,
    sha256,
    path: `/media/${sha256}.${extension}`,
    mimeType,
    bytes: bytes.length,
    ...(metadata ? { width: metadata.width, height: metadata.height } : {}),
  });
  await mkdir(path.join(root, 'public/media'), { recursive: true });
  await writeFile(path.join(root, 'public', asset.path), bytes);
  return asset;
}
