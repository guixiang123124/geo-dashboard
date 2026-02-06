'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  MessageSquareText,
  Flame,
  Filter,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Eye,
  ShoppingCart,
} from 'lucide-react';

// ─── Demo Data ───────────────────────────────────────────────
type Intent = 'Awareness' | 'Consideration' | 'Decision';

interface DemoPrompt {
  id: number;
  prompt: string;
  intent: Intent;
  brandMentions: number;
  topBrands: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  trending: boolean;
}

const BRANDS = ['PatPat', 'Primary', 'H&M Kids', 'Carter\'s', 'Hanna Andersson', 'Tea Collection', 'Cat & Jack', 'Janie & Jack'];

const DEMO_PROMPTS: DemoPrompt[] = [
  { id: 1, prompt: '什么是最好的儿童时尚品牌？', intent: 'Awareness', brandMentions: 7, topBrands: ['PatPat', 'Carter\'s', 'H&M Kids'], difficulty: 'Easy', trending: true },
  { id: 2, prompt: 'Best kids clothing brands for toddlers', intent: 'Awareness', brandMentions: 6, topBrands: ['Carter\'s', 'Primary', 'Cat & Jack'], difficulty: 'Easy', trending: true },
  { id: 3, prompt: 'Sustainable children\'s fashion brands', intent: 'Awareness', brandMentions: 5, topBrands: ['Hanna Andersson', 'Tea Collection', 'Primary'], difficulty: 'Medium', trending: true },
  { id: 4, prompt: 'Affordable kids clothes online', intent: 'Awareness', brandMentions: 8, topBrands: ['PatPat', 'H&M Kids', 'Cat & Jack', 'Carter\'s'], difficulty: 'Easy', trending: true },
  { id: 5, prompt: 'Organic cotton kids clothing', intent: 'Awareness', brandMentions: 4, topBrands: ['Hanna Andersson', 'Primary', 'Tea Collection'], difficulty: 'Medium', trending: false },
  { id: 6, prompt: 'Trendy kids fashion 2025', intent: 'Awareness', brandMentions: 6, topBrands: ['H&M Kids', 'Janie & Jack', 'Tea Collection'], difficulty: 'Medium', trending: true },
  { id: 7, prompt: 'Best baby clothes brands', intent: 'Awareness', brandMentions: 5, topBrands: ['Carter\'s', 'PatPat', 'H&M Kids'], difficulty: 'Easy', trending: false },
  { id: 8, prompt: 'Kids activewear brands', intent: 'Awareness', brandMentions: 3, topBrands: ['Cat & Jack', 'Primary'], difficulty: 'Hard', trending: false },
  { id: 9, prompt: 'Luxury children\'s clothing', intent: 'Awareness', brandMentions: 4, topBrands: ['Janie & Jack', 'Tea Collection', 'Hanna Andersson'], difficulty: 'Hard', trending: false },
  { id: 10, prompt: 'Best kids pajamas', intent: 'Awareness', brandMentions: 5, topBrands: ['Hanna Andersson', 'Primary', 'Carter\'s'], difficulty: 'Medium', trending: false },
  { id: 11, prompt: 'PatPat vs Carter\'s which is better?', intent: 'Consideration', brandMentions: 4, topBrands: ['PatPat', 'Carter\'s'], difficulty: 'Medium', trending: true },
  { id: 12, prompt: 'H&M Kids vs Primary comparison', intent: 'Consideration', brandMentions: 3, topBrands: ['H&M Kids', 'Primary'], difficulty: 'Medium', trending: false },
  { id: 13, prompt: 'Is PatPat good quality?', intent: 'Consideration', brandMentions: 3, topBrands: ['PatPat', 'Carter\'s', 'H&M Kids'], difficulty: 'Easy', trending: true },
  { id: 14, prompt: 'Hanna Andersson worth the price?', intent: 'Consideration', brandMentions: 3, topBrands: ['Hanna Andersson', 'Primary', 'Tea Collection'], difficulty: 'Medium', trending: false },
  { id: 15, prompt: 'Best value kids clothing brand', intent: 'Consideration', brandMentions: 6, topBrands: ['PatPat', 'Cat & Jack', 'Carter\'s', 'H&M Kids'], difficulty: 'Easy', trending: true },
  { id: 16, prompt: 'Kids clothes that last long', intent: 'Consideration', brandMentions: 4, topBrands: ['Primary', 'Hanna Andersson', 'Tea Collection'], difficulty: 'Medium', trending: false },
  { id: 17, prompt: 'Safest kids clothing no chemicals', intent: 'Consideration', brandMentions: 3, topBrands: ['Hanna Andersson', 'Primary'], difficulty: 'Hard', trending: false },
  { id: 18, prompt: 'Best kids clothing for sensitive skin', intent: 'Consideration', brandMentions: 4, topBrands: ['Primary', 'Hanna Andersson', 'Carter\'s'], difficulty: 'Medium', trending: false },
  { id: 19, prompt: 'PatPat sizing reviews', intent: 'Consideration', brandMentions: 2, topBrands: ['PatPat'], difficulty: 'Easy', trending: false },
  { id: 20, prompt: 'Tea Collection vs Janie & Jack', intent: 'Consideration', brandMentions: 3, topBrands: ['Tea Collection', 'Janie & Jack'], difficulty: 'Hard', trending: false },
  { id: 21, prompt: 'Where to buy kids school uniforms online', intent: 'Decision', brandMentions: 5, topBrands: ['Cat & Jack', 'H&M Kids', 'Carter\'s'], difficulty: 'Easy', trending: true },
  { id: 22, prompt: 'Best site to buy toddler dresses', intent: 'Decision', brandMentions: 5, topBrands: ['PatPat', 'H&M Kids', 'Janie & Jack'], difficulty: 'Easy', trending: false },
  { id: 23, prompt: 'Buy organic kids clothes online', intent: 'Decision', brandMentions: 4, topBrands: ['Hanna Andersson', 'Primary', 'Tea Collection'], difficulty: 'Medium', trending: false },
  { id: 24, prompt: 'PatPat discount code', intent: 'Decision', brandMentions: 2, topBrands: ['PatPat'], difficulty: 'Easy', trending: true },
  { id: 25, prompt: 'Carter\'s free shipping', intent: 'Decision', brandMentions: 2, topBrands: ['Carter\'s'], difficulty: 'Easy', trending: false },
  { id: 26, prompt: 'Best kids clothes Black Friday deals', intent: 'Decision', brandMentions: 6, topBrands: ['PatPat', 'Carter\'s', 'H&M Kids', 'Cat & Jack'], difficulty: 'Easy', trending: false },
  { id: 27, prompt: 'Gift ideas for 5 year old girl clothing', intent: 'Decision', brandMentions: 5, topBrands: ['Janie & Jack', 'Tea Collection', 'H&M Kids'], difficulty: 'Medium', trending: false },
  { id: 28, prompt: 'Kids winter coat recommendations', intent: 'Decision', brandMentions: 4, topBrands: ['H&M Kids', 'Carter\'s', 'Cat & Jack'], difficulty: 'Medium', trending: false },
  { id: 29, prompt: 'Best kids swimwear brands 2025', intent: 'Decision', brandMentions: 4, topBrands: ['Primary', 'Cat & Jack', 'Tea Collection'], difficulty: 'Medium', trending: true },
  { id: 30, prompt: 'Where to buy matching family outfits', intent: 'Decision', brandMentions: 3, topBrands: ['PatPat', 'H&M Kids', 'Carter\'s'], difficulty: 'Easy', trending: false },
  { id: 31, prompt: 'Best kids clothes subscription box', intent: 'Awareness', brandMentions: 3, topBrands: ['Stitch Fix Kids', 'Primary'], difficulty: 'Hard', trending: false },
  { id: 32, prompt: 'Gender neutral kids clothing brands', intent: 'Awareness', brandMentions: 4, topBrands: ['Primary', 'Hanna Andersson', 'Cat & Jack'], difficulty: 'Medium', trending: true },
];

const INTENT_CONFIG: Record<Intent, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Awareness: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Eye, label: '认知阶段' },
  Consideration: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Target, label: '考虑阶段' },
  Decision: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: ShoppingCart, label: '决策阶段' },
};

const HEATMAP_PROMPTS = DEMO_PROMPTS.filter(p => p.brandMentions >= 4).slice(0, 12);

// ─── Component ───────────────────────────────────────────────
export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<Intent | 'All'>('All');
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<null | { brands: string[]; sentiment: string }>(null);
  const [sortCol, setSortCol] = useState<'mentions' | 'prompt'>('mentions');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = DEMO_PROMPTS;
    if (intentFilter !== 'All') list = list.filter(p => p.intent === intentFilter);
    if (searchQuery) list = list.filter(p => p.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
    list = [...list].sort((a, b) => {
      if (sortCol === 'mentions') return sortAsc ? a.brandMentions - b.brandMentions : b.brandMentions - a.brandMentions;
      return sortAsc ? a.prompt.localeCompare(b.prompt) : b.prompt.localeCompare(a.prompt);
    });
    return list;
  }, [searchQuery, intentFilter, sortCol, sortAsc]);

  const funnelData = useMemo(() => {
    const counts: Record<Intent, number> = { Awareness: 0, Consideration: 0, Decision: 0 };
    DEMO_PROMPTS.forEach(p => { counts[p.intent] += p.brandMentions; });
    return counts;
  }, []);

  const hotPrompts = useMemo(() =>
    [...DEMO_PROMPTS].sort((a, b) => b.brandMentions - a.brandMentions).slice(0, 10),
  []);

  const handleTestPrompt = () => {
    if (!testPrompt.trim()) return;
    const fakeBrands = BRANDS.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 2);
    setTestResult({ brands: fakeBrands, sentiment: Math.random() > 0.3 ? '正面' : '中性' });
  };

  const toggleSort = (col: 'mentions' | 'prompt') => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const maxFunnel = Math.max(...Object.values(funnelData));

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-700 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquareText className="w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold">Prompt 研究工具</h1>
        </div>
        <p className="text-violet-200 text-sm md:text-base">发现哪些 AI 提示词触发品牌提及，分析提示词意图分布与品牌覆盖矩阵</p>
      </div>

      {/* Funnel + Hot Prompts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Filter className="w-5 h-5 text-violet-600" />意图漏斗分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['Awareness', 'Consideration', 'Decision'] as Intent[]).map((intent) => {
              const cfg = INTENT_CONFIG[intent];
              const Icon = cfg.icon;
              const pct = Math.round((funnelData[intent] / maxFunnel) * 100);
              return (
                <div key={intent} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><Icon className={`w-4 h-4 ${cfg.color}`} />{cfg.label} ({intent})</span>
                    <span className="font-bold">{funnelData[intent]} 次提及</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div className={`h-full rounded-lg transition-all ${intent === 'Awareness' ? 'bg-blue-500' : intent === 'Consideration' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <svg viewBox="0 0 300 160" className="w-full mt-4">
              <polygon points="30,10 270,10 240,55 60,55" fill="#8b5cf6" opacity="0.8" />
              <polygon points="60,60 240,60 220,105 80,105" fill="#6366f1" opacity="0.8" />
              <polygon points="80,110 220,110 200,150 100,150" fill="#4f46e5" opacity="0.8" />
              <text x="150" y="38" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">认知 · {funnelData.Awareness}</text>
              <text x="150" y="88" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">考虑 · {funnelData.Consideration}</text>
              <text x="150" y="135" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">决策 · {funnelData.Decision}</text>
            </svg>
          </CardContent>
        </Card>

        {/* Hot Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Flame className="w-5 h-5 text-orange-500" />热门提示词 Top 10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hotPrompts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.prompt}</p>
                    <span className={`text-xs ${INTENT_CONFIG[p.intent].color}`}>{p.intent}</span>
                  </div>
                  <span className="text-sm font-bold text-violet-600">{p.brandMentions}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test a Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-yellow-500" />测试提示词</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestPrompt()}
              placeholder="输入任意提示词，查看模拟 AI 回答中的品牌提及..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button onClick={handleTestPrompt} className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" />测试
            </button>
          </div>
          {testResult && (
            <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="text-sm font-medium text-violet-800 mb-2">模拟结果 (Demo)</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {testResult.brands.map(b => (
                  <span key={b} className="px-2.5 py-1 bg-white border border-violet-200 rounded-full text-xs font-medium text-violet-700">{b}</span>
                ))}
              </div>
              <p className="text-xs text-violet-600">情感倾向: {testResult.sentiment} · 品牌提及数: {testResult.brands.length}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Heatmap Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Target className="w-5 h-5 text-indigo-600" />品牌-提示词覆盖矩阵</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 font-medium text-slate-500 sticky left-0 bg-white min-w-[200px]">提示词</th>
                {BRANDS.map(b => (
                  <th key={b} className="py-2 px-2 font-medium text-slate-500 text-center whitespace-nowrap">{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEATMAP_PROMPTS.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 px-2 font-medium text-slate-700 sticky left-0 bg-white truncate max-w-[200px]">{p.prompt}</td>
                  {BRANDS.map(brand => {
                    const mentioned = p.topBrands.includes(brand);
                    return (
                      <td key={brand} className="py-2 px-2 text-center">
                        <div className={`w-7 h-7 mx-auto rounded ${mentioned ? 'bg-violet-500' : 'bg-slate-100'} flex items-center justify-center`}>
                          {mentioned && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Searchable Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base"><Search className="w-5 h-5 text-slate-500" />提示词库 ({filtered.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {(['All', 'Awareness', 'Consideration', 'Decision'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setIntentFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${intentFilter === f ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f === 'All' ? '全部' : f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索提示词..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-medium text-slate-500 cursor-pointer select-none" onClick={() => toggleSort('prompt')}>
                    <span className="flex items-center gap-1">提示词 {sortCol === 'prompt' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-slate-500">意图</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-500 cursor-pointer select-none" onClick={() => toggleSort('mentions')}>
                    <span className="flex items-center justify-center gap-1">品牌提及 {sortCol === 'mentions' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-slate-500">难度</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Top 品牌</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-500">趋势</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cfg = INTENT_CONFIG[p.intent];
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-800">{p.prompt}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg}`}>{p.intent}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-violet-600">{p.brandMentions}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs font-medium ${p.difficulty === 'Easy' ? 'text-green-600' : p.difficulty === 'Medium' ? 'text-amber-600' : 'text-red-600'}`}>{p.difficulty}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {p.topBrands.slice(0, 3).map(b => (
                            <span key={b} className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{b}</span>
                          ))}
                          {p.topBrands.length > 3 && <span className="text-xs text-slate-400">+{p.topBrands.length - 3}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.trending && <Flame className="w-4 h-4 text-orange-500 mx-auto" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
