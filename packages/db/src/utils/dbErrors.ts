import { Prisma } from '@prisma/client';

/**
 * Helper to detect Prisma unique constraint (P2002) errors.
 * Exported from @acme/db so callers don't need to import Prisma directly.
 */
export function isUniqueConstraintError(e: unknown): e is Prisma.PrismaClientKnownRequestError {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    (e as Prisma.PrismaClientKnownRequestError).code === 'P2002'
  );
}
