import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n';
import enMessages from '@/messages/en.json';

export const BASE_URL = 'https://babycurve.app';
export const OG_IMAGE = '/og.png';

export function localePath(locale: string, path = ''): string {
  return '/' + locale + path;
}

export function buildAlternates(
  locale: string = DEFAULT_LOCALE,
  path = '',
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const languages: Record<string, string> = {};

  for (const { code } of LOCALES) {
    languages[code] = BASE_URL + '/' + code + path;
  }
  languages['x-default'] = BASE_URL + '/en' + path;

  return {
    // Canonical points at the current locale's own URL, not always the default,
    // so non-English pages are not treated as duplicates of English.
    canonical: BASE_URL + '/' + locale + path,
    languages,
  };
}

export function buildJsonLd(
  locale: string,
  description?: string,
): {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  applicationCategory: string;
  inLanguage: string;
  isAccessibleForFree: boolean;
  url: string;
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BabyCurve',
    description: description ?? enMessages.app.description,
    applicationCategory: 'MedicalApplication',
    inLanguage: locale,
    isAccessibleForFree: true,
    url: BASE_URL + '/' + locale,
  };
}
