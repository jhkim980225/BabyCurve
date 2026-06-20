import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n';
import { BASE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map(({ code }) => {
    const url = BASE_URL + '/' + code;
    const languagesMap: Record<string, string> = {};
    for (const { code: lc } of LOCALES) {
      languagesMap[lc] = BASE_URL + '/' + lc;
    }
    languagesMap['x-default'] = BASE_URL + '/en';
    return {
      url,
      lastModified: new Date('2025-06-01'),
      alternates: {
        languages: languagesMap,
      },
    };
  });
}
