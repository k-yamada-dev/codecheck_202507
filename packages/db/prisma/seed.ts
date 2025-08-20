// packages/db/prisma/seed.ts
import { prisma } from '../src/client';

// "YYYY-MM-DD HH:mm:ss" → Date（UTC扱い）
const ts = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

// 変換: DBに保存されているスネーク/小文字 → Prisma Enum（大文字）
const roleMap = {
  internal_admin: 'INTERNAL_ADMIN',
  tenant_admin: 'TENANT_ADMIN',
  uploader: 'UPLOADER',
} as const;

async function main() {
  // ---------- Tenant ----------
  const tenant = await prisma.tenant.upsert({
    where: { id: 'ch68zlwyyro4yissx5w68b67' },
    update: {
      name: 'System Tenant',
      tenantCode: 'system',
      isDeleted: false,
      deletedAt: null,
      updatedAt: ts('2025-08-04 17:04:06'),
    },
    create: {
      id: 'ch68zlwyyro4yissx5w68b67',
      name: 'System Tenant',
      tenantCode: 'system',
      deletedAt: null,
      createdAt: ts('2025-08-04 17:04:02'),
      updatedAt: ts('2025-08-04 17:04:06'),
    },
  });

  // ---------- Users ----------
  // 1) 本ユーザー
  const user1 = await prisma.user.upsert({
    where: { id: '23d209a4-ed32-4cf7-b2e6-3f3e35a650d8' },
    update: {
      name: '山田 勝喜',
      email: 'k-yamada@focus-s.com',
      externalId: 'mMhj1ynzhJfglZGlTta7eAHp67w1',
      isDeleted: false,
      deletedAt: null,
      updatedAt: ts('2025-08-06 07:25:41'),
    },
    create: {
      id: '23d209a4-ed32-4cf7-b2e6-3f3e35a650d8',
      tenantId: tenant.id,
      provider: 'firebase',
      externalId: 'mMhj1ynzhJfglZGlTta7eAHp67w1',
      name: '山田 勝喜',
      email: 'k-yamada@focus-s.com',
      isDeleted: false,
      deletedAt: null,
      createdAt: ts('2025-08-04 17:04:55'),
      updatedAt: ts('2025-08-06 07:25:41'),
    },
  });

  // ---------- Roles (UserRole) ----------
  // user1: internal_admin / tenant_admin / uploader
  const user1Roles: Array<{
    role: keyof typeof roleMap;
    assignedAt: string;
    createdAt: string;
    updatedAt: string;
  }> = [
    {
      role: 'internal_admin',
      assignedAt: '2025-08-04 17:07:06',
      createdAt: '2025-08-04 17:07:07',
      updatedAt: '2025-08-04 17:07:11',
    },
    {
      role: 'tenant_admin',
      assignedAt: '2025-08-04 17:07:28',
      createdAt: '2025-08-04 17:07:29',
      updatedAt: '2025-08-04 17:07:29',
    },
    {
      role: 'uploader',
      assignedAt: '2025-08-04 17:07:44',
      createdAt: '2025-08-04 17:07:45',
      updatedAt: '2025-08-04 17:07:46',
    },
  ];

  for (const r of user1Roles) {
    await prisma.userRole.upsert({
      where: {
        userId_tenantId_role: {
          userId: user1.id,
          tenantId: tenant.id,
          role: roleMap[r.role] as any, // Prisma enum（大文字）
        },
      },
      update: {
        assignedAt: ts(r.assignedAt),
        isDeleted: false,
        deletedAt: null,
        updatedAt: ts(r.updatedAt),
      },
      create: {
        userId: user1.id,
        tenantId: tenant.id,
        role: roleMap[r.role] as any,
        assignedAt: ts(r.assignedAt),
        isDeleted: false,
        deletedAt: null,
        createdAt: ts(r.createdAt),
        updatedAt: ts(r.updatedAt),
      },
    });
  }

  console.log('✅ Seed done');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
