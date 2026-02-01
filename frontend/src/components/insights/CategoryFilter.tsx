'use client';

import { useState } from 'react';
import { Filter, ChevronDown, X, Layers } from 'lucide-react';

interface Category {
  category: string;
  brand_count: number;
  mention_count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Technology': '💻',
  'E-commerce': '🛒',
  'Fashion': '👕',
  'Food & Beverage': '🍔',
  'Finance': '💳',
  'Healthcare': '⚕️',
  'Entertainment': '🎬',
  'Automotive': '🚗',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Technology': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'E-commerce': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Fashion': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Food & Beverage': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Finance': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Healthcare': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Entertainment': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Automotive': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalMentions = categories.reduce((sum, c) => sum + c.mention_count, 0);
  const totalBrands = categories.reduce((sum, c) => sum + c.brand_count, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Categories</h3>
              <p className="text-sm text-slate-500">{categories.length} industries</p>
            </div>
          </div>
          {selectedCategory && (
            <button
              onClick={() => onCategoryChange(null)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Stats */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{totalMentions.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Mentions</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{totalBrands}</p>
            <p className="text-xs text-slate-500">Unique Brands</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
            <p className="text-xs text-slate-500">Categories</p>
          </div>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => {
            const colors = CATEGORY_COLORS[cat.category] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
            const icon = CATEGORY_ICONS[cat.category] || '📦';
            const isSelected = selectedCategory === cat.category;
            const percentage = totalMentions > 0 ? (cat.mention_count / totalMentions * 100).toFixed(1) : 0;

            return (
              <button
                key={cat.category}
                onClick={() => onCategoryChange(isSelected ? null : cat.category)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                    : `${colors.border} ${colors.bg} hover:border-slate-300`
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{icon}</span>
                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-violet-700' : colors.text}`}>
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={isSelected ? 'text-violet-600' : 'text-slate-500'}>
                    {cat.brand_count} brands
                  </span>
                  <span className={`font-medium ${isSelected ? 'text-violet-700' : 'text-slate-600'}`}>
                    {percentage}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isSelected ? 'bg-violet-500' : 'bg-slate-400'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* All categories option */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full mt-3 p-3 rounded-lg border-2 text-center transition-all ${
            !selectedCategory
              ? 'border-violet-500 bg-violet-50 text-violet-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="font-medium">All Categories</span>
        </button>
      </div>
    </div>
  );
}
