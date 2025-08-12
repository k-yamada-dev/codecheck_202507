'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/Theme-provider';
import { Toaster } from 'sonner';
import i18n from '@/i18n/config';
import queryClient from '@/lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [isDev, setIsDev] = React.useState(false);

  React.useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemeProvider defaultTheme="system" enableSystem>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
          </ThemeProvider>
        </SessionProvider>
        {isDev && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
      <Toaster />
    </>
  );
}
