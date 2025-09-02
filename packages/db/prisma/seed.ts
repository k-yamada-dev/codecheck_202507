// packages/db/prisma/seed.ts
import { prisma } from '../src/client';
import { randomUUID } from 'crypto';
import type { Role } from '@prisma/client';

// "YYYY-MM-DD HH:mm:ss" → Date（UTC扱い）
const ts = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

// 変換: DBに保存されているスネーク/小文字 → Prisma Enum（大文字）
const roleMap: { [K in 'internal_admin' | 'tenant_admin' | 'uploader']: Role } = {
  internal_admin: 'INTERNAL_ADMIN',
  tenant_admin: 'TENANT_ADMIN',
  uploader: 'UPLOADER',
};

async function main() {
  // ---------- Tenant ----------
  const tenantId = randomUUID();
  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      name: 'System Tenant',
      tenantCode: 'system',
      isDeleted: false,
      deletedAt: null,
      updatedAt: ts('2025-08-04 17:04:06'),
    },
    create: {
      id: tenantId,
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

  // Some environments may not have the new `id` column on `user_roles` yet.
  // Detect schema at runtime and use the appropriate insert/update strategy:
  const cols =
    (await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'id'`) as Array<{
      column_name?: string;
    }>;
  const hasUserRolesId = Array.isArray(cols) && cols.length > 0;

  for (const r of user1Roles) {
    const roleValue: Role = roleMap[r.role];
    const dbRole = r.role;

    if (hasUserRolesId) {
      // New schema: user_roles has id column — safe to use Prisma client create/update
      const existing = await prisma.userRole.findFirst({
        where: { userId: user1.id, tenantId: tenant.id, role: roleValue },
      });
      if (existing) {
        await prisma.userRole.update({
          where: { id: existing.id },
          data: {
            assignedAt: ts(r.assignedAt),
            isDeleted: false,
            deletedAt: null,
            updatedAt: ts(r.updatedAt),
          },
        });
      } else {
        await prisma.userRole.create({
          data: {
            userId: user1.id,
            tenantId: tenant.id,
            role: roleValue,
            assignedAt: ts(r.assignedAt),
            isDeleted: false,
            deletedAt: null,
            createdAt: ts(r.createdAt),
            updatedAt: ts(r.updatedAt),
          },
        });
      }
    } else {
      // Old schema: no id column (composite primary key). Use raw SQL with ON CONFLICT
      await prisma.$executeRaw`
        INSERT INTO user_roles (user_id, tenant_id, role, assigned_at, is_deleted, deleted_at, created_at, updated_at)
        VALUES (${user1.id}::uuid, ${tenant.id}::uuid, ${dbRole}::"Role", ${ts(r.assignedAt)}, false, NULL, ${ts(r.createdAt)}, ${ts(r.updatedAt)})
        ON CONFLICT (user_id, tenant_id, role)
        DO UPDATE SET
          assigned_at = EXCLUDED.assigned_at,
          is_deleted = EXCLUDED.is_deleted,
          deleted_at = EXCLUDED.deleted_at,
          updated_at = EXCLUDED.updated_at
      `;
    }
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
