'use client';

import { useState, useCallback } from 'react';
import { usePrompts, usePromptCategories } from '@/hooks/usePrompts';
import { promptsApi } from '@/lib/api';
import type { Prompt, PromptCreate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquareText,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Filter,
  Hash,
  Weight,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  general_discovery: 'bg-blue-100 text-blue-700 border-blue-200',
  brand_comparison: 'bg-purple-100 text-purple-700 border-purple-200',
  price_value: 'bg-green-100 text-green-700 border-green-200',
  sustainability: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  age_specific: 'bg-pink-100 text-pink-700 border-pink-200',
  safety_quality: 'bg-red-100 text-red-700 border-red-200',
  material_quality: 'bg-amber-100 text-amber-700 border-amber-200',
  occasion_specific: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  style_trend: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  use_case_activity: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  sizing_fit: 'bg-orange-100 text-orange-700 border-orange-200',
  specialty_needs: 'bg-teal-100 text-teal-700 border-teal-200',
};

function getCategoryStyle(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-700 border-slate-200';
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PromptsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>();

  const { prompts, total, loading, error, refetch } = usePrompts(selectedCategory, debouncedSearch);
  const { categories } = usePromptCategories();

  // Create/Edit state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<PromptCreate>({
    text: '',
    intent_category: '',
    weight: 5,
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearchSubmit = useCallback(() => {
    setDebouncedSearch(searchQuery || undefined);
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const openCreateForm = useCallback(() => {
    setFormData({ text: '', intent_category: categories[0]?.category ?? '', weight: 5, description: '' });
    setEditingPrompt(null);
    setShowCreateForm(true);
  }, [categories]);

  const openEditForm = useCallback((prompt: Prompt) => {
    setFormData({
      text: prompt.text,
      intent_category: prompt.intent_category,
      weight: prompt.weight,
      description: prompt.description ?? '',
    });
    setEditingPrompt(prompt);
    setShowCreateForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowCreateForm(false);
    setEditingPrompt(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.text.trim() || !formData.intent_category.trim()) return;
    try {
      setSaving(true);
      if (editingPrompt) {
        await promptsApi.update(editingPrompt.id, formData);
      } else {
        await promptsApi.create(formData);
      }
      closeForm();
      refetch();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [formData, editingPrompt, closeForm, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      setDeletingId(id);
      await promptsApi.delete(id);
      refetch();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  }, [refetch]);

  const updateForm = useCallback((field: keyof PromptCreate, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load prompts</p>
          <p className="text-slate-500 text-sm mt-1">{error}</p>
          <Button onClick={refetch} className="mt-4 bg-violet-600 hover:bg-violet-700 text-white">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prompt Library</h1>
          <p className="text-slate-500 mt-1">
            Manage evaluation prompts across {categories.length} intent categories
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prompt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <MessageSquareText className="w-5 h-5 text-violet-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-xs text-slate-500">Total Prompts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Hash className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                <p className="text-xs text-slate-500">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Weight className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {prompts.length > 0
                    ? (prompts.reduce((s, p) => s + p.weight, 0) / prompts.length).toFixed(1)
                    : '0'}
                </p>
                <p className="text-xs text-slate-500">Avg Weight</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Filter className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {selectedCategory ? formatCategory(selectedCategory) : 'All'}
                </p>
                <p className="text-xs text-slate-500">Active Filter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-violet-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({total})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setSelectedCategory(
              selectedCategory === cat.category ? undefined : cat.category
            )}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.category
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {formatCategory(cat.category)} ({cat.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <Button
          onClick={handleSearchSubmit}
          variant="outline"
          className="border-slate-200"
        >
          Search
        </Button>
        {debouncedSearch && (
          <Button
            onClick={() => { setSearchQuery(''); setDebouncedSearch(undefined); }}
            variant="outline"
            className="border-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">
              {editingPrompt ? 'Edit Prompt' : 'New Prompt'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prompt Text *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => updateForm('text', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="e.g., What are the best organic baby clothing brands?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Intent Category *
                </label>
                <select
                  value={formData.intent_category}
                  onChange={(e) => updateForm('intent_category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {formatCategory(cat.category)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Weight (1-10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.weight}
                  onChange={(e) => updateForm('weight', parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description ?? ''}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeForm} className="border-slate-200">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.text.trim() || !formData.intent_category}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {editingPrompt ? 'Update' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompts Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquareText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No prompts found</p>
          <p className="text-slate-500 text-sm mt-1">
            {selectedCategory || debouncedSearch
              ? 'Try adjusting your filters'
              : 'Add your first prompt to get started'}
          </p>
        </div>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Prompt
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900 line-clamp-2">{prompt.text}</p>
                      {prompt.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{prompt.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getCategoryStyle(prompt.intent_category)}`}
                      >
                        {formatCategory(prompt.intent_category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {prompt.weight}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(prompt)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id)}
                          disabled={deletingId === prompt.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          {deletingId === prompt.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
