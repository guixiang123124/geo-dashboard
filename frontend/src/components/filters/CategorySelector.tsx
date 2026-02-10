'use client';

import { type CategoryInfo } from '@/hooks/useCategories';

interface CategorySelectorProps {
  categories: CategoryInfo[];
  selected: string;
  onChange: (category: string) => void;
  loading?: boolean;
}

export default function CategorySelector({ categories, selected, onChange, loading }: CategorySelectorProps) {
  if (loading) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
          selected === ''
            ? 'bg-violet-600 text-white border-violet-500'
            : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
        }`}
      >
        All Industries
      </button>
      {categories.map(c => (
        <button
          key={c.category}
          onClick={() => onChange(c.category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            selected === c.category
              ? 'bg-violet-600 text-white border-violet-500'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
          }`}
        >
          {c.category}
          <span className="ml-1.5 text-xs opacity-70">{c.brand_count}</span>
        </button>
      ))}
    </div>
  );
}
