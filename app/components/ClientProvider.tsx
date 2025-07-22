'use client';

import React from 'react';
import '../i18n/config';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return <>{children}</>;
}
