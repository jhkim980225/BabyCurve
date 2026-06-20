'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n';
import { LanguageSelect } from '@/components/LanguageSelect';

const LOCALE_STORAGE_KEY = 'babycurve.locale';

/**
 * Best-match a BCP-47 language tag against our LOCALES list.
 * Strategy: exact match → language+region prefix → language prefix → default.
 */
function bestMatchLocale(browserLang: string): string {
  const lower = browserLang.toLowerCase();
  // Exact match (case-insensitive)
  const exact = LOCALES.find((l) => l.code.toLowerCase() === lower);
  if (exact) return exact.code;
  // Language-region: e.g. navigator.language='zh-tw' should match 'zh-TW'
  const normalized = LOCALES.find(
    (l) => l.code.toLowerCase() === lower.replace('_', '-'),
  );
  if (normalized) return normalized.code;
  // Language prefix: e.g. 'zh-hans' → 'zh-CN' or 'en-US' → 'en'
  const prefix = lower.split('-')[0];
  const byPrefix = LOCALES.find((l) => l.code.toLowerCase().startsWith(prefix));
  if (byPrefix) return byPrefix.code;
  return DEFAULT_LOCALE;
}

type PageState = 'loading' | 'selector' | 'redirecting';

export default function RootPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');

  useEffect(() => {
    const stored =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(LOCALE_STORAGE_KEY)
        : null;

    if (stored && LOCALES.some((l) => l.code === stored)) {
      // Stored preference → navigate directly
      router.replace('/' + stored);
      setState('redirecting');
    } else {
      // No stored preference → show the language selector
      setState('selector');
    }
  }, [router]);

  if (state === 'loading' || state === 'redirecting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-slate-400 text-sm">Loading…</span>
      </div>
    );
  }

  // state === 'selector'
  return <LanguageSelect />;
}
