// PATCH, DELETE /api/v1/users/[id]?tenantId=...
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  if (!id || !tenantId) {
    return NextResponse.json(
      problemJson('about:blank', 'Missing id or tenantId', 400),
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, roles } = body;

    const updated = await prisma.user.update({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
      data: {
        name,
        email,
        ...(roles ? { roles } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  if (!id || !tenantId) {
    return NextResponse.json(
      problemJson('about:blank', 'Missing id or tenantId', 400),
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: {
        tenantId_id: {
          tenantId,
          id,
        },
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}
