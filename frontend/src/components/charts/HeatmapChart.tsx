'use client';

import React from 'react';

interface HeatmapData {
    brand: string;
    model: string;
    score: number;
}

interface HeatmapChartProps {
    data: HeatmapData[];
    brands: string[];
    models: string[];
    onCellClick?: (brand: string, model: string) => void;
}

export default function HeatmapChart({ data, brands, models, onCellClick }: HeatmapChartProps) {
    // Get color based on score (0-100)
    const getColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 70) return 'bg-green-400';
        if (score >= 60) return 'bg-yellow-400';
        if (score >= 50) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-400';
        if (score >= 30) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getTextColor = (score: number) => {
        return score >= 50 ? 'text-white' : 'text-slate-900';
    };

    // Find score for specific brand-model combination
    const getScore = (brand: string, model: string): number => {
        const item = data.find(d => d.brand === brand && d.model === model);
        return item?.score || 0;
    };

    const handleCellClick = (brand: string, model: string) => {
        if (onCellClick) {
            onCellClick(brand, model);
        }
    };

    return (
        <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 bg-slate-50 border-b border-r border-slate-200">
                                Brand / Model
                            </th>
                            {models.map(model => (
                                <th
                                    key={model}
                                    className="px-4 py-3 text-center text-xs font-semibold text-slate-700 bg-slate-50 border-b border-slate-200"
                                >
                                    {model}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((brand, brandIndex) => (
                            <tr key={brand}>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 bg-slate-50 border-r border-b border-slate-200 whitespace-nowrap">
                                    {brand}
                                </td>
                                {models.map((model, modelIndex) => {
                                    const score = getScore(brand, model);
                                    return (
                                        <td
                                            key={`${brand}-${model}`}
                                            className={`
                                                px-4 py-3 text-center text-sm font-semibold border-b border-slate-200
                                                ${getColor(score)} ${getTextColor(score)}
                                                ${onCellClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                                            `}
                                            onClick={() => handleCellClick(brand, model)}
                                            title={`${brand} - ${model}: ${score}`}
                                        >
                                            {score}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                <span className="text-xs font-semibold text-slate-600">Score Range:</span>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-red-500 rounded" />
                    <span className="text-xs text-slate-600">0-40</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-orange-500 rounded" />
                    <span className="text-xs text-slate-600">40-50</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-yellow-500 rounded" />
                    <span className="text-xs text-slate-600">50-60</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-yellow-400 rounded" />
                    <span className="text-xs text-slate-600">60-70</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-green-400 rounded" />
                    <span className="text-xs text-slate-600">70-80</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-green-500 rounded" />
                    <span className="text-xs text-slate-600">80-100</span>
                </div>
            </div>
        </div>
    );
}
