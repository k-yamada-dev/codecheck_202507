import { fetchWithInterceptor } from '../../utils/apiInterceptor';
import { errorLogger } from '../../utils/errorLogging';

jest.mock('../../utils/errorLogging');

describe('fetchWithInterceptor', () => {
  const mockResponse = { data: 'test data' };
  const mockError = { message: 'Test error', code: 'ERROR_CODE', status: 400 };

  beforeEach(() => {
    global.fetch = jest.fn();
    (errorLogger.logError as jest.Mock).mockClear();
  });

  it('正常なレスポンスを処理できること', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchWithInterceptor('/test');
    expect(result).toEqual({ data: mockResponse });
  });

  it('エラーレスポンスを処理できること', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve(mockError),
      status: 400,
    });

    const result = await fetchWithInterceptor('/test');
    expect(result).toEqual({ error: mockError.message });
    expect(errorLogger.logError).toHaveBeenCalled();
  });

  it('ネットワークエラーを処理できること', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchWithInterceptor('/test');
    expect(result).toEqual({ error: 'Network error occurred' });
    expect(errorLogger.logError).toHaveBeenCalled();
  });
});
