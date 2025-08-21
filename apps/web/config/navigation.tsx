import { USER_ROLE, type RoleType } from '@acme/contracts';
import {
  LayoutDashboard,
  Image,
  Users,
  FileText,
  Paintbrush,
  LucideIcon,
  ListChecks,
  SearchCode,
  Shield, // Admin icon
} from 'lucide-react';

export interface NavItem {
  text: string;
  icon: LucideIcon;
  path: string;
  roles: RoleType[];
}

export const navItems: NavItem[] = [
  {
    text: 'dashboard.title',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: [
      USER_ROLE.UPLOADER,
      USER_ROLE.DOWNLOADER,
      USER_ROLE.AUDITOR,
      USER_ROLE.TENANT_ADMIN,
    ],
  },
  {
    text: 'watermark.title',
    icon: Paintbrush,
    path: '/watermark',
    roles: [USER_ROLE.UPLOADER],
  },
  {
    text: 'decode.title', // 透かし検出のテキスト
    icon: SearchCode, // 透かし検出のアイコン
    path: '/decode', // 透かし検出ページのパス
    roles: [USER_ROLE.UPLOADER, USER_ROLE.AUDITOR], // UploaderとAuditorが利用可能
  },
  {
    text: 'userManagement.title',
    icon: Users,
    path: '/user-management',
    roles: [USER_ROLE.TENANT_ADMIN],
  },
  {
    text: 'job.title', // JOB一覧のテキスト
    icon: ListChecks, // JOB一覧のアイコン
    path: '/job', // 新しいJOB一覧ページのパス
    roles: [
      USER_ROLE.UPLOADER,
      USER_ROLE.DOWNLOADER,
      USER_ROLE.AUDITOR,
      USER_ROLE.TENANT_ADMIN,
    ], // 適切なロールを設定
  },
  {
    text: 'log.title',
    icon: FileText,
    path: '/log',
    roles: [USER_ROLE.UPLOADER, USER_ROLE.AUDITOR, USER_ROLE.TENANT_ADMIN],
  },
  {
    text: 'imageManagement.title',
    icon: Image,
    path: '/image-management',
    roles: [USER_ROLE.UPLOADER],
  },
  // Admin Console Link
  {
    text: 'admin.title', // Use i18n key
    icon: Shield,
    path: '/admin/tenants',
    roles: [USER_ROLE.INTERNAL_ADMIN],
  },
];
