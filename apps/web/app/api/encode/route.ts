import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@acme/db';
import { publishJob } from '@/lib/pubsub';
import { authOptions } from '@/lib/auth';
import { CreateJobRequestSchema, JOB_TYPE, JOB_STATUS } from '@acme/contracts';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !session.user.id ||
      !session.user.tenantId
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: userId, tenantId, name: userName } = session.user;

    const { srcImagePath, payload } = CreateJobRequestSchema.omit({
      type: true,
    }).parse(await req.json());

    const job = await prisma.job.create({
      data: {
        type: JOB_TYPE.EMBED,
        status: JOB_STATUS.PENDING,
        imageUrl: srcImagePath,
        params: payload,
        tenantId: tenantId,
        userId: userId,
        userName: userName || '',
        srcImagePath: srcImagePath,
        result: {},
      },
    });

    await publishJob({ jobId: job.id, tenantId: tenantId });

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (error: unknown) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      {
        error: 'Failed to create job',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
