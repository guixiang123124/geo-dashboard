'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { ModelComparisonData } from '@/lib/types';

interface ModelComparisonChartProps {
    data: ModelComparisonData[];
    height?: number;
    onModelClick?: (model: string) => void;
}

const MODEL_COLORS = {
    'ChatGPT': '#10b981',    // green
    'Gemini': '#3b82f6',     // blue
    'Claude': '#f59e0b',     // amber
    'Perplexity': '#8b5cf6', // purple
};

export default function ModelComparisonChart({ data, height = 400, onModelClick }: ModelComparisonChartProps) {
    const customTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload[0]) return null;

        const item = payload[0].payload;

        return (
            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[180px]">
                <p className="font-semibold text-sm text-slate-900 mb-2">{item.model}</p>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Score:</span>
                        <span className="font-semibold text-slate-900">{item.score}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Mentions:</span>
                        <span className="font-semibold text-slate-900">{item.mentionCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Citation Rate:</span>
                        <span className="font-semibold text-slate-900">{item.citationRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Avg Rank:</span>
                        <span className="font-semibold text-slate-900">#{item.avgRank}</span>
                    </div>
                </div>
            </div>
        );
    };

    const handleBarClick = (entry: any) => {
        if (onModelClick) {
            onModelClick(entry.model);
        }
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="model"
                    stroke="#6b7280"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                />
                <YAxis
                    domain={[0, 100]}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                />
                <Tooltip content={customTooltip} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar
                    dataKey="composite"
                    onClick={handleBarClick}
                    cursor={onModelClick ? 'pointer' : 'default'}
                    radius={[8, 8, 0, 0]}
                    label={{
                        position: 'top',
                        style: { fontSize: '12px', fontWeight: 600 },
                    }}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={MODEL_COLORS[entry.model as keyof typeof MODEL_COLORS] || '#94a3b8'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
