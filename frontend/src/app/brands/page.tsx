'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, TrendingDown, ArrowRight, Download, Plus } from 'lucide-react';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import CategorySelector from '@/components/filters/CategorySelector';
import AdvancedFilters, { type FilterState } from '@/components/filters/AdvancedFilters';
import { exportBrandsToCSV } from '@/lib/export';

export default function BrandsPage() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const { categories, loading: catLoading } = useCategories();
    const { brands, loading } = useBrands(selectedCategory || undefined);
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
                case 'visibility-desc':
                    return (b.score?.visibility_score ?? 0) - (a.score?.visibility_score ?? 0);
                case 'citation-desc':
                    return (b.score?.citation_score ?? 0) - (a.score?.citation_score ?? 0);
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
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
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
                        <h1 className="text-3xl font-bold text-slate-900">
                            Brands
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Manage and track all your brands ({filteredBrands.length} of {brands.length})
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/brands/new">
                            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Brand
                            </Button>
                        </Link>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Industry Filter */}
                <CategorySelector
                    categories={categories}
                    selected={selectedCategory}
                    onChange={setSelectedCategory}
                    loading={catLoading}
                />

                {/* Advanced Filters */}
                <AdvancedFilters onFilterChange={handleFilterChange} onReset={handleReset} />

                {/* Brand Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBrands.map((brand, index) => {
                        const score = brand.score;
                        const compositeScore = score?.composite_score ?? 0;
                        const rank = index + 1;
                        const scoreColor =
                            compositeScore >= 25
                                ? 'text-green-700'
                                : compositeScore >= 10
                                ? 'text-blue-700'
                                : compositeScore > 0
                                ? 'text-amber-700'
                                : 'text-slate-400';

                        const getTrendIcon = () => {
                            if (compositeScore >= 25) return <TrendingUp className="w-5 h-5 text-green-600" />;
                            if (compositeScore >= 10) return null;
                            return <TrendingDown className="w-5 h-5 text-amber-600" />;
                        };

                        return (
                            <Link key={brand.id} href={`/brands/${brand.id}`}>
                                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 hover:border-slate-300 group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg ${rank <= 3 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    #{rank}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                                                        {brand.name}
                                                    </h3>
                                                    <Badge variant="outline" className="mt-1">
                                                        {brand.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div
                                                    className={`text-3xl font-extrabold ${scoreColor}`}
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
                                                        {score?.visibility_score ?? 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-blue-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (score?.visibility_score ?? 0) * 2)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Citation */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Citation</span>
                                                    <span className="font-semibold text-green-700">
                                                        {score?.citation_score ?? 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-green-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (score?.citation_score ?? 0) * 2)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Representation */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Framing</span>
                                                    <span className="font-semibold text-amber-700">
                                                        {score?.representation_score ?? 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-amber-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (score?.representation_score ?? 0) * 2)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Intent */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-600">Intent</span>
                                                    <span className="font-semibold text-purple-700">
                                                        {score?.intent_score ?? 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-purple-100 rounded-full h-1.5">
                                                    <div
                                                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (score?.intent_score ?? 0) * 2)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {brand.domain && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">{brand.domain}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-end text-violet-600 group-hover:text-violet-700 text-sm font-medium">
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
                            <Package className="w-16 h-16 mx-auto text-slate-400 mb-4" />
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
