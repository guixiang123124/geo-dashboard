'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Database,
  Zap,
  AlertCircle,
  RefreshCw,
  Activity,
  Download,
  FileText,
  MessageSquareText,
  Settings2,
  CheckCircle2,
  XCircle,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';
import { useEvaluationRuns } from '@/hooks/useEvaluations';
import { usePromptCategories } from '@/hooks/usePrompts';
import { exportBrandsToCSV, exportToJSON, exportToPDF } from '@/lib/export';

const AI_MODEL_CONFIG = [
  {
    name: 'Google AI (Gemini)',
    model: 'Gemini 2.0 Flash',
    envVar: 'GOOGLE_API_KEY',
    letter: 'G',
    letterBg: 'bg-blue-600',
    description: 'Primary evaluation model',
    status: 'active' as const,
  },
  {
    name: 'OpenAI (ChatGPT)',
    model: 'GPT-4',
    envVar: 'OPENAI_API_KEY',
    letter: 'O',
    letterBg: 'bg-slate-800',
    description: 'Requires API key configuration',
    status: 'planned' as const,
  },
  {
    name: 'Anthropic (Claude)',
    model: 'Claude 3',
    envVar: 'ANTHROPIC_API_KEY',
    letter: 'A',
    letterBg: 'bg-orange-600',
    description: 'Requires API key configuration',
    status: 'planned' as const,
  },
  {
    name: 'Perplexity',
    model: 'Perplexity Pro',
    envVar: 'PERPLEXITY_API_KEY',
    letter: 'P',
    letterBg: 'bg-teal-600',
    description: 'Requires API key configuration',
    status: 'planned' as const,
  },
];

export default function SettingsPage() {
  const { brands, loading: brandsLoading } = useBrands();
  const { runs, loading: runsLoading } = useEvaluationRuns();
  const { categories, loading: categoriesLoading } = usePromptCategories();
  const [exporting, setExporting] = useState<string | null>(null);

  const loading = brandsLoading || runsLoading;

  const totalBrands = brands.length;
  const scoredBrands = brands.filter(b => b.score).length;
  const totalEvalRuns = runs.length;
  const completedRuns = runs.filter(r => r.status === 'completed').length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;

  // Count total results across all runs
  const totalResults = runs.reduce((sum, r) => sum + (r.prompt_count ?? 0), 0);

  // Total prompts from categories
  const totalPrompts = categories.reduce((sum, c) => sum + c.count, 0);

  // API status — inferred from whether data loaded
  const apiConnected = !brandsLoading && brands.length > 0;

  // Active model (from runs data)
  const activeModels = Array.from(
    new Set(runs.flatMap(r => r.models_used ?? []))
  );

  // Last run date
  const lastRunDate = runs.length > 0
    ? runs
        .filter(r => r.completed_at)
        .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
        [0]?.completed_at
    : null;

  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      exportBrandsToCSV(brands);
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = async () => {
    setExporting('json');
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        brands: brands.map(b => ({
          name: b.name,
          category: b.category,
          domain: b.domain,
          score: b.score ? {
            composite: b.score.composite_score,
            visibility: b.score.visibility_score,
            citation: b.score.citation_score,
            representation: b.score.representation_score,
            intent: b.score.intent_score,
            totalMentions: b.score.total_mentions,
            citationRate: b.score.citation_rate,
          } : null,
        })),
        evaluationRuns: runs.map(r => ({
          name: r.name,
          status: r.status,
          models: r.models_used,
          promptCount: r.prompt_count,
          completedAt: r.completed_at,
        })),
        summary: {
          totalBrands,
          scoredBrands,
          totalEvalRuns,
          completedRuns,
          totalResults,
          totalPrompts,
          activeModels,
        },
      };
      exportToJSON(exportData, `geo-insights-full-export-${new Date().toISOString().split('T')[0]}`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      exportToPDF('Brand Performance Overview', brands, `geo-insights-report-${new Date().toISOString().split('T')[0]}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Settings
          </h1>
          <p className="text-slate-500">System configuration, data overview, and export tools for GEO Insights</p>
        </div>

        {/* System Status */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Backend API and service health</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${apiConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <p className="font-semibold text-slate-900">Backend API</p>
                <p className="text-sm text-slate-600">
                  {loading ? 'Checking...' : apiConnected ? 'Connected at localhost:8000' : 'Not connected'}
                </p>
              </div>
              <Badge className={`ml-auto ${apiConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                {loading ? 'Loading' : apiConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Database className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Database</p>
                  <p className="text-sm font-medium text-slate-900">SQLite (aiosqlite)</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Shield className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Auth</p>
                  <p className="text-sm font-medium text-slate-900">JWT Tokens</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Settings2 className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Last Evaluation</p>
                  <p className="text-sm font-medium text-slate-900">
                    {lastRunDate
                      ? new Date(lastRunDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Model Configuration</CardTitle>
                <CardDescription>API keys are configured via backend environment variables</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {AI_MODEL_CONFIG.map(model => {
              const isActive = model.status === 'active' && apiConnected;
              const isUsed = activeModels.some(m =>
                m.toLowerCase().includes(model.name.split('(')[0].trim().toLowerCase()) ||
                m.toLowerCase().includes(model.model.toLowerCase().split(' ')[0])
              );

              return (
                <div
                  key={model.name}
                  className={`p-4 border rounded-lg ${
                    isActive ? 'border-green-200 bg-green-50/50' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${isActive ? model.letterBg : 'bg-slate-300'} rounded-lg flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{model.letter}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{model.name}</p>
                        <p className="text-xs text-slate-600">{model.model} — {model.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isUsed && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          Used in evaluations
                        </Badge>
                      )}
                      <Badge className={
                        isActive
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }>
                        {isActive ? 'Active' : 'Planned'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{model.envVar}</code>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-green-600 ml-2">
                        <CheckCircle2 className="w-3 h-3" /> Configured
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 ml-2">
                        <XCircle className="w-3 h-3" /> Not configured
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">How to configure</p>
                <p className="text-blue-700">
                  Set API keys in the backend <code className="bg-blue-100 px-1 rounded">.env</code> file, then restart the server.
                  Example: <code className="bg-blue-100 px-1 rounded">GOOGLE_API_KEY=your_key_here</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Library Overview */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-600 rounded-lg">
                  <MessageSquareText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Prompt Library</CardTitle>
                  <CardDescription>Evaluation prompts organized by intent category</CardDescription>
                </div>
              </div>
              <Link href="/prompts">
                <Button variant="outline" size="sm">
                  Manage Prompts
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 py-4 justify-center text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading prompts...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">Total prompts: <span className="font-bold text-slate-900">{totalPrompts}</span></span>
                  <span className="text-slate-600">Categories: <span className="font-bold text-slate-900">{categories.length}</span></span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map(cat => (
                    <div key={cat.category} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-xs font-medium text-slate-700 truncate mr-2">
                        {cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">{cat.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Overview */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Data Overview</CardTitle>
                <CardDescription>Current data in the system</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 py-4 justify-center text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading data...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Brands</p>
                    <p className="text-2xl font-bold text-slate-900">{totalBrands}</p>
                    <p className="text-xs text-slate-500">{scoredBrands} with scores</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Eval Runs</p>
                    <p className="text-2xl font-bold text-slate-900">{totalEvalRuns}</p>
                    <p className="text-xs text-slate-500">
                      {completedRuns} done{failedRuns > 0 ? `, ${failedRuns} failed` : ''}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Results</p>
                    <p className="text-2xl font-bold text-slate-900">{totalResults}</p>
                    <p className="text-xs text-slate-500">prompt evaluations</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Prompts</p>
                    <p className="text-2xl font-bold text-slate-900">{totalPrompts}</p>
                    <p className="text-xs text-slate-500">{categories.length} categories</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Models</p>
                    <p className="text-2xl font-bold text-slate-900">{activeModels.length}</p>
                    <p className="text-xs text-slate-500">{activeModels[0] ?? 'none active'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link href="/evaluations" className="flex-1">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      View Evaluations
                    </Button>
                  </Link>
                  <Link href="/brands" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      View Brands
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Export & Data Management */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Export & Data Management</CardTitle>
                <CardDescription>Download reports and data in various formats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleExportCSV}
                disabled={exporting === 'csv' || brands.length === 0}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Export CSV</p>
                  <p className="text-xs text-slate-500">Brand scores spreadsheet</p>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={exporting === 'json' || brands.length === 0}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Export JSON</p>
                  <p className="text-xs text-slate-500">Full data export</p>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={exporting === 'pdf' || brands.length === 0}
                className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Export PDF</p>
                  <p className="text-xs text-slate-500">Printable report</p>
                </div>
              </button>
            </div>

            {exporting && (
              <div className="flex items-center gap-2 text-sm text-slate-600 py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Preparing {exporting.toUpperCase()} export...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-slate-900">GEO Insights Dashboard</p>
              <p className="text-xs text-slate-500">
                Generative Engine Optimization — Track and improve your brand visibility across AI platforms
              </p>
              <p className="text-xs text-slate-400">
                Built with Next.js, FastAPI, and SQLite
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
