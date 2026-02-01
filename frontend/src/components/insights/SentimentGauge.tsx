'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Heart, ThumbsUp, ThumbsDown, Minus, Sparkles } from 'lucide-react';

interface SentimentData {
  brand: string;
  total_mentions: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sentiment_percentages: {
    positive: number;
    negative: number;
    neutral: number;
  };
  average_confidence: number;
  sentiment_score: number;
  by_model: {
    model: string;
    positive: number;
    negative: number;
    neutral: number;
  }[];
}

interface SentimentGaugeProps {
  data: SentimentData | null;
  loading?: boolean;
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

export default function SentimentGauge({ data, loading }: SentimentGaugeProps) {
  const pieData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Positive', value: data.sentiment_distribution.positive, color: SENTIMENT_COLORS.positive },
      { name: 'Neutral', value: data.sentiment_distribution.neutral, color: SENTIMENT_COLORS.neutral },
      { name: 'Negative', value: data.sentiment_distribution.negative, color: SENTIMENT_COLORS.negative },
    ].filter(d => d.value > 0);
  }, [data]);

  const sentimentLevel = useMemo(() => {
    if (!data) return { level: 'neutral', label: 'No Data', color: 'slate' };
    const score = data.sentiment_score;
    if (score >= 30) return { level: 'excellent', label: 'Excellent', color: 'emerald' };
    if (score >= 10) return { level: 'good', label: 'Good', color: 'green' };
    if (score >= -10) return { level: 'neutral', label: 'Neutral', color: 'slate' };
    if (score >= -30) return { level: 'concerning', label: 'Concerning', color: 'amber' };
    return { level: 'poor', label: 'Poor', color: 'red' };
  }, [data]);

  const customTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const item = payload[0].payload;

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-semibold text-slate-900">{item.name}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          {item.value} mentions ({data ? (item.value / data.total_mentions * 100).toFixed(1) : 0}%)
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-48 bg-slate-100 rounded-full mx-auto w-48" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Sentiment Analysis</h3>
            <p className="text-sm text-slate-500">Select a brand to view sentiment</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Sparkles className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">Click on a brand to see sentiment breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Sentiment Analysis</h3>
              <p className="text-sm text-slate-500">{data.brand}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${sentimentLevel.color}-100 text-${sentimentLevel.color}-700`}
               style={{
                 backgroundColor: sentimentLevel.color === 'emerald' ? '#d1fae5' :
                                  sentimentLevel.color === 'green' ? '#dcfce7' :
                                  sentimentLevel.color === 'amber' ? '#fef3c7' :
                                  sentimentLevel.color === 'red' ? '#fee2e2' : '#f1f5f9',
                 color: sentimentLevel.color === 'emerald' ? '#047857' :
                        sentimentLevel.color === 'green' ? '#15803d' :
                        sentimentLevel.color === 'amber' ? '#b45309' :
                        sentimentLevel.color === 'red' ? '#b91c1c' : '#475569',
               }}
          >
            {sentimentLevel.label}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main gauge */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className={`text-3xl font-bold ${data.sentiment_score >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {data.sentiment_score > 0 ? '+' : ''}{data.sentiment_score}
              </p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-700">{data.sentiment_percentages.positive}%</p>
            <p className="text-xs text-emerald-600">{data.sentiment_distribution.positive} positive</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Minus className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xl font-bold text-slate-700">{data.sentiment_percentages.neutral}%</p>
            <p className="text-xs text-slate-500">{data.sentiment_distribution.neutral} neutral</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsDown className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl font-bold text-red-600">{data.sentiment_percentages.negative}%</p>
            <p className="text-xs text-red-500">{data.sentiment_distribution.negative} negative</p>
          </div>
        </div>

        {/* By model breakdown */}
        {data.by_model.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">By Source</h4>
            <div className="space-y-2">
              {data.by_model.slice(0, 4).map((model) => {
                const total = model.positive + model.neutral + model.negative;
                const posWidth = total > 0 ? (model.positive / total) * 100 : 0;
                const neuWidth = total > 0 ? (model.neutral / total) * 100 : 0;
                const negWidth = total > 0 ? (model.negative / total) * 100 : 0;

                return (
                  <div key={model.model} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-28 truncate">{model.model}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${posWidth}%` }}
                      />
                      <div
                        className="h-full bg-slate-400"
                        style={{ width: `${neuWidth}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${negWidth}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Confidence */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500">Average Confidence</span>
          <span className="font-medium text-slate-700">{(data.average_confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
