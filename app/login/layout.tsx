import React from 'react';
import type { Metadata } from 'next';
import ClientLayout from '@/app/login/ClientLayout';
import { isValidLanguage } from '@/lib/utils';
import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isValidLanguage(params.locale) ? params.locale : 'ja';
  const t = await getT(locale, ['common']);
  return {
    title: `Login - ${t('appName')}`,
    description: t('metaDescription', `Login to ${t('appName')}`),
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
