import { errorLogger } from './errorLogging';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const fetchWithInterceptor = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(input, init);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = {
        message: data.message || 'An error occurred',
        code: data.code,
        status: response.status,
      };

      errorLogger.logError(new Error(JSON.stringify(error)));
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    errorLogger.logError(error instanceof Error ? error : new Error('Network error'));
    return { error: 'Network error occurred' };
  }
};

export const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    return { data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred' };
  }
};
