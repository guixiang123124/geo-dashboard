'use client';

import React from 'react';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { GEOScore } from '@/lib/types';

interface RadarChartProps {
    brands: Array<{
        name: string;
        score: GEOScore;
        color: string;
    }>;
    height?: number;
}

export default function RadarChart({ brands, height = 400 }: RadarChartProps) {
    // Transform data for radar chart format
    const data = [
        {
            dimension: 'Visibility',
            ...brands.reduce((acc, brand) => ({
                ...acc,
                [brand.name]: brand.score.visibility_score
            }), {})
        },
        {
            dimension: 'Citation',
            ...brands.reduce((acc, brand) => ({
                ...acc,
                [brand.name]: brand.score.citation_score
            }), {})
        },
        {
            dimension: 'Representation',
            ...brands.reduce((acc, brand) => ({
                ...acc,
                [brand.name]: brand.score.representation_score
            }), {})
        },
        {
            dimension: 'Intent',
            ...brands.reduce((acc, brand) => ({
                ...acc,
                [brand.name]: brand.score.intent_score
            }), {})
        },
    ];

    const customTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload[0]) return null;

        return (
            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-sm text-slate-900 mb-2">
                    {payload[0].payload.dimension}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600">{entry.name}:</span>
                        <span className="font-semibold text-slate-900">{Math.round(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsRadar data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                    dataKey="dimension"
                    style={{ fontSize: '12px', fill: '#6b7280' }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    style={{ fontSize: '10px', fill: '#6b7280' }}
                />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />

                {brands.map((brand, index) => (
                    <Radar
                        key={brand.name}
                        name={brand.name}
                        dataKey={brand.name}
                        stroke={brand.color}
                        fill={brand.color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                    />
                ))}
            </RechartsRadar>
        </ResponsiveContainer>
    );
}
