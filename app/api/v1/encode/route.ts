import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { EncodeRequestSchema } from '@/app/api/_schemas/encode';
import { getSessionInfo } from '@/lib/utils/apiAuth';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Validate request using Zod schema
  const encodeRequest = EncodeRequestSchema.parse(body);

  // Get session information
  const { tenantId, userId, userName } = await getSessionInfo();

  const inputPath = `/tmp/${encodeRequest.inputFileName}`; // Placeholder for input file path
  const outputPath = `/tmp/encoded_${encodeRequest.inputFileName}`; // Placeholder for output file path

  const job = await prisma.job.create({
    data: {
      tenantId,
      userId,
      userName,
      type: 'EMBED',
      status: 'RUNNING',
      srcImagePath: inputPath,
      imageUrl: inputPath,
      params: encodeRequest,
      result: {}, // 空のオブジェクトを初期値として追加
    },
  });

  // Simulate encoding process
  const result = `Simulated encoding result for ${inputPath} to ${outputPath}`;

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: 'DONE',
      finishedAt: new Date(),
      durationMs: new Date().getTime() - job.startedAt.getTime(),
      result: {
        outputFileName: outputPath,
        watermarkApplied: encodeRequest.watermarkText || 'image watermark',
        settings: {
          quality: encodeRequest.quality,
          opacity: encodeRequest.opacity,
          position: encodeRequest.position,
        },
      },
    },
  });

  return NextResponse.json({
    result,
    outputFileName: outputPath,
    success: true,
  });
});
