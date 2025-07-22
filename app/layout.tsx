import React from 'react';
import { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import Providers from './providers';
import ClientProvider from '@/app/components/ClientProvider';
import { dir } from 'i18next';
import { languages } from '@/app/i18n/settings';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AcuaSaaS',
  description: 'A watermarking SaaS platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  const locale = (languages as readonly string[]).includes(params.locale) ? params.locale : 'ja';

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ErrorBoundary>
          <Providers session={session}>
            <ClientProvider>
              {session ? (
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 flex flex-col">
                    <Header />
                    <div className="p-6">{children}</div>
                  </main>
                </div>
              ) : (
                <>{children}</>
              )}
            </ClientProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
