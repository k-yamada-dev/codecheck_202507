import { errorLogger } from '../../utils/errorLogging';

describe('ErrorLogger', () => {
  const originalConsoleError = console.error;
  const originalFetch = global.fetch;
  const mockError = new Error('Test error');
  const mockComponentStack = 'Component stack trace';

  beforeEach(() => {
    console.error = jest.fn();
    global.fetch = jest.fn();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    console.error = originalConsoleError;
    global.fetch = originalFetch;
  });

  it('開発環境でエラーをコンソールに出力すること', () => {
    errorLogger.logError(mockError);
    expect(console.error).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('本番環境でエラーをサーバーに送信すること', async () => {
    process.env.NODE_ENV = 'production';
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await errorLogger.logError(mockError);

    expect(global.fetch).toHaveBeenCalledWith('/api/error-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    });
  });

  it('コンポーネントスタック情報を含むエラーを処理できること', () => {
    const errorInfo = { componentStack: mockComponentStack };
    errorLogger.logError(mockError, errorInfo);

    expect(console.error).toHaveBeenCalledWith(
      'Error Log:',
      expect.objectContaining({
        message: mockError.message,
        componentStack: mockComponentStack,
      })
    );
  });

  it('サーバーへのエラー送信が失敗した場合にコンソールにエラーを出力すること', async () => {
    process.env.NODE_ENV = 'production';
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await errorLogger.logError(mockError);

    expect(console.error).toHaveBeenCalledWith('Error sending error log:', expect.any(Error));
  });
});

describe('errorLogger', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  it('should log errors with timestamp', () => {
    const error = new Error('Test error');
    const spy = jest.spyOn(console, 'error');

    errorLogger.logError(error);

    expect(spy).toHaveBeenCalledWith('Error Log:', expect.any(String), error);
  });
});
