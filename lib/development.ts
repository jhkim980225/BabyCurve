import enData from '@/data/development/en.json';

export interface DevelopmentInfo {
  sizeComparison: string;
  milestone: string;
}

type LocaleData = Record<string, DevelopmentInfo | { note: string }>;

const localeCache: Record<string, LocaleData> = {
  en: enData as LocaleData,
};

function loadLocale(locale: string): LocaleData {
  if (localeCache[locale]) return localeCache[locale];
  // Only 'en' exists; any other locale falls back to en
  return localeCache['en'];
}

export function getDevelopmentInfo(
  week: number,
  locale: string = 'en',
): DevelopmentInfo | null {
  const data = loadLocale(locale);
  const key = String(Math.floor(week));
  const entry = data[key];
  // Ignore _meta key and missing entries
  if (!entry || '_meta' in data && key === '_meta') return null;
  if ('note' in entry) return null;
  return entry as DevelopmentInfo;
}
