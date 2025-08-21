import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract, JOB_TYPE, JOB_STATUS } from '@acme/contracts';
import { jobsRepo } from '@acme/db';
import { getSessionInfo } from '@/lib/utils/apiAuth';

export const POST = createRouteHandler(contract.encode, async ({ body }: { body: any }) => {
  try {
    // Get session information
    const { tenantId, userId, userName } = await getSessionInfo();

    const inputPath = `/tmp/${body.inputFileName}`; // Placeholder for input file path
    const outputPath = `/tmp/encoded_${body.inputFileName}`; // Placeholder for output file path

    const job = await jobsRepo.create({
      tenantId,
      userId,
      userName,
      type: JOB_TYPE.EMBED,
      payload: body,
      srcImagePath: inputPath,
      imageUrl: inputPath,
      params: body,
    });

    // Simulate encoding process
    const result = `Simulated encoding result for ${inputPath} to ${outputPath}`;

    await jobsRepo.updateResult(job.id, {
      status: JOB_STATUS.DONE,
      finishedAt: new Date(),
      durationMs: new Date().getTime() - job.createdAt.getTime(),
      result: {
        outputFileName: outputPath,
        watermarkApplied: body.watermarkText || 'image watermark',
        settings: {
          quality: body.quality,
          opacity: body.opacity,
          position: body.position,
        },
      },
    });

    return {
      status: 200,
      body: {
        result,
        outputFileName: outputPath,
        success: true,
      },
    };
  } catch (error) {
    console.error('Encode API error:', error);
    return {
      status: 500,
      body: {
        result: 'Internal server error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
});
