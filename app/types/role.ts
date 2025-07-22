export const USER_ROLES = {
  UPLOADER: 'uploader',
  DOWNLOADER: 'downloader',
  AUDITOR: 'auditor',
  TENANT_ADMIN: 'tenant_admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ALL_ROLES = Object.values(USER_ROLES);
