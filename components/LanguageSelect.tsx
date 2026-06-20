'use client';

import { useRouter } from 'next/navigation';
import { LOCALES } from '@/lib/i18n';

const LOCALE_STORAGE_KEY = 'babycurve.locale';

/**
 * Full-screen first-entry language selector.
 * Lists all 9 locales in their native names.
 * On selection: stores the preference and navigates to that locale route.
 */
export function LanguageSelect() {
  const router = useRouter();

  const handleSelect = (code: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, code);
    }
    router.replace('/' + code);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white/80 backdrop-blur-md p-8"
      data-testid="language-select"
    >
      <h1 className="text-2xl font-bold text-blue-900">Choose your language</h1>
      <ul className="flex flex-col gap-3 w-full max-w-xs">
        {LOCALES.map(({ code, name }) => (
          <li key={code}>
            <button
              onClick={() => handleSelect(code)}
              className="w-full rounded-xl border border-blue-200 bg-white/70 px-4 py-3 text-left text-lg font-medium text-blue-900 shadow-sm backdrop-blur hover:bg-blue-50 hover:border-blue-400 transition-colors"
              data-testid={`locale-btn-${code}`}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
