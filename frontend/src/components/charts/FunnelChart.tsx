'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { FunnelData } from '@/lib/types';

interface FunnelChartProps {
    data: FunnelData[];
    height?: number;
    onStageClick?: (stage: string) => void;
}

const STAGE_COLORS = {
    'Recall': '#6366f1',       // indigo
    'Visibility': '#3b82f6',   // blue
    'Citation': '#10b981',     // green
    'Conversion': '#8b5cf6',   // purple
};

export default function FunnelChart({ data, height = 400, onStageClick }: FunnelChartProps) {
    const customTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload[0]) return null;

        const item = payload[0].payload;

        return (
            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-sm text-slate-900">{item.stage}</p>
                <p className="text-xs text-slate-600">{item.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{item.value}%</p>
            </div>
        );
    };

    const handleBarClick = (entry: any) => {
        if (onStageClick) {
            onStageClick(entry.stage);
        }
    };

    return (
        <div className="space-y-4">
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                        type="category"
                        dataKey="stage"
                        width={90}
                        style={{ fontSize: '13px', fontWeight: 600, fill: '#374151' }}
                    />
                    <Tooltip content={customTooltip} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                    <Bar
                        dataKey="value"
                        onClick={handleBarClick}
                        cursor={onStageClick ? 'pointer' : 'default'}
                        radius={[0, 8, 8, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={STAGE_COLORS[entry.stage as keyof typeof STAGE_COLORS] || '#94a3b8'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Drop-off rates */}
            <div className="flex flex-col gap-2 px-4">
                {data.map((stage, index) => {
                    if (index === 0) return null;
                    const prevStage = data[index - 1];
                    const dropOff = prevStage.value - stage.value;
                    const dropOffPercent = ((dropOff / prevStage.value) * 100).toFixed(1);

                    return (
                        <div key={stage.stage} className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="flex-shrink-0 w-2 h-2 bg-slate-400 rounded-full" />
                            <span>
                                <span className="font-semibold text-red-600">{dropOffPercent}%</span> drop-off
                                from {prevStage.stage} to {stage.stage}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
