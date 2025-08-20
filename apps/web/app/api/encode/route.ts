import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { publishJob } from '@/lib/pubsub';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env.server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: userId, tenantId, name: userName } = session.user;

    const body = await req.json();
    const { imageId, watermark, options } = body;

    if (!imageId || !watermark) {
      return NextResponse.json({ error: 'imageId and watermark are required' }, { status: 400 });
    }

    const imagePath = `${tenantId}/${userId}/${imageId}`;
    const gcsUri = `gs://${env.GCS_BUCKET_NAME}/${imagePath}`;

    const job = await prisma.job.create({
      data: {
        type: 'EMBED',
        status: 'PENDING',
        imageUrl: gcsUri,
        params: { watermark, ...options },
        tenantId: tenantId,
        userId: userId,
        userName: userName || '',
        srcImagePath: gcsUri,
        result: {},
      },
    });

    await publishJob({ jobId: job.id, tenantId: tenantId });

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job', details: error.message },
      { status: 500 }
    );
  }
}
