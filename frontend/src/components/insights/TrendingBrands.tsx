'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Sparkles } from 'lucide-react';

interface TrendingBrand {
  brand: string;
  category: string;
  mention_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_percentage: number;
  sentiment_score: number;
  model_coverage: number;
}

interface TrendingBrandsProps {
  data: TrendingBrand[];
  onBrandSelect?: (brand: string) => void;
  selectedBrand?: string | null;
}

const COLORS = [
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
  '#3b82f6', // blue-500
  '#0ea5e9', // sky-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#10b981', // emerald-500
  '#22c55e', // green-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
];

export default function TrendingBrands({
  data,
  onBrandSelect,
  selectedBrand,
}: TrendingBrandsProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
      shortName: item.brand.length > 12 ? item.brand.slice(0, 10) + '...' : item.brand,
    }));
  }, [data]);

  const customTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const item = payload[0].payload;

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-slate-900">{item.brand}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Category</span>
            <span className="font-medium text-slate-700">{item.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Mentions</span>
            <span className="font-bold text-slate-900">{item.mention_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Positive</span>
            <span className="font-medium text-emerald-600">{item.positive_percentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sentiment Score</span>
            <span className={`font-medium ${item.sentiment_score >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {item.sentiment_score > 0 ? '+' : ''}{item.sentiment_score}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Model Coverage</span>
            <span className="font-medium text-slate-700">{item.model_coverage} LLMs</span>
          </div>
        </div>
      </div>
    );
  };

  const handleClick = (data: any) => {
    if (onBrandSelect && data?.brand) {
      onBrandSelect(data.brand);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Trending Brands</h3>
            <p className="text-sm text-slate-500">Top brands by mention frequency</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              dataKey="shortName"
              type="category"
              tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={75}
            />
            <Tooltip content={customTooltip} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
            <Bar
              dataKey="mention_count"
              radius={[0, 6, 6, 0]}
              onClick={handleClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.brand === selectedBrand ? '#4f46e5' : entry.color}
                  opacity={selectedBrand && entry.brand !== selectedBrand ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Brand list below chart */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {chartData.slice(0, 5).map((item) => (
            <button
              key={item.brand}
              onClick={() => onBrandSelect?.(item.brand)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedBrand === item.brand
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {item.brand}
              <span className={`${selectedBrand === item.brand ? 'text-violet-200' : 'text-slate-400'}`}>
                {item.mention_count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
