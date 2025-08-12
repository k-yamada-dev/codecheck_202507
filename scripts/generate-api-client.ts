import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

import { AdminApiMeta } from '../app/api/_schemas/admin';
import { ImagesApiMeta } from '../app/api/_schemas/images';

// Generate TypeScript API client
function generateApiClient() {
  const clientContent = `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from OpenAPI specification

export interface CreateJobRequest {
  type: 'EMBED' | 'DECODE';
  srcImagePath: string;
  thumbnailPath?: string | null;
  params: Record<string, any>;
}

export interface CreateJobResponse {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  type: 'EMBED' | 'DECODE';
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR';
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
  thumbnailPath?: string | null;
  srcImagePath: string;
  params: Record<string, any>;
  result: Record<string, any>;
  ip?: string | null;
  ua?: string | null;
  createdAt: string;
  isArchived: boolean;
  archivedAt?: string | null;
  imageUrl: string;
  resultUrl?: string | null;
  watermark?: string | null;
  confidence?: number | null;
}

export interface GetJobsQuery {
  filter?: 'all' | 'embed' | 'decode';
  search?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
  userId?: string;
}

export interface GetJobsResponse {
  jobs: CreateJobResponse[];
  nextCursor?: string | null;
  hasNextPage: boolean;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// --- Tenants API types ---
export interface TenantItem {
  id: string;
  name: string;
  tenantCode: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GetTenantsResponse {
  tenants: TenantItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Base API configuration
export interface ApiConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public response: ErrorResponse
  ) {
    super(\`API Error \${status}: \${response.error.message}\`);
    this.name = 'ApiError';
  }
}

// Base API client class
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: {
            code: 'UNKNOWN_ERROR',
            message: response.statusText || 'Unknown error occurred',
          },
        };
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    return response.json();
  }

  // Jobs API methods
  async createJob(data: CreateJobRequest): Promise<CreateJobResponse> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJobs(params: GetJobsQuery = {}): Promise<GetJobsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    const endpoint = query ? \`/jobs?\${query}\` : '/jobs';
    
    return this.request(endpoint);
  }

  // Images API methods
  async getImages(params: Record<string, any> = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    const endpoint = query ? \`/v1/images?\${query}\` : '/v1/images';
    return this.request(endpoint);
  }

  // Tenants API methods
  async getTenants(): Promise<GetTenantsResponse> {
    return this.request('/admin/tenants');
  }

  // Add authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = \`Bearer \${token}\`;
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}

// Default export - singleton instance
export const apiClient = new ApiClient();

// Named exports for convenience
export const jobsApi = {
  create: (data: CreateJobRequest) => apiClient.createJob(data),
  list: (params?: GetJobsQuery) => apiClient.getJobs(params),
};

export const tenantsApi = {
  list: () => apiClient.getTenants(),
};

export const imagesApi = {
  list: (params?: Record<string, any>) => apiClient.getImages(params),
};
`;

  return clientContent.trim();
}

// Generate the client file
const clientContent = generateApiClient();

// Ensure the directory exists
const outputDir = resolve(process.cwd(), '__generated__/client');
mkdirSync(outputDir, { recursive: true });

// Write the client file
const outputPath = resolve(outputDir, 'api.ts');
writeFileSync(outputPath, clientContent, 'utf8');

console.log(`✅ API client generated at: ${outputPath}`);
