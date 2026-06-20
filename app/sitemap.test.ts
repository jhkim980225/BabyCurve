import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { BASE_URL } from '@/lib/seo';
import { LOCALES } from '@/lib/i18n';

describe('sitemap', () => {
  it('returns 9 entries (one per locale)', () => {
    const entries = sitemap();
    expect(entries).toHaveLength(9);
  });

  it('each entry URL matches the expected locale URL', () => {
    const entries = sitemap();
    for (let i = 0; i < LOCALES.length; i++) {
      expect(entries[i].url).toBe(BASE_URL + '/' + LOCALES[i].code);
    }
  });

  it('each entry has alternates.languages with all 9 locales', () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.alternates).toBeDefined();
      const langs = (entry.alternates as { languages: Record<string, string> }).languages;
      expect(Object.keys(langs)).toHaveLength(9);
      for (const { code } of LOCALES) {
        expect(langs[code]).toBe(BASE_URL + '/' + code);
      }
    }
  });

  it('each entry has a lastModified date', () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(entry.lastModified).toBeDefined();
    }
  });
});
