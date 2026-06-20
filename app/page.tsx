'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES } from '@/lib/i18n';
import { LanguageSelect } from '@/components/LanguageSelect';

const LOCALE_STORAGE_KEY = 'babycurve.locale';

type PageState = 'loading' | 'selector' | 'redirecting';

export default function RootPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');

  useEffect(() => {
    const stored =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(LOCALE_STORAGE_KEY)
        : null;

    const valid = !!stored && LOCALES.some((l) => l.code === stored);
    if (valid) {
      // Stored preference → navigate directly
      router.replace('/' + stored);
    }
    // One-time, client-only locale routing decision; intentional single setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(valid ? 'redirecting' : 'selector');
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
