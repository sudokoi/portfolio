import { readSnapshot } from './publishing/snapshot';
const data = await readSnapshot(process.argv[2] || process.cwd());
console.log(
  `Validated ${data.posts.length} published articles and ${data.assets.length} original assets.`,
);
