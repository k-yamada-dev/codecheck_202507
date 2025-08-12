'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { navItems } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, Menu } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // 除外パスリスト（今後追加しやすい形）
  const EXCLUDE_PATHS = ['/login', '/forgot-password'];
  if (EXCLUDE_PATHS.includes(pathname)) {
    return null;
  }

  if (status === 'loading') {
    // You can return a loading skeleton here
    return <div className="w-16 md:w-56 bg-background border-r"></div>;
  }

  const userRoles = session?.user?.roles;
  const menuItems = userRoles
    ? navItems.filter(item => !item.roles || item.roles.some(r => userRoles.includes(r)))
    : [];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navContent = (
    <nav className="flex-grow px-2 py-4 space-y-2">
      {menuItems.map(item => (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant={pathname === item.path ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => router.push(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span className={cn('ml-4', { hidden: isCollapsed })}>{t(item.text)}</span>
            </Button>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">{t(item.text)}</TooltipContent>}
        </Tooltip>
      ))}
    </nav>
  );
  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-center border-b h-14">
                <h1 className="font-bold text-lg">{t('common.appName')}</h1>
              </div>
              {navContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex relative h-screen bg-background border-r transition-all',
          isCollapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-2 flex items-center justify-between border-b h-14">
            <h1 className={cn('font-bold text-lg pl-2', { hidden: isCollapsed })}>
              {t('common.appName')}
            </h1>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronLeft
                className={cn('h-5 w-5 transition-transform', { 'rotate-180': isCollapsed })}
              />
            </Button>
          </div>
          <TooltipProvider>{navContent}</TooltipProvider>
        </div>
      </div>
    </>
  );
}
