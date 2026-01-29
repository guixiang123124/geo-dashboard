'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadarChart } from '@/components/charts';
import { scoresApi, DEFAULT_WORKSPACE_ID } from '@/lib/api';
import { useBrands } from '@/hooks/useBrands';
import type { BrandComparisonData, GEOScore } from '@/lib/types';
import {
  GitCompareArrows,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Trophy,
  Eye,
  Link2,
  MessageSquare,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

const DIMENSION_META = [
  { key: 'visibility_score', label: 'Visibility', radarKey: 'Visibility', weight: '35%', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'citation_score', label: 'Citation', radarKey: 'Citation', weight: '25%', icon: Link2, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'representation_score', label: 'Representation', radarKey: 'Representation', weight: '25%', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'intent_score', label: 'Intent', radarKey: 'Intent', weight: '15%', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
] as const;

export default function ComparePage() {
  const { brands } = useBrands();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<BrandComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBrand = useCallback((brandId: string) => {
    if (selectedIds.includes(brandId) || selectedIds.length >= 5) return;
    setSelectedIds(prev => [...prev, brandId]);
  }, [selectedIds]);

  const removeBrand = useCallback((brandId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== brandId));
  }, []);

  // Fetch comparison data when selection changes
  useEffect(() => {
    if (selectedIds.length < 2) {
      setComparisonData([]);
      return;
    }

    async function fetchComparison() {
      try {
        setLoading(true);
        setError(null);
        const data = await scoresApi.getComparison(DEFAULT_WORKSPACE_ID, selectedIds);
        setComparisonData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load comparison';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [selectedIds]);

  // Color palette for radar chart brands
  const BRAND_COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#e11d48'];

  // Prepare radar chart data in the format RadarChart expects
  const radarBrands = comparisonData.map((brand, index) => ({
    name: brand.brand_name,
    score: {
      composite_score: brand.composite_score,
      visibility_score: brand.visibility_score,
      citation_score: brand.citation_score,
      representation_score: brand.representation_score,
      intent_score: brand.intent_score,
    } as GEOScore,
    color: BRAND_COLORS[index % BRAND_COLORS.length],
  }));

  // Find winner per dimension
  const getWinner = (key: typeof DIMENSION_META[number]['key']) => {
    if (comparisonData.length === 0) return null;
    return comparisonData.reduce((best, brand) =>
      brand[key] > best[key] ? brand : best
    );
  };

  // Sort brands by composite for ranking
  const rankedBrands = [...comparisonData].sort(
    (a, b) => b.composite_score - a.composite_score
  );

  const availableBrands = brands
    .filter(b => b.score && !selectedIds.includes(b.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitCompareArrows className="w-6 h-6 text-violet-600" />
            Head-to-Head Comparison
          </h1>
          <p className="text-slate-500 mt-1">
            Compare brand GEO scores side by side (select 2-5 brands)
          </p>
        </div>

        {/* Brand Selector */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Brands to Compare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected brands */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedIds.map(id => {
                  const brand = brands.find(b => b.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full border border-violet-200"
                    >
                      <span className="text-sm font-medium">{brand?.name || id}</span>
                      <button
                        onClick={() => removeBrand(id)}
                        className="p-0.5 hover:bg-violet-200 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add brand dropdown */}
            {selectedIds.length < 5 && (
              <div className="flex items-center gap-3">
                <Plus className="w-4 h-4 text-slate-400" />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addBrand(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Add a brand to compare...</option>
                  {availableBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} — Score: {brand.score?.composite_score ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedIds.length < 2 && (
              <p className="text-xs text-slate-500">
                Select at least 2 brands to see comparison
              </p>
            )}
          </CardContent>
        </Card>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Comparison Results */}
        {comparisonData.length >= 2 && !loading && (
          <>
            {/* Ranking Bar */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Overall Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankedBrands.map((brand, index) => {
                    const maxScore = rankedBrands[0].composite_score || 1;
                    const barWidth = (brand.composite_score / maxScore) * 100;
                    return (
                      <div key={brand.brand_id} className="flex items-center gap-3">
                        <span className={`text-lg font-bold w-8 text-right ${
                          index === 0 ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Link href={`/brands/${brand.brand_id}`}>
                              <span className="text-sm font-semibold text-slate-900 hover:text-violet-600 transition-colors">
                                {brand.brand_name}
                              </span>
                            </Link>
                            <span className={`text-lg font-bold ${
                              index === 0 ? 'text-emerald-600' : 'text-slate-700'
                            }`}>
                              {brand.composite_score}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                index === 0 ? 'bg-emerald-500' : 'bg-violet-400'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Dimension Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart brands={radarBrands} height={400} />
              </CardContent>
            </Card>

            {/* Dimension Breakdown */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-3 text-xs font-medium text-slate-500 uppercase">Dimension</th>
                        {comparisonData.map(brand => (
                          <th key={brand.brand_id} className="text-right py-3 px-3 text-xs font-medium text-slate-500 uppercase">
                            {brand.brand_name}
                          </th>
                        ))}
                        <th className="text-right py-3 px-3 text-xs font-medium text-slate-500 uppercase">Leader</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Composite row */}
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">Composite Score</td>
                        {comparisonData.map(brand => {
                          const isWinner = getWinner('composite_score' as never)?.brand_id === brand.brand_id;
                          return (
                            <td key={brand.brand_id} className={`py-3 px-3 text-right font-bold ${isWinner ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {brand.composite_score}
                              {isWinner && <Trophy className="w-3 h-3 inline ml-1 text-amber-500" />}
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-right text-xs font-medium text-emerald-600">
                          {getWinner('composite_score' as never)?.brand_name}
                        </td>
                      </tr>

                      {/* Dimension rows */}
                      {DIMENSION_META.map(dim => {
                        const winner = getWinner(dim.key);
                        const Icon = dim.icon;
                        return (
                          <tr key={dim.key} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${dim.color}`} />
                                <span className="font-medium text-slate-700">{dim.label}</span>
                                <span className="text-xs text-slate-400">{dim.weight}</span>
                              </div>
                            </td>
                            {comparisonData.map(brand => {
                              const value = brand[dim.key];
                              const isWinner = winner?.brand_id === brand.brand_id;
                              return (
                                <td key={brand.brand_id} className={`py-3 px-3 text-right font-semibold ${isWinner ? 'text-emerald-600' : 'text-slate-600'}`}>
                                  {value}
                                  {isWinner && comparisonData.length > 1 && (
                                    <ArrowUpRight className="w-3 h-3 inline ml-0.5 text-emerald-500" />
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-3 px-3 text-right text-xs font-medium text-emerald-600">
                              {winner?.brand_name}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Additional metrics */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-700">Total Mentions</td>
                        {comparisonData.map(brand => (
                          <td key={brand.brand_id} className="py-3 px-3 text-right text-slate-600 font-semibold">
                            {brand.total_mentions}
                          </td>
                        ))}
                        <td className="py-3 px-3"></td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-700">Citation Rate</td>
                        {comparisonData.map(brand => (
                          <td key={brand.brand_id} className="py-3 px-3 text-right text-slate-600 font-semibold">
                            {Math.round(brand.citation_rate * 100)}%
                          </td>
                        ))}
                        <td className="py-3 px-3"></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-700">Intent Coverage</td>
                        {comparisonData.map(brand => (
                          <td key={brand.brand_id} className="py-3 px-3 text-right text-slate-600 font-semibold">
                            {Math.round(brand.intent_coverage * 100)}%
                          </td>
                        ))}
                        <td className="py-3 px-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonData.map(brand => {
                const scores = DIMENSION_META.map(d => ({
                  label: d.label,
                  value: brand[d.key],
                  icon: d.icon,
                  color: d.color,
                }));
                const strongest = scores.reduce((a, b) => a.value > b.value ? a : b);
                const weakest = scores.reduce((a, b) => a.value < b.value ? a : b);

                return (
                  <Card key={brand.brand_id} className="border-slate-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{brand.brand_name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{brand.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center py-2">
                        <p className="text-3xl font-bold text-slate-900">{brand.composite_score}</p>
                        <p className="text-xs text-slate-500">Composite GEO Score</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs text-emerald-700">
                            <strong>Strength:</strong> {strongest.label} ({strongest.value})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs text-red-700">
                            <strong>Improve:</strong> {weakest.label} ({weakest.value})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {selectedIds.length < 2 && !loading && (
          <Card className="border-slate-200 border-dashed">
            <CardContent className="py-16 text-center">
              <GitCompareArrows className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Select brands to compare</p>
              <p className="text-sm text-slate-500 mt-1">
                Choose 2-5 brands above to see a head-to-head GEO score comparison
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
