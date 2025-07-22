'use client';

import React from 'react';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/Theme-provider';
import i18n from './i18n/config';
import queryClient from '../lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null | undefined;
}

export default function Providers({ children, session }: ProvidersProps) {
  const [isDev, setIsDev] = React.useState(false);

  React.useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <ThemeProvider defaultTheme="system" enableSystem>
          <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        </ThemeProvider>
      </SessionProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
