import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { downloadFile } from '@/app/config/storage';
import { DecodeRequestDTOImpl } from '@/app/dto/DecodeRequestDTO';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const decodeRequest = new DecodeRequestDTOImpl(body);
    const inputPath = await downloadFile(decodeRequest.inputFileName);

    const command = `decode -i ${inputPath} -b ${decodeRequest.blockSize} -t ${decodeRequest.timer} -rw ${decodeRequest.widthScalingFrom}:${decodeRequest.widthScalingTo} -rh ${decodeRequest.heightScalingFrom}:${decodeRequest.heightScalingTo} -ra ${decodeRequest.rotationFrom}:${decodeRequest.rotationTo} -log ${decodeRequest.logfile}`;

    const result = execSync(command).toString().trim();
    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error('Error in decoding process:', error);
    return NextResponse.json(
      { error: `Error decoding file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
