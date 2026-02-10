'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Trophy, Grid3X3, Database, Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X, TrendingUp, Users, Eye, Star, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Tab = 'overview' | 'rankings' | 'matrix' | 'raw';

interface CategoryInfo {
  category: string;
  brand_count: number;
  eval_count: number;
  avg_composite: number;
}

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

interface MatrixData {
  matrix: Record<string, Record<string, { rate: number; mentioned: number; total: number }>>;
  intents: string[];
  brands: string[];
}

interface RawItem {
  brand: string;
  prompt: string;
  intent: string;
  model: string;
  mentioned: boolean;
  rank: number;
  context: string;
  sentiment: string;
  response: string;
  response_time_ms: number;
  cited: boolean;
  representation: number;
}

interface BrandOption {
  name: string;
  domain: string;
  category: string;
}

// Color helpers
function scoreColor(v: number) {
  if (v >= 60) return 'text-emerald-400';
  if (v >= 30) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBg(v: number) {
  if (v >= 60) return 'bg-emerald-500/20';
  if (v >= 30) return 'bg-yellow-500/20';
  return 'bg-red-500/20';
}

function scoreHex(v: number) {
  if (v >= 60) return '#34d399';
  if (v >= 30) return '#fbbf24';
  return '#f87171';
}

function rankBadge(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

function rankStyle(rank: number) {
  if (rank === 1) return 'text-yellow-400 font-bold';
  if (rank === 2) return 'text-gray-300 font-bold';
  if (rank === 3) return 'text-amber-600 font-bold';
  return 'text-zinc-400';
}

function heatColor(rate: number) {
  if (rate === 0) return 'bg-zinc-800';
  if (rate < 20) return 'bg-emerald-900/40';
  if (rate < 40) return 'bg-emerald-800/60';
  if (rate < 60) return 'bg-emerald-700/70';
  if (rate < 80) return 'bg-emerald-600/80';
  return 'bg-emerald-500';
}

// Category accent colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string; hex: string }> = {
  'Kids Fashion': { bg: 'bg-pink-500/15', text: 'text-pink-400', accent: 'border-pink-500/50', hex: '#ec4899' },
  'SaaS & Technology': { bg: 'bg-blue-500/15', text: 'text-blue-400', accent: 'border-blue-500/50', hex: '#3b82f6' },
  'Health & Wellness': { bg: 'bg-green-500/15', text: 'text-green-400', accent: 'border-green-500/50', hex: '#22c55e' },
  'Fintech & Financial Services': { bg: 'bg-amber-500/15', text: 'text-amber-400', accent: 'border-amber-500/50', hex: '#f59e0b' },
  'Travel & Hospitality': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', accent: 'border-cyan-500/50', hex: '#06b6d4' },
  'Real Estate & Home': { bg: 'bg-orange-500/15', text: 'text-orange-400', accent: 'border-orange-500/50', hex: '#f97316' },
  'Education & EdTech': { bg: 'bg-purple-500/15', text: 'text-purple-400', accent: 'border-purple-500/50', hex: '#a855f7' },
  'Food & Beverage': { bg: 'bg-red-500/15', text: 'text-red-400', accent: 'border-red-500/50', hex: '#ef4444' },
};

const SHORT_CATEGORY_NAMES: Record<string, string> = {
  'Kids Fashion': 'Kids',
  'Fintech & Financial Services': 'Fintech',
  'Food & Beverage': 'Food',
  'Health & Wellness': 'Health',
  'Real Estate & Home': 'Real Estate',
  'Travel & Hospitality': 'Travel',
  'Education & EdTech': 'Education',
  'SaaS & Technology': 'SaaS',
};

function getCatColor(cat: string) {
  return CATEGORY_COLORS[cat] || { bg: 'bg-violet-500/15', text: 'text-violet-400', accent: 'border-violet-500/50', hex: '#8b5cf6' };
}

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
  </div>
);

const ErrorMsg = ({ msg }: { msg: string }) => (
  <div className="text-center py-10 text-red-400">{msg}</div>
);

// ── SVG Charts ──────────────────────────────────────────────

function BarChartSVG({ data, height = 260 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(40, Math.max(16, (600 - data.length * 4) / data.length));
  const chartW = data.length * (barW + 8) + 40;
  const chartH = height - 40;

  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(chartW, 300)} height={height} className="w-full" viewBox={`0 0 ${Math.max(chartW, 300)} ${height}`} preserveAspectRatio="xMinYMid meet">
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * (chartH - 20);
          const x = 35 + i * (barW + 8);
          const y = chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={3} fill={d.color || '#8b5cf6'} opacity={0.85} />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontWeight={600}>
                {typeof d.value === 'number' ? (d.value % 1 === 0 ? d.value : d.value.toFixed(1)) : d.value}
              </text>
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill="#71717a" fontSize={9} className="select-none">
                {d.label.length > 10 ? d.label.slice(0, 9) + '…' : d.label}
              </text>
            </g>
          );
        })}
        <line x1={30} y1={0} x2={30} y2={chartH} stroke="#3f3f46" strokeWidth={1} />
        <line x1={30} y1={chartH} x2={chartW} y2={chartH} stroke="#3f3f46" strokeWidth={1} />
      </svg>
    </div>
  );
}

function HorizontalBarSVG({ data, height: overrideH }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barH = 22;
  const gap = 6;
  const h = overrideH || data.length * (barH + gap) + 10;
  const labelW = 120;
  const chartW = 500;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${chartW} ${h}`} preserveAspectRatio="xMinYMid meet">
      {data.map((d, i) => {
        const y = i * (barH + gap) + 4;
        const w = ((d.value / maxVal) * (chartW - labelW - 60));
        return (
          <g key={i}>
            <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize={11}>
              {d.label.length > 18 ? d.label.slice(0, 17) + '…' : d.label}
            </text>
            <rect x={labelW} y={y} width={Math.max(w, 2)} height={barH} rx={4} fill={d.color || '#8b5cf6'} opacity={0.8} />
            <text x={labelW + w + 6} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize={11} fontWeight={600}>
              {d.value.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChartSVG({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  const cx = 90, cy = 90, r = 70, inner = 45;
  let cumAngle = -Math.PI / 2;

  const paths = data.map(d => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + inner * Math.cos(endAngle);
    const iy1 = cy + inner * Math.sin(endAngle);
    const ix2 = cx + inner * Math.cos(startAngle);
    const iy2 = cy + inner * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;

    return (
      <path
        key={d.label}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2} Z`}
        fill={d.color}
        opacity={0.85}
      />
    );
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={180} height={180} viewBox="0 0 180 180">
        {paths}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e4e4e7" fontSize={18} fontWeight={700}>{total.toLocaleString()}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize={11}>total</text>
      </svg>
      <div className="space-y-1.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-zinc-300">{d.label}</span>
            <span className="text-zinc-500 ml-auto">{d.value}</span>
            <span className="text-zinc-600 text-xs">({total ? ((d.value / total) * 100).toFixed(0) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function InsightsPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/industry/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'rankings', label: 'Rankings', icon: <Trophy className="h-4 w-4" /> },
    { key: 'matrix', label: 'Intent Matrix', icon: <Grid3X3 className="h-4 w-4" /> },
    { key: 'raw', label: 'Raw Data', icon: <Database className="h-4 w-4" /> },
  ];

  const totalEvals = categories.reduce((s, c) => s + c.eval_count, 0);

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white">Industry Intelligence</h1>
        <p className="text-zinc-400 mt-2">AI visibility benchmarks across competitive landscapes</p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            selectedCategory === ''
              ? 'bg-violet-600 text-white border-violet-500'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          All Industries
          <span className="ml-1.5 text-xs opacity-70">{totalEvals.toLocaleString()}</span>
        </button>
        {!catLoading && categories.map(c => {
          const colors = getCatColor(c.category);
          const isActive = selectedCategory === c.category;
          return (
            <button
              key={c.category}
              onClick={() => setSelectedCategory(c.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? `${colors.bg} ${colors.text} ${colors.accent}`
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {c.category}
              <span className="ml-1.5 text-xs opacity-70">{c.eval_count.toLocaleString()}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'ghost'}
            className={tab === t.key ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'text-zinc-400 hover:text-white'}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            <span className="ml-2 hidden sm:inline">{t.label}</span>
          </Button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab category={selectedCategory} categories={categories} />}
      {tab === 'rankings' && <RankingsTab category={selectedCategory} />}
      {tab === 'matrix' && <MatrixTab category={selectedCategory} />}
      {tab === 'raw' && <RawDataTab category={selectedCategory} />}
    </div>
  );
}

// ── Overview Tab ────────────────────────────────────────────

function OverviewTab({ category, categories }: { category: string; categories: CategoryInfo[] }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const statsUrl = `${API_URL}/api/v1/industry/stats?${params}`;
    const rankParams = new URLSearchParams(params);
    rankParams.set('sort_by', 'composite');
    rankParams.set('limit', '10');
    const rankUrl = `${API_URL}/api/v1/industry/rankings?${rankParams}`;
    Promise.all([
      fetch(statsUrl).then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
      fetch(rankUrl).then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
    ])
      .then(([s, r]) => { setStats(s); setRankings(r.rankings || []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <Spinner />;
  if (error || !stats) return <ErrorMsg msg={error || 'No data'} />;

  // Find best AIO rate and best scoring category
  const sortedByAIO = [...categories].filter(c => c.eval_count > 0).sort((a, b) => b.avg_composite - a.avg_composite);
  const bestCategory = sortedByAIO[0];
  // For headline: find category with highest mention rate (proxy: highest avg_composite)
  // and category with highest avg score
  const sortedCats = [...categories].filter(c => c.avg_composite > 0).sort((a, b) => b.avg_composite - a.avg_composite);

  // "All Industries" view
  if (!category) {
    return (
      <div className="space-y-6">
        {/* Headline Insight */}
        {bestCategory && (
          <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, #1e1044 0%, #0f172a 100%)' }}>
            <p className="text-violet-400 text-sm font-medium mb-1 uppercase tracking-wider">Cross-Industry Insight</p>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              <span className="text-emerald-400">{bestCategory.category}</span> brands score highest (avg {bestCategory.avg_composite})
              {sortedCats.length > 1 && (
                <span className="text-zinc-400 font-normal text-lg"> — while {sortedCats[sortedCats.length - 1].category} trails at {sortedCats[sortedCats.length - 1].avg_composite}</span>
              )}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">{stats.total_brands} brands · {stats.total_evaluations.toLocaleString()} evaluations · {stats.mention_rate}% overall mention rate</p>
          </div>
        )}

        {/* Global KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Evaluations', value: stats.total_evaluations.toLocaleString(), icon: <Zap className="h-5 w-5 text-violet-400" /> },
            { label: 'Brands Tracked', value: stats.total_brands, icon: <Users className="h-5 w-5 text-blue-400" /> },
            { label: 'Avg Composite', value: stats.score_averages.composite, icon: <Star className="h-5 w-5 text-yellow-400" /> },
            { label: 'Mention Rate', value: `${stats.mention_rate}%`, icon: <Eye className="h-5 w-5 text-emerald-400" /> },
          ].map(c => (
            <Card key={c.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  {c.icon}
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">{c.label}</div>
                    <div className="text-2xl font-bold text-white">{c.value}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cross-Industry Comparison — wider bars with rank numbers */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-violet-400" /> Cross-Industry Comparison</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const sorted = [...categories].filter(c => c.avg_composite > 0).sort((a, b) => b.avg_composite - a.avg_composite);
              const maxVal = Math.max(...sorted.map(c => c.avg_composite), 1);
              const barH = 30;
              const gap = 8;
              const labelW = 160;
              const chartW = 600;
              const h = sorted.length * (barH + gap) + 10;
              return (
                <svg width="100%" height={h} viewBox={`0 0 ${chartW} ${h}`} preserveAspectRatio="xMinYMid meet">
                  {sorted.map((c, i) => {
                    const y = i * (barH + gap) + 4;
                    const w = (c.avg_composite / maxVal) * (chartW - labelW - 80);
                    return (
                      <g key={c.category}>
                        <text x={6} y={y + barH / 2 + 4} fill="#a1a1aa" fontSize={12} fontWeight={600}>#{i + 1}</text>
                        <text x={30} y={y + barH / 2 + 4} fill="#d4d4d8" fontSize={12}>{c.category}</text>
                        <rect x={labelW} y={y} width={Math.max(w, 3)} height={barH} rx={5} fill={getCatColor(c.category).hex} opacity={0.8} />
                        <text x={labelW + w + 8} y={y + barH / 2 + 4} fill="#e4e4e7" fontSize={12} fontWeight={700}>{c.avg_composite.toFixed(1)}</text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </CardContent>
        </Card>

        {/* Category Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(c => {
            const colors = getCatColor(c.category);
            return (
              <Card key={c.category} className={`bg-zinc-900 border-zinc-800 hover:${colors.accent} transition-all cursor-default`}>
                <CardContent className="pt-5 pb-4">
                  <div className={`text-sm font-semibold ${colors.text} mb-3`}>{c.category}</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-zinc-500 text-xs">Brands</div>
                      <div className="text-white font-bold">{c.brand_count}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs">Evaluations</div>
                      <div className="text-white font-bold">{c.eval_count.toLocaleString()}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-500 text-xs">Avg Composite</span>
                        <span className={`text-lg font-mono font-bold ${scoreColor(c.avg_composite)}`}>{c.avg_composite}</span>
                      </div>
                      <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.avg_composite}%`, backgroundColor: scoreHex(c.avg_composite) }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Category-specific view
  const topPerformer = rankings[0];
  const catAvg = stats.score_averages.composite;
  const gapAboveAvg = topPerformer ? Math.round(topPerformer.composite - catAvg) : 0;
  const sortedIntents = [...stats.intent_breakdown].sort((a, b) => b.rate - a.rate);
  const bestIntentItem = sortedIntents[0];
  const worstIntentItem = sortedIntents[sortedIntents.length - 1];

  const sentimentData = [
    { label: 'Positive', value: stats.sentiment_distribution['positive'] || 0, color: '#34d399' },
    { label: 'Neutral', value: stats.sentiment_distribution['neutral'] || 0, color: '#a78bfa' },
    { label: 'Negative', value: stats.sentiment_distribution['negative'] || 0, color: '#f87171' },
    { label: 'Unknown', value: stats.sentiment_distribution['unknown'] || 0, color: '#52525b' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Category Header with Gauge */}
      <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, #1e1044 0%, #0f172a 100%)' }}>
        <p className="text-violet-400 text-sm font-medium mb-1 uppercase tracking-wider">{category} AI Visibility Report</p>
        <div className="flex flex-wrap items-end gap-6 mt-2">
          {/* Large score gauge */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-full h-full">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={scoreHex(catAvg)} strokeWidth="6"
                  strokeDasharray={`${(catAvg / 100) * 213.6} 213.6`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" />
                <text x="40" y="36" textAnchor="middle" fill="#e4e4e7" fontSize="18" fontWeight="700">{catAvg}</text>
                <text x="40" y="50" textAnchor="middle" fill="#71717a" fontSize="10">/100</text>
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Industry Average: {catAvg}/100</div>
              {topPerformer && (
                <p className="text-zinc-400 text-sm mt-1">
                  Top: <span className="text-emerald-400 font-semibold">{topPerformer.name}</span> at {topPerformer.composite}/100 — <span className="text-emerald-400">{gapAboveAvg} points above avg</span>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-sm text-zinc-500">
          <span>{stats.total_brands} brands</span>
          <span>{stats.total_evaluations.toLocaleString()} evaluations</span>
          <span>{stats.mention_rate}% mention rate</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Brands', value: stats.total_brands, icon: <Users className="h-5 w-5 text-blue-400" /> },
          { label: 'Evaluations', value: stats.total_evaluations.toLocaleString(), icon: <Zap className="h-5 w-5 text-violet-400" /> },
          { label: 'Mention Rate', value: `${stats.mention_rate}%`, icon: <Eye className="h-5 w-5 text-emerald-400" /> },
          { label: 'Top Brand', value: stats.top_brand?.name || '—', icon: <Trophy className="h-5 w-5 text-amber-400" /> },
        ].map(c => (
          <Card key={c.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                {c.icon}
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">{c.label}</div>
                  <div className="text-xl font-bold text-white truncate">{c.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution - Top 10 */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white text-base">Top 10 Brand Scores</CardTitle></CardHeader>
          <CardContent>
            <BarChartSVG
              data={rankings.slice(0, 10).map(r => ({
                label: r.name,
                value: r.composite,
                color: scoreHex(r.composite),
              }))}
            />
          </CardContent>
        </Card>

        {/* Intent Performance — with best/worst callouts */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-base">Intent Performance</CardTitle>
            {bestIntentItem && worstIntentItem && (
              <p className="text-xs text-zinc-500 mt-1">
                Best: <span className="text-emerald-400 font-medium">{bestIntentItem.intent.replace(/_/g, ' ')}</span> ({bestIntentItem.rate}%)
                {' · '}
                Worst: <span className="text-red-400 font-medium">{worstIntentItem.intent.replace(/_/g, ' ')}</span> ({worstIntentItem.rate}%)
              </p>
            )}
          </CardHeader>
          <CardContent>
            <HorizontalBarSVG
              data={sortedIntents.slice(0, 10).map(ib => ({
                label: ib.intent,
                value: ib.rate,
                color: ib === bestIntentItem ? '#34d399' : ib === worstIntentItem ? '#f87171' : (ib.rate >= 50 ? '#34d399' : ib.rate >= 25 ? '#fbbf24' : '#f87171'),
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sentiment */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white text-base">Sentiment Breakdown</CardTitle></CardHeader>
          <CardContent>
            <DonutChartSVG data={sentimentData} />
          </CardContent>
        </Card>

        {/* Score Dimensions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white text-base">Score Dimensions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Visibility', value: stats.score_averages.visibility },
              { label: 'Citation', value: stats.score_averages.citation },
              { label: 'Representation', value: stats.score_averages.representation },
              { label: 'Intent', value: stats.score_averages.intent },
            ].map(d => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">{d.label}</span>
                  <span className={scoreColor(d.value)}>{d.value}/100</span>
                </div>
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.value}%`, backgroundColor: scoreHex(d.value) }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Rankings Tab ─────────────────────────────────────────────

function RankingsTab({ category }: { category: string }) {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [sortBy, setSortBy] = useState('composite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback((sort: string) => {
    setLoading(true);
    const params = new URLSearchParams({ sort_by: sort, limit: '50' });
    if (category) params.set('category', category);
    fetch(`${API_URL}/api/v1/industry/rankings?${params}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => setRankings(d.rankings))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => { load(sortBy); }, [sortBy, load]);

  const cols: { key: string; label: string; sortable: boolean }[] = [
    { key: 'rank', label: '#', sortable: false },
    { key: 'name', label: 'Brand', sortable: false },
    { key: 'composite', label: 'Composite', sortable: true },
    { key: 'visibility', label: 'Visibility', sortable: true },
    { key: 'citation', label: 'Citation', sortable: true },
    { key: 'representation', label: 'Repr.', sortable: true },
    { key: 'intent', label: 'Intent', sortable: true },
    { key: 'mentions', label: 'Mentions', sortable: true },
  ];

  if (error) return <ErrorMsg msg={error} />;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Brand Rankings{category ? ` — ${category}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {cols.map(c => (
                    <th
                      key={c.key}
                      className={`py-3 px-3 text-left text-zinc-400 font-medium ${c.sortable ? 'cursor-pointer hover:text-violet-400' : ''}`}
                      onClick={() => c.sortable && setSortBy(c.key)}
                    >
                      <span className="flex items-center gap-1">
                        {c.label}
                        {sortBy === c.key && <ChevronDown className="h-3 w-3 text-violet-400" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankings.map(r => (
                  <Fragment key={r.name}>
                    <tr
                      className={`border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer ${r.rank <= 3 ? 'bg-zinc-800/30' : ''}`}
                      onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                    >
                      <td className={`py-3 px-3 ${rankStyle(r.rank)}`}>{rankBadge(r.rank)}</td>
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{r.name}</div>
                        {!category && <div className="text-xs text-zinc-500">{r.category}</div>}
                      </td>
                      {(['composite', 'visibility', 'citation', 'representation', 'intent'] as const).map(k => (
                        <td key={k} className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono ${scoreBg(r[k])} ${scoreColor(r[k])}`}>
                            {r[k].toFixed(1)}
                          </span>
                        </td>
                      ))}
                      <td className="py-3 px-3 text-zinc-300">{r.mentions}/{r.evaluations}</td>
                    </tr>
                    {expanded === r.name && (
                      <tr className="bg-zinc-800/20">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Domain', value: r.domain || '—' },
                              { label: 'Category', value: r.category },
                              { label: 'Mention Rate', value: `${r.evaluations ? ((r.mentions / r.evaluations) * 100).toFixed(1) : 0}%` },
                              { label: 'Evaluations', value: r.evaluations },
                            ].map(d => (
                              <div key={d.label}>
                                <div className="text-xs text-zinc-500">{d.label}</div>
                                <div className="text-sm text-white font-medium">{d.value}</div>
                              </div>
                            ))}
                          </div>
                          {/* Mini score bar */}
                          <div className="mt-4 flex gap-2 flex-wrap">
                            {(['composite', 'visibility', 'citation', 'representation', 'intent'] as const).map(k => (
                              <div key={k} className="flex items-center gap-1.5">
                                <span className="text-xs text-zinc-500 capitalize">{k}:</span>
                                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${r[k]}%`, backgroundColor: scoreHex(r[k]) }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Matrix Tab ──────────────────────────────────────────────

function MatrixTab({ category }: { category: string }) {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCell, setHoveredCell] = useState<{ brand: string; intent: string; rate: number; mentioned: number; total: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    fetch(`${API_URL}/api/v1/industry/intent-matrix${params}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorMsg msg={error || 'No data'} />;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Intent × Brand Heatmap{category ? ` — ${category}` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {hoveredCell && (
          <div className="absolute top-2 right-4 bg-zinc-800 border border-zinc-700 rounded-lg p-3 z-20 shadow-xl text-sm">
            <div className="text-white font-medium">{hoveredCell.brand}</div>
            <div className="text-zinc-400 text-xs">{hoveredCell.intent}</div>
            <div className="mt-1 text-emerald-400 font-mono">{hoveredCell.rate}% ({hoveredCell.mentioned}/{hoveredCell.total})</div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-zinc-400 font-medium sticky left-0 bg-zinc-900 z-10 min-w-[140px]">Brand</th>
                {data.intents.map(i => (
                  <th key={i} className="py-2 px-2 text-zinc-400 font-medium text-center min-w-[80px]">
                    <div className="truncate max-w-[80px]" title={i}>{i}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.brands.map(brand => (
                <tr key={brand} className="border-t border-zinc-800/50">
                  <td className="py-1.5 px-3 text-zinc-300 font-medium sticky left-0 bg-zinc-900 z-10 truncate max-w-[140px]" title={brand}>{brand}</td>
                  {data.intents.map(intent => {
                    const cell = data.matrix[brand]?.[intent];
                    const rate = cell ? cell.rate : 0;
                    return (
                      <td
                        key={intent}
                        className="py-1.5 px-2 text-center"
                        onMouseEnter={() => cell && setHoveredCell({ brand, intent, rate, mentioned: cell.mentioned, total: cell.total })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className={`rounded px-1 py-0.5 ${heatColor(rate)} text-zinc-200`}>
                          {rate}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Raw Data Tab ────────────────────────────────────────────

function RawDataTab({ category }: { category: string }) {
  const [data, setData] = useState<RawItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 50, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [intents, setIntents] = useState<string[]>([]);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterIntent, setFilterIntent] = useState('');
  const [filterMentioned, setFilterMentioned] = useState('');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const catParam = category ? `?category=${encodeURIComponent(category)}` : '';
    Promise.all([
      fetch(`${API_URL}/api/v1/industry/brands${catParam}`).then(r => r.json()),
      fetch(`${API_URL}/api/v1/industry/intents${catParam}`).then(r => r.json()),
    ]).then(([b, i]) => {
      setBrands(b.brands || []);
      setIntents(i.intents || []);
    }).catch(() => {});
    setFilterBrand('');
    setFilterIntent('');
    setPage(1);
  }, [category]);

  const loadData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (filterBrand) params.set('brand', filterBrand);
    if (filterIntent) params.set('intent', filterIntent);
    if (filterMentioned) params.set('mentioned', filterMentioned);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    fetch(`${API_URL}/api/v1/industry/raw?${params}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { setData(d.data); setPagination(d.pagination); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, filterBrand, filterIntent, filterMentioned, search, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Brand</label>
              <select value={filterBrand} onChange={e => { setFilterBrand(e.target.value); setPage(1); }} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 focus:border-violet-500 outline-none">
                <option value="">All Brands</option>
                {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Intent</label>
              <select value={filterIntent} onChange={e => { setFilterIntent(e.target.value); setPage(1); }} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 focus:border-violet-500 outline-none">
                <option value="">All Intents</option>
                {intents.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Mentioned</label>
              <select value={filterMentioned} onChange={e => { setFilterMentioned(e.target.value); setPage(1); }} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 focus:border-violet-500 outline-none">
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-zinc-500 block mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search prompts or responses..." className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded pl-8 pr-8 py-1.5 w-full focus:border-violet-500 outline-none" />
                {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-zinc-500 hover:text-white" /></button>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          {error ? <ErrorMsg msg={error} /> : loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Brand', 'Prompt', 'Intent', 'Model', 'Mentioned', 'Rank', 'Sentiment', 'Time'].map(h => (
                      <th key={h} className="py-2 px-3 text-left text-zinc-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <Fragment key={i}>
                      <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                        <td className="py-2 px-3 text-white font-medium whitespace-nowrap">{r.brand}</td>
                        <td className="py-2 px-3 text-zinc-300 max-w-[300px] truncate">{r.prompt}</td>
                        <td className="py-2 px-3 text-zinc-400">{r.intent}</td>
                        <td className="py-2 px-3 text-zinc-400 text-xs">{r.model}</td>
                        <td className="py-2 px-3">{r.mentioned ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                        <td className="py-2 px-3 text-zinc-400">{r.rank ?? '—'}</td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            r.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                            r.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                            r.sentiment === 'neutral' ? 'bg-violet-500/20 text-violet-400' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>{r.sentiment || '—'}</span>
                        </td>
                        <td className="py-2 px-3 text-zinc-400 text-xs">{r.response_time_ms}ms</td>
                      </tr>
                      {expanded === i && (
                        <tr className="bg-zinc-800/30">
                          <td colSpan={8} className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ChevronUp className="h-4 w-4 text-violet-400" />
                              <span className="text-violet-400 text-xs font-medium">Full AI Response</span>
                              {r.context && <span className="text-xs text-zinc-500 ml-4">Context: {r.context}</span>}
                            </div>
                            <p className="text-zinc-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">{r.response}</p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Page {pagination.page} of {pagination.total_pages}</span>
              <span className="text-zinc-600">|</span>
              <span>{pagination.total.toLocaleString()} results</span>
            </div>
            <div className="flex items-center gap-3">
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded px-2 py-1 outline-none">
                {[50, 100, 200].map(s => <option key={s} value={s}>{s}/page</option>)}
              </select>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-zinc-400 hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled={page >= pagination.total_pages} onClick={() => setPage(p => p + 1)} className="text-zinc-400 hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
