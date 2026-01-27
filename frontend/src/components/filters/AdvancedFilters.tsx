'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  X,
  Search,
  Calendar,
  TrendingUp,
  Package,
  ChevronDown
} from 'lucide-react';

export interface FilterState {
  search: string;
  category: string[];
  scoreRange: [number, number];
  dateRange: string;
  sortBy: string;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES = [
  'Baby Clothing',
  'Toddler Wear',
  'Kids Sportswear',
  'School Uniforms',
  'Sleepwear',
  'Accessories'
];

const SCORE_RANGES = [
  { label: 'All Scores', value: [0, 100] as [number, number] },
  { label: 'Excellent (80-100)', value: [80, 100] as [number, number] },
  { label: 'Good (60-79)', value: [60, 79] as [number, number] },
  { label: 'Fair (40-59)', value: [40, 59] as [number, number] },
  { label: 'Needs Improvement (<40)', value: [0, 39] as [number, number] },
];

const DATE_RANGES = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

const SORT_OPTIONS = [
  { label: 'Highest Score', value: 'score-desc' },
  { label: 'Lowest Score', value: 'score-asc' },
  { label: 'Brand Name (A-Z)', value: 'name-asc' },
  { label: 'Brand Name (Z-A)', value: 'name-desc' },
  { label: 'Recently Updated', value: 'updated-desc' },
];

export default function AdvancedFilters({ onFilterChange, onReset }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: [],
    scoreRange: [0, 100],
    dateRange: 'all',
    sortBy: 'score-desc',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...filters.category, category];
    updateFilter('category', newCategories);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      category: [],
      scoreRange: [0, 100],
      dateRange: 'all',
      sortBy: 'score-desc',
    };
    setFilters(resetFilters);
    onReset();
  };

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    filters.category.length +
    (filters.scoreRange[0] !== 0 || filters.scoreRange[1] !== 100 ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'score-desc' ? 1 : 0);

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {isExpanded && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Categories */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Package className="w-4 h-4" />
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        filters.category.includes(category)
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <TrendingUp className="w-4 h-4" />
                Score Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SCORE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => updateFilter('scoreRange', range.value)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                      ${
                        filters.scoreRange[0] === range.value[0] &&
                        filters.scoreRange[1] === range.value[1]
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4" />
                Time Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => updateFilter('dateRange', range.value)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        filters.dateRange === range.value
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
