export const SITE_ORIGIN = 'https://sudh.online';
export const SITE_TITLE = "Sudhanshu's Corner";
export const canonical = (path = '/') => new URL(path, SITE_ORIGIN).href;
export const indexable =
  process.env.SITE_INDEXABLE === 'true' && process.env.VERCEL_ENV !== 'preview';
