'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GitCompareArrows,
  Trophy,
  AlertTriangle,
  Lightbulb,
  Star,
  TrendingUp,
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrands, type BrandWithScore } from '@/hooks/useBrands';

const DIMENSIONS = ['visibility', 'citation', 'representation', 'intent'] as const;
const DIM_LABELS: Record<string, string> = {
  visibility: 'Visibility',
  citation: 'Citation',
  representation: 'Framing',
  intent: 'Intent',
};

const COLORS = ['#8b5cf6', '#6366f1', '#0ea5e9', '#d946ef', '#14b8a6', '#f59e0b', '#ef4444', '#ec4899', '#78716c', '#a855f7'];

function getDimScore(brand: BrandWithScore, dim: string): number {
  const s = brand.score;
  if (!s) return 0;
  switch (dim) {
    case 'visibility': return s.visibility_score;
    case 'citation': return s.citation_score;
    case 'representation': return s.representation_score;
    case 'intent': return s.intent_score;
    default: return 0;
  }
}

export default function CompetePage() {
  const { t } = useLanguage();
  const { brands, loading } = useBrands();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auto-select top 4 brands once loaded
  const sortedBrands = useMemo(() => {
    return [...brands]
      .filter(b => b.score)
      .sort((a, b) => (b.score?.composite_score ?? 0) - (a.score?.composite_score ?? 0));
  }, [brands]);

  const effectiveSelectedIds = useMemo(() => {
    if (selectedIds.length > 0) return selectedIds;
    return sortedBrands.slice(0, 4).map(b => b.id);
  }, [selectedIds, sortedBrands]);

  const selectedBrands = useMemo(() => {
    return sortedBrands.filter(b => effectiveSelectedIds.includes(b.id));
  }, [sortedBrands, effectiveSelectedIds]);

  const brandColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    sortedBrands.forEach((b, i) => { map[b.id] = COLORS[i % COLORS.length]; });
    return map;
  }, [sortedBrands]);

  const toggleBrand = (id: string) => {
    const current = effectiveSelectedIds;
    if (current.includes(id)) {
      if (current.length > 2) {
        setSelectedIds(current.filter(x => x !== id));
      }
    } else if (current.length < 4) {
      setSelectedIds([...current, id]);
    }
  };

  // Radar chart params
  const radarCx = 150, radarCy = 150, radarR = 110;
  const radarAngles = DIMENSIONS.map((_, i) => (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2);

  const getRadarPoint = (value: number, angleIdx: number) => {
    const maxVal = 100;
    const r = (value / maxVal) * radarR;
    return { x: radarCx + r * Math.cos(radarAngles[angleIdx]), y: radarCy + r * Math.sin(radarAngles[angleIdx]) };
  };

  // Scatter plot params
  const scatterW = 500, scatterH = 350, scatterPad = 50;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto" />
          <p className="text-lg font-semibold text-slate-900">Loading competitive data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <GitCompareArrows className="w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold">{t('compete.title')}</h1>
        </div>
        <p className="text-indigo-200 text-sm md:text-base">{t('compete.subtitle')}</p>
        <p className="text-indigo-300 text-xs mt-2">{sortedBrands.length} brands with real evaluation data</p>
      </div>

      {/* Brand Selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">{t('compete.selectBrands')}:</span>
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                {selectedBrands.map(b => b.name).join(', ')} <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-64 py-1 max-h-72 overflow-y-auto">
                  {sortedBrands.map(b => (
                    <button key={b.id} onClick={() => toggleBrand(b.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${effectiveSelectedIds.includes(b.id) ? 'bg-violet-600 border-violet-600' : 'border-slate-300'}`}>
                        {effectiveSelectedIds.includes(b.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span style={{ color: brandColorMap[b.id] }} className="font-medium">{b.name}</span>
                      <span className="ml-auto text-xs text-slate-400">{b.score?.composite_score ?? 0}</span>
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
              {[20, 40, 60, 80, 100].map(v => (
                <polygon key={v} points={radarAngles.map((_, i) => { const p = getRadarPoint(v, i); return `${p.x},${p.y}`; }).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {radarAngles.map((_, i) => { const p = getRadarPoint(100, i); return <line key={i} x1={radarCx} y1={radarCy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />; })}
              {DIMENSIONS.map((d, i) => {
                const p = getRadarPoint(115, i);
                return <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#64748b" fontWeight="600">{DIM_LABELS[d]}</text>;
              })}
              {selectedBrands.map(brand => {
                const color = brandColorMap[brand.id];
                const points = DIMENSIONS.map((d, i) => {
                  const p = getRadarPoint(getDimScore(brand, d), i);
                  return `${p.x},${p.y}`;
                }).join(' ');
                return (
                  <g key={brand.id}>
                    <polygon points={points} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
                    {DIMENSIONS.map((d, i) => {
                      const p = getRadarPoint(getDimScore(brand, d), i);
                      return <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />;
                    })}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {selectedBrands.map(b => (
                <div key={b.id} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorMap[b.id] }} />
                  <span className="font-medium">{b.name}</span>
                  <span className="text-slate-400">({b.score?.composite_score ?? 0})</span>
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
              <line x1={scatterPad} y1={scatterH - scatterPad} x2={scatterW - 20} y2={scatterH - scatterPad} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={scatterPad} y1={20} x2={scatterPad} y2={scatterH - scatterPad} stroke="#cbd5e1" strokeWidth="1" />
              <text x={scatterW / 2} y={scatterH - 10} textAnchor="middle" fontSize="11" fill="#64748b">Visibility Score</text>
              <text x={15} y={scatterH / 2} textAnchor="middle" fontSize="11" fill="#64748b" transform={`rotate(-90, 15, ${scatterH / 2})`}>Composite Score</text>
              {[25, 50, 75].map(v => {
                const x = scatterPad + (v / 100) * (scatterW - scatterPad - 20);
                const y = scatterH - scatterPad - (v / 100) * (scatterH - scatterPad - 20);
                return (
                  <g key={v}>
                    <line x1={x} y1={20} x2={x} y2={scatterH - scatterPad} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={scatterPad} y1={y} x2={scatterW - 20} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  </g>
                );
              })}
              {sortedBrands.map(b => {
                const vis = b.score?.visibility_score ?? 0;
                const comp = b.score?.composite_score ?? 0;
                const mentions = b.score?.total_mentions ?? 1;
                const x = scatterPad + (vis / 100) * (scatterW - scatterPad - 20);
                const y = scatterH - scatterPad - (comp / 100) * (scatterH - scatterPad - 20);
                const r = Math.max(6, Math.sqrt(mentions) * 1.5);
                const color = brandColorMap[b.id];
                return (
                  <g key={b.id}>
                    <circle cx={x} cy={y} r={r} fill={color} fillOpacity="0.6" stroke={color} strokeWidth="1.5" />
                    <text x={x} y={y - r - 4} textAnchor="middle" fontSize="8" fill="#374151" fontWeight="600">{b.name}</text>
                  </g>
                );
              })}
            </svg>
            <p className="text-xs text-slate-400 text-center mt-2">Bubble size = total mentions</p>
          </CardContent>
        </Card>
      </div>

      {/* Head-to-Head Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Trophy className="w-5 h-5 text-yellow-500" />Head-to-Head Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-600 font-medium">Brand</th>
                  <th className="text-center py-3 px-2 text-slate-600 font-medium">Composite</th>
                  <th className="text-center py-3 px-2 text-slate-600 font-medium">Visibility</th>
                  <th className="text-center py-3 px-2 text-slate-600 font-medium">Citation</th>
                  <th className="text-center py-3 px-2 text-slate-600 font-medium">Framing</th>
                  <th className="text-center py-3 px-2 text-slate-600 font-medium">Intent</th>
                  <th className="text-center py-3 px-2 text-slate-600 font-medium">Mentions</th>
                </tr>
              </thead>
              <tbody>
                {selectedBrands.map((brand, i) => {
                  const s = brand.score;
                  return (
                    <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorMap[brand.id] }} />
                          <span className="font-semibold text-slate-900">{brand.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 font-bold text-slate-900">{s?.composite_score ?? 0}</td>
                      <td className="text-center py-3 px-2 text-blue-700">{s?.visibility_score ?? 0}</td>
                      <td className="text-center py-3 px-2 text-green-700">{s?.citation_score ?? 0}</td>
                      <td className="text-center py-3 px-2 text-amber-700">{s?.representation_score ?? 0}</td>
                      <td className="text-center py-3 px-2 text-purple-700">{s?.intent_score ?? 0}</td>
                      <td className="text-center py-3 px-2 text-slate-600">{s?.total_mentions ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Brands Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Star className="w-5 h-5 text-yellow-500" />Full Industry Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sortedBrands.slice(0, 10).map((b, i) => (
              <div key={b.id} className="border border-slate-200 rounded-xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-slate-400">#{i + 1}</div>
                <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                <div className="text-2xl font-bold text-violet-600">{b.score?.composite_score ?? 0}</div>
                <div className="text-xs text-slate-400">{b.score?.total_mentions ?? 0} mentions</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
