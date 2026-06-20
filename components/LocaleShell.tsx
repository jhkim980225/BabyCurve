'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@/components/I18nProvider';
import { getMessages } from '@/lib/i18n';

interface LocaleShellProps {
  locale: string;
  children: ReactNode;
}

export function LocaleShell({ locale, children }: LocaleShellProps) {
  const messages = getMessages(locale);
  return (
    <I18nProvider locale={locale} messages={messages}>
      {children}
    </I18nProvider>
  );
}
