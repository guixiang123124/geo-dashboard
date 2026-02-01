'use client';

import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Bot, Zap } from 'lucide-react';

interface LLMModel {
  model: string;
  total_mentions: number;
  unique_brands: number;
  positive_rate: number;
  negative_rate: number;
  neutral_rate: number;
  top_brands: [string, number][];
}

interface LLMComparisonProps {
  data: LLMModel[];
  selectedBrand?: string | null;
}

const MODEL_COLORS: Record<string, string> = {
  'GPT-4': '#10b981',
  'GPT-4o': '#059669',
  'Claude-3-Opus': '#8b5cf6',
  'Claude-3.5-Sonnet': '#7c3aed',
  'Gemini-Pro': '#3b82f6',
  'Gemini-1.5-Pro': '#2563eb',
  'Llama-3-70B': '#f59e0b',
  'Mistral-Large': '#ef4444',
  'Command-R+': '#ec4899',
  'Reviews': '#6b7280',
};

export default function LLMComparison({ data, selectedBrand }: LLMComparisonProps) {
  // Radar chart data - normalized metrics
  const radarData = useMemo(() => {
    const maxMentions = Math.max(...data.map(d => d.total_mentions));
    const maxBrands = Math.max(...data.map(d => d.unique_brands));

    return [
      {
        metric: 'Mentions',
        ...Object.fromEntries(
          data.map(d => [d.model, Math.round((d.total_mentions / maxMentions) * 100)])
        ),
      },
      {
        metric: 'Brand Diversity',
        ...Object.fromEntries(
          data.map(d => [d.model, Math.round((d.unique_brands / maxBrands) * 100)])
        ),
      },
      {
        metric: 'Positive Rate',
        ...Object.fromEntries(data.map(d => [d.model, Math.round(d.positive_rate)])),
      },
      {
        metric: 'Neutral Rate',
        ...Object.fromEntries(data.map(d => [d.model, Math.round(d.neutral_rate)])),
      },
    ];
  }, [data]);

  // Sentiment stacked bar data
  const sentimentData = useMemo(() => {
    return data
      .filter(d => d.model !== 'Reviews')
      .map(d => ({
        model: d.model.replace('-', '\n').slice(0, 15),
        fullModel: d.model,
        positive: d.positive_rate,
        neutral: d.neutral_rate,
        negative: d.negative_rate,
        total: d.total_mentions,
      }));
  }, [data]);

  const customTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const item = payload[0].payload;

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[180px]">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-violet-500" />
          <span className="font-bold text-slate-900 text-sm">{item.fullModel || item.model}</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-emerald-600">Positive</span>
            <span className="font-medium">{item.positive?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Neutral</span>
            <span className="font-medium">{item.neutral?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500">Negative</span>
            <span className="font-medium">{item.negative?.toFixed(1)}%</span>
          </div>
          {item.total && (
            <div className="flex justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-400">Total</span>
              <span className="font-bold text-slate-700">{item.total} mentions</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const topModels = data.filter(d => d.model !== 'Reviews').slice(0, 4);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">LLM Model Comparison</h3>
            <p className="text-sm text-slate-500">
              How different AI models mention brands
              {selectedBrand && <span className="text-violet-600 font-medium"> for {selectedBrand}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Top models stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {topModels.map((model) => (
            <div
              key={model.model}
              className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: MODEL_COLORS[model.model] || '#6b7280' }}
                />
                <span className="text-xs font-medium text-slate-600 truncate">
                  {model.model}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{model.total_mentions}</p>
              <p className="text-xs text-slate-500">
                {model.unique_brands} brands • {model.positive_rate.toFixed(0)}% positive
              </p>
            </div>
          ))}
        </div>

        {/* Sentiment Distribution Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-4">Sentiment Distribution by Model</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={sentimentData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="fullModel"
                type="category"
                tick={{ fontSize: 11, fill: '#374151' }}
                width={95}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-slate-600">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-400" />
            <span className="text-xs text-slate-600">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-slate-600">Negative</span>
          </div>
        </div>
      </div>
    </div>
  );
}
