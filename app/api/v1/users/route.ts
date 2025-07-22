// GET /api/v1/users?tenantId=...&search=...
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function problemJson(type: string, title: string, status: number, detail?: string) {
  return {
    type,
    title,
    status,
    detail,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');
  const search = searchParams.get('search') ?? '';

  if (!tenantId) {
    return NextResponse.json(
      problemJson('about:blank', 'Missing tenantId', 400),
      { status: 400 }
    );
  }

  try {
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { externalId: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}
