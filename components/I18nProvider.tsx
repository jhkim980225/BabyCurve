'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { getMessages, DEFAULT_LOCALE } from '@/lib/i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

interface I18nContextValue {
  locale: string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  messages: getMessages(DEFAULT_LOCALE),
});

interface I18nProviderProps {
  locale: string;
  messages: Messages;
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  // Set document lang client-side (root layout keeps lang="en" statically)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Get a translation function. When called outside an I18nProvider the context
 * defaults to English messages, so isolated unit tests continue to see English
 * text without needing a wrapper.
 *
 * t('form.calculate')           → "Calculate"
 * t('dev.heading', { week: 12}) → "Week 12 — Development"
 */
export function useT() {
  const { messages } = useContext(I18nContext);

  function t(key: string, vars?: Record<string, string | number>): string {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = messages;
    for (const part of parts) {
      if (node == null || typeof node !== 'object') {
        return key; // fallback to key
      }
      node = node[part];
    }
    if (typeof node !== 'string') {
      return key; // fallback to key
    }
    if (vars) {
      return node.replace(/\{(\w+)\}/g, (_, name) =>
        vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
      );
    }
    return node;
  }

  return t;
}
