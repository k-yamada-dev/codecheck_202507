import React from 'react';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Login - AcuaSaaS',
  description: 'Login to AcuaSaaS',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
