import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorLogData = await request.json();
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'error.log');

    // ログディレクトリが存在しない場合は作成
    if (!existsSync(logDir)) {
      await mkdir(logDir, { recursive: true });
    }

    // エラーログをファイルに追加
    const logEntry = `[${errorData.timestamp}] ${errorData.message}\n${
      errorData.stack || ''
    }\n${errorData.componentStack || ''}\n\n`;

    await appendFile(logFile, logEntry);

    return NextResponse.json({ message: 'Error logged successfully' });
  } catch (error) {
    console.error('Error logging error:', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
