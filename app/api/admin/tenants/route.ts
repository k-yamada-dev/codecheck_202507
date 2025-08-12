import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';
import { CreateTenantRequestSchema, GetTenantsResponseSchema } from '@/app/api/_schemas/admin';

/**
 * テナント一覧を取得するAPI
 * @param req NextRequest
 * @returns NextResponse
 */
export const GET = withErrorHandling(async (_req: NextRequest, _ctx: { params: unknown }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.roles?.includes(Role.INTERNAL_ADMIN)) {
    throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Forbidden', 403);
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
  const tenants = tenantsRaw.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt ? t.updatedAt.toISOString() : undefined,
    deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
  }));
  if (tenants.length > 0) {
    // eslint-disable-next-line no-console
    console.log('tenant sample:', tenants[0]);
  }
  // Zodスキーマで型バリデーション
  const response = GetTenantsResponseSchema.parse({ tenants, meta: undefined });
  return NextResponse.json(response);
});

/**
 * 新規テナントを作成するAPI
 * @param req Request
 * @returns NextResponse
 */
export const POST = withErrorHandling(async (req: NextRequest, _ctx: { params: unknown }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.roles?.includes(Role.INTERNAL_ADMIN)) {
    throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Forbidden', 403);
  }

  const body = await req.json();

  // Validate request using Zod schema
  const { name, adminEmail, tenantCode } = CreateTenantRequestSchema.parse(body);

  // Generate tenantCode if not provided
  const finalTenantCode =
    tenantCode ||
    name.toLowerCase().replace(/\s/g, '').slice(0, 8) + Math.random().toString(36).slice(2, 6);

  // Prisma transaction to create tenant and admin user together
  const newTenant = await prisma.$transaction(async tx => {
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
      throw new AppError(ErrorCode.VALIDATION, '既にこのメールアドレスは登録されています', 409);
    } catch (e) {
      if (e instanceof AppError) throw e; // re-throw our custom error

      const error = e as { code?: string };
      if (error.code === 'auth/user-not-found') {
        // 存在しなければ新規作成
        firebaseUser = await firebaseAdmin.auth().createUser({
          email: adminEmail,
          emailVerified: false, // or true, depending on your flow
          displayName: 'Tenant Admin',
          disabled: false,
        });
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
      roles: [Role.TENANT_ADMIN],
    });

    if (dbUser) {
      await sendPasswordResetMail(adminEmail);
    }

    return tenant;
  });

  return NextResponse.json(newTenant, { status: 201 });
});
