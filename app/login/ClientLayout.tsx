'use client';

import React from 'react';
import '../i18n/config';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <div className="min-h-screen">{children}</div>;
}
