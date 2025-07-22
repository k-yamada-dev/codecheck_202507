interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

interface UploadResponse {
  fileUrl: string;
  jobId: string;
  filePath: string;
  thumbnailPath: string;
}

interface DecodeResponse {
  result: string;
}

interface EncodeResponse {
  outputUrl: string;
}

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  public async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  public async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  public async decode(params: Record<string, unknown>): Promise<ApiResponse<DecodeResponse>> {
    return this.request<DecodeResponse>('/api/v1/decode', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  public async encode(params: Record<string, unknown>): Promise<ApiResponse<EncodeResponse>> {
    return this.request<EncodeResponse>('/api/v1/encode', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = ApiClient.getInstance();
