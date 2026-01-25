/**
 * API client for GEO Insights Dashboard.
 */

import type {
  User,
  AuthToken,
  LoginCredentials,
  RegisterData,
  Brand,
  BrandCreate,
  BrandUpdate,
  BrandWithScore,
  ScoreCard,
  EvaluationRun,
  EvaluationResult,
  EvaluationCreate,
  PaginatedResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

// Default workspace ID for demo/development
export const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || 'ws-demo-001';

// ============ Token Management ============

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  localStorage.removeItem('access_token');
}

// ============ Fetch Wrapper ============

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_V1}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

// ============ Auth API ============

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_V1}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail);
    }

    const data: AuthToken = await response.json();
    setAccessToken(data.access_token);
    return data;
  },

  async register(data: RegisterData): Promise<User> {
    return fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      clearAccessToken();
    }
  },

  async getMe(): Promise<User> {
    return fetchApi<User>('/auth/me');
  },

  async updateMe(data: Partial<User>): Promise<User> {
    return fetchApi<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await fetchApi('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },
};

// ============ Brands API ============

export const brandsApi = {
  async list(
    workspaceId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<BrandWithScore>> {
    return fetchApi<PaginatedResponse<BrandWithScore>>(
      `/brands?workspace_id=${workspaceId}&page=${page}&page_size=${pageSize}`
    );
  },

  async get(brandId: string, workspaceId: string): Promise<BrandWithScore> {
    return fetchApi<BrandWithScore>(`/brands/${brandId}?workspace_id=${workspaceId}`);
  },

  async create(workspaceId: string, data: BrandCreate): Promise<Brand> {
    return fetchApi<Brand>(`/brands?workspace_id=${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(brandId: string, workspaceId: string, data: BrandUpdate): Promise<Brand> {
    return fetchApi<Brand>(`/brands/${brandId}?workspace_id=${workspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(brandId: string, workspaceId: string): Promise<void> {
    await fetchApi(`/brands/${brandId}?workspace_id=${workspaceId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Scores API ============

export const scoresApi = {
  async getBrandScore(brandId: string, workspaceId: string): Promise<ScoreCard | null> {
    try {
      return await fetchApi<ScoreCard>(
        `/scores/brand/${brandId}/latest?workspace_id=${workspaceId}`
      );
    } catch {
      return null;
    }
  },

  async getBrandHistory(
    brandId: string,
    workspaceId: string,
    limit = 30
  ): Promise<ScoreCard[]> {
    return fetchApi<ScoreCard[]>(
      `/scores/brand/${brandId}?workspace_id=${workspaceId}&limit=${limit}`
    );
  },

  async getWorkspaceScores(workspaceId: string): Promise<ScoreCard[]> {
    return fetchApi<ScoreCard[]>(`/scores/workspace?workspace_id=${workspaceId}`);
  },
};

// ============ Evaluations API ============

export const evaluationsApi = {
  async list(
    workspaceId: string,
    status?: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<EvaluationRun>> {
    let url = `/evaluations?workspace_id=${workspaceId}&page=${page}&page_size=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return fetchApi<PaginatedResponse<EvaluationRun>>(url);
  },

  async get(runId: string, workspaceId: string): Promise<EvaluationRun> {
    return fetchApi<EvaluationRun>(`/evaluations/${runId}?workspace_id=${workspaceId}`);
  },

  async create(workspaceId: string, data: EvaluationCreate): Promise<EvaluationRun> {
    return fetchApi<EvaluationRun>(`/evaluations?workspace_id=${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getResults(
    runId: string,
    workspaceId: string,
    brandId?: string,
    modelName?: string
  ): Promise<EvaluationResult[]> {
    let url = `/evaluations/${runId}/results?workspace_id=${workspaceId}`;
    if (brandId) url += `&brand_id=${brandId}`;
    if (modelName) url += `&model_name=${modelName}`;
    return fetchApi<EvaluationResult[]>(url);
  },
};

// ============ Health Check ============

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// ============ Compatibility Aliases ============
// These aliases maintain compatibility with existing hooks

export const brandsAPI = {
  ...brandsApi,
  async list(workspaceId: string, page = 1, pageSize = 20) {
    const result = await brandsApi.list(workspaceId, page, pageSize);
    // Transform to expected format with 'brands' key
    return { brands: result.items || [], total: result.total || 0 };
  },
};

export const scoresAPI = {
  ...scoresApi,
  getBrandLatest: scoresApi.getBrandScore,
};

export const evaluationsAPI = evaluationsApi;
export const authAPI = authApi;

// Re-export types for convenience
export type { Brand, ScoreCard, BrandWithScore } from './types';
