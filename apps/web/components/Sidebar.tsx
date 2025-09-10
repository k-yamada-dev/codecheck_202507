'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { navItems } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, Menu } from 'lucide-react';
import Image from "next/image";

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
    return <div className="w-16 md:w-56 bg-sidebar border-r"></div>;
  }

  const userRoles = session?.user?.roles;
  const menuItems = userRoles
    ? navItems.filter(
      (item) => !item.roles || item.roles.some((r) => userRoles.includes(r))
    )
    : [];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navContent = (
    <nav className="flex-grow px-2 py-4 space-y-2">
      {menuItems.map((item) => (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant={pathname === item.path ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => router.push(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span className={cn('ml-4', { hidden: isCollapsed })}>
                {t(item.text)}
              </span>
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">{t(item.text)}</TooltipContent>
          )}
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="dark w-56 border-0 bg-sidebar p-0 text-sidebar-foreground"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-center border-b h-14">
                {/* <h1 className="font-bold text-lg">{t('common.appName')}</h1> */}
                <Image
                  src="/1C54072F-00B3-4053-A8CD-1FD787BD8418.png" // publicディレクトリに置いた画像ファイルへのパス
                  alt={t('common.appName')} // 画像が表示されない場合の代替テキスト
                  width={50} // ロゴの幅（ピクセル単位で調整してください）
                  height={10} // ロゴの高さ（ピクセル単位で調整してください）
                  priority // ページの初期表示で重要なので、優先的に読み込みます
                />
              </div>
              {navContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'dark hidden md:flex relative h-screen border-r transition-all',
          'bg-sidebar text-sidebar-foreground',
          isCollapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className="flex-1 flex-col h-full">
          <div className="p-2 flex items-center justify-center border-b h-14 relative">
            {isCollapsed && (
              <Image
                src="/favicon.ico"
                alt={t('common.appName')}
                width={32}
                height={32}
              />
            )}
            {!isCollapsed && (
              <Image
                src="/CCFCD28C-D34F-4878-912A-6C2AC994B07D.png"
                alt={t('common.appName')}
                width={150}
                height={50}
                priority
                className="-translate-x-4"
              />
            )}
          </div>
          <TooltipProvider>{navContent}</TooltipProvider>
        </div>
        <div
          onClick={toggleSidebar}
          className="absolute top-1/2 -translate-y-1/2 -right-2.5 h-12 w-5 cursor-pointer group flex items-center justify-center rounded-r-md border border-l-0 bg-sidebar hover:bg-muted"
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform group-hover:text-foreground', {
              'rotate-180': isCollapsed,
            })}
          />
        </div>
      </div>
    </>
  );
}