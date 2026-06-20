import { describe, it, expect } from 'vitest';
import { buildAlternates, buildJsonLd, BASE_URL, OG_IMAGE } from './seo';
import { LOCALES } from './i18n';

describe('seo', () => {
  describe('buildAlternates', () => {
    it('defaults canonical to the en locale', () => {
      const alternates = buildAlternates();
      expect(alternates.canonical).toBe(BASE_URL + '/en');
    });

    it('sets canonical to the given locale (no duplicate-of-en)', () => {
      expect(buildAlternates('ja').canonical).toBe(BASE_URL + '/ja');
      expect(buildAlternates('zh-TW').canonical).toBe(BASE_URL + '/zh-TW');
    });

    it('languages includes all 9 locale keys', () => {
      const { languages } = buildAlternates();
      for (const { code } of LOCALES) {
        expect(languages).toHaveProperty(code);
        expect(languages[code]).toBe(BASE_URL + '/' + code);
      }
      expect(Object.keys(languages)).toHaveLength(10); // 9 locales + x-default
    });

    it('languages includes x-default pointing to /en', () => {
      const { languages } = buildAlternates();
      expect(languages['x-default']).toBe(BASE_URL + '/en');
    });

    it('path argument is appended to all URLs', () => {
      const { canonical, languages } = buildAlternates('en', '/some/path');
      expect(canonical).toBe(BASE_URL + '/en/some/path');
      expect(languages['en']).toBe(BASE_URL + '/en/some/path');
      expect(languages['x-default']).toBe(BASE_URL + '/en/some/path');
    });
  });

  describe('buildJsonLd', () => {
    it('returns a WebApplication schema', () => {
      const ld = buildJsonLd('ja');
      expect(ld['@type']).toBe('WebApplication');
    });

    it('sets inLanguage to the given locale', () => {
      expect(buildJsonLd('ja').inLanguage).toBe('ja');
      expect(buildJsonLd('ko').inLanguage).toBe('ko');
      expect(buildJsonLd('en').inLanguage).toBe('en');
    });

    it('has expected top-level fields', () => {
      const ld = buildJsonLd('en');
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld.name).toBe('BabyCurve');
      expect(ld.applicationCategory).toBe('MedicalApplication');
      expect(ld.isAccessibleForFree).toBe(true);
      expect(ld.url).toBe(BASE_URL + '/en');
    });

    it('description is a non-empty string', () => {
      const ld = buildJsonLd('en');
      expect(typeof ld.description).toBe('string');
      expect(ld.description.length).toBeGreaterThan(0);
    });
  });

  describe('constants', () => {
    it('BASE_URL is set correctly', () => {
      expect(BASE_URL).toBe('https://babycurve.app');
    });

    it('OG_IMAGE is set correctly', () => {
      expect(OG_IMAGE).toBe('/og.png');
    });
  });
});
