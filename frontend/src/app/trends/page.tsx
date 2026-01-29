'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeSeriesChart } from '@/components/charts';
import { scoresApi, DEFAULT_WORKSPACE_ID } from '@/lib/api';
import { useBrands } from '@/hooks/useBrands';
import type { TimeSeriesDataPoint } from '@/lib/types';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function TrendsPage() {
  const { brands } = useBrands();
  const [trendData, setTrendData] = useState<TimeSeriesDataPoint[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scoresApi.getTrends(
        DEFAULT_WORKSPACE_ID,
        selectedBrandId || undefined,
      );
      setTrendData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trends';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedBrandId]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Compute trend indicators from data
  const computeTrend = (key: keyof TimeSeriesDataPoint) => {
    if (trendData.length < 2) return { direction: 'stable' as const, change: 0 };
    const latest = trendData[trendData.length - 1][key] as number;
    const previous = trendData[trendData.length - 2][key] as number;
    const change = latest - previous;
    const direction = change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'stable' as const;
    return { direction, change };
  };

  const compositeTrend = computeTrend('composite');
  const visibilityTrend = computeTrend('visibility');
  const citationTrend = computeTrend('citation');
  const representationTrend = computeTrend('representation');

  const trendCards = [
    { label: 'Composite', key: 'composite' as const, trend: compositeTrend, color: 'indigo' },
    { label: 'Visibility', key: 'visibility' as const, trend: visibilityTrend, color: 'blue' },
    { label: 'Citation', key: 'citation' as const, trend: citationTrend, color: 'green' },
    { label: 'Representation', key: 'representation' as const, trend: representationTrend, color: 'amber' },
  ];

  const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
    if (direction === 'up') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (direction === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const latestData = trendData.length > 0 ? trendData[trendData.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LineChart className="w-6 h-6 text-violet-600" />
              Score Trends
            </h1>
            <p className="text-slate-500 mt-1">
              Track GEO score changes over time across evaluation runs
            </p>
          </div>
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Brand Filter */}
        <Card className="border-slate-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">View trends for:</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-w-[200px]"
              >
                <option value="">All Brands (Average)</option>
                {brands
                  .filter(b => b.score)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
              </select>
              {selectedBrandId && (
                <button
                  onClick={() => setSelectedBrandId('')}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trend Indicator Cards */}
        {latestData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendCards.map((card) => (
              <div key={card.key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {card.label}
                  </span>
                  <TrendIcon direction={card.trend.direction} />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {latestData[card.key] as number}
                </p>
                {card.trend.change !== 0 && (
                  <p className={`text-xs font-medium mt-1 ${
                    card.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {card.trend.change > 0 ? '+' : ''}{card.trend.change} from previous
                  </p>
                )}
                {card.trend.change === 0 && (
                  <p className="text-xs text-slate-400 mt-1">No change</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Chart */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedBrandId
                  ? `${brands.find(b => b.id === selectedBrandId)?.name || 'Brand'} Score History`
                  : 'Average Score Trends'}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {trendData.length} evaluation{trendData.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-16 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                <p className="text-slate-600 font-medium">{error}</p>
                <button
                  onClick={fetchTrends}
                  className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <LineChart className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No trend data yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Run multiple evaluations to see score trends over time
                </p>
              </div>
            ) : (
              <TimeSeriesChart data={trendData} height={400} />
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        {trendData.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Score History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Composite</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Visibility</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Citation</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Representation</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase">Intent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...trendData].reverse().map((point, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {new Date(point.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-600">{point.composite}</td>
                        <td className="py-2.5 px-3 text-right text-blue-600">{point.visibility}</td>
                        <td className="py-2.5 px-3 text-right text-green-600">{point.citation}</td>
                        <td className="py-2.5 px-3 text-right text-amber-600">{point.representation}</td>
                        <td className="py-2.5 px-3 text-right text-purple-600">{point.intent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
