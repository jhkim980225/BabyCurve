import enMessages from '@/messages/en.json';
import esMXMessages from '@/messages/es-MX.json';
import jaMessages from '@/messages/ja.json';
import zhTWMessages from '@/messages/zh-TW.json';
import zhCNMessages from '@/messages/zh-CN.json';
import koMessages from '@/messages/ko.json';
import thMessages from '@/messages/th.json';
import viMessages from '@/messages/vi.json';
import idMessages from '@/messages/id.json';

export interface LocaleInfo {
  code: string;
  name: string;
}

export const LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English' },
  { code: 'es-MX', name: 'Español (México)' },
  { code: 'ja', name: '日本語' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'ko', name: '한국어' },
  { code: 'th', name: 'ภาษาไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
];

export const DEFAULT_LOCALE = 'en';

export function isLocale(x: string): boolean {
  return LOCALES.some((l) => l.code === x);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

const messageMap: Record<string, Messages> = {
  en: enMessages,
  'es-MX': esMXMessages,
  ja: jaMessages,
  'zh-TW': zhTWMessages,
  'zh-CN': zhCNMessages,
  ko: koMessages,
  th: thMessages,
  vi: viMessages,
  id: idMessages,
};

export function getMessages(locale: string): Messages {
  return messageMap[locale] ?? messageMap[DEFAULT_LOCALE];
}
