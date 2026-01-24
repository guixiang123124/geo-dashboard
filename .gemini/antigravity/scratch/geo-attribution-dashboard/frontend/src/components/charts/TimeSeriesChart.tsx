'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { TimeSeriesDataPoint } from '@/lib/types';

interface TimeSeriesChartProps {
    data: TimeSeriesDataPoint[];
    showDimensions?: {
        composite?: boolean;
        visibility?: boolean;
        citation?: boolean;
        representation?: boolean;
        intent?: boolean;
    };
    height?: number;
}

const COLORS = {
    composite: '#6366f1',     // indigo
    visibility: '#3b82f6',    // blue
    citation: '#10b981',      // green
    representation: '#f59e0b', // amber
    intent: '#8b5cf6',        // purple
};

export default function TimeSeriesChart({
    data,
    showDimensions = {
        composite: true,
        visibility: true,
        citation: true,
        representation: true,
        intent: true,
    },
    height = 400
}: TimeSeriesChartProps) {
    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'MMM dd');
        } catch {
            return dateStr;
        }
    };

    const customTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload) return null;

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-sm text-gray-900 mb-2">
                    {format(new Date(label), 'MMM dd, yyyy')}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600 capitalize">{entry.name}:</span>
                        <span className="font-semibold text-gray-900">{Math.round(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    domain={[0, 100]}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip content={customTooltip} />
                <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="circle"
                />

                {showDimensions.composite && (
                    <Line
                        type="monotone"
                        dataKey="composite"
                        stroke={COLORS.composite}
                        strokeWidth={3}
                        dot={{ fill: COLORS.composite, r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Composite"
                    />
                )}
                {showDimensions.visibility && (
                    <Line
                        type="monotone"
                        dataKey="visibility"
                        stroke={COLORS.visibility}
                        strokeWidth={2}
                        dot={{ fill: COLORS.visibility, r: 2 }}
                        activeDot={{ r: 4 }}
                        name="Visibility"
                    />
                )}
                {showDimensions.citation && (
                    <Line
                        type="monotone"
                        dataKey="citation"
                        stroke={COLORS.citation}
                        strokeWidth={2}
                        dot={{ fill: COLORS.citation, r: 2 }}
                        activeDot={{ r: 4 }}
                        name="Citation"
                    />
                )}
                {showDimensions.representation && (
                    <Line
                        type="monotone"
                        dataKey="representation"
                        stroke={COLORS.representation}
                        strokeWidth={2}
                        dot={{ fill: COLORS.representation, r: 2 }}
                        activeDot={{ r: 4 }}
                        name="Representation"
                    />
                )}
                {showDimensions.intent && (
                    <Line
                        type="monotone"
                        dataKey="intent"
                        stroke={COLORS.intent}
                        strokeWidth={2}
                        dot={{ fill: COLORS.intent, r: 2 }}
                        activeDot={{ r: 4 }}
                        name="Intent"
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
}
