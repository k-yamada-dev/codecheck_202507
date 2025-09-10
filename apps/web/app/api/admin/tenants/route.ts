import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract, USER_ROLE } from '@acme/contracts';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  prisma,
  generateUniqueTenantCode,
  isUniqueConstraintError,
} from '@acme/db';
import type { Tenant, TransactionClient } from '@acme/db';
import type { CreateTenantRequest } from '@acme/contracts';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

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

      const { name, adminEmail, tenantCode } = body;

      // If tenantCode provided by client, try a single create using it.
      let newTenant;
      const createWithTx = async (tx: TransactionClient, tcode: string) => {
        const tenant = await tx.tenant.create({
          data: {
            name,
            tenantCode: tcode,
          },
        });

        // 既存Firebaseユーザーがいないか確認（存在する場合はそのまま流用する）
        let firebaseUser;
        try {
          firebaseUser = await firebaseAdmin.auth().getUserByEmail(adminEmail);
        } catch (e) {
          const error = e as { code?: string; message?: string };
          if (error.code === 'auth/user-not-found') {
            firebaseUser = await firebaseAdmin.auth().createUser({
              email: adminEmail,
              emailVerified: false,
              displayName: 'Tenant Admin',
              disabled: false,
            });
          } else {
            throw e;
          }
        }

        // 共通サービスでユーザー作成
        const { createUser, sendPasswordResetMail } = await import(
          '@/lib/userService'
        );
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
      };

      if (tenantCode) {
        // client provided a tenantCode — use it directly
        newTenant = await prisma.$transaction(async (tx: TransactionClient) => {
          return await createWithTx(tx, tenantCode);
        });
      } else {
        // Server-generate tenantCode with retries on unique-constraint failures
        const maxAttempts = 5;
        let lastError: unknown = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const generated = await generateUniqueTenantCode();
          try {
            newTenant = await prisma.$transaction(
              async (tx: TransactionClient) => {
                return await createWithTx(tx, generated);
              }
            );
            break; // success
          } catch (e) {
            lastError = e;
            // Prisma unique constraint (P2002) -> retry
            if (isUniqueConstraintError(e)) {
              // conflict, retry with new code
              continue;
            }
            // other error -> rethrow
            throw e;
          }
        }
        if (!newTenant) {
          console.error('Failed to create tenant after retries', lastError);
          throw lastError;
        }
      }

      return {
        status: 201,
        body: {
          id: newTenant.id,
          name: newTenant.name,
          tenantCode: newTenant.tenantCode,
          isDeleted: newTenant.isDeleted,
          createdAt: newTenant.createdAt.toISOString(),
          updatedAt: newTenant.updatedAt
            ? newTenant.updatedAt.toISOString()
            : null,
          deletedAt: newTenant.deletedAt
            ? newTenant.deletedAt.toISOString()
            : null,
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
