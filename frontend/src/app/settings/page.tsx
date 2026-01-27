'use client';

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
} from 'lucide-react';
import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';
import { useEvaluationRuns } from '@/hooks/useEvaluations';
import { exportBrandsToCSV } from '@/lib/export';

export default function SettingsPage() {
  const { brands, loading: brandsLoading } = useBrands();
  const { runs, loading: runsLoading } = useEvaluationRuns();

  const loading = brandsLoading || runsLoading;

  const totalBrands = brands.length;
  const scoredBrands = brands.filter(b => b.score).length;
  const totalEvalRuns = runs.length;
  const completedRuns = runs.filter(r => r.status === 'completed').length;

  // Count total results across all runs
  const totalResults = runs.reduce((sum, r) => sum + (r.prompt_count ?? 0), 0);

  // API status — inferred from whether data loaded
  const apiConnected = !brandsLoading && brands.length > 0;

  // Active model (from runs data)
  const activeModels = Array.from(
    new Set(runs.flatMap(r => r.models_used ?? []))
  );

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Settings
          </h1>
          <p className="text-slate-500">System configuration and data overview for GEO Insights</p>
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

            {activeModels.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">Active AI Models</p>
                <div className="flex flex-wrap gap-2">
                  {activeModels.map(model => (
                    <Badge key={model} variant="outline" className="bg-white">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>AI model API keys are configured via environment variables</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google AI */}
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Google AI (Gemini)</p>
                    <p className="text-xs text-slate-600">Gemini 2.0 Flash — primary evaluation model</p>
                  </div>
                </div>
                <Badge className={apiConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
                  {apiConnected ? 'Active' : 'Unknown'}
                </Badge>
              </div>
            </div>

            {/* Planned models */}
            {['OpenAI (ChatGPT)', 'Anthropic (Claude)', 'Perplexity'].map(name => (
              <div key={name} className="p-4 border border-slate-200 rounded-lg opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-slate-500 text-xs font-bold">?</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{name}</p>
                      <p className="text-xs text-slate-500">Planned integration</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Planned</Badge>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Configuration</p>
                <p className="text-blue-700">
                  API keys are managed via environment variables in the backend <code className="bg-blue-100 px-1 rounded">.env</code> file.
                  Set <code className="bg-blue-100 px-1 rounded">GOOGLE_API_KEY</code> to enable Gemini evaluations.
                </p>
              </div>
            </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Total Brands</p>
                    <p className="text-2xl font-bold text-slate-900">{totalBrands}</p>
                    <p className="text-xs text-slate-500">{scoredBrands} with scores</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Eval Runs</p>
                    <p className="text-2xl font-bold text-slate-900">{totalEvalRuns}</p>
                    <p className="text-xs text-slate-500">{completedRuns} completed</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Total Results</p>
                    <p className="text-2xl font-bold text-slate-900">{totalResults}</p>
                    <p className="text-xs text-slate-500">prompt evaluations</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Models Used</p>
                    <p className="text-2xl font-bold text-slate-900">{activeModels.length}</p>
                    <p className="text-xs text-slate-500">{activeModels[0] ?? 'none'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href="/evaluations">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      View Evaluations
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => exportBrandsToCSV(brands)}
                  >
                    Export All Brands (CSV)
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
