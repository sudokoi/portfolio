import { afterEach, expect, it, vi } from 'vitest';
import { liveSource } from '../../scripts/publishing/export-content';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('downloads authenticated originals and rejects foreign origins before sending credentials', async () => {
  vi.stubEnv('SANITY_PROJECT_ID', 'testproject');
  vi.stubEnv('SANITY_DATASET', 'production');
  vi.stubEnv('SANITY_READ_TOKEN', 'test-only-token');
  const fetcher = vi.fn(async () => new Response(new Uint8Array([1, 2, 3])));
  vi.stubGlobal('fetch', fetcher);
  const source = liveSource();
  const asset = {
    _id: 'image-test',
    url: 'https://cdn.sanity.io/images/testproject/production/original.jpg',
    mimeType: 'image/jpeg',
    size: 3,
  };
  expect(await source.bytes(asset)).toEqual(Buffer.from([1, 2, 3]));
  expect(fetcher).toHaveBeenCalledWith(
    new URL(`${asset.url}?dlRaw=original.jpg`),
    expect.objectContaining({
      headers: { Authorization: 'Bearer test-only-token' },
      redirect: 'error',
    }),
  );
  await expect(
    source.bytes({ ...asset, url: 'https://other.example/original.jpg' }),
  ).rejects.toThrow('origin');
  expect(fetcher).toHaveBeenCalledTimes(1);
});
