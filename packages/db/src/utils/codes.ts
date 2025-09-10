import { prisma } from '../client';
import { randomUUID } from 'crypto';

/**
 * Generate a unique userCode following repo rules:
 * - base36 lowercase
 * - up to 4 chars
 * - checked against DB for uniqueness
 */
export async function generateUniqueUserCode(): Promise<string> {
  const candidate = () => {
    const max = Math.pow(36, 4); // 36^4 possibilities
    const n = Math.floor(Math.random() * max);
    return n.toString(36);
  };

  for (let i = 0; i < 10; i++) {
    const code = candidate();
    const found = await prisma.user.findFirst({ where: { userCode: code } });
    if (!found) return code;
  }

  // fallback
  return randomUUID().replace(/-/g, '').slice(0, 4).toLowerCase();
}

/**
 * Generate a unique tenantCode following repo rules:
 * - base36 lowercase
 * - up to 6 chars
 * - checked against DB for uniqueness
 */
export async function generateUniqueTenantCode(): Promise<string> {
  const candidate = () => {
    const max = Math.pow(36, 6); // 36^6 possibilities
    const n = Math.floor(Math.random() * max);
    return n.toString(36);
  };

  for (let i = 0; i < 10; i++) {
    const code = candidate();
    const found = await prisma.tenant.findFirst({ where: { tenantCode: code } });
    if (!found) return code;
  }

  // fallback
  return randomUUID().replace(/-/g, '').slice(0, 6).toLowerCase();
}
