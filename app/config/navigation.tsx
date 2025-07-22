import { UserRole, USER_ROLES } from '../types/role';

import {
  LayoutDashboard,
  Image,
  Users,
  FileText,
  Paintbrush,
  LucideIcon,
  ListChecks, // JOB一覧用のアイコンを追加
  SearchCode, // 透かし検出用のアイコンを追加
} from 'lucide-react';

export interface NavItem {
  text: string;
  icon: LucideIcon;
  path: string;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    text: 'dashboard.title',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: [
      USER_ROLES.UPLOADER,
      USER_ROLES.DOWNLOADER,
      USER_ROLES.AUDITOR,
      USER_ROLES.TENANT_ADMIN,
    ],
  },
  {
    text: 'watermark.title',
    icon: Paintbrush,
    path: '/watermark',
    roles: [USER_ROLES.UPLOADER],
  },
  {
    text: 'decode.title', // 透かし検出のテキスト
    icon: SearchCode, // 透かし検出のアイコン
    path: '/decode', // 透かし検出ページのパス
    roles: [USER_ROLES.UPLOADER, USER_ROLES.AUDITOR], // UploaderとAuditorが利用可能
  },
  {
    text: 'userManagement.title',
    icon: Users,
    path: '/user-management',
    roles: [USER_ROLES.TENANT_ADMIN],
  },
  {
    text: 'job.title', // JOB一覧のテキスト
    icon: ListChecks, // JOB一覧のアイコン
    path: '/job', // 新しいJOB一覧ページのパス
    roles: [
      USER_ROLES.UPLOADER,
      USER_ROLES.DOWNLOADER,
      USER_ROLES.AUDITOR,
      USER_ROLES.TENANT_ADMIN,
    ], // 適切なロールを設定
  },
  {
    text: 'log.title',
    icon: FileText,
    path: '/log',
    roles: [USER_ROLES.UPLOADER, USER_ROLES.AUDITOR, USER_ROLES.TENANT_ADMIN],
  },
  {
    text: 'imageManagement.title',
    icon: Image,
    path: '/image-management',
    roles: [USER_ROLES.UPLOADER],
  },
];
