import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract } from '@acme/contracts';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@acme/db';

/**
 * PATCH /api/session/tenant
 * Body: { tenantId: string }
 *
 * Behavior:
 * - Verify the request is authenticated.
 * - Verify the authenticated user has a user_role for the requested tenant.
 * - Return tenant metadata { ok: true, tenantId, name?, tenantCode? } on success.
 *
 * Note: This endpoint validates membership and returns tenant info. It does not
 * mutate the JWT/session on the server (JWT re-issue flow is out-of-scope here).
 * The client can decide how to persist the selected current tenant (e.g. refresh
 * session / re-login / local state). This route removes the 404 and performs
 * server-side validation.
 */
const router = createRouteHandler(contract.session, {
  setTenant: async ({ body }: { body: { tenantId: string } }) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !session.user.id) {
        return { status: 401, body: { ok: false, message: 'Unauthorized' } };
      }

      const { tenantId } = body as { tenantId?: string };
      if (!tenantId) {
        return {
          status: 400,
          body: { ok: false, message: 'tenantId is required' },
        };
      }

      // Debug logging to help diagnose tenant switch failures
      console.log(
        '[PATCH /api/session/tenant] request body tenantId:',
        tenantId
      );
      console.log('[PATCH /api/session/tenant] session.user:', {
        id: session.user.id,
        email: session.user.email,
        tenantId: session.user.tenantId,
        tenants: session.user.tenants,
      });

      // Check membership: does this user have a user_role for tenantId (not deleted)
      const membership = await prisma.userRole.findFirst({
        where: {
          userId: session.user.id,
          tenantId,
          isDeleted: false,
        },
      });

      if (!membership) {
        return {
          status: 403,
          body: { ok: false, message: 'You are not a member of this tenant' },
        };
      }

      // Fetch tenant meta for UI
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, tenantCode: true },
      });

      return {
        status: 200,
        body: {
          ok: true,
          tenantId,
          name: tenant?.name ?? null,
          tenantCode: tenant?.tenantCode ?? null,
        },
      };
    } catch (error) {
      console.error('PATCH /api/session/tenant error:', error);
      return {
        status: 500,
        body: { ok: false, message: 'Internal Server Error' },
      };
    }
  },
});

export const PATCH = router.setTenant;
