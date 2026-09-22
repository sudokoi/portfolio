import { rm } from 'node:fs/promises';
import { exportContent, liveSource } from './publishing/export-content';
import { readSnapshot } from './publishing/snapshot';
const { stage, digest } = await exportContent(process.cwd(), liveSource(), await readSnapshot());
console.log(`Validated published export ${digest}. Dry run; Git snapshot unchanged.`);
await rm(stage, { recursive: true, force: true });
