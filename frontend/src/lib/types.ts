/**
 * TypeScript type definitions for GEO Insights Dashboard.
 */

// ============ Auth Types ============

export interface User {
  id: number;
  email: string;
  full_name?: string;
  workspace_id?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// ============ Brand Types ============

export interface Brand {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  category: string;
  positioning?: string;
  price_tier?: string;
  target_age_range?: string;
  target_keywords?: string[];
  competitors?: string[];
  created_at: string;
  updated_at: string;
}

export interface BrandCreate {
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  category: string;
  positioning?: string;
  price_tier?: string;
  target_age_range?: string;
  target_keywords?: string[];
  competitors?: string[];
}

export interface BrandUpdate {
  name?: string;
  domain?: string;
  logo_url?: string;
  category?: string;
  positioning?: string;
  price_tier?: string;
  target_age_range?: string;
  target_keywords?: string[];
  competitors?: string[];
}

// ============ Score Types ============

export interface GEOScore {
  composite_score: number;
  visibility_score: number;
  citation_score: number;
  representation_score: number;
  intent_score: number;
}

export interface ModelScoreEntry {
  score: number;
  mentions: number;
}

export interface ScoreCard extends GEOScore {
  id: string;
  brand_id: string;
  evaluation_run_id: string;
  total_mentions: number;
  avg_rank: number | null;
  citation_rate: number;
  intent_coverage: number;
  model_scores?: Record<string, ModelScoreEntry>;
  evaluation_count: number;
  last_evaluation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandWithScore extends Brand {
  score?: ScoreCard;
}

// ============ Evaluation Types ============

export type EvaluationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface EvaluationRun {
  id: string;
  workspace_id: string;
  name?: string;
  models_used: string[];
  status: EvaluationStatus;
  progress: number;
  prompt_count: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface EvaluationResult {
  id: string;
  evaluation_run_id: string;
  brand_id: string;
  prompt_id: string;
  model_name: string;
  prompt_text: string;
  intent_category: string;
  response_text: string;
  is_mentioned: boolean;
  mention_rank?: number;
  mention_context?: string;
  is_cited: boolean;
  citation_urls?: string[];
  representation_score: number;
  description_text?: string;
  sentiment?: string;
  intent_fit_score?: number;
  response_time_ms?: number;
  evaluated_at: string;
}

export interface EvaluationRunDetail extends EvaluationRun {
  results: EvaluationResult[];
}

export interface EvaluationCreate {
  name?: string;
  models: string[];
  brand_ids?: string[];
  prompt_ids?: string[];
}

// ============ Prompt Types ============

export interface Prompt {
  id: string;
  text: string;
  intent_category: string;
  weight: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PromptCreate {
  text: string;
  intent_category: string;
  weight?: number;
  description?: string;
}

export interface PromptUpdate {
  text?: string;
  intent_category?: string;
  weight?: number;
  description?: string;
}

export interface PromptCategory {
  category: string;
  count: number;
}

// ============ Analytics Types ============

export interface TimeSeriesDataPoint {
  date: string;
  composite: number;
  visibility: number;
  citation: number;
  representation: number;
  intent: number;
}

export interface RadarDataPoint {
  dimension: string;
  [brandName: string]: string | number;
}

export interface ModelComparisonData {
  model: string;
  visibility: number;
  citation: number;
  representation: number;
  intent: number;
  composite: number;
}

export interface BrandComparisonData {
  brand_id: string;
  brand_name: string;
  category: string;
  composite_score: number;
  visibility_score: number;
  citation_score: number;
  representation_score: number;
  intent_score: number;
  total_mentions: number;
  citation_rate: number;
  intent_coverage: number;
  model_scores: Record<string, { score: number; mentions: number }>;
  last_evaluation_date: string | null;
}

export interface FunnelData {
  stage: string;
  value: number;
  percentage: number;
}

export interface HeatmapCell {
  brand: string;
  model: string;
  score: number;
}

// ============ Filter Types ============

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterState {
  dateRange: DateRange;
  selectedBrands: string[];
  selectedModels: string[];
  selectedDimensions: string[];
}

// ============ API Response Types ============

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// ============ Constants ============

export const AI_MODELS = [
  { id: 'gpt-4', name: 'ChatGPT', provider: 'OpenAI' },
  { id: 'gemini-pro', name: 'Gemini', provider: 'Google' },
  { id: 'claude-3', name: 'Claude', provider: 'Anthropic' },
  { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity AI' },
] as const;

export const GEO_DIMENSIONS = [
  { id: 'visibility', name: 'Visibility', weight: 0.35, color: '#3b82f6' },
  { id: 'citation', name: 'Citation', weight: 0.25, color: '#10b981' },
  { id: 'representation', name: 'Representation', weight: 0.25, color: '#f59e0b' },
  { id: 'intent', name: 'Intent Coverage', weight: 0.15, color: '#8b5cf6' },
] as const;

export const INTENT_CATEGORIES = [
  'Product Discovery',
  'Brand Comparison',
  'Purchase Decision',
  'Style Advice',
  'Size & Fit',
  'Price Research',
  'Gift Recommendations',
  'Trend Information',
  'Quality Assessment',
  'Sustainability',
  'Care Instructions',
  'Occasion Specific',
] as const;

// ============ Derived Types ============

export type AIModel = (typeof AI_MODELS)[number];

export type AttributionFunnel = FunnelData;

export type ModelScore = ModelComparisonData;

export interface TrendIndicator {
  direction: 'up' | 'down' | 'stable';
  change: number;
}
