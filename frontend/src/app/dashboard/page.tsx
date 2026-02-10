'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import {
  Loader2,
  AlertCircle,
  Trophy,
  AlertTriangle,
  Target,
  Eye,
  TrendingUp,
  Users,
  Star,
  BarChart3,
  ArrowRight,
  Cpu,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface StatsData {
  total_evaluations: number;
  total_mentioned: number;
  mention_rate: number;
  total_brands: number;
  total_prompts: number;
  intent_breakdown: { intent: string; total: number; mentioned: number; rate: number }[];
  sentiment_distribution: Record<string, number>;
  score_averages: { composite: number; composite_min: number; composite_max: number; visibility: number; citation: number; representation: number; intent: number };
  top_brand?: { name: string; composite: number } | null;
}

interface CategoryInfo {
  category: string;
  brand_count: number;
  eval_count: number;
  avg_composite: number;
}

interface RankingItem {
  rank: number;
  name: string;
  domain: string;
  category: string;
  composite: number;
  visibility: number;
  citation: number;
  representation: number;
  intent: number;
  mentions: number;
  evaluations: number;
}

/** Relative color scale: interpolate green→yellow→red based on position within data range */
function relativeColor(value: number, min: number, max: number): string {
  if (max === min) return '#fbbf24';
  const t = (value - min) / (max - min); // 0=worst, 1=best
  if (t >= 0.75) return '#34d399'; // top 25% → emerald
  if (t >= 0.25) return '#fbbf24'; // middle 50% → amber
  return '#f87171'; // bottom 25% → red
}

function scoreColor(v: number): string {
  if (v >= 50) return '#34d399';
  if (v >= 20) return '#fbbf24';
  return '#f87171';
}

function scoreTextClass(v: number): string {
  if (v >= 50) return 'text-emerald-400';
  if (v >= 20) return 'text-yellow-400';
  return 'text-red-400';
}

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { categories, loading: catLoading } = useCategories();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [allRankings, setAllRankings] = useState<RankingItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);

    const rankParams = new URLSearchParams(params);
    rankParams.set('sort_by', 'composite');
    rankParams.set('limit', '200');

    // Always fetch full rankings (no category filter) for visibility gap & cross-industry insights
    const allRankParams = new URLSearchParams();
    allRankParams.set('sort_by', 'composite');
    allRankParams.set('limit', '200');

    Promise.all([
      fetch(`${API_URL}/api/v1/industry/stats?${params}`).then(r => r.json()),
      fetch(`${API_URL}/api/v1/industry/rankings?${rankParams}`).then(r => r.json()),
      fetch(`${API_URL}/api/v1/industry/categories`).then(r => r.json()),
      fetch(`${API_URL}/api/v1/industry/rankings?${allRankParams}`).then(r => r.json()),
    ])
      .then(([s, r, c, ar]) => {
        setStats(s);
        setRankings(r.rankings || []);
        setAllCategories(c.categories || []);
        setAllRankings(ar.rankings || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto" />
          <p className="text-lg font-semibold text-white">Loading Luminos</p>
          <p className="text-sm text-zinc-400">Fetching AI visibility data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md">
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Error Loading Data</h2>
          </div>
          <p className="text-zinc-400 mb-4">{error || 'No data available'}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Derived data
  const topBrand = stats.top_brand;
  const avgScore = stats.score_averages.composite;
  const maxScore = stats.score_averages.composite_max;

  // P0 #3: Use full rankings data for accurate visibility gap counts
  const dataForGap = selectedCategory ? rankings : allRankings;
  const zeroBrands = dataForGap.filter(r => r.composite === 0).length;
  const lowBrands = dataForGap.filter(r => r.composite > 0 && r.composite < 15).length;
  const aboveAvg = dataForGap.filter(r => r.composite > avgScore).length;

  const top5 = rankings.filter(r => r.composite > 0).slice(0, 5);
  const bottom3 = [...rankings].filter(r => r.composite > 0).sort((a, b) => a.composite - b.composite).slice(0, 3);

  // Industry data sorted by avg composite (exclude zero eval)
  const evaluatedCategories = allCategories.filter(c => c.eval_count > 0);
  const sortedIndustries = [...evaluatedCategories].sort((a, b) => b.avg_composite - a.avg_composite);
  const globalAvg = sortedIndustries.length > 0
    ? Math.round(sortedIndustries.reduce((s, c) => s + c.avg_composite, 0) / sortedIndustries.length * 10) / 10
    : 0;

  // Total brands & evals across all categories
  const totalBrands = allCategories.reduce((s, c) => s + c.brand_count, 0);
  const totalEvals = allCategories.reduce((s, c) => s + c.eval_count, 0);
  const evaluatedIndustryCount = evaluatedCategories.length;
  const totalIndustryCount = allCategories.length;

  // Intent insights (P1 #6: already category-aware via stats endpoint with ?category=X)
  const sortedIntents = [...stats.intent_breakdown].sort((a, b) => b.rate - a.rate);
  const bestIntent = sortedIntents[0];
  const worstIntent = sortedIntents[sortedIntents.length - 1];

  // P1 #7: Per-industry top brands for "Who's Dominating"
  const industryChampions: { category: string; brand: string; score: number }[] = [];
  if (!selectedCategory) {
    const seen = new Set<string>();
    for (const r of allRankings) {
      if (!seen.has(r.category) && r.composite > 0) {
        seen.add(r.category);
        industryChampions.push({ category: r.category, brand: r.name, score: r.composite });
      }
    }
    industryChampions.sort((a, b) => b.score - a.score);
  }

  // P0 #2: Score ratio
  const scoreRatio = avgScore > 0 ? (maxScore / avgScore).toFixed(1) : '—';

  // P0 #1: Hero headline — focus on score, not mention_rate
  const heroHeadline = selectedCategory
    ? `${selectedCategory} averages ${avgScore}/100`
    : `Average AI Visibility Score: ${avgScore}/100`;
  const heroSub = selectedCategory
    ? (topBrand ? `${topBrand.name} leads at ${topBrand.composite}` : '')
    : 'most brands have weak AI presence';

  // Build category avg map for P2 #9
  const categoryAvgMap: Record<string, number> = {};
  for (const c of allCategories) {
    categoryAvgMap[c.category] = c.avg_composite;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Section 1: Hero Insight Banner */}
      <div className="relative overflow-hidden rounded-2xl p-8 md:p-10" style={{ background: 'linear-gradient(135deg, #1e1044 0%, #0f172a 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative">
          <p className="text-violet-400 text-sm font-medium mb-2 uppercase tracking-wider">AI Visibility Report</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {heroHeadline}
          </h1>
          {heroSub && <p className="text-lg text-zinc-400">— {heroSub}</p>}
          <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
            <span>{totalBrands} brands · {evaluatedIndustryCount} industries · {totalEvals.toLocaleString()} evaluations</span>
          </div>
          {/* P0 #1: CTA link */}
          <Link href="/audit" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
            Check your brand <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            !selectedCategory
              ? 'bg-violet-600 text-white border-violet-500'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          All Industries
        </button>
        {!catLoading && categories.map(c => (
          <button
            key={c.category}
            onClick={() => setSelectedCategory(c.category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selectedCategory === c.category
                ? 'bg-violet-600 text-white border-violet-500'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {c.category}
          </button>
        ))}
      </div>

      {/* Section 2: Quick Stats Row — P0 #2 fixes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={<Users className="w-4 h-4 text-violet-400" />}
          label="Brands Tracked"
          value={`${totalBrands}`}
          sub={evaluatedIndustryCount < totalIndustryCount
            ? `${totalIndustryCount} industries (${evaluatedIndustryCount} evaluated)`
            : `${evaluatedIndustryCount} industries`}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
          label="Avg Score"
          value={`${avgScore}`}
          sub="/100"
          gauge={avgScore}
        />
        <StatCard
          icon={<Eye className="w-4 h-4 text-emerald-400" />}
          label="AI Visible"
          value={`${stats.mention_rate}%`}
          sub={`${stats.total_mentioned} mentions`}
        />
        <StatCard
          icon={<Cpu className="w-4 h-4 text-yellow-400" />}
          label="AI Platform"
          value="Gemini"
          sub="10+ query types"
        />
        <StatCard
          icon={<Star className="w-4 h-4 text-amber-400" />}
          label="Top Score"
          value={`${maxScore}`}
          sub={topBrand?.name ?? 'N/A'}
          highlight
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4 text-red-400" />}
          label="Score Gap"
          value={`${scoreRatio}×`}
          sub={`Top ${maxScore} vs Avg ${avgScore}`}
        />
      </div>

      {/* Section 3: AI Visibility Landscape */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">
          {selectedCategory ? `Top Brands — ${selectedCategory}` : 'AI Visibility Landscape'}
        </h2>
        <p className="text-sm text-zinc-500 mb-5">
          {selectedCategory
            ? `Top ${Math.min(10, top5.length)} brands by composite GEO score`
            : 'Which industries does AI know best? Ranked by average composite score'}
        </p>
        {selectedCategory ? (
          <IndustryBrandBars brands={top5.slice(0, 10)} maxVal={maxScore} />
        ) : (
          <IndustryBars industries={sortedIndustries} globalAvg={globalAvg} />
        )}
      </div>

      {/* Section 4: Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Who's Dominating — P1 #7: per-industry champions when unfiltered */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white">Who&apos;s Dominating?</h3>
          </div>
          <div className="space-y-2">
            {selectedCategory ? (
              top5.slice(0, 3).map((b, i) => (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : 'text-amber-600'}`}>
                      {['🥇', '🥈', '🥉'][i]}
                    </span>
                    <span className="text-sm text-zinc-200 truncate">{b.name}</span>
                  </div>
                  <span className={`text-sm font-bold font-mono ${scoreTextClass(b.composite)}`}>{b.composite}</span>
                </div>
              ))
            ) : (
              industryChampions.slice(0, 8).map(ch => (
                <div key={ch.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">🏆</span>
                    <span className="text-xs text-zinc-500 shrink-0">{ch.category}:</span>
                    <span className="text-sm text-zinc-200 truncate">{ch.brand}</span>
                  </div>
                  <span className={`text-sm font-bold font-mono ml-2 ${scoreTextClass(ch.score)}`}>{ch.score}</span>
                </div>
              ))
            )}
          </div>
          {/* P2 #11: action link */}
          <div className="mt-3 pt-2 border-t border-zinc-800">
            <Link href="/insights" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View full rankings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Visibility Gap — P0 #3: uses allRankings for accurate counts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-white">The Visibility Gap</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Invisible to AI (score 0)</span>
              <span className="text-lg font-bold text-red-400">{zeroBrands}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Barely mentioned (&lt;15)</span>
              <span className="text-lg font-bold text-yellow-400">{lowBrands}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Above average</span>
              <span className="text-lg font-bold text-emerald-400">{aboveAvg}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            {zeroBrands + lowBrands > 0 ? `${zeroBrands + lowBrands} brands need GEO optimization` : 'All brands have some AI visibility'}
          </p>
          {/* P2 #11: action link */}
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <Link href="/audit" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Run free diagnosis <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Best Intent Coverage — P1 #6: already category-aware via stats?category=X */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white">Intent Coverage</h3>
          </div>
          {bestIntent && worstIntent && (
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-500">Best: {formatIntent(bestIntent.intent)}</span>
                  <span className="text-sm font-bold text-emerald-400">{bestIntent.rate}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${bestIntent.rate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-500">Worst: {formatIntent(worstIntent.intent)}</span>
                  <span className="text-sm font-bold text-red-400">{worstIntent.rate}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${worstIntent.rate}%` }} />
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-zinc-500 mt-3">
            {selectedCategory
              ? `Showing intents for ${selectedCategory}`
              : 'Showing intent patterns across all industries'}
          </p>
          {/* P2 #11: action link */}
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <Link href="/learn" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              See optimization tips <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Section 5: Brand Performance — Top 5 + Bottom 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers — P2 #8: industry badges */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="font-bold text-white">Top Performers</h3>
          </div>
          <div className="p-4 space-y-2">
            {top5.map((b, i) => {
              const pct = maxScore > 0 ? (b.composite / maxScore) * 100 : 0;
              return (
                <div key={b.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <span className={`text-sm font-bold w-7 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-white truncate">{b.name}</span>
                        {/* P2 #8: industry badge */}
                        <span className="text-xs text-zinc-600 shrink-0">{b.category}</span>
                      </div>
                      <span className={`text-sm font-bold font-mono ml-2 ${scoreTextClass(b.composite)}`}>{b.composite}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(b.composite) }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {top5.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">No brands with scores yet</p>}
          </div>
          <div className="px-5 py-3 border-t border-zinc-800">
            <Link href="/insights" className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
              View All Brands <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Needs Attention — P2 #9: industry-relative context */}
        <div className="bg-zinc-900 border border-red-900/30 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 bg-red-950/20">
            <h3 className="font-bold text-white">Needs Attention</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{zeroBrands} invisible + {lowBrands} low-scoring brands</p>
          </div>
          <div className="p-4 space-y-2">
            {bottom3.map(b => {
              const industryAvg = categoryAvgMap[b.category] ?? avgScore;
              return (
                <div key={b.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm text-zinc-300">{b.name}</span>
                      <span className="text-xs text-zinc-600">{b.category}</span>
                    </div>
                    {/* P2 #9: show industry avg for context */}
                    <span className="text-xs text-zinc-600 ml-4">
                      Industry avg: {industryAvg.toFixed(1)}
                    </span>
                  </div>
                  <span className={`text-sm font-bold font-mono ${scoreTextClass(b.composite)}`}>{b.composite}</span>
                </div>
              );
            })}
            {zeroBrands > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">+ {zeroBrands} brands with zero AI visibility</p>
              </div>
            )}
            {bottom3.length === 0 && zeroBrands === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">All brands performing well</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-zinc-800">
            <Link href="/insights" className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
              View Full Rankings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* P2 #10: Data source footer */}
      <footer className="text-center py-4">
        <p className="text-xs text-zinc-600">
          Data Source: Gemini 2.0 Flash · Last Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {totalEvals.toLocaleString()} evaluations across {evaluatedIndustryCount} industries
        </p>
      </footer>
    </div>
  );
}

// ── Stat Card Component ─────────────────────────────────────

function StatCard({ icon, label, value, sub, gauge, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  gauge?: number;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 ${highlight ? 'border-yellow-900/50' : 'border-zinc-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {gauge == null && <span className="text-xs text-zinc-500 mb-1">{sub}</span>}
      </div>
      {gauge != null && (
        <div className="mt-2">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${gauge}%`, backgroundColor: scoreColor(gauge) }} />
          </div>
          <span className="text-xs text-zinc-500 mt-1">{sub}</span>
        </div>
      )}
    </div>
  );
}

// ── Industry Horizontal Bar Chart — P1 #4: relative color scale, P1 #5: bigger avg line ──

function IndustryBars({ industries, globalAvg }: { industries: CategoryInfo[]; globalAvg: number }) {
  const scores = industries.map(c => c.avg_composite);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const maxVal = Math.max(maxScore, 1);
  const barH = 28;
  const gap = 6;
  const labelW = 170;
  const chartW = 700;
  const h = industries.length * (barH + gap) + 30; // extra space for avg label
  const avgX = labelW + (globalAvg / maxVal) * (chartW - labelW - 80);

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${chartW} ${h}`} preserveAspectRatio="xMinYMid meet">
      {/* P1 #5: Prominent average line */}
      <line x1={avgX} y1={0} x2={avgX} y2={h - 20} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="8 5" opacity={0.8} />
      <rect x={avgX - 30} y={2} width={60} height={18} rx={4} fill="#8b5cf6" opacity={0.25} />
      <text x={avgX} y={14} textAnchor="middle" fill="#a78bfa" fontSize={11} fontWeight={700}>
        Avg {globalAvg}
      </text>

      {industries.map((c, i) => {
        const y = i * (barH + gap) + 24;
        const w = (c.avg_composite / maxVal) * (chartW - labelW - 80);
        // P1 #4: relative color scale
        const color = relativeColor(c.avg_composite, minScore, maxScore);
        return (
          <g key={c.category}>
            <text x={8} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize={12} fontWeight={500}>
              #{i + 1}
            </text>
            <text x={30} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize={12}>
              {c.category}
            </text>
            <rect x={labelW} y={y} width={Math.max(w, 3)} height={barH} rx={4} fill={color} opacity={0.85} />
            <text x={labelW + w + 8} y={y + barH / 2 + 4} fill="#e4e4e7" fontSize={12} fontWeight={700}>
              {c.avg_composite.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Brand Horizontal Bar Chart (filtered view) ──────────────

function IndustryBrandBars({ brands, maxVal }: { brands: RankingItem[]; maxVal: number }) {
  const barH = 28;
  const gap = 6;
  const labelW = 160;
  const chartW = 700;
  const h = brands.length * (barH + gap) + 10;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${chartW} ${h}`} preserveAspectRatio="xMinYMid meet">
      {brands.map((b, i) => {
        const y = i * (barH + gap) + 4;
        const w = (b.composite / Math.max(maxVal, 1)) * (chartW - labelW - 80);
        const color = scoreColor(b.composite);
        return (
          <g key={b.name}>
            <text x={8} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize={12} fontWeight={500}>
              #{i + 1}
            </text>
            <text x={30} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize={12}>
              {b.name.length > 20 ? b.name.slice(0, 19) + '…' : b.name}
            </text>
            <rect x={labelW} y={y} width={Math.max(w, 3)} height={barH} rx={4} fill={color} opacity={0.75} />
            <text x={labelW + w + 8} y={y + barH / 2 + 4} fill="#e4e4e7" fontSize={12} fontWeight={700}>
              {b.composite}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function formatIntent(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
