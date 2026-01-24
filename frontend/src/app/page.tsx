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
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Loading brands and scores...</p>
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GEO Attribution Dashboard</h1>
          <p className="text-gray-600">
            Real-time brand performance across AI chatbot platforms
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Brands"
            value={totalBrands}
            icon={<Target className="w-6 h-6" />}
          />
          <StatCard
            label="Average GEO Score"
            value={avgComposite}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            label="Best Dimension"
            value={bestDimension}
            icon={<BarChart3 className="w-6 h-6" />}
          />
        </div>

        {/* Brand ScoreCards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-neutral-900">Brand Performance</h2>
            <Link href="/analytics">
              <Button variant="outline">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {top3.map((brand, index) => (
                  <div key={brand.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{brand.name}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {brand.score?.composite_score}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottom3.map((brand, index) => (
                  <div key={brand.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{brand.name}</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {brand.score?.composite_score}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Connected to backend API</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {brandsWithScores.length} brands with evaluation data
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
