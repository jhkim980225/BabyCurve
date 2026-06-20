'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LOCALES } from '@/lib/i18n';
import { useContext } from 'react';

const LOCALE_STORAGE_KEY = 'babycurve.locale';

/**
 * Compact language switcher for the header.
 * Reads the current locale from the URL path, stores the new preference
 * in localStorage, and navigates to the new locale route.
 */
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // Derive current locale from pathname: /en/... → 'en'
  const pathParts = (pathname ?? '').split('/').filter(Boolean);
  const currentLocale = LOCALES.find((l) => l.code === pathParts[0])?.code ?? 'en';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, code);
    }
    router.replace('/' + code);
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      aria-label="language"
      className="rounded-lg border border-blue-200 bg-white/70 px-2 py-1 text-xs text-blue-900 backdrop-blur"
      data-testid="language-switcher"
    >
      {LOCALES.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
