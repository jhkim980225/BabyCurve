import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE, isLocale, getMessages } from './i18n';

// Recursively collect all leaf key paths from a nested object
// (skipping the _meta key used in non-en files)
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k === '_meta') continue;
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

describe('i18n', () => {
  it('exports LOCALES with 9 entries', () => {
    expect(LOCALES).toHaveLength(9);
  });

  it('DEFAULT_LOCALE is "en"', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('isLocale returns true for every locale code', () => {
    for (const { code } of LOCALES) {
      expect(isLocale(code)).toBe(true);
    }
  });

  it('isLocale returns false for unknown locales', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('xx')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('getMessages("en") returns an object with expected keys', () => {
    const msgs = getMessages('en');
    expect(msgs).toBeDefined();
    expect(typeof msgs).toBe('object');
    expect(msgs.form).toBeDefined();
    expect(msgs.form.calculate).toBe('Calculate');
  });

  it('getMessages falls back to en for unknown locales', () => {
    const msgs = getMessages('fr-unknown');
    expect(msgs).toEqual(getMessages('en'));
  });

  it('all locale files have the same key set as en.json', () => {
    const enKeys = collectKeys(getMessages('en') as Record<string, unknown>);

    for (const { code } of LOCALES) {
      if (code === 'en') continue;
      const localeKeys = collectKeys(getMessages(code) as Record<string, unknown>);
      expect(localeKeys, `Locale "${code}" key set must match en.json`).toEqual(enKeys);
    }
  });

  it('getMessages("es-MX") returns an object with the same keys as en', () => {
    const enKeys = collectKeys(getMessages('en') as Record<string, unknown>);
    const esMXKeys = collectKeys(getMessages('es-MX') as Record<string, unknown>);
    expect(esMXKeys).toEqual(enKeys);
  });
});
