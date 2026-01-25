'use client';

import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';
import ScoreCard from '@/components/geo/ScoreCard';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const { brands, loading, error } = useBrands();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
              <Loader2 className="w-16 h-16 animate-spin text-white relative z-10" />
            </div>
          </div>
          <div>
            <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Loading GEO Insights
            </p>
            <p className="text-sm text-slate-600 mt-2">Fetching brand performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              Make sure the backend API is running at{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code>
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats from real data
  const brandsWithScores = brands.filter((b) => b.score);
  const totalBrands = brands.length;
  const avgComposite =
    brandsWithScores.length > 0
      ? Math.round(
          brandsWithScores.reduce((sum, b) => sum + (b.score?.composite_score || 0), 0) /
            brandsWithScores.length
        )
      : 0;

  // Find best dimension
  const dimensionAverages = {
    Visibility: brandsWithScores.reduce((sum, b) => sum + (b.score?.visibility_score || 0), 0) / brandsWithScores.length,
    Citation: brandsWithScores.reduce((sum, b) => sum + (b.score?.citation_score || 0), 0) / brandsWithScores.length,
    Representation: brandsWithScores.reduce((sum, b) => sum + (b.score?.representation_score || 0), 0) / brandsWithScores.length,
    Intent: brandsWithScores.reduce((sum, b) => sum + (b.score?.intent_score || 0), 0) / brandsWithScores.length,
  };
  const bestDimension = Object.entries(dimensionAverages).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  // Top and bottom performers
  const sortedByScore = [...brandsWithScores].sort(
    (a, b) => (b.score?.composite_score || 0) - (a.score?.composite_score || 0)
  );
  const top3 = sortedByScore.slice(0, 3);
  const bottom3 = sortedByScore.slice(-3).reverse();

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl shadow-purple-500/20">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Welcome to GEO Insights
            </h1>
            <p className="text-xl text-purple-100 mb-6 max-w-2xl">
              Track and optimize your brand performance in the AI era across major platforms
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">ChatGPT</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Gemini</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Claude</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Perplexity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm shadow-purple-500/5 border border-slate-200/60 p-6 hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Brands</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
                  {totalBrands}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Actively monitored</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm shadow-blue-500/5 border border-slate-200/60 p-6 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Average GEO Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                  {avgComposite}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Across all platforms</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm shadow-green-500/5 border border-slate-200/60 p-6 hover:shadow-md hover:shadow-green-500/10 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Best Dimension</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                  {bestDimension}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Top performing metric</p>
          </div>
        </div>

        {/* Brand ScoreCards */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Brand Performance</h2>
              <p className="text-sm text-slate-600 mt-1">Real-time GEO scores across all dimensions</p>
            </div>
            <Link href="/analytics">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandsWithScores.map((brand) => (
              <ScoreCard
                key={brand.id}
                brandName={brand.name}
                category={brand.category}
                score={{
                  brandId: brand.id,
                  brandName: brand.name,
                  scores: {
                    composite: brand.score!.composite_score,
                    visibility: brand.score!.visibility_score,
                    citation: brand.score!.citation_score,
                    representation: brand.score!.representation_score,
                    intent: brand.score!.intent_score,
                  },
                  totalMentions: brand.score!.total_mentions,
                  avgRank: brand.score!.avg_rank || undefined,
                  citationRate: brand.score!.citation_rate,
                  intentCoverage: brand.score!.intent_coverage,
                  lastUpdated: brand.score!.last_evaluation_date || brand.score!.updated_at,
                }}
              />
            ))}
          </div>
        </section>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm shadow-green-500/5 border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <h3 className="text-lg font-bold text-slate-900">🏆 Top Performers</h3>
              <p className="text-sm text-slate-600 mt-1">Brands leading in AI visibility</p>
            </div>
            <div className="p-6 space-y-3">
              {top3.map((brand, index) => (
                <div key={brand.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-green-500/30">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-slate-900">{brand.name}</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {brand.score?.composite_score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm shadow-orange-500/5 border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100">
              <h3 className="text-lg font-bold text-slate-900">⚠️ Needs Attention</h3>
              <p className="text-sm text-slate-600 mt-1">Brands requiring optimization</p>
            </div>
            <div className="p-6 space-y-3">
              {bottom3.map((brand, index) => (
                <div key={brand.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold shadow-lg shadow-orange-500/30">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-slate-900">{brand.name}</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {brand.score?.composite_score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">🚀 System Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm font-medium text-green-600">All Systems Operational</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {brandsWithScores.length} brands actively monitored | API connected
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm">
                <div className="text-xs text-slate-500">Uptime</div>
                <div className="text-sm font-bold text-slate-900">99.9%</div>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm">
                <div className="text-xs text-slate-500">Evaluations</div>
                <div className="text-sm font-bold text-slate-900">1.2K+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
