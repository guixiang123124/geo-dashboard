'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GitCompareArrows,
  Trophy,
  AlertTriangle,
  ExternalLink,
  Lightbulb,
  Star,
  TrendingUp,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Demo Data ───────────────────────────────────────────────
interface Brand {
  name: string;
  visibility: number;
  sentiment: number;
  mentions: number;
  citation: number;
  representation: number;
  recommendation: string;
  recColor: string;
  color: string;
  sources: string[];
}

const BRANDS: Brand[] = [
  { name: 'PatPat', visibility: 72, sentiment: 78, mentions: 156, citation: 65, representation: 70, recommendation: 'Budget Pick', recColor: 'bg-green-100 text-green-700', color: '#8b5cf6', sources: ['patpat.com', 'momjunction.com', 'whattoexpect.com', 'reddit.com/r/parenting'] },
  { name: 'Carter\'s', visibility: 85, sentiment: 82, mentions: 203, citation: 78, representation: 80, recommendation: 'Top Pick', recColor: 'bg-yellow-100 text-yellow-700', color: '#6366f1', sources: ['carters.com', 'parents.com', 'whattoexpect.com', 'goodhousekeeping.com', 'babylist.com'] },
  { name: 'H&M Kids', visibility: 68, sentiment: 65, mentions: 142, citation: 55, representation: 62, recommendation: 'Popular Choice', recColor: 'bg-blue-100 text-blue-700', color: '#0ea5e9', sources: ['hm.com', 'vogue.com', 'refinery29.com', 'buzzfeed.com'] },
  { name: 'Primary', visibility: 55, sentiment: 88, mentions: 89, citation: 72, representation: 85, recommendation: 'Premium Pick', recColor: 'bg-purple-100 text-purple-700', color: '#d946ef', sources: ['primary.com', 'parents.com', 'motherly.com', 'babylist.com', 'theeverymom.com'] },
  { name: 'Hanna Andersson', visibility: 48, sentiment: 90, mentions: 76, citation: 80, representation: 88, recommendation: 'Quality Pick', recColor: 'bg-indigo-100 text-indigo-700', color: '#14b8a6', sources: ['hannaandersson.com', 'parents.com', 'theeverymom.com', 'motherly.com'] },
  { name: 'Tea Collection', visibility: 42, sentiment: 85, mentions: 62, citation: 68, representation: 75, recommendation: 'Niche Favorite', recColor: 'bg-teal-100 text-teal-700', color: '#f59e0b', sources: ['teacollection.com', 'motherly.com', 'babylist.com'] },
  { name: 'Cat & Jack', visibility: 78, sentiment: 70, mentions: 180, citation: 60, representation: 65, recommendation: 'Best Value', recColor: 'bg-emerald-100 text-emerald-700', color: '#ef4444', sources: ['target.com', 'parents.com', 'goodhousekeeping.com', 'buzzfeed.com'] },
  { name: 'Janie & Jack', visibility: 38, sentiment: 86, mentions: 48, citation: 70, representation: 82, recommendation: 'Luxury Pick', recColor: 'bg-rose-100 text-rose-700', color: '#ec4899', sources: ['janieandjack.com', 'vogue.com', 'harpersbazaar.com'] },
  { name: 'Old Navy Kids', visibility: 60, sentiment: 62, mentions: 130, citation: 45, representation: 55, recommendation: 'Budget Alternative', recColor: 'bg-orange-100 text-orange-700', color: '#78716c', sources: ['oldnavy.com', 'buzzfeed.com', 'reddit.com/r/parenting'] },
  { name: 'Zara Kids', visibility: 52, sentiment: 72, mentions: 95, citation: 50, representation: 60, recommendation: 'Trendy Pick', recColor: 'bg-pink-100 text-pink-700', color: '#a855f7', sources: ['zara.com', 'vogue.com', 'refinery29.com', 'whowhatwear.com'] },
];

const ALL_SOURCES = [...new Set(BRANDS.flatMap(b => b.sources))];
const DIMENSIONS = ['visibility', 'sentiment', 'citation', 'representation'] as const;
const DIM_LABEL_KEYS: Record<string, string> = {
  visibility: 'compete.dim.visibility',
  sentiment: 'compete.dim.sentiment',
  citation: 'compete.dim.citation',
  representation: 'compete.dim.representation',
};

const MY_BRAND = 'PatPat';

const ACTION_ITEMS = [
  { priority: 'compete.priority.high', textKey: 'compete.action1', icon: ExternalLink },
  { priority: 'compete.priority.high', textKey: 'compete.action2', icon: TrendingUp },
  { priority: 'compete.priority.medium', textKey: 'compete.action3', icon: Trophy },
  { priority: 'compete.priority.medium', textKey: 'compete.action4', icon: ExternalLink },
  { priority: 'compete.priority.low', textKey: 'compete.action5', icon: AlertTriangle },
];

export default function CompetePage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>(['PatPat', 'Carter\'s', 'H&M Kids', 'Primary']);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedBrands = BRANDS.filter(b => selected.includes(b.name));

  const toggleBrand = (name: string) => {
    if (selected.includes(name)) {
      if (selected.length > 2) setSelected(selected.filter(n => n !== name));
    } else if (selected.length < 4) {
      setSelected([...selected, name]);
    }
  };

  // Radar chart params
  const radarCx = 150, radarCy = 150, radarR = 110;
  const radarAngles = DIMENSIONS.map((_, i) => (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2);

  const getRadarPoint = (value: number, angleIdx: number) => {
    const r = (value / 100) * radarR;
    return { x: radarCx + r * Math.cos(radarAngles[angleIdx]), y: radarCy + r * Math.sin(radarAngles[angleIdx]) };
  };

  // Scatter plot params
  const scatterW = 500, scatterH = 350, scatterPad = 50;

  // Citation gap for my brand
  const myBrand = BRANDS.find(b => b.name === MY_BRAND)!;
  const mySources = new Set(myBrand.sources);
  const gaps = BRANDS.filter(b => b.name !== MY_BRAND).flatMap(b =>
    b.sources.filter(s => !mySources.has(s)).map(s => ({ source: s, competitor: b.name }))
  );
  const uniqueGaps = [...new Map(gaps.map(g => [g.source, g])).values()];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <GitCompareArrows className="w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold">{t('compete.title')}</h1>
        </div>
        <p className="text-indigo-200 text-sm md:text-base">{t('compete.subtitle')}</p>
      </div>

      {/* Brand Selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">{t('compete.selectBrands')}:</span>
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                {selected.join(', ')} <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-56 py-1">
                  {BRANDS.map(b => (
                    <button key={b.name} onClick={() => toggleBrand(b.name)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(b.name) ? 'bg-violet-600 border-violet-600' : 'border-slate-300'}`}>
                        {selected.includes(b.name) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span style={{ color: b.color }} className="font-medium">{b.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('compete.radarTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 300 300" className="w-full max-w-md mx-auto">
              {/* Grid */}
              {[20, 40, 60, 80, 100].map(v => (
                <polygon key={v} points={radarAngles.map((_, i) => { const p = getRadarPoint(v, i); return `${p.x},${p.y}`; }).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {/* Axes */}
              {radarAngles.map((_, i) => { const p = getRadarPoint(100, i); return <line key={i} x1={radarCx} y1={radarCy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />; })}
              {/* Labels */}
              {DIMENSIONS.map((d, i) => {
                const p = getRadarPoint(115, i);
                return <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#64748b" fontWeight="600">{t(DIM_LABEL_KEYS[d])}</text>;
              })}
              {/* Brand polygons */}
              {selectedBrands.map(brand => {
                const points = DIMENSIONS.map((d, i) => {
                  const p = getRadarPoint(brand[d], i);
                  return `${p.x},${p.y}`;
                }).join(' ');
                return (
                  <g key={brand.name}>
                    <polygon points={points} fill={brand.color} fillOpacity="0.15" stroke={brand.color} strokeWidth="2" />
                    {DIMENSIONS.map((d, i) => {
                      const p = getRadarPoint(brand[d], i);
                      return <circle key={i} cx={p.x} cy={p.y} r="3" fill={brand.color} />;
                    })}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {selectedBrands.map(b => (
                <div key={b.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="font-medium">{b.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitive Landscape Scatter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('compete.landscapeTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full">
              {/* Axes */}
              <line x1={scatterPad} y1={scatterH - scatterPad} x2={scatterW - 20} y2={scatterH - scatterPad} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={scatterPad} y1={20} x2={scatterPad} y2={scatterH - scatterPad} stroke="#cbd5e1" strokeWidth="1" />
              <text x={scatterW / 2} y={scatterH - 10} textAnchor="middle" fontSize="11" fill="#64748b">{t('compete.xAxis.visibility')}</text>
              <text x={15} y={scatterH / 2} textAnchor="middle" fontSize="11" fill="#64748b" transform={`rotate(-90, 15, ${scatterH / 2})`}>{t('compete.yAxis.sentiment')}</text>
              {/* Grid lines */}
              {[25, 50, 75].map(v => {
                const x = scatterPad + ((v) / 100) * (scatterW - scatterPad - 20);
                const y = scatterH - scatterPad - ((v) / 100) * (scatterH - scatterPad - 20);
                return (
                  <g key={v}>
                    <line x1={x} y1={20} x2={x} y2={scatterH - scatterPad} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={scatterPad} y1={y} x2={scatterW - 20} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  </g>
                );
              })}
              {/* Bubbles */}
              {BRANDS.map(b => {
                const x = scatterPad + (b.visibility / 100) * (scatterW - scatterPad - 20);
                const y = scatterH - scatterPad - (b.sentiment / 100) * (scatterH - scatterPad - 20);
                const r = Math.max(8, Math.sqrt(b.mentions) * 1.8);
                return (
                  <g key={b.name}>
                    <circle cx={x} cy={y} r={r} fill={b.color} fillOpacity="0.6" stroke={b.color} strokeWidth="1.5" />
                    <text x={x} y={y - r - 4} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">{b.name}</text>
                  </g>
                );
              })}
            </svg>
            <p className="text-xs text-slate-400 text-center mt-2">{t('compete.bubbleSize')}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Star className="w-5 h-5 text-yellow-500" />{t('compete.aiRecType')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {BRANDS.map(b => (
              <div key={b.name} className="border border-slate-200 rounded-xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: b.color + '20' }}>
                  <Trophy className="w-5 h-5" style={{ color: b.color }} />
                </div>
                <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${b.recColor}`}>{b.recommendation}</span>
                <div className="text-xs text-slate-400">{t('compete.composite')} {Math.round((b.visibility + b.sentiment + b.citation + b.representation) / 4)}{t('compete.score')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Citation Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-5 h-5 text-amber-500" />{t('compete.citationGap')} — {MY_BRAND}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">{t('compete.citationGapDesc')} {MY_BRAND} {t('compete.notCited')}:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uniqueGaps.map(g => (
              <div key={g.source} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">{g.source}</span>
                </div>
                <span className="text-xs text-amber-600">{t('compete.citedBy')} {g.competitor}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="w-5 h-5 text-violet-600" />{t('compete.actionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ACTION_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const priority = t(item.priority);
              return (
                <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Icon className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{t(item.textKey)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priority === t('compete.priority.high') ? 'bg-red-100 text-red-700' : priority === t('compete.priority.medium') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{priority}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
