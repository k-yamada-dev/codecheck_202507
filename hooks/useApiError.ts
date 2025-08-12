import { useState } from 'react';

interface ApiError {
  message: string;
  code?: string;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleApiError = (error: unknown) => {
    if (error instanceof Error) {
      setError({ message: error.message });
    } else if (typeof error === 'string') {
      setError({ message: error });
    } else {
      setError({ message: '予期せぬエラーが発生しました' });
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleApiError,
    clearError,
  };
};
