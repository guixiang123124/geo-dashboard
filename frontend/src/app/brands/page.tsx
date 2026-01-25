'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, TrendingDown, ArrowRight, Download } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import AdvancedFilters, { type FilterState } from '@/components/filters/AdvancedFilters';
import { exportBrandsToCSV } from '@/lib/export';

export default function BrandsPage() {
    const { brands, loading } = useBrands();
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        category: [],
        scoreRange: [0, 100],
        dateRange: 'all',
        sortBy: 'score-desc',
    });

    // Filter and sort brands
    const filteredBrands = useMemo(() => {
        let result = brands.filter((brand) => {
            // Search filter
            if (filters.search && !brand.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Category filter
            if (filters.category.length > 0 && !filters.category.includes(brand.category)) {
                return false;
            }

            // Score range filter
            const score = brand.score?.composite_score ?? 0;
            if (score < filters.scoreRange[0] || score > filters.scoreRange[1]) {
                return false;
            }

            return true;
        });

        // Sort
        result.sort((a, b) => {
            const scoreA = a.score?.composite_score ?? 0;
            const scoreB = b.score?.composite_score ?? 0;

            switch (filters.sortBy) {
                case 'score-desc':
                    return scoreB - scoreA;
                case 'score-asc':
                    return scoreA - scoreB;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'updated-desc':
                    return (b.score?.last_evaluation_date ?? '').localeCompare(
                        a.score?.last_evaluation_date ?? ''
                    );
                default:
                    return 0;
            }
        });

        return result;
    }, [brands, filters]);

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const handleReset = () => {
        setFilters({
            search: '',
            category: [],
            scoreRange: [0, 100],
            dateRange: 'all',
            sortBy: 'score-desc',
        });
    };

    const handleExport = () => {
        exportBrandsToCSV(filteredBrands);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600">Loading brands...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Brands
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Manage and track all your brands ({filteredBrands.length} of {brands.length})
                        </p>
                    </div>
                    <Button
                        onClick={handleExport}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Advanced Filters */}
                <AdvancedFilters onFilterChange={handleFilterChange} onReset={handleReset} />

                {/* Brand Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBrands.map((brand) => {
                        const score = brand.score;
                        if (!score) return null;

                        const compositeScore = score.composite_score;
                        const scoreColor =
                            compositeScore >= 80
                                ? 'from-green-600 to-emerald-600'
                                : compositeScore >= 50
                                ? 'from-yellow-600 to-orange-600'
                                : 'from-red-600 to-pink-600';

                        const getTrendIcon = () => {
                            if (compositeScore >= 70) return <TrendingUp className="w-5 h-5 text-green-600" />;
                            return <TrendingDown className="w-5 h-5 text-red-600" />;
                        };

                        return (
                            <Link key={brand.id} href={`/brands/${brand.id}`}>
                                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200/60 hover:border-purple-300 group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 rounded-lg font-bold text-lg">
                                                    {brand.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                                                        {brand.name}
                                                    </h3>
                                                    <Badge variant="outline" className="mt-1">
                                                        {brand.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div
                                                    className={`text-3xl font-extrabold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}
                                                >
                                                    {compositeScore}
                                                </div>
                                                {getTrendIcon()}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Visibility */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Visibility</span>
                                                    <span className="font-semibold text-blue-700">
                                                        {score.visibility_score}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-blue-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${score.visibility_score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Citation */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Citation</span>
                                                    <span className="font-semibold text-green-700">
                                                        {score.citation_score}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-green-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${score.citation_score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Representation */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Framing</span>
                                                    <span className="font-semibold text-amber-700">
                                                        {score.representation_score}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-amber-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${score.representation_score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Intent */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Intent</span>
                                                    <span className="font-semibold text-purple-700">
                                                        {score.intent_score}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-purple-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${score.intent_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {brand.domain && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">{brand.domain}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-end text-purple-600 group-hover:text-purple-700 text-sm font-medium">
                                            View Details
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredBrands.length === 0 && (
                    <Card className="border-dashed border-2">
                        <CardContent className="p-12 text-center">
                            <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No brands found</h3>
                            <p className="text-slate-600 mb-4">
                                Try adjusting your filters or search criteria
                            </p>
                            <Button onClick={handleReset} variant="outline">
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
