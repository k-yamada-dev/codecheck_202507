import React from 'react';
import { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import ErrorBoundary from '@/components/ErrorBoundary';
import Providers from '@/providers/AppProviders';
import ClientProvider from '@/components/ClientProvider';
import { dir } from 'i18next';
import '@/styles/globals.css';
import { cn, isValidLanguage } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isValidLanguage(params.locale) ? params.locale : 'ja';
  const t = await getT(locale, ['common']);
  return {
    title: t('common:appName'),
    description: t('metaDescription', 'A watermarking SaaS platform'),
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isValidLanguage(params.locale) ? params.locale : 'ja';

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ErrorBoundary>
          <Providers>
            <ClientProvider>
              <div className="flex">
                <Sidebar />
                <main className="flex-1 flex flex-col">
                  <Header />
                  <div className="p-6">{children}</div>
                </main>
              </div>
            </ClientProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
