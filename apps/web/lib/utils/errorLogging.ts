interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public async logError(
    error: Error,
    errorInfo?: React.ErrorInfo
  ): Promise<void> {
    const errorData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack ?? undefined,
      timestamp: new Date().toISOString(),
    };

    // 開発環境の場合はコンソールにエラーを出力
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', errorData);
      return;
    }

    // 本番環境の場合はサーバーにエラーを送信
    try {
      const response = await fetch('/api/error-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });

      if (!response.ok) {
        throw new Error('Error logging failed');
      }
    } catch (err) {
      console.error('Error sending error log:', err);
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();
