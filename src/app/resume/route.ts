import { getAsset, getProfile } from '@/modules/content';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
// Re-generated from the current snapshot on each deploy, with a stable download filename.
export const dynamic = 'force-static';
export async function GET() {
  const asset = getAsset(getProfile().resume._ref);
  const bytes = await readFile(path.join(process.cwd(), 'public', asset.path));
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Sudhanshu-Ranjan-Resume.pdf"',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      ETag: `"${asset.sha256}"`,
    },
  });
}
