'use client';

import React from 'react';
import { useSession, signOut, getSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { handleUIError } from '@/lib/errors/uiHandler';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';

export default function Header() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const currentPage = navItems.find(item => item.path === pathname);
  const pageTitle = currentPage ? t(currentPage.text) : '';

  const handleLogout = async () => {
    try {
      const sessionData = await getSession();
      const idToken = sessionData?.idToken;

      await signOut({ redirect: false });

      if (idToken) {
        const logoutUrl = `/api/auth/logout?id_token=${encodeURIComponent(idToken)}`;
        window.location.href = logoutUrl;
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      handleUIError(error);
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* For mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden" // This button is a placeholder, the actual trigger is in Sidebar.tsx
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>

        {status === 'authenticated' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{t('header.signedInAs')}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
