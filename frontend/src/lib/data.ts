/**
 * Mock data and data utilities for GEO Insights Dashboard.
 */

import type {
  BrandWithScore,
  TimeSeriesDataPoint,
  RadarDataPoint,
  ModelComparisonData,
  FunnelData,
  HeatmapCell,
  GEOScore,
} from './types';

// ============ Mock Brands Data ============

export const MOCK_BRANDS: BrandWithScore[] = [
  {
    id: '1',
    workspace_id: 'ws-1',
    name: 'Carter\'s',
    slug: 'carters',
    domain: 'carters.com',
    category: 'Kids Fashion',
    positioning: 'premium',
    price_tier: 'mid',
    target_age_range: '0-10',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    score: {
      id: 's1',
      brand_id: '1',
      composite_score: 82,
      visibility_score: 85,
      citation_score: 78,
      representation_score: 80,
      intent_score: 84,
      total_mentions: 156,
      avg_rank: 2.3,
      citation_rate: 0.65,
      intent_coverage: 0.84,
      evaluation_count: 12,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  },
  {
    id: '2',
    workspace_id: 'ws-1',
    name: 'OshKosh B\'Gosh',
    slug: 'oshkosh',
    domain: 'oshkosh.com',
    category: 'Kids Fashion',
    positioning: 'premium',
    price_tier: 'mid',
    target_age_range: '2-12',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    score: {
      id: 's2',
      brand_id: '2',
      composite_score: 76,
      visibility_score: 79,
      citation_score: 72,
      representation_score: 75,
      intent_score: 78,
      total_mentions: 134,
      avg_rank: 3.1,
      citation_rate: 0.58,
      intent_coverage: 0.78,
      evaluation_count: 12,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  },
  {
    id: '3',
    workspace_id: 'ws-1',
    name: 'Gymboree',
    slug: 'gymboree',
    domain: 'gymboree.com',
    category: 'Kids Fashion',
    positioning: 'value',
    price_tier: 'budget',
    target_age_range: '0-8',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    score: {
      id: 's3',
      brand_id: '3',
      composite_score: 68,
      visibility_score: 70,
      citation_score: 62,
      representation_score: 72,
      intent_score: 66,
      total_mentions: 98,
      avg_rank: 4.2,
      citation_rate: 0.45,
      intent_coverage: 0.66,
      evaluation_count: 12,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  },
  {
    id: '4',
    workspace_id: 'ws-1',
    name: 'Primary',
    slug: 'primary',
    domain: 'primary.com',
    category: 'Kids Fashion',
    positioning: 'premium',
    price_tier: 'premium',
    target_age_range: '0-12',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    score: {
      id: 's4',
      brand_id: '4',
      composite_score: 74,
      visibility_score: 72,
      citation_score: 76,
      representation_score: 78,
      intent_score: 70,
      total_mentions: 112,
      avg_rank: 3.5,
      citation_rate: 0.62,
      intent_coverage: 0.70,
      evaluation_count: 12,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  },
  {
    id: '5',
    workspace_id: 'ws-1',
    name: 'Hanna Andersson',
    slug: 'hanna-andersson',
    domain: 'hannaandersson.com',
    category: 'Kids Fashion',
    positioning: 'premium',
    price_tier: 'premium',
    target_age_range: '0-14',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    score: {
      id: 's5',
      brand_id: '5',
      composite_score: 71,
      visibility_score: 68,
      citation_score: 74,
      representation_score: 76,
      intent_score: 65,
      total_mentions: 89,
      avg_rank: 4.0,
      citation_rate: 0.58,
      intent_coverage: 0.65,
      evaluation_count: 12,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  },
  {
    id: '6',
    workspace_id: 'ws-1',
    name: 'Tea Collection',
    slug: 'tea-collection',
    domain: 'teacollection.com',
    category: 'Kids Fashion',
    positioning: 'premium',
    price_tier: 'premium',
    target_age_range: '0-12',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    score: {
      id: 's6',
      brand_id: '6',
      composite_score: 65,
      visibility_score: 62,
      citation_score: 68,
      representation_score: 70,
      intent_score: 58,
      total_mentions: 76,
      avg_rank: 5.2,
      citation_rate: 0.52,
      intent_coverage: 0.58,
      evaluation_count: 12,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
  },
];

// ============ Generate Time Series Data ============

export function generateTimeSeriesData(
  brandIds: string[],
  days = 30
): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic scores with some variation
    const baseComposite = 70 + Math.random() * 15;
    data.push({
      date: date.toISOString().split('T')[0],
      composite: Math.round(baseComposite + Math.sin(i / 5) * 5),
      visibility: Math.round(baseComposite + 5 + Math.random() * 10 - 5),
      citation: Math.round(baseComposite - 5 + Math.random() * 10 - 5),
      representation: Math.round(baseComposite + Math.random() * 10 - 5),
      intent: Math.round(baseComposite - 2 + Math.random() * 10 - 5),
    });
  }

  return data;
}

// ============ Generate Radar Data ============

export function generateRadarData(brands: BrandWithScore[]): RadarDataPoint[] {
  const dimensions = ['Visibility', 'Citation', 'Representation', 'Intent'];

  return dimensions.map((dimension) => {
    const point: RadarDataPoint = { dimension };

    brands.forEach((brand) => {
      if (brand.score) {
        const key = dimension.toLowerCase().replace(' ', '_') + '_score';
        point[brand.name] = (brand.score as unknown as Record<string, number>)[key] || 0;
      }
    });

    return point;
  });
}

// ============ Generate Model Comparison Data ============

export function generateModelComparisonData(): ModelComparisonData[] {
  return [
    {
      model: 'ChatGPT',
      visibility: 82,
      citation: 75,
      representation: 78,
      intent: 80,
      composite: 79,
    },
    {
      model: 'Gemini',
      visibility: 78,
      citation: 72,
      representation: 76,
      intent: 74,
      composite: 75,
    },
    {
      model: 'Claude',
      visibility: 80,
      citation: 78,
      representation: 82,
      intent: 76,
      composite: 79,
    },
    {
      model: 'Perplexity',
      visibility: 85,
      citation: 88,
      representation: 74,
      intent: 82,
      composite: 82,
    },
  ];
}

// ============ Generate Funnel Data ============

export function generateFunnelData(): FunnelData[] {
  const totalQueries = 1000;
  return [
    { stage: 'Queries', value: totalQueries, percentage: 100 },
    { stage: 'Brand Mentioned', value: 680, percentage: 68 },
    { stage: 'Top 3 Position', value: 420, percentage: 42 },
    { stage: 'Cited with Link', value: 280, percentage: 28 },
    { stage: 'Recommended', value: 180, percentage: 18 },
  ];
}

// ============ Generate Heatmap Data ============

export function generateHeatmapData(brands: BrandWithScore[]): HeatmapCell[] {
  const models = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];
  const cells: HeatmapCell[] = [];

  brands.slice(0, 8).forEach((brand) => {
    models.forEach((model) => {
      cells.push({
        brand: brand.name,
        model,
        score: Math.round(60 + Math.random() * 35),
      });
    });
  });

  return cells;
}

// ============ Score Utilities ============

export function calculateCompositeScore(score: Partial<GEOScore>): number {
  const visibility = score.visibility_score || 0;
  const citation = score.citation_score || 0;
  const representation = score.representation_score || 0;
  const intent = score.intent_score || 0;

  return Math.round(
    visibility * 0.35 + citation * 0.25 + representation * 0.25 + intent * 0.15
  );
}

export function getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 65) return '#3b82f6'; // blue
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function getTrendIndicator(current: number, previous: number): {
  direction: 'up' | 'down' | 'stable';
  change: number;
} {
  const change = current - previous;
  if (Math.abs(change) < 1) {
    return { direction: 'stable', change: 0 };
  }
  return {
    direction: change > 0 ? 'up' : 'down',
    change: Math.abs(Math.round(change * 10) / 10),
  };
}

// ============ Format Utilities ============

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============ Compatibility Aliases ============

// Alias for backwards compatibility
export const BRANDS = MOCK_BRANDS;

// Re-export GEOScore from types
export type { GEOScore } from './types';

// Model breakdown data - indexed by brand ID
const defaultModelBreakdown: ModelComparisonData[] = [
  { model: 'ChatGPT', visibility: 82, citation: 75, representation: 78, intent: 80, composite: 79 },
  { model: 'Gemini', visibility: 78, citation: 72, representation: 76, intent: 74, composite: 75 },
  { model: 'Claude', visibility: 80, citation: 78, representation: 82, intent: 76, composite: 79 },
  { model: 'Perplexity', visibility: 85, citation: 88, representation: 74, intent: 82, composite: 82 },
];

export const MODEL_BREAKDOWN: Record<string, ModelComparisonData[]> = {
  '1': defaultModelBreakdown,
  '2': defaultModelBreakdown,
  '3': defaultModelBreakdown,
  '4': defaultModelBreakdown,
  '5': defaultModelBreakdown,
  '6': defaultModelBreakdown,
};

// Get historical scores by brand ID
export function getHistoricalScoresById(brandId: string): TimeSeriesDataPoint[] {
  return generateTimeSeriesData([brandId], 30);
}

// Get model breakdown by brand ID
export function getModelBreakdownById(brandId: string): ModelComparisonData[] {
  return generateModelComparisonData();
}

// Get funnel data by brand ID
export function getFunnelDataById(brandId: string): FunnelData[] {
  return generateFunnelData();
}

// Scores alias - indexed by brand ID for easy lookup
export const SCORES: Record<string, { composite: number; visibility: number; citation: number; representation: number; intent: number }> =
  MOCK_BRANDS.reduce((acc, brand) => {
    if (brand.score) {
      acc[brand.id] = {
        composite: brand.score.composite_score,
        visibility: brand.score.visibility_score,
        citation: brand.score.citation_score,
        representation: brand.score.representation_score,
        intent: brand.score.intent_score,
      };
    }
    return acc;
  }, {} as Record<string, { composite: number; visibility: number; citation: number; representation: number; intent: number }>);

// Mock evaluation runs data
export const ALL_EVALUATION_RUNS = [
  {
    id: 'eval-1',
    name: 'Weekly Brand Check',
    brandName: "Carter's",
    status: 'completed',
    startedAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T10:45:00Z',
    totalBrands: 30,
    totalPrompts: 120,
    completedPrompts: 120,
    modelsUsed: ['ChatGPT', 'Gemini', 'Claude'],
    duration: '45m',
    progress: 100,
  },
  {
    id: 'eval-2',
    name: 'Monthly Deep Analysis',
    brandName: "OshKosh B'Gosh",
    status: 'completed',
    startedAt: '2024-01-10T14:00:00Z',
    completedAt: '2024-01-10T16:30:00Z',
    totalBrands: 30,
    totalPrompts: 120,
    completedPrompts: 120,
    modelsUsed: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'],
    duration: '2h 30m',
    progress: 100,
  },
  {
    id: 'eval-3',
    name: 'New Brand Evaluation',
    brandName: 'Gymboree',
    status: 'running',
    startedAt: '2024-01-16T09:00:00Z',
    completedAt: null,
    totalBrands: 5,
    totalPrompts: 120,
    completedPrompts: 78,
    modelsUsed: ['ChatGPT', 'Claude'],
    duration: null,
    progress: 65,
  },
  {
    id: 'eval-4',
    name: 'Competitor Analysis',
    brandName: 'Primary',
    status: 'pending',
    startedAt: null,
    completedAt: null,
    totalBrands: 10,
    totalPrompts: 120,
    completedPrompts: 0,
    modelsUsed: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'],
    duration: null,
    progress: 0,
  },
];
