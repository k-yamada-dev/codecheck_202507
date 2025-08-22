import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import {
  contract,
  USER_ROLE,
  CreateTenantRequestSchema,
  type CreateTenantRequest,
} from '@acme/contracts';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@acme/db';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import type { Prisma, Tenant } from '@prisma/client';

const router = createRouteHandler(contract.admin, {
  getTenants: async () => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.roles?.includes(USER_ROLE.INTERNAL_ADMIN)) {
        return {
          status: 403,
          body: {
            tenants: [],
            meta: undefined,
          },
        };
      }

      const tenantsRaw = await prisma.tenant.findMany({
        where: {
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // createdAt/updatedAt/deletedAtをstring(ISO)化
      const tenants = tenantsRaw.map((t: Tenant) => ({
        id: t.id,
        name: t.name,
        tenantCode: t.tenantCode,
        isDeleted: t.isDeleted,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt ? t.updatedAt.toISOString() : undefined,
        deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
      }));

      return {
        status: 200,
        body: {
          tenants,
          meta: undefined,
        },
      };
    } catch (error) {
      console.error('Get Tenants API error:', error);
      return {
        status: 500,
        body: {
          tenants: [],
          meta: undefined,
        },
      };
    }
  },
  createTenant: async ({ body }: { body: CreateTenantRequest }) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.roles?.includes(USER_ROLE.INTERNAL_ADMIN)) {
        return {
          status: 403,
          body: {
            id: '',
            name: '',
            tenantCode: '',
            isDeleted: false,
            createdAt: '',
            updatedAt: null,
            deletedAt: null,
          },
        };
      }

      const { name, adminEmail, tenantCode } =
        CreateTenantRequestSchema.parse(body);

      // Generate tenantCode if not provided
      const finalTenantCode =
        tenantCode ||
        name.toLowerCase().replace(/\s/g, '').slice(0, 8) + Math.random().toString(36).slice(2, 6);

      // Prisma transaction to create tenant and admin user together
      const newTenant = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
        const tenant = await tx.tenant.create({
          data: {
            name,
            tenantCode: finalTenantCode,
          },
        });

        // 既存Firebaseユーザーがいないか確認
        let firebaseUser;
        try {
          firebaseUser = await firebaseAdmin.auth().getUserByEmail(adminEmail);
          // 既に存在する場合はエラー返却
          throw new Error('既にこのメールアドレスは登録されています');
        } catch (e) {
          const error = e as { code?: string; message?: string };
          if (error.code === 'auth/user-not-found') {
            // 存在しなければ新規作成
            firebaseUser = await firebaseAdmin.auth().createUser({
              email: adminEmail,
              emailVerified: false,
              displayName: 'Tenant Admin',
              disabled: false,
            });
          } else if (error.message === '既にこのメールアドレスは登録されています') {
            throw e;
          } else {
            // その他のFirebaseエラー
            throw e;
          }
        }

        // 共通サービスでユーザー作成
        const { createUser, sendPasswordResetMail } = await import('@/lib/userService');
        const dbUser = await createUser({
          prisma: tx,
          tenantId: tenant.id,
          email: adminEmail,
          name: 'Tenant Admin',
          externalId: firebaseUser.uid,
          provider: 'firebase',
          roles: [USER_ROLE.TENANT_ADMIN],
        });

        if (dbUser) {
          await sendPasswordResetMail(adminEmail);
        }

        return tenant;
      });

      return {
        status: 201,
        body: {
          id: newTenant.id,
          name: newTenant.name,
          tenantCode: newTenant.tenantCode,
          isDeleted: newTenant.isDeleted,
          createdAt: newTenant.createdAt.toISOString(),
          updatedAt: newTenant.updatedAt ? newTenant.updatedAt.toISOString() : null,
          deletedAt: newTenant.deletedAt ? newTenant.deletedAt.toISOString() : null,
        },
      };
    } catch (error) {
      console.error('Create Tenant API error:', error);
      return {
        status: 500,
        body: {
          id: '',
          name: '',
          tenantCode: '',
          isDeleted: false,
          createdAt: '',
          updatedAt: null,
          deletedAt: null,
        },
      };
    }
  },
});

export const GET = router.getTenants;
export const POST = router.createTenant;
