'use client';

import React, { useMemo } from 'react';
import { TimeSeriesChart, RadarChart, FunnelChart, ModelComparisonChart, HeatmapChart } from '@/components/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/ui/export-button';
import { FilterBar } from '@/components/ui/filter-bar';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { BrandSelector } from '@/components/filters/BrandSelector';
import { ModelSelector } from '@/components/filters/ModelSelector';
import { DimensionSelector } from '@/components/filters/DimensionSelector';
import { BRANDS, getHistoricalScoresById, getModelBreakdownById, getFunnelDataById, MODEL_BREAKDOWN } from '@/lib/data';
import { exportToCSV, exportToPNG, formatChartDataForCSV } from '@/lib/export';
import { useFilters } from '@/hooks/useFilters';

export default function AnalyticsPage() {
    const { filters, updateFilter, resetFilters } = useFilters({
        brands: BRANDS.map(b => b.id),
    });
    // Prepare data for charts
    const brand1 = BRANDS[0];
    const brand2 = BRANDS[1];
    const brand3 = BRANDS[2];

    const historicalData = getHistoricalScoresById(brand1.id);
    const modelBreakdown = getModelBreakdownById(brand1.id);
    const funnelData = getFunnelDataById(brand1.id);

    // Radar chart data - using GEOScore compatible structure
    const radarData = [
        {
            name: brand1.name,
            score: {
                composite_score: 78,
                visibility_score: 85,
                citation_score: 60,
                representation_score: 75,
                intent_score: 90,
            },
            color: '#3b82f6'
        },
        {
            name: brand2.name,
            score: {
                composite_score: 65,
                visibility_score: 40,
                citation_score: 85,
                representation_score: 90,
                intent_score: 50,
            },
            color: '#10b981'
        },
        {
            name: brand3.name,
            score: {
                composite_score: 82,
                visibility_score: 80,
                citation_score: 90,
                representation_score: 85,
                intent_score: 70,
            },
            color: '#f59e0b'
        }
    ];

    // Heatmap data
    const heatmapData = BRANDS.flatMap(brand => {
        const breakdown = MODEL_BREAKDOWN[brand.id];
        return breakdown.map(item => ({
            brand: brand.name,
            model: item.model,
            score: item.composite
        }));
    });

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Filters */}
                <FilterBar onClearAll={resetFilters}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DateRangePicker
                            value={filters.dateRange}
                            onChange={(range) => updateFilter('dateRange', range)}
                        />
                        <BrandSelector
                            brands={BRANDS}
                            selected={filters.brands}
                            onChange={(brands) => updateFilter('brands', brands)}
                        />
                        <ModelSelector
                            models={['ChatGPT', 'Gemini', 'Claude', 'Perplexity']}
                            selected={filters.models}
                            onChange={(models) => updateFilter('models', models)}
                        />
                        <DimensionSelector
                            selected={filters.dimensions}
                            onChange={(dimensions) => updateFilter('dimensions', dimensions)}
                        />
                    </div>
                </FilterBar>

                {/* Time Series Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Historical Performance - {brand1.name}</CardTitle>
                            <ExportButton
                                onExportCSV={async () => {
                                    await exportToCSV(
                                        formatChartDataForCSV(historicalData as unknown as Record<string, unknown>[], 'timeseries'),
                                        `historical-performance-${brand1.name.toLowerCase().replace(/\s+/g, '-')}`
                                    );
                                }}
                                onExportPNG={async () => {
                                    const el = document.getElementById('time-series-chart');
                                    if (el) await exportToPNG(el, `historical-performance-${brand1.name.toLowerCase().replace(/\s+/g, '-')}`);
                                }}
                                size="sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div id="time-series-chart">
                            <TimeSeriesChart data={historicalData} height={400} />
                        </div>
                    </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Multi-Dimensional Comparison</CardTitle>
                            <ExportButton
                                onExportPNG={async () => {
                                    const el = document.getElementById('radar-chart');
                                    if (el) await exportToPNG(el, 'multi-dimensional-comparison');
                                }}
                                size="sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div id="radar-chart">
                            <RadarChart brands={radarData} height={400} />
                        </div>
                    </CardContent>
                </Card>

                {/* Model Comparison and Funnel Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>AI Model Performance - {brand1.name}</CardTitle>
                                <ExportButton
                                    onExportCSV={async () => {
                                        await exportToCSV(
                                            formatChartDataForCSV(modelBreakdown as unknown as Record<string, unknown>[], 'model'),
                                            `model-performance-${brand1.name.toLowerCase().replace(/\s+/g, '-')}`
                                        );
                                    }}
                                    onExportPNG={async () => {
                                        const el = document.getElementById('model-comparison-chart');
                                        if (el) await exportToPNG(el, `model-performance-${brand1.name.toLowerCase().replace(/\s+/g, '-')}`);
                                    }}
                                    size="sm"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div id="model-comparison-chart">
                                <ModelComparisonChart data={modelBreakdown} height={350} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Attribution Funnel - {brand1.name}</CardTitle>
                                <ExportButton
                                    onExportCSV={async () => {
                                        await exportToCSV(
                                            formatChartDataForCSV(funnelData as unknown as Record<string, unknown>[], 'funnel'),
                                            `attribution-funnel-${brand1.name.toLowerCase().replace(/\s+/g, '-')}`
                                        );
                                    }}
                                    onExportPNG={async () => {
                                        const el = document.getElementById('funnel-chart');
                                        if (el) await exportToPNG(el, `attribution-funnel-${brand1.name.toLowerCase().replace(/\s+/g, '-')}`);
                                    }}
                                    size="sm"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div id="funnel-chart">
                                <FunnelChart data={funnelData} height={350} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Heatmap Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Brand × Model Performance Heatmap</CardTitle>
                            <ExportButton
                                onExportCSV={async () => {
                                    await exportToCSV(heatmapData, 'brand-model-heatmap');
                                }}
                                onExportPNG={async () => {
                                    const el = document.getElementById('heatmap-chart');
                                    if (el) await exportToPNG(el, 'brand-model-heatmap');
                                }}
                                size="sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div id="heatmap-chart">
                            <HeatmapChart
                                data={heatmapData}
                                brands={BRANDS.map(b => b.name)}
                                models={['ChatGPT', 'Gemini', 'Claude', 'Perplexity']}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
