import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract, JOB_TYPE, JOB_STATUS } from '@acme/contracts';
import { jobsRepo } from '@acme/db';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { execSync } from 'child_process';
import { downloadFile } from '@/lib/gcs/storage.server';

export const POST = createRouteHandler(contract.decode, async ({ body }: { body: any }) => {
  try {
    // Get session information
    const { tenantId, userId, userName } = await getSessionInfo();

    const inputPath = await downloadFile(body.inputFileName);

    const job = await jobsRepo.create({
      tenantId,
      userId,
      userName,
      type: JOB_TYPE.DECODE,
      payload: body,
      srcImagePath: inputPath,
      imageUrl: inputPath,
      params: body,
    });

    // Execute decode command
    const command = `decode -i ${inputPath} -b ${body.blockSize} -t ${body.timer} -rw ${body.widthScalingFrom}:${body.widthScalingTo} -rh ${body.heightScalingFrom}:${body.heightScalingTo} -ra ${body.rotationFrom}:${body.rotationTo} -log ${body.logfile}`;

    const result = execSync(command).toString().trim();

    await jobsRepo.updateResult(job.id, {
      status: JOB_STATUS.DONE,
      finishedAt: new Date(),
      durationMs: new Date().getTime() - job.createdAt.getTime(),
      result: {
        output: result,
        command: command,
      },
    });

    return {
      status: 200,
      body: {
        result,
        success: true,
      },
    };
  } catch (error) {
    console.error('Decode API error:', error);
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
