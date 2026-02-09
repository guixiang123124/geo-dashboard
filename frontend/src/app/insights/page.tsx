'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Trophy, Grid3X3, Database, Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Tab = 'overview' | 'rankings' | 'matrix' | 'raw';

interface StatsData {
  total_evaluations: number;
  total_mentioned: number;
  mention_rate: number;
  total_brands: number;
  total_prompts: number;
  intent_breakdown: { intent: string; total: number; mentioned: number; rate: number }[];
  sentiment_distribution: Record<string, number>;
  score_averages: { composite: number; visibility: number; citation: number; representation: number; intent: number };
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

function rankStyle(rank: number) {
  if (rank === 1) return 'text-yellow-400 font-bold';
  if (rank === 2) return 'text-gray-300 font-bold';
  if (rank === 3) return 'text-amber-600 font-bold';
  return 'text-zinc-400';
}

function rankBadge(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

function heatColor(rate: number) {
  if (rate === 0) return 'bg-zinc-800';
  if (rate < 20) return 'bg-emerald-900/40';
  if (rate < 40) return 'bg-emerald-800/60';
  if (rate < 60) return 'bg-emerald-700/70';
  if (rate < 80) return 'bg-emerald-600/80';
  return 'bg-emerald-500';
}

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
  </div>
);

const ErrorMsg = ({ msg }: { msg: string }) => (
  <div className="text-center py-10 text-red-400">{msg}</div>
);

export default function InsightsPage() {
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'rankings', label: 'Rankings', icon: <Trophy className="h-4 w-4" /> },
    { key: 'matrix', label: 'Intent Matrix', icon: <Grid3X3 className="h-4 w-4" /> },
    { key: 'raw', label: 'Raw Data', icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Industry Intelligence</h1>
        <p className="text-zinc-400 mt-1">AI visibility benchmarks across your competitive landscape</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'ghost'}
            className={tab === t.key ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'text-zinc-400 hover:text-white'}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            <span className="ml-2">{t.label}</span>
          </Button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'rankings' && <RankingsTab />}
      {tab === 'matrix' && <MatrixTab />}
      {tab === 'raw' && <RawDataTab />}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/v1/industry/stats`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error || !stats) return <ErrorMsg msg={error || 'No data'} />;

  const cards = [
    { label: 'Total Evaluations', value: stats.total_evaluations.toLocaleString() },
    { label: 'Brands Tracked', value: stats.total_brands },
    { label: 'Avg Composite', value: stats.score_averages.composite.toFixed(1) },
    { label: 'Mention Rate', value: `${(stats.mention_rate * 100).toFixed(1)}%` },
  ];

  const dims = [
    { label: 'Visibility', value: stats.score_averages.visibility },
    { label: 'Citation', value: stats.score_averages.citation },
    { label: 'Representation', value: stats.score_averages.representation },
    { label: 'Intent', value: stats.score_averages.intent },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">{c.label}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-white">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Intent Category Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {stats.intent_breakdown.map(ib => (
              <div key={ib.intent} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300 truncate mr-2">{ib.intent}</span>
                  <span className="text-zinc-400 shrink-0">{(ib.rate * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all" style={{ width: `${ib.rate * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Score Dimensions</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {dims.map(d => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">{d.label}</span>
                  <span className={scoreColor(d.value)}>{d.value.toFixed(1)}</span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${d.value >= 60 ? 'bg-emerald-500' : d.value >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RankingsTab() {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [sortBy, setSortBy] = useState('composite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback((sort: string) => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/industry/rankings?sort_by=${sort}&limit=30`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => setRankings(d.rankings))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(sortBy); }, [sortBy, load]);

  const cols: { key: string; label: string }[] = [
    { key: 'rank', label: '#' },
    { key: 'name', label: 'Brand' },
    { key: 'composite', label: 'Composite' },
    { key: 'visibility', label: 'Visibility' },
    { key: 'citation', label: 'Citation' },
    { key: 'representation', label: 'Representation' },
    { key: 'intent', label: 'Intent' },
    { key: 'mentions', label: 'Mentions' },
  ];

  const sortable = ['composite', 'visibility', 'citation', 'representation', 'intent', 'mentions'];

  if (error) return <ErrorMsg msg={error} />;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader><CardTitle className="text-white">Brand Rankings</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {cols.map(c => (
                    <th
                      key={c.key}
                      className={`py-3 px-3 text-left text-zinc-400 font-medium ${sortable.includes(c.key) ? 'cursor-pointer hover:text-violet-400' : ''}`}
                      onClick={() => sortable.includes(c.key) && setSortBy(c.key)}
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
                  <tr key={r.name} className={`border-b border-zinc-800/50 hover:bg-zinc-800/50 ${r.rank <= 3 ? 'bg-zinc-800/30' : ''}`}>
                    <td className={`py-3 px-3 ${rankStyle(r.rank)}`}>{rankBadge(r.rank)}</td>
                    <td className="py-3 px-3 text-white font-medium">{r.name}</td>
                    {(['composite', 'visibility', 'citation', 'representation', 'intent'] as const).map(k => (
                      <td key={k} className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${scoreBg(r[k])} ${scoreColor(r[k])}`}>
                          {r[k].toFixed(1)}
                        </span>
                      </td>
                    ))}
                    <td className="py-3 px-3 text-zinc-300">{r.mentions}/{r.evaluations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatrixTab() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/v1/industry/intent-matrix`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorMsg msg={error || 'No data'} />;

  const avgByIntent: Record<string, number> = {};
  data.intents.forEach(intent => {
    let sum = 0, count = 0;
    data.brands.forEach(brand => {
      const cell = data.matrix[brand]?.[intent];
      if (cell) { sum += cell.rate; count++; }
    });
    avgByIntent[intent] = count > 0 ? sum / count : 0;
  });

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader><CardTitle className="text-white">Intent × Brand Heatmap</CardTitle></CardHeader>
      <CardContent>
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
                    const rate = cell ? cell.rate * 100 : 0;
                    return (
                      <td key={intent} className="py-1.5 px-2 text-center">
                        <div className={`rounded px-1 py-0.5 ${heatColor(rate)} text-zinc-200`} title={`${brand} × ${intent}: ${rate.toFixed(0)}%`}>
                          {rate.toFixed(0)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t-2 border-violet-600">
                <td className="py-2 px-3 text-violet-400 font-bold sticky left-0 bg-zinc-900 z-10">Average</td>
                {data.intents.map(intent => (
                  <td key={intent} className="py-2 px-2 text-center text-violet-300 font-mono font-bold">
                    {(avgByIntent[intent] * 100).toFixed(0)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RawDataTab() {
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
    Promise.all([
      fetch(`${API_URL}/api/v1/industry/brands`).then(r => r.json()),
      fetch(`${API_URL}/api/v1/industry/intents`).then(r => r.json()),
    ]).then(([b, i]) => {
      setBrands(b.brands || []);
      setIntents(i.intents || []);
    }).catch(() => {});
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
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
  }, [filterBrand, filterIntent, filterMentioned, search, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-4">
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
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search prompts..." className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded pl-8 pr-8 py-1.5 w-full focus:border-violet-500 outline-none" />
                {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-zinc-500 hover:text-white" /></button>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          {error ? <ErrorMsg msg={error} /> : loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Brand', 'Prompt', 'Intent', 'Model', 'Mentioned', 'Rank', 'Sentiment', 'Response Time'].map(h => (
                      <th key={h} className="py-2 px-3 text-left text-zinc-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <>
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                        <td className="py-2 px-3 text-white font-medium whitespace-nowrap">{r.brand}</td>
                        <td className="py-2 px-3 text-zinc-300 max-w-[300px] truncate">{r.prompt}</td>
                        <td className="py-2 px-3 text-zinc-400">{r.intent}</td>
                        <td className="py-2 px-3 text-zinc-400 text-xs">{r.model}</td>
                        <td className="py-2 px-3">{r.mentioned ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                        <td className="py-2 px-3 text-zinc-400">{r.rank ?? '—'}</td>
                        <td className="py-2 px-3 text-zinc-400">{r.sentiment}</td>
                        <td className="py-2 px-3 text-zinc-400">{r.response_time_ms}ms</td>
                      </tr>
                      {expanded === i && (
                        <tr key={`exp-${i}`} className="bg-zinc-800/30">
                          <td colSpan={8} className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ChevronUp className="h-4 w-4 text-violet-400" />
                              <span className="text-violet-400 text-xs font-medium">AI Response</span>
                            </div>
                            <p className="text-zinc-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">{r.response}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Page {pagination.page} of {pagination.total_pages}</span>
              <span className="text-zinc-600">|</span>
              <span>Total: {pagination.total} results</span>
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
