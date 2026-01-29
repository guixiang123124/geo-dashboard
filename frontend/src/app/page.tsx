'use client';

import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';
import ScoreCard from '@/components/geo/ScoreCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle,
  Loader2,
  Eye,
  Link2,
  MessageSquare,
  Users,
  Activity,
  Info,
  PlayCircle,
  Plus,
  Clock,
  FileText,
} from 'lucide-react';

export default function Home() {
  const { brands, loading, error } = useBrands();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto" />
          <div>
            <p className="text-lg font-semibold text-slate-900">Loading GEO Insights</p>
            <p className="text-sm text-slate-500 mt-1">Fetching brand performance data...</p>
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
            <p className="text-slate-700 mb-4">{error}</p>
            <p className="text-sm text-slate-500">
              Make sure the backend API is running at{' '}
              <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">http://localhost:8000</code>
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
  const scoredCount = brandsWithScores.length;
  const visibleBrands = brandsWithScores.filter((b) => (b.score?.composite_score ?? 0) > 0);

  const avgComposite =
    scoredCount > 0
      ? Math.round(
          brandsWithScores.reduce((sum, b) => sum + (b.score?.composite_score ?? 0), 0) /
            scoredCount
        )
      : 0;

  // Total mentions and mention rate
  const totalMentions = brandsWithScores.reduce(
    (sum, b) => sum + (b.score?.total_mentions ?? 0),
    0
  );
  const totalEvaluations = brandsWithScores.reduce(
    (sum, b) => sum + (b.score?.evaluation_count ?? 0),
    0
  );
  // Mention rate: brands mentioned at least once / total evaluated brands
  const mentionRate =
    scoredCount > 0 ? Math.round((visibleBrands.length / scoredCount) * 100) : 0;

  // Average citation rate
  const avgCitationRate =
    scoredCount > 0
      ? Math.round(
          (brandsWithScores.reduce((sum, b) => sum + (b.score?.citation_rate ?? 0), 0) /
            scoredCount) *
            100
        )
      : 0;

  // Dimension averages
  const dimAvg = (key: 'visibility_score' | 'citation_score' | 'representation_score' | 'intent_score') =>
    scoredCount > 0
      ? Math.round(
          brandsWithScores.reduce((sum, b) => sum + (b.score?.[key] ?? 0), 0) / scoredCount
        )
      : 0;

  const dimensionData = [
    { label: 'Visibility', avg: dimAvg('visibility_score'), weight: '35%', icon: Eye, color: 'blue' },
    { label: 'Citation', avg: dimAvg('citation_score'), weight: '25%', icon: Link2, color: 'green' },
    { label: 'Framing', avg: dimAvg('representation_score'), weight: '25%', icon: MessageSquare, color: 'amber' },
    { label: 'Intent', avg: dimAvg('intent_score'), weight: '15%', icon: Target, color: 'purple' },
  ];

  // Top performers (non-zero only) and brands needing attention
  const sortedByScore = [...brandsWithScores].sort(
    (a, b) => (b.score?.composite_score ?? 0) - (a.score?.composite_score ?? 0)
  );
  const top5 = sortedByScore.filter((b) => (b.score?.composite_score ?? 0) > 0).slice(0, 5);
  const notVisible = brandsWithScores.filter((b) => (b.score?.composite_score ?? 0) === 0);
  const lowPerformers = sortedByScore
    .filter((b) => {
      const s = b.score?.composite_score ?? 0;
      return s > 0 && s < 15;
    })
    .slice(-5)
    .reverse();

  const maxComposite = top5[0]?.score?.composite_score ?? 1;

  // Last evaluation timestamp
  const lastEvaluationDate = brandsWithScores.reduce<string | null>((latest, b) => {
    const d = b.score?.last_evaluation_date ?? b.score?.updated_at;
    if (!d) return latest;
    if (!latest) return d;
    return d > latest ? d : latest;
  }, null);

  const formatLastEvaluated = (dateStr: string | null): string => {
    if (!dateStr) return 'No evaluations yet';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              GEO Performance Dashboard
            </h1>
            <p className="text-lg text-slate-300 mb-6 max-w-2xl">
              Generative Engine Optimization — measuring how AI platforms represent your brands
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/evaluations/new">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium text-sm transition-colors">
                  <PlayCircle className="w-4 h-4" />
                  Run Evaluation
                </button>
              </Link>
              <Link href="/brands">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium text-sm transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Brand
                </button>
              </Link>
              <Link href="/analytics">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-lg font-medium text-sm transition-colors">
                  <FileText className="w-4 h-4" />
                  View Reports
                </button>
              </Link>
            </div>

            {/* Last Evaluated + AI Model Status */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-slate-300" />
                <span className="text-sm text-slate-300">Last evaluated: <span className="text-white font-medium">{formatLastEvaluated(lastEvaluationDate)}</span></span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Gemini 2.0 Flash</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-400">ChatGPT (planned)</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-400">Claude (planned)</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-400">Perplexity (planned)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Brands</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalBrands}</p>
            <p className="text-xs text-slate-500 mt-1">{scoredCount} evaluated</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{avgComposite}<span className="text-sm font-normal text-slate-500">/100</span></p>
            <p className="text-xs text-slate-500 mt-1">composite GEO</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Visible</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{visibleBrands.length}<span className="text-sm font-normal text-slate-500">/{scoredCount}</span></p>
            <p className="text-xs text-slate-500 mt-1">{mentionRate}% mentioned by AI</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Mentions</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalMentions}</p>
            <p className="text-xs text-slate-500 mt-1">across all prompts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Citation</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{avgCitationRate}%</p>
            <p className="text-xs text-slate-500 mt-1">avg citation rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Top Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{maxComposite}</p>
            <p className="text-xs text-slate-500 mt-1">{top5[0]?.name ?? 'N/A'}</p>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">GEO Score Dimensions</CardTitle>
            <p className="text-sm text-slate-500">
              The composite GEO score (0-100) is calculated from four dimensions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {dimensionData.map((dim) => {
                const Icon = dim.icon;
                const colorMap: Record<string, { bg: string; icon: string; bar: string; text: string }> = {
                  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', bar: 'bg-blue-500', text: 'text-blue-700' },
                  green: { bg: 'bg-green-50', icon: 'text-green-600', bar: 'bg-green-500', text: 'text-green-700' },
                  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', bar: 'bg-amber-500', text: 'text-amber-700' },
                  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', bar: 'bg-purple-500', text: 'text-purple-700' },
                };
                const c = colorMap[dim.color];
                return (
                  <div key={dim.label} className={`p-4 rounded-lg ${c.bg} border border-slate-100`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${c.icon}`} />
                      <span className="text-sm font-medium text-slate-700">{dim.label}</span>
                      <span className="text-xs text-slate-500 ml-auto">{dim.weight}</span>
                    </div>
                    <div className={`text-2xl font-bold ${c.text}`}>{dim.avg}</div>
                    <div className="w-full bg-white/60 rounded-full h-1.5 mt-2">
                      <div
                        className={`${c.bar} h-1.5 rounded-full transition-all`}
                        style={{ width: `${Math.min(100, dim.avg * 2)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">avg across {scoredCount} brands</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Brand ScoreCards */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Brand Performance</h2>
              <p className="text-sm text-slate-600 mt-1">
                {visibleBrands.length} brands visible to AI out of {scoredCount} evaluated
              </p>
            </div>
            <Link href="/analytics">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white transition-colors">
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
              <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
              <p className="text-sm text-slate-600 mt-1">Highest GEO composite scores</p>
            </div>
            <div className="p-6 space-y-3">
              {top5.map((brand, index) => {
                const score = brand.score?.composite_score ?? 0;
                const barPct = maxComposite > 0 ? (score / maxComposite) * 100 : 0;
                return (
                  <Link key={brand.id} href={`/brands/${brand.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <span className="text-sm font-bold text-slate-500 w-6 text-right">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 truncate">{brand.name}</span>
                          <span className="text-lg font-bold text-green-600 ml-2">{score}</span>
                        </div>
                        <div className="w-full bg-green-100 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {top5.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">No brands with scores yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-100">
              <h3 className="text-lg font-bold text-slate-900">Needs Attention</h3>
              <p className="text-sm text-slate-600 mt-1">
                {notVisible.length} brand{notVisible.length !== 1 ? 's' : ''} not mentioned by AI
              </p>
            </div>
            <div className="p-6 space-y-3">
              {lowPerformers.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Low scoring brands</p>
                  {lowPerformers.map((brand) => (
                    <Link key={brand.id} href={`/brands/${brand.id}`}>
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <span className="text-sm font-medium text-slate-900">{brand.name}</span>
                        <span className="text-sm font-bold text-amber-600">{brand.score?.composite_score}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {notVisible.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">Not visible (score 0)</p>
                  <div className="flex flex-wrap gap-2">
                    {notVisible.slice(0, 8).map((brand) => (
                      <Link key={brand.id} href={`/brands/${brand.id}`}>
                        <span className="inline-block px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer transition-colors">
                          {brand.name}
                        </span>
                      </Link>
                    ))}
                    {notVisible.length > 8 && (
                      <span className="inline-block px-3 py-1 text-xs text-slate-500 font-medium">
                        +{notVisible.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {lowPerformers.length === 0 && notVisible.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">All brands performing well</p>
              )}
            </div>
          </div>
        </div>

        {/* GEO Methodology */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-lg">How GEO Scoring Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  GEO (Generative Engine Optimization) measures how AI models represent your brand
                  when users ask relevant questions. Each brand is evaluated across 20+ prompts
                  covering product discovery, comparisons, purchase intent, and more.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-slate-700"><strong>Visibility (35%)</strong> — Is the brand mentioned in AI responses?</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700"><strong>Citation (25%)</strong> — Does AI link to or cite the brand?</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-slate-700"><strong>Framing (25%)</strong> — How positively is the brand described?</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-slate-700"><strong>Intent (15%)</strong> — Does AI recommend the brand for the right queries?</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Score interpretation</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600"><strong>25+</strong> — Strong AI presence, frequently mentioned and recommended</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-600"><strong>10-24</strong> — Moderate presence, mentioned in some contexts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-slate-600"><strong>1-9</strong> — Low visibility, rarely mentioned by AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-sm text-slate-600"><strong>0</strong> — Not mentioned in any AI responses</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Scores are based on evaluation against Gemini 2.0 Flash. Multi-model support coming soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
