import { socialImage } from '@/modules/seo';
export const alt = "Sudhanshu's Corner";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';
export default function Image() {
  return socialImage(
    'A small corner of the internet.',
    'Frontend engineering, personal projects, and things learned along the way. By Sudhanshu Ranjan.',
  );
}
