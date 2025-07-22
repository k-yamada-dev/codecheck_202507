import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export interface SessionInfo {
  tenantId: string;
  userId: string;
  userName: string;
}

export async function getSessionInfo(req?: NextRequest): Promise<SessionInfo> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.tenantId || !session.user.id) {
    throw new Error('Unauthorized: Missing session or required user information');
  }

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    userName: session.user.name || '',
  };
}
