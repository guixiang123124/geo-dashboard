'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBrands } from '@/hooks/useBrands';
import { usePromptCategories } from '@/hooks/usePrompts';
import { useModels } from '@/hooks/useModels';
import { evaluationsApi, DEFAULT_WORKSPACE_ID } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  ArrowLeft,
  Check,
  Loader2,
  Cpu,
  Package,
  MessageSquareText,
  Zap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function NewEvaluationPage() {
  const router = useRouter();
  const { brands, loading: brandsLoading } = useBrands();
  const { categories } = usePromptCategories();
  const { models, availableModels, loading: modelsLoading } = useModels();

  const [name, setName] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select first available model
  useEffect(() => {
    if (availableModels.length > 0 && selectedModels.length === 0) {
      setSelectedModels([availableModels[0].id]);
    }
  }, [availableModels, selectedModels.length]);

  // Auto-generate name
  useEffect(() => {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const modelNames = selectedModels.join(' + ') || 'Evaluation';
    setName(`${modelNames} — ${date}`);
  }, [selectedModels]);

  const toggleModel = useCallback((modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((m) => m !== modelId)
        : [...prev, modelId]
    );
  }, []);

  const toggleBrand = useCallback((brandId: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedModels.length === 0) {
      setError('Select at least one AI model');
      return;
    }

    const brandIds = allBrands
      ? brands.map((b) => b.id)
      : selectedBrandIds;

    if (brandIds.length === 0) {
      setError('Select at least one brand');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const run = await evaluationsApi.create(DEFAULT_WORKSPACE_ID, {
        name: name.trim() || 'New Evaluation',
        models: selectedModels,
        brand_ids: brandIds,
      });
      router.push(`/evaluations/${run.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start evaluation';
      setError(message);
      setSubmitting(false);
    }
  }, [name, selectedModels, selectedBrandIds, allBrands, brands, router]);

  const totalPrompts = categories.reduce((sum, c) => sum + c.count, 0);
  const estimatedResults = (allBrands ? brands.length : selectedBrandIds.length) * totalPrompts * selectedModels.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/evaluations">
          <Button variant="outline" size="sm" className="border-slate-200">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Run New Evaluation</h1>
          <p className="text-slate-500 mt-0.5">
            Evaluate brand visibility across AI platforms
          </p>
        </div>
      </div>

      {/* Evaluation Name */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" />
            Evaluation Name
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="e.g., January 2026 Full Evaluation"
          />
        </CardContent>
      </Card>

      {/* Model Selection */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-600" />
            AI Models
            <Badge variant="outline" className="ml-2 text-xs bg-violet-50 text-violet-700 border-violet-200">
              {selectedModels.length} selected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading models...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {models.map((model) => {
                const isSelected = selectedModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    onClick={() => model.available && toggleModel(model.id)}
                    disabled={!model.available}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      !model.available
                        ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-violet-600 text-white' : model.available ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-300'
                    }`}>
                      {isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        model.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${isSelected ? 'text-violet-900' : 'text-slate-900'}`}>
                        {model.name}
                      </p>
                      <p className="text-xs text-slate-500">{model.model}</p>
                    </div>
                    {model.available ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-slate-200 text-slate-400">
                        Not configured
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {availableModels.length === 0 && !modelsLoading && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>No AI models configured. Add API keys in Settings to enable evaluation.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Selection */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-600" />
            Brands
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setAllBrands(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                allBrands
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Brands ({brands.length})
            </button>
            <button
              onClick={() => setAllBrands(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !allBrands
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Select Specific
            </button>
          </div>

          {!allBrands && (
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {brandsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                </div>
              ) : (
                brands.map((brand) => {
                  const isSelected = selectedBrandIds.includes(brand.id);
                  return (
                    <button
                      key={brand.id}
                      onClick={() => toggleBrand(brand.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-violet-600 border-violet-600'
                          : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-slate-900">{brand.name}</span>
                      <span className="text-xs text-slate-400 ml-auto">{brand.category}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
          {!allBrands && selectedBrandIds.length > 0 && (
            <p className="text-xs text-slate-500">
              {selectedBrandIds.length} brand{selectedBrandIds.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Prompt Summary */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-violet-600" />
            Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Using all <span className="font-semibold text-slate-900">{totalPrompts} prompts</span> across{' '}
            <span className="font-semibold text-slate-900">{categories.length} categories</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map((cat) => (
              <Badge key={cat.category} variant="outline" className="text-xs border-slate-200 text-slate-600">
                {cat.category.replace(/_/g, ' ')} ({cat.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estimation & Submit */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Estimated Results</p>
              <p className="text-3xl font-bold text-violet-600 mt-1">
                {estimatedResults.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {allBrands ? brands.length : selectedBrandIds.length} brands
                {' × '}{totalPrompts} prompts
                {' × '}{selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right space-y-3">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedModels.length === 0 || availableModels.length === 0}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8"
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {submitting ? 'Starting...' : 'Start Evaluation'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
