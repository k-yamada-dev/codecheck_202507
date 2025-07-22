// GET /api/logs/[id] - ログ詳細取得API
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      problemJson('about:blank', 'Missing id', 400),
      { status: 400 }
    );
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        problemJson('about:blank', 'Not found', 404),
        { status: 404 }
      );
    }

    // userNameを含めて返却
    return NextResponse.json({
      ...job,
      userName: job.userName,
    });
  } catch (err: any) {
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}
