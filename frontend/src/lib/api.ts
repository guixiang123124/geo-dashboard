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
  EvaluationRunDetail,
  EvaluationResult,
  EvaluationCreate,
  PaginatedResponse,
  Prompt,
  PromptCreate,
  PromptUpdate,
  PromptCategory,
  TimeSeriesDataPoint,
  BrandComparisonData,
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

  const fullUrl = `${API_V1}${endpoint}`;
  const response = await fetch(fullUrl, {
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

// Backend returns this shape (uses 'brands' key, not 'items')
interface BackendBrandListResponse {
  brands: BrandWithScore[];
  total: number;
  page: number;
  page_size: number;
}

export const brandsApi = {
  async list(
    workspaceId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<BrandWithScore>> {
    const raw = await fetchApi<BackendBrandListResponse>(
      `/brands?workspace_id=${workspaceId}&page=${page}&page_size=${pageSize}`
    );
    return {
      items: raw.brands ?? [],
      total: raw.total ?? 0,
      page: raw.page ?? 1,
      page_size: raw.page_size ?? pageSize,
      total_pages: Math.ceil((raw.total ?? 0) / (raw.page_size ?? pageSize)),
    };
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

  async getTrends(
    workspaceId: string,
    brandId?: string,
  ): Promise<TimeSeriesDataPoint[]> {
    let url = `/scores/trends?workspace_id=${workspaceId}`;
    if (brandId) url += `&brand_id=${brandId}`;
    return fetchApi<TimeSeriesDataPoint[]>(url);
  },

  async getComparison(
    workspaceId: string,
    brandIds: string[],
  ): Promise<BrandComparisonData[]> {
    const ids = brandIds.join(',');
    return fetchApi<BrandComparisonData[]>(
      `/scores/comparison?workspace_id=${workspaceId}&brand_ids=${ids}`
    );
  },
};

// ============ Evaluations API ============

export const evaluationsApi = {
  async list(
    workspaceId: string,
    status?: string,
  ): Promise<EvaluationRun[]> {
    let url = `/evaluations?workspace_id=${workspaceId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return fetchApi<EvaluationRun[]>(url);
  },

  async get(runId: string, workspaceId: string): Promise<EvaluationRunDetail> {
    return fetchApi<EvaluationRunDetail>(`/evaluations/${runId}?workspace_id=${workspaceId}`);
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

// ============ Prompts API ============

interface BackendPromptListResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  page_size: number;
}

export const promptsApi = {
  async list(
    page = 1,
    pageSize = 50,
    category?: string,
    search?: string,
  ): Promise<{ prompts: Prompt[]; total: number }> {
    let url = `/prompts?page=${page}&page_size=${pageSize}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const raw = await fetchApi<BackendPromptListResponse>(url);
    return { prompts: raw.prompts ?? [], total: raw.total ?? 0 };
  },

  async get(promptId: string): Promise<Prompt> {
    return fetchApi<Prompt>(`/prompts/${promptId}`);
  },

  async create(data: PromptCreate): Promise<Prompt> {
    return fetchApi<Prompt>('/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(promptId: string, data: PromptUpdate): Promise<Prompt> {
    return fetchApi<Prompt>(`/prompts/${promptId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(promptId: string): Promise<void> {
    await fetchApi(`/prompts/${promptId}`, { method: 'DELETE' });
  },

  async categories(): Promise<PromptCategory[]> {
    return fetchApi<PromptCategory[]>('/prompts/categories');
  },
};

// ============ AI Models API ============

export interface AIModelInfo {
  id: string;
  name: string;
  model: string;
  available: boolean;
  description: string;
  icon: string;
}

export const modelsApi = {
  async list(): Promise<AIModelInfo[]> {
    return fetchApi<AIModelInfo[]>('/models');
  },

  async listAvailable(): Promise<AIModelInfo[]> {
    return fetchApi<AIModelInfo[]>('/models/available');
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
    return { brands: result.items, total: result.total };
  },
};

export const scoresAPI = {
  ...scoresApi,
  getBrandLatest: scoresApi.getBrandScore,
};

export const evaluationsAPI = evaluationsApi;
export const authAPI = authApi;

// ============ Insights API ============

export const insightsApi = {
  async getTrending(category?: string, limit = 10) {
    let url = `/insights/trending?limit=${limit}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    return fetchApi<{
      brands: Array<{
        brand: string;
        category: string;
        mention_count: number;
        positive_count: number;
        negative_count: number;
        neutral_count: number;
        positive_percentage: number;
        sentiment_score: number;
        model_coverage: number;
      }>;
      total_mentions: number;
      categories_available: string[];
    }>(url);
  },

  async getLLMComparison(brand?: string) {
    let url = '/insights/llm-comparison';
    if (brand) url += `?brand=${encodeURIComponent(brand)}`;
    return fetchApi<{
      models: Array<{
        model: string;
        total_mentions: number;
        unique_brands: number;
        positive_rate: number;
        negative_rate: number;
        neutral_rate: number;
        top_brands: [string, number][];
      }>;
      total_models: number;
    }>(url);
  },

  async getSentiment(brand: string) {
    return fetchApi<{
      brand: string;
      total_mentions: number;
      sentiment_distribution: {
        positive: number;
        negative: number;
        neutral: number;
      };
      sentiment_percentages: {
        positive: number;
        negative: number;
        neutral: number;
      };
      average_confidence: number;
      sentiment_score: number;
      by_model: Array<{
        model: string;
        positive: number;
        negative: number;
        neutral: number;
      }>;
    }>(`/insights/sentiment/${encodeURIComponent(brand)}`);
  },

  async getCategories() {
    return fetchApi<{
      categories: Array<{
        category: string;
        brand_count: number;
        mention_count: number;
      }>;
      total: number;
    }>('/insights/categories');
  },

  async getSummary() {
    return fetchApi<{
      total_mentions: number;
      unique_brands: number;
      categories: number;
      sentiment_overview: {
        positive: number;
        negative: number;
        neutral: number;
      };
      data_sources: {
        llm_conversations: number;
        reviews: number;
      };
    }>('/insights/summary');
  },

  async getTemporal(brand?: string, days = 30) {
    let url = `/insights/temporal?days=${days}`;
    if (brand) url += `&brand=${encodeURIComponent(brand)}`;
    return fetchApi<{
      data: Array<{
        date: string;
        total: number;
        positive: number;
        negative: number;
        neutral: number;
      }>;
      brand: string | null;
      period_days: number;
    }>(url);
  },

  async refresh() {
    return fetchApi<{ status: string; message: string }>('/insights/refresh', {
      method: 'POST',
    });
  },
};

// Re-export types for convenience
export type { Brand, ScoreCard, BrandWithScore } from './types';
