import type { MetadataRoute } from 'next';
import { canonical, indexable } from '@/shared/config/site';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      ...(indexable ? { allow: '/', disallow: '/mcp' } : { disallow: '/' }),
    },
    ...(indexable ? { sitemap: canonical('/sitemap.xml') } : {}),
  };
}
