import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { downloadFile } from '@/lib/gcs/storage.server';
import { DecodeRequestSchema } from '@/app/api/_schemas/decode';
import { withErrorHandling } from '@/lib/errors/apiHandler';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Validate request using Zod schema
  const decodeRequest = DecodeRequestSchema.parse(body);

  const inputPath = await downloadFile(decodeRequest.inputFileName);

  const command = `decode -i ${inputPath} -b ${decodeRequest.blockSize} -t ${decodeRequest.timer} -rw ${decodeRequest.widthScalingFrom}:${decodeRequest.widthScalingTo} -rh ${decodeRequest.heightScalingFrom}:${decodeRequest.heightScalingTo} -ra ${decodeRequest.rotationFrom}:${decodeRequest.rotationTo} -log ${decodeRequest.logfile}`;

  const result = execSync(command).toString().trim();
  return NextResponse.json({ result });
});
