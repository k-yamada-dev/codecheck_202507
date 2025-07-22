import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { EncodeRequestDTOImpl } from '@/app/dto/EncodeRequestDTO';

export async function POST(request: NextRequest) {
  console.log('Encode API called');
  try {
    const body = await request.json();
    const userId = 'example-user-id'; // Replace with actual user ID retrieval logic
    const tenantId = 'example-tenant-id'; // Replace with actual tenant ID retrieval logic
    const userName = 'example-user-name'; // Replace with actual user name retrieval logic
    const encodeRequest = new EncodeRequestDTOImpl(body);
    const inputPath = '/tmp/dummy-input-path'; // Placeholder for input file path
    const outputPath = '/tmp/dummy-output-path'; // Placeholder for output file path

    const job = await prisma.job.create({
      data: {
        tenantId,
        userId,
        userName,
        type: 'EMBED',
        status: 'RUNNING',
        srcImagePath: inputPath,
        params: body,
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
        result: { outputFileName: outputPath },
      },
    });
    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error('Error in encoding process:', error);
    return NextResponse.json(
      { error: `Error encoding file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
