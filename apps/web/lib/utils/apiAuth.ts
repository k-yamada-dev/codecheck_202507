import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export interface SessionInfo {
  tenantId: string;
  userId: string;
  userName: string;
}

export async function getSessionInfo(req?: NextRequest): Promise<SessionInfo> {
  if (req && req.method !== 'GET') {
    throw new Error('Method Not Allowed');
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error(
      'Unauthorized: Missing session or required user information'
    );
  }

  // Determine current tenant:
  // 1) Prefer explicit session.user.tenantId (current tenant stored in session)
  // 2) Fallback to first entry in session.user.tenants (array set at login)
  // 3) If none found, throw unauthorized
  let tenantId: string | undefined = session.user.tenantId as
    | string
    | undefined;

  if (!tenantId) {
    type UserWithTenants = { tenants?: { tenantId: string }[] };
    const userWithTenants = session.user as unknown as UserWithTenants;
    if (
      Array.isArray(userWithTenants.tenants) &&
      userWithTenants.tenants.length > 0
    ) {
      tenantId = userWithTenants.tenants[0].tenantId;
    }
  }

  if (!tenantId) {
    throw new Error('Unauthorized: Missing tenant information in session');
  }

  return {
    tenantId,
    userId: session.user.id,
    userName: session.user.name || '',
  };
}
