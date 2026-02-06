'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Zap,
  Sun,
  Snowflake,
  Leaf,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

// ─── Demo Data ───────────────────────────────────────────────
const WEEKS = ['W1 (1/6)', 'W2 (1/13)', 'W3 (1/20)', 'W4 (1/27)', 'W5 (2/3)', 'W6 (2/10)', 'W7 (2/17)', 'W8 (2/24)'];

interface BrandTrend {
  name: string;
  color: string;
  scores: number[];
}

const BRAND_TRENDS: BrandTrend[] = [
  { name: 'PatPat', color: '#8b5cf6', scores: [62, 65, 68, 70, 72, 71, 74, 72] },
  { name: 'Carter\'s', color: '#6366f1', scores: [80, 82, 81, 83, 85, 84, 86, 85] },
  { name: 'H&M Kids', color: '#0ea5e9', scores: [65, 63, 66, 68, 67, 69, 68, 68] },
  { name: 'Primary', color: '#d946ef', scores: [45, 48, 50, 52, 55, 57, 56, 55] },
  { name: 'Hanna Andersson', color: '#14b8a6', scores: [40, 42, 44, 46, 48, 47, 49, 48] },
  { name: 'Cat & Jack', color: '#ef4444', scores: [72, 74, 75, 76, 78, 77, 79, 78] },
  { name: 'Tea Collection', color: '#f59e0b', scores: [35, 36, 38, 40, 42, 41, 43, 42] },
  { name: 'Janie & Jack', color: '#ec4899', scores: [30, 32, 34, 36, 38, 37, 39, 38] },
];

const MOVERS = BRAND_TRENDS.map(b => {
  const change = b.scores[7] - b.scores[0];
  const pct = ((change / b.scores[0]) * 100).toFixed(1);
  return { name: b.name, color: b.color, current: b.scores[7], change, pct: parseFloat(pct) };
}).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

interface CategoryTrend {
  name: string;
  nameZh: string;
  trend: 'up' | 'down' | 'stable';
  mentions: number;
  change: number;
}

const CATEGORY_TRENDS: CategoryTrend[] = [
  { name: 'Organic Cotton', nameZh: '有机棉', trend: 'up', mentions: 342, change: 28 },
  { name: 'Activewear', nameZh: '运动服', trend: 'up', mentions: 289, change: 22 },
  { name: 'Gender Neutral', nameZh: '无性别', trend: 'up', mentions: 256, change: 35 },
  { name: 'Dresses', nameZh: '连衣裙', trend: 'stable', mentions: 412, change: 3 },
  { name: 'School Uniforms', nameZh: '校服', trend: 'down', mentions: 198, change: -12 },
  { name: 'Sleepwear', nameZh: '睡衣', trend: 'stable', mentions: 267, change: 5 },
  { name: 'Sustainable Fashion', nameZh: '可持续时尚', trend: 'up', mentions: 315, change: 31 },
  { name: 'Matching Outfits', nameZh: '亲子装', trend: 'up', mentions: 178, change: 18 },
];

interface Season {
  name: string;
  nameZh: string;
  icon: React.ElementType;
  months: string;
  peak: string;
  color: string;
}

const SEASONS: Season[] = [
  { name: 'Spring Collection', nameZh: '春季新品', icon: Leaf, months: '2月-4月', peak: '3月', color: 'bg-green-100 text-green-700' },
  { name: 'Summer / Swimwear', nameZh: '夏季泳装', icon: Sun, months: '5月-7月', peak: '6月', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Back to School', nameZh: '开学季', icon: GraduationCap, months: '7月-9月', peak: '8月', color: 'bg-blue-100 text-blue-700' },
  { name: 'Holiday / Winter', nameZh: '节日冬装', icon: Snowflake, months: '10月-12月', peak: '11月', color: 'bg-violet-100 text-violet-700' },
];

interface PlatformData {
  platform: string;
  brands: { name: string; score: number }[];
}

const PLATFORM_DATA: PlatformData[] = [
  { platform: 'ChatGPT', brands: [{ name: 'Carter\'s', score: 88 }, { name: 'Cat & Jack', score: 80 }, { name: 'PatPat', score: 74 }, { name: 'Primary', score: 58 }, { name: 'H&M Kids', score: 70 }] },
  { platform: 'Gemini', brands: [{ name: 'Carter\'s', score: 82 }, { name: 'Cat & Jack', score: 75 }, { name: 'PatPat', score: 68 }, { name: 'Primary', score: 52 }, { name: 'H&M Kids', score: 72 }] },
  { platform: 'Claude', brands: [{ name: 'Carter\'s', score: 85 }, { name: 'Cat & Jack', score: 78 }, { name: 'PatPat', score: 76 }, { name: 'Primary', score: 62 }, { name: 'H&M Kids', score: 65 }] },
];

const PLATFORM_COLORS: Record<string, string> = { ChatGPT: '#10b981', Gemini: '#3b82f6', Claude: '#f59e0b' };

// ─── Chart Helpers ───────────────────────────────────────────
const chartW = 700, chartH = 300, padL = 45, padR = 20, padT = 20, padB = 40;
const plotW = chartW - padL - padR;
const plotH = chartH - padT - padB;

function toX(i: number) { return padL + (i / (WEEKS.length - 1)) * plotW; }
function toY(v: number, min: number, max: number) { return padT + plotH - ((v - min) / (max - min)) * plotH; }

export default function TrendsPage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['PatPat', 'Carter\'s', 'H&M Kids', 'Cat & Jack']);

  const allScores = BRAND_TRENDS.filter(b => selectedBrands.includes(b.name)).flatMap(b => b.scores);
  const minScore = Math.max(0, Math.min(...allScores) - 5);
  const maxScore = Math.min(100, Math.max(...allScores) + 5);

  const toggleBrand = (name: string) => {
    if (selectedBrands.includes(name)) {
      if (selectedBrands.length > 1) setSelectedBrands(selectedBrands.filter(n => n !== name));
    } else {
      setSelectedBrands([...selectedBrands, name]);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <LineChart className="w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold">趋势追踪</h1>
        </div>
        <p className="text-purple-200 text-sm md:text-base">追踪品牌在 AI 平台的可见度变化，发现品类趋势与季节性洞察</p>
      </div>

      {/* Weekly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-5 h-5 text-violet-600" />周度可见度趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {BRAND_TRENDS.map(b => (
              <button key={b.name} onClick={() => toggleBrand(b.name)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${selectedBrands.includes(b.name) ? 'text-white border-transparent' : 'bg-white text-slate-500 border-slate-200'}`}
                style={selectedBrands.includes(b.name) ? { backgroundColor: b.color } : {}}>
                {b.name}
              </button>
            ))}
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
            {/* Grid */}
            {[0, 1, 2, 3, 4].map(i => {
              const v = minScore + (i / 4) * (maxScore - minScore);
              const y = toY(v, minScore, maxScore);
              return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(v)}</text>
                </g>
              );
            })}
            {/* X labels */}
            {WEEKS.map((w, i) => (
              <text key={w} x={toX(i)} y={chartH - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">{w}</text>
            ))}
            {/* Lines */}
            {BRAND_TRENDS.filter(b => selectedBrands.includes(b.name)).map(brand => {
              const pathD = brand.scores.map((s, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(s, minScore, maxScore)}`).join(' ');
              return (
                <g key={brand.name}>
                  <path d={pathD} fill="none" stroke={brand.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {brand.scores.map((s, i) => (
                    <circle key={i} cx={toX(i)} cy={toY(s, minScore, maxScore)} r="3.5" fill="white" stroke={brand.color} strokeWidth="2" />
                  ))}
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movers & Shakers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-amber-500" />涨跌榜</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOVERS.map(m => (
                <div key={m.name} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-sm font-medium">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">{m.current}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.change > 0 ? 'text-green-600' : m.change < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {m.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : m.change < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {m.change > 0 ? '+' : ''}{m.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="w-5 h-5 text-indigo-600" />品类趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CATEGORY_TRENDS.map(c => (
                <div key={c.name} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.nameZh}</p>
                    <p className="text-xs text-slate-400">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(c.mentions / 420) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{c.mentions}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-semibold w-14 justify-end ${c.change > 0 ? 'text-green-600' : c.change < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {c.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : c.change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {c.change > 0 ? '+' : ''}{c.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Calendar className="w-5 h-5 text-violet-600" />季节性洞察</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {SEASONS.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.name} className={`rounded-xl border p-4 space-y-2 ${s.color.split(' ')[0]} border-transparent`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${s.color.split(' ')[1]}`} />
                    <span className={`text-sm font-bold ${s.color.split(' ')[1]}`}>{s.nameZh}</span>
                  </div>
                  <p className="text-xs text-slate-600">{s.name}</p>
                  <div className="text-xs text-slate-500">
                    <span className="block">时间: {s.months}</span>
                    <span className="block">高峰: {s.peak}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Timeline bar */}
          <div className="mt-6">
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div className="bg-green-200 flex-[3] flex items-center justify-center text-xs font-medium text-green-800">春季</div>
              <div className="bg-yellow-200 flex-[3] flex items-center justify-center text-xs font-medium text-yellow-800">夏季</div>
              <div className="bg-blue-200 flex-[3] flex items-center justify-center text-xs font-medium text-blue-800">开学</div>
              <div className="bg-violet-200 flex-[3] flex items-center justify-center text-xs font-medium text-violet-800">节日</div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400 px-1">
              <span>1月</span><span>3月</span><span>5月</span><span>7月</span><span>9月</span><span>11月</span><span>12月</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-violet-600" />AI 平台对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-medium text-slate-500">品牌</th>
                  {PLATFORM_DATA.map(p => (
                    <th key={p.platform} className="text-center py-3 px-3 font-medium text-slate-500">
                      <span className="flex items-center justify-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.platform] }} />
                        {p.platform}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLATFORM_DATA[0].brands.map(brand => (
                  <tr key={brand.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-800">{brand.name}</td>
                    {PLATFORM_DATA.map(platform => {
                      const b = platform.brands.find(x => x.name === brand.name);
                      const score = b?.score ?? 0;
                      return (
                        <td key={platform.platform} className="py-3 px-3">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: PLATFORM_COLORS[platform.platform] }} />
                            </div>
                            <span className="text-xs font-bold text-slate-600 w-8">{score}</span>
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
    </div>
  );
}
