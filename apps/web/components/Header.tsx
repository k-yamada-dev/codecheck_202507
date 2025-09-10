'use client';

import React from 'react';
import { useSession, signOut, getSession, signIn } from 'next-auth/react';
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
import { Menu, LogOut, User, Check } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getIdToken } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { navItems } from '@/config/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { RoleType } from '@acme/contracts';

export default function Header() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = navItems.find((item) => item.path === pathname);
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

  const handleTenantSwitch = async (tenantId: string) => {
    try {
      const res = await fetch('/api/session/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantId }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || 'Failed to switch tenant'
        );
      }

      // Try to obtain fresh idToken from Firebase client first (more reliable)
      let idToken: string | undefined;
      try {
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
          idToken = await getIdToken(currentUser, /* forceRefresh */ true);
        }
      } catch (e) {
        // ignore and fallback to session stored idToken
        console.warn(
          'Failed to get idToken from Firebase client, will fallback to session idToken',
          e
        );
      }

      try {
        if (!idToken) {
          const sessionData = await getSession();
          idToken = sessionData?.idToken;
        }

        if (idToken) {
          // Re-authenticate to update JWT claims (jwt callback reads tenantId)
          await signIn('credentials', { idToken, tenantId, redirect: false });
        } else {
          console.warn(
            'No idToken available to re-authenticate; tenant selection will not persist to JWT'
          );
        }
      } catch (reAuthErr) {
        console.warn('Re-auth on tenant switch failed:', reAuthErr);
      }

      // Refresh UI / session-aware components
      router.refresh();
    } catch (err) {
      handleUIError(err);
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

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {status === 'authenticated' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {t('header.signedInAs')}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                {/* Tenant switcher */}
                {session?.user?.tenants &&
                  session.user.tenants.length > 0 && (
                    <>
                      {/* Current tenant label for clear visibility */}
                      <div className="px-3 pb-2">
                        {(() => {
                          const current =
                            session?.user?.tenants?.find(
                              (x: {
                                tenantId: string;
                                tenantCode?: string | null;
                                name?: string | null;
                                roles?: RoleType[];
                              }) => x.tenantId === session?.user?.tenantId
                            ) ?? null;
                          if (!current) return null;
                          return (
                            <div className="text-sm font-medium">
                              {t('header.current')}:{' '}
                              {current.name ??
                                current.tenantCode ??
                                current.tenantId}
                            </div>
                          );
                        })()}
                      </div>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal">
                        <p className="text-xs leading-none text-muted-foreground">
                          {t('header.currentTenant')}
                        </p>
                      </DropdownMenuLabel>
                      {session.user.tenants.map(
                        (tnt: {
                          tenantId: string;
                          tenantCode?: string;
                          name?: string;
                        }) => {
                          const isCurrent =
                            session?.user?.tenantId === tnt.tenantId;
                          return (
                            <DropdownMenuItem
                              key={tnt.tenantId}
                              onClick={() => handleTenantSwitch(tnt.tenantId)}
                              className="flex items-center justify-between"
                            >
                              <span
                                className={
                                  isCurrent
                                    ? 'font-semibold truncate'
                                    : 'truncate'
                                }
                              >
                                {tnt.name ?? tnt.tenantCode ?? tnt.tenantId}
                              </span>
                              {isCurrent && (
                                <Check className="ml-2 h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          );
                        }
                      )}
                    </>
                  )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}