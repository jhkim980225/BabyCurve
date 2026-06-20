import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { LOCALES, isLocale, getMessages } from '@/lib/i18n';
import { LocaleShell } from '@/components/LocaleShell';
import { buildAlternates, buildJsonLd, OG_IMAGE, BASE_URL } from '@/lib/seo';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return LOCALES.map(({ code }) => ({ locale: code }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  const messages = getMessages(locale);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app = (messages as any).app ?? {};
  const brand: string = app.brand ?? 'BabyCurve';
  const title: string = app.title ?? 'Fetal Growth Calculator';
  const description: string = app.description ?? '';

  const fullTitle = `${brand} · ${title}`;
  const alternates = buildAlternates();
  const localeUrl = BASE_URL + '/' + locale;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages as Record<string, string>,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: localeUrl,
      locale,
      type: 'website',
      images: [OG_IMAGE],
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const jsonLd = buildJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocaleShell locale={locale}>
        {children}
      </LocaleShell>
    </>
  );
}
