'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingBrands,
  LLMComparison,
  SentimentGauge,
  CategoryFilter,
} from '@/components/insights';
import {
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  Database,
  TrendingUp,
  Bot,
  Zap,
  ExternalLink,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TrendingBrand {
  brand: string;
  category: string;
  mention_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_percentage: number;
  sentiment_score: number;
  model_coverage: number;
}

interface LLMModel {
  model: string;
  total_mentions: number;
  unique_brands: number;
  positive_rate: number;
  negative_rate: number;
  neutral_rate: number;
  top_brands: [string, number][];
}

interface Category {
  category: string;
  brand_count: number;
  mention_count: number;
}

interface SentimentData {
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
  by_model: {
    model: string;
    positive: number;
    negative: number;
    neutral: number;
  }[];
}

interface Summary {
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
}

export default function InsightsPage() {
  const [trendingBrands, setTrendingBrands] = useState<TrendingBrand[]>([]);
  const [llmComparison, setLlmComparison] = useState<LLMModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryParam = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';

      const [trendingRes, llmRes, categoriesRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/insights/trending?limit=10${categoryParam}`),
        fetch(`${API_BASE_URL}/api/v1/insights/llm-comparison`),
        fetch(`${API_BASE_URL}/api/v1/insights/categories`),
        fetch(`${API_BASE_URL}/api/v1/insights/summary`),
      ]);

      if (!trendingRes.ok || !llmRes.ok || !categoriesRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch insights data');
      }

      const [trendingData, llmData, categoriesData, summaryData] = await Promise.all([
        trendingRes.json(),
        llmRes.json(),
        categoriesRes.json(),
        summaryRes.json(),
      ]);

      setTrendingBrands(trendingData.brands || []);
      setLlmComparison(llmData.models || []);
      setCategories(categoriesData.categories || []);
      setSummary(summaryData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load insights';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Fetch sentiment for selected brand
  const fetchSentiment = useCallback(async (brand: string) => {
    try {
      setSentimentLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/insights/sentiment/${encodeURIComponent(brand)}`);
      if (!res.ok) throw new Error('Failed to fetch sentiment');
      const data = await res.json();
      setSentimentData(data);
    } catch (err) {
      console.error('Failed to fetch sentiment:', err);
      setSentimentData(null);
    } finally {
      setSentimentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedBrand) {
      fetchSentiment(selectedBrand);
    } else {
      setSentimentData(null);
    }
  }, [selectedBrand, fetchSentiment]);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(selectedBrand === brand ? null : brand);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading insights...</p>
          <p className="text-sm text-slate-400 mt-1">Analyzing brand mentions across LLM conversations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-slate-700 font-medium mb-2">Failed to load insights</p>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-violet-600" />
            Insights Explorer
          </h1>
          <p className="text-slate-500 mt-1">
            Discover brand visibility patterns from public LLM conversations
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-90">Total Mentions</span>
            </div>
            <p className="text-3xl font-bold">{summary.total_mentions.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">
              {summary.data_sources.llm_conversations} LLM + {summary.data_sources.reviews} reviews
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-90">Unique Brands</span>
            </div>
            <p className="text-3xl font-bold">{summary.unique_brands}</p>
            <p className="text-xs opacity-75 mt-1">Across {summary.categories} categories</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-90">Positive Sentiment</span>
            </div>
            <p className="text-3xl font-bold">
              {summary.total_mentions > 0
                ? Math.round((summary.sentiment_overview.positive / summary.total_mentions) * 100)
                : 0}%
            </p>
            <p className="text-xs opacity-75 mt-1">{summary.sentiment_overview.positive} positive mentions</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-90">LLM Models</span>
            </div>
            <p className="text-3xl font-bold">{llmComparison.filter(m => m.model !== 'Reviews').length}</p>
            <p className="text-xs opacity-75 mt-1">Models analyzed</p>
          </div>
        </div>
      )}

      {/* Data source info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">Data Sources</h4>
            <p className="text-sm text-blue-700 mt-1">
              Insights are derived from synthetic data mimicking patterns found in LMSYS-Chat-1M
              (LLM conversations) and Amazon Reviews. This demo shows how brand visibility can be
              tracked across different AI models.
            </p>
          </div>
          <a
            href="https://huggingface.co/datasets/lmsys/lmsys-chat-1m"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Trending + LLM Comparison */}
        <div className="lg:col-span-2 space-y-6">
          <TrendingBrands
            data={trendingBrands}
            onBrandSelect={handleBrandSelect}
            selectedBrand={selectedBrand}
          />
          <LLMComparison data={llmComparison} selectedBrand={selectedBrand} />
        </div>

        {/* Right column - Categories + Sentiment */}
        <div className="space-y-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <SentimentGauge data={sentimentData} loading={sentimentLoading} />
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center text-sm text-slate-400 pt-4">
        <p>
          💡 Click on any brand in the chart to see its detailed sentiment analysis
        </p>
      </div>
    </div>
  );
}
