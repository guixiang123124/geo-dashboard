'use client';

import React from 'react';
import Link from 'next/link';
import { RadarChart, HeatmapChart, FunnelChart, ModelComparisonChart } from '@/components/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrands } from '@/hooks/useBrands';
import { RefreshCw, AlertCircle, BarChart3, TrendingUp, Award, Eye, Link2, FileText, Target, Users, Activity } from 'lucide-react';

function getScoreColor(score: number): string {
    if (score >= 25) return 'text-green-700';
    if (score >= 10) return 'text-blue-700';
    if (score > 0) return 'text-amber-700';
    return 'text-slate-500';
}

function getBarWidth(score: number, max: number): string {
    if (max === 0) return '0%';
    return `${Math.min(100, (score / max) * 100)}%`;
}

export default function AnalyticsPage() {
    const { brands, loading, error } = useBrands();

    if (loading) {
        return (
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Analytics
                    </h1>
                    <p className="text-slate-500 mt-2">GEO performance analytics across brands and AI models</p>
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500">Loading analytics...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
                    <Card className="mt-8 border-red-200 bg-red-50">
                        <CardContent className="p-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700">{error}</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const allScored = brands.filter(b => b.score);
    const brandsWithScores = brands.filter(b => b.score && b.score.composite_score > 0);
    const sortedByComposite = [...brandsWithScores].sort(
        (a, b) => (b.score?.composite_score ?? 0) - (a.score?.composite_score ?? 0)
    );
    const maxComposite = sortedByComposite[0]?.score?.composite_score ?? 1;
    const topBrands = sortedByComposite.slice(0, 10);

    // Aggregate stats
    const totalBrands = brands.length;
    const scoredBrands = allScored.length;
    const visibleBrands = brandsWithScores.length;

    const safeDiv = (num: number, den: number) => den > 0 ? Math.round(num / den) : 0;

    const avgComposite = safeDiv(
        allScored.reduce((sum, b) => sum + (b.score?.composite_score ?? 0), 0),
        scoredBrands
    );
    const avgVisibility = safeDiv(
        allScored.reduce((sum, b) => sum + (b.score?.visibility_score ?? 0), 0),
        scoredBrands
    );
    const avgCitation = safeDiv(
        allScored.reduce((sum, b) => sum + (b.score?.citation_score ?? 0), 0),
        scoredBrands
    );
    const avgRepresentation = safeDiv(
        allScored.reduce((sum, b) => sum + (b.score?.representation_score ?? 0), 0),
        scoredBrands
    );
    const avgIntent = safeDiv(
        allScored.reduce((sum, b) => sum + (b.score?.intent_score ?? 0), 0),
        scoredBrands
    );
    const totalMentions = allScored.reduce((sum, b) => sum + (b.score?.total_mentions ?? 0), 0);
    const mentionRate = scoredBrands > 0 ? Math.round((visibleBrands / scoredBrands) * 100) : 0;

    // Radar data for top 5
    const radarBrands = sortedByComposite.slice(0, 5).map((b, i) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
        return {
            name: b.name,
            score: {
                composite_score: b.score?.composite_score ?? 0,
                visibility_score: b.score?.visibility_score ?? 0,
                citation_score: b.score?.citation_score ?? 0,
                representation_score: b.score?.representation_score ?? 0,
                intent_score: b.score?.intent_score ?? 0,
            },
            color: colors[i % colors.length],
        };
    });

    // Heatmap - show model scores for brands that have them
    const heatmapBrands: string[] = [];
    const heatmapModels: string[] = [];
    const heatmapData: Array<{ brand: string; model: string; score: number }> = [];

    for (const brand of sortedByComposite.slice(0, 15)) {
        if (brand.score?.model_scores) {
            heatmapBrands.push(brand.name);
            for (const [model, entry] of Object.entries(brand.score.model_scores)) {
                if (!heatmapModels.includes(model)) {
                    heatmapModels.push(model);
                }
                heatmapData.push({
                    brand: brand.name,
                    model,
                    score: entry.score ?? 0,
                });
            }
        }
    }

    // Funnel data for FunnelChart component
    const funnelData = [
        { stage: 'Recall', value: scoredBrands > 0 ? 100 : 0, percentage: 100, label: `${scoredBrands} brands evaluated` },
        { stage: 'Visibility', value: scoredBrands > 0 ? Math.round((visibleBrands / scoredBrands) * 100) : 0, percentage: scoredBrands > 0 ? Math.round((visibleBrands / scoredBrands) * 100) : 0, label: `${visibleBrands} brands mentioned by AI` },
        { stage: 'Citation', value: scoredBrands > 0 ? Math.round((allScored.filter(b => (b.score?.citation_score ?? 0) > 0).length / scoredBrands) * 100) : 0, percentage: 0, label: 'Cited with links' },
        { stage: 'Conversion', value: scoredBrands > 0 ? Math.round((allScored.filter(b => (b.score?.composite_score ?? 0) >= 25).length / scoredBrands) * 100) : 0, percentage: 0, label: 'Strong GEO presence' },
    ];

    // Model comparison data (aggregate model_scores across all brands)
    const modelAggregates: Record<string, { totalScore: number; totalMentions: number; count: number }> = {};
    for (const brand of allScored) {
        if (brand.score?.model_scores) {
            for (const [model, entry] of Object.entries(brand.score.model_scores)) {
                if (!modelAggregates[model]) {
                    modelAggregates[model] = { totalScore: 0, totalMentions: 0, count: 0 };
                }
                modelAggregates[model].totalScore += entry.score ?? 0;
                modelAggregates[model].totalMentions += entry.mentions ?? 0;
                modelAggregates[model].count += 1;
            }
        }
    }
    const modelComparisonData = Object.entries(modelAggregates).map(([model, agg]) => ({
        model,
        composite: agg.count > 0 ? Math.round(agg.totalScore / agg.count) : 0,
        visibility: 0,
        citation: 0,
        representation: 0,
        intent: 0,
        score: agg.count > 0 ? Math.round(agg.totalScore / agg.count) : 0,
        mentionCount: agg.totalMentions,
        citationRate: 0,
        avgRank: 0,
    }));

    // Score distribution (using calibrated thresholds)
    const distribution = {
        high: allScored.filter(b => (b.score?.composite_score ?? 0) >= 25).length,
        medium: allScored.filter(b => {
            const s = b.score?.composite_score ?? 0;
            return s >= 10 && s < 25;
        }).length,
        low: allScored.filter(b => {
            const s = b.score?.composite_score ?? 0;
            return s > 0 && s < 10;
        }).length,
        zero: brands.filter(b => !b.score || b.score.composite_score === 0).length,
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Analytics
                    </h1>
                    <p className="text-slate-500 mt-2">
                        GEO performance analytics across {totalBrands} brands ({scoredBrands} evaluated)
                    </p>
                </div>

                {/* GEO Funnel — the most important overview */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>GEO Performance Funnel</CardTitle>
                        <p className="text-sm text-slate-500">How brands progress through AI visibility stages</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Evaluated', count: scoredBrands, total: totalBrands, color: 'bg-slate-500', desc: 'Brands tested against AI prompts' },
                                { label: 'Visible (score > 0)', count: visibleBrands, total: scoredBrands, color: 'bg-blue-500', desc: 'Mentioned at least once by AI' },
                                { label: 'Moderate+ (score >= 10)', count: distribution.medium + distribution.high, total: scoredBrands, color: 'bg-indigo-500', desc: 'Regularly mentioned across prompts' },
                                { label: 'Strong (score >= 25)', count: distribution.high, total: scoredBrands, color: 'bg-green-500', desc: 'Frequently recommended by AI' },
                            ].map((stage) => {
                                const pct = stage.total > 0 ? Math.round((stage.count / stage.total) * 100) : 0;
                                return (
                                    <div key={stage.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div>
                                                <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                                                <span className="text-xs text-slate-500 ml-2">{stage.desc}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">
                                                {stage.count}/{stage.total} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3">
                                            <div
                                                className={`${stage.color} h-3 rounded-full transition-all`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-purple-500" />
                                <p className="text-xs text-slate-500 uppercase">Brands</p>
                            </div>
                            <p className="text-2xl font-bold">{totalBrands}</p>
                            <p className="text-xs text-slate-500">{visibleBrands} visible to AI</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <p className="text-xs text-slate-500 uppercase">Avg Score</p>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(avgComposite)}`}>{avgComposite}<span className="text-sm font-normal text-slate-500">/100</span></p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <p className="text-xs text-slate-500 uppercase">Mention Rate</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{mentionRate}%</p>
                            <p className="text-xs text-slate-500">brands found by AI</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                <p className="text-xs text-slate-500 uppercase">Mentions</p>
                            </div>
                            <p className="text-2xl font-bold">{totalMentions}</p>
                            <p className="text-xs text-slate-500">total across prompts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Link2 className="w-4 h-4 text-green-500" />
                                <p className="text-xs text-slate-500 uppercase">Avg Citation</p>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(avgCitation)}`}>{avgCitation}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Award className="w-4 h-4 text-amber-500" />
                                <p className="text-xs text-slate-500 uppercase">Best Score</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{maxComposite}</p>
                            <p className="text-xs text-slate-500">{sortedByComposite[0]?.name}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Dimension Averages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Average Score by Dimension</CardTitle>
                        <p className="text-sm text-slate-500">How all {scoredBrands} evaluated brands perform on each GEO dimension</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Visibility', value: avgVisibility, weight: '35%', icon: Eye, color: 'blue', desc: 'Brand presence in responses' },
                                { label: 'Citation', value: avgCitation, weight: '25%', icon: Link2, color: 'green', desc: 'Source links provided' },
                                { label: 'Framing', value: avgRepresentation, weight: '25%', icon: FileText, color: 'amber', desc: 'Quality of representation' },
                                { label: 'Intent', value: avgIntent, weight: '15%', icon: Target, color: 'purple', desc: 'Query-brand alignment' },
                            ].map((dim) => {
                                const Icon = dim.icon;
                                const colorClasses: Record<string, { bg: string; text: string; bar: string }> = {
                                    blue: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
                                    green: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
                                    amber: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
                                    purple: { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500' },
                                };
                                const cc = colorClasses[dim.color];
                                return (
                                    <div key={dim.label} className={`p-4 rounded-lg ${cc.bg} border border-slate-100`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={`w-4 h-4 ${cc.text}`} />
                                            <span className="text-sm font-medium text-slate-700">{dim.label}</span>
                                            <span className="text-xs text-slate-500 ml-auto">{dim.weight}</span>
                                        </div>
                                        <p className={`text-3xl font-bold ${cc.text}`}>{dim.value}</p>
                                        <div className="w-full bg-white/60 rounded-full h-2 mt-2">
                                            <div
                                                className={`${cc.bar} h-2 rounded-full`}
                                                style={{ width: `${Math.min(100, dim.value * 2)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{dim.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Score Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Score Distribution</CardTitle>
                        <p className="text-sm text-slate-500">Calibrated thresholds for GEO scoring</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                                <p className="text-sm text-slate-600">Strong (25+)</p>
                                <p className="text-3xl font-bold text-green-600">{distribution.high}</p>
                                <p className="text-xs text-slate-500 mt-1">frequently recommended</p>
                            </div>
                            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                                <p className="text-sm text-slate-600">Moderate (10-24)</p>
                                <p className="text-3xl font-bold text-blue-600">{distribution.medium}</p>
                                <p className="text-xs text-slate-500 mt-1">mentioned in some contexts</p>
                            </div>
                            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
                                <p className="text-sm text-slate-600">Low (1-9)</p>
                                <p className="text-3xl font-bold text-amber-600">{distribution.low}</p>
                                <p className="text-xs text-slate-500 mt-1">rarely mentioned</p>
                            </div>
                            <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                                <p className="text-sm text-slate-600">Not Visible (0)</p>
                                <p className="text-3xl font-bold text-slate-500">{distribution.zero}</p>
                                <p className="text-xs text-slate-500 mt-1">not found by AI</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Brands Ranking */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Brands</CardTitle>
                        <p className="text-sm text-slate-500">Ranked by composite GEO score</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topBrands.map((brand, idx) => {
                                const s = brand.score!;
                                return (
                                    <Link key={brand.id} href={`/brands/${brand.id}`}>
                                        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                            <span className="text-lg font-bold text-slate-500 w-8 text-right">#{idx + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-slate-900 truncate">{brand.name}</span>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                                        <span title="Visibility"><Eye className="w-3 h-3 inline mr-1" />{s.visibility_score}</span>
                                                        <span title="Citation"><Link2 className="w-3 h-3 inline mr-1" />{s.citation_score}</span>
                                                        <span title="Framing"><FileText className="w-3 h-3 inline mr-1" />{s.representation_score}</span>
                                                        <span title="Intent"><Target className="w-3 h-3 inline mr-1" />{s.intent_score}</span>
                                                        <span className={`font-bold ${getScoreColor(s.composite_score)}`}>{s.composite_score}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className="bg-violet-500 h-2 rounded-full transition-all"
                                                        style={{ width: getBarWidth(s.composite_score, maxComposite) }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* GEO Funnel Chart */}
                {funnelData.length > 0 && scoredBrands > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Attribution Funnel</CardTitle>
                            <p className="text-sm text-slate-500">
                                Drop-off rates from recall to conversion
                            </p>
                        </CardHeader>
                        <CardContent>
                            <FunnelChart data={funnelData} height={250} />
                        </CardContent>
                    </Card>
                )}

                {/* Model Comparison Chart */}
                {modelComparisonData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Model Performance</CardTitle>
                            <p className="text-sm text-slate-500">
                                Average GEO score across all brands by AI model
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ModelComparisonChart data={modelComparisonData} height={300} />
                        </CardContent>
                    </Card>
                )}

                {/* Radar Chart */}
                {radarBrands.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Multi-Dimensional Comparison (Top 5)</CardTitle>
                            <p className="text-sm text-slate-500">
                                Comparing visibility, citation, framing, and intent scores
                            </p>
                        </CardHeader>
                        <CardContent>
                            <RadarChart brands={radarBrands} height={400} />
                        </CardContent>
                    </Card>
                )}

                {/* Heatmap */}
                {heatmapData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Brand x Model Performance Heatmap</CardTitle>
                            <p className="text-sm text-slate-500">Score comparison across AI models</p>
                        </CardHeader>
                        <CardContent>
                            <HeatmapChart
                                data={heatmapData}
                                brands={heatmapBrands}
                                models={heatmapModels}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* All Brands Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Brands Performance</CardTitle>
                        <p className="text-sm text-slate-500">Complete table of all {totalBrands} brands sorted by composite score</p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 pr-4 font-medium text-slate-500">#</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500">Brand</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500">Category</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500 text-right">Composite</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500 text-right">Visibility</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500 text-right">Citation</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500 text-right">Framing</th>
                                        <th className="pb-3 pr-4 font-medium text-slate-500 text-right">Intent</th>
                                        <th className="pb-3 font-medium text-slate-500 text-right">Mentions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...brands]
                                        .sort((a, b) => (b.score?.composite_score ?? 0) - (a.score?.composite_score ?? 0))
                                        .map((brand, idx) => {
                                            const s = brand.score;
                                            return (
                                                <tr key={brand.id} className="border-b last:border-0 hover:bg-slate-50">
                                                    <td className="py-3 pr-4 text-slate-500">{idx + 1}</td>
                                                    <td className="py-3 pr-4">
                                                        <Link href={`/brands/${brand.id}`} className="font-medium text-slate-900 hover:text-violet-600 transition-colors">
                                                            {brand.name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 pr-4 text-slate-600">{brand.category}</td>
                                                    <td className={`py-3 pr-4 text-right font-bold ${getScoreColor(s?.composite_score ?? 0)}`}>
                                                        {s?.composite_score ?? 0}
                                                    </td>
                                                    <td className="py-3 pr-4 text-right text-slate-700">{s?.visibility_score ?? 0}</td>
                                                    <td className="py-3 pr-4 text-right text-slate-700">{s?.citation_score ?? 0}</td>
                                                    <td className="py-3 pr-4 text-right text-slate-700">{s?.representation_score ?? 0}</td>
                                                    <td className="py-3 pr-4 text-right text-slate-700">{s?.intent_score ?? 0}</td>
                                                    <td className="py-3 text-right text-slate-700">{s?.total_mentions ?? 0}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
