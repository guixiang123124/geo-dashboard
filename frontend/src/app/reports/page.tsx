'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBrands } from '@/hooks/useBrands';
import {
  exportBrandsToCSV,
  exportToJSON,
  exportToPDF,
} from '@/lib/export';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  Loader2,
  CheckCircle2,
  BarChart3,
  Package,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react';

type ReportType = 'brand-scores' | 'evaluation-summary' | 'comparison';
type ExportFormat = 'csv' | 'json' | 'pdf';

interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: typeof BarChart3;
  color: string;
  bg: string;
  formats: ExportFormat[];
}

const REPORT_CONFIGS: readonly ReportConfig[] = [
  {
    id: 'brand-scores',
    title: 'Brand GEO Scores',
    description:
      'Complete brand scores including composite, visibility, citation, representation, and intent dimensions.',
    icon: Package,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    formats: ['csv', 'json', 'pdf'],
  },
  {
    id: 'evaluation-summary',
    title: 'Evaluation Summary',
    description:
      'Summary of all evaluation runs including status, progress, models used, and timestamps.',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    formats: ['csv', 'json'],
  },
  {
    id: 'comparison',
    title: 'Model Comparison',
    description:
      'Per-model score breakdowns showing how each AI platform references your brands.',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    formats: ['csv', 'json'],
  },
] as const;

const FORMAT_ICONS: Record<ExportFormat, typeof FileSpreadsheet> = {
  csv: FileSpreadsheet,
  json: FileJson,
  pdf: Printer,
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV Spreadsheet',
  json: 'JSON Data',
  pdf: 'PDF Report',
};

export default function ReportsPage() {
  const { brands, loading: brandsLoading } = useBrands();
  const [exportingState, setExportingState] = useState<Record<string, boolean>>({});
  const [completedState, setCompletedState] = useState<Record<string, boolean>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Derive available categories
  const categories = Array.from(new Set(brands.map(b => b.category))).sort();

  // Filter brands by category
  const filteredBrands =
    categoryFilter === 'all'
      ? brands
      : brands.filter(b => b.category === categoryFilter);

  const handleExport = async (reportType: ReportType, format: ExportFormat) => {
    const stateKey = `${reportType}-${format}`;
    setExportingState(prev => ({ ...prev, [stateKey]: true }));

    try {
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      const dateStr = new Date().toISOString().split('T')[0];

      switch (reportType) {
        case 'brand-scores': {
          if (format === 'csv') {
            exportBrandsToCSV(filteredBrands);
          } else if (format === 'json') {
            const jsonData = filteredBrands.map(b => ({
              name: b.name,
              category: b.category,
              domain: b.domain,
              scores: b.score
                ? {
                    composite: b.score.composite_score,
                    visibility: b.score.visibility_score,
                    citation: b.score.citation_score,
                    representation: b.score.representation_score,
                    intent: b.score.intent_score,
                  }
                : null,
              mentions: b.score?.total_mentions ?? 0,
              avg_rank: b.score?.avg_rank ?? null,
              citation_rate: b.score?.citation_rate ?? null,
              intent_coverage: b.score?.intent_coverage ?? null,
            }));
            exportToJSON(
              { report: 'Brand GEO Scores', generated: new Date().toISOString(), brands: jsonData },
              `geo-brand-scores-${dateStr}`
            );
          } else if (format === 'pdf') {
            exportToPDF('Brand GEO Scores', filteredBrands, `geo-brand-scores-${dateStr}`);
          }
          break;
        }
        case 'evaluation-summary': {
          // Export aggregated evaluation data from brand score cards
          const evalData = filteredBrands
            .filter(b => b.score)
            .map(b => ({
              brand: b.name,
              category: b.category,
              composite_score: b.score?.composite_score ?? 0,
              evaluation_count: b.score?.evaluation_count ?? 0,
              total_mentions: b.score?.total_mentions ?? 0,
              citation_rate: b.score?.citation_rate ?? 0,
              intent_coverage: b.score?.intent_coverage ?? 0,
              last_evaluation: b.score?.last_evaluation_date ?? 'N/A',
            }));

          if (format === 'csv') {
            const csvLines = [
              'Brand,Category,Composite Score,Evaluations,Mentions,Citation Rate,Intent Coverage,Last Evaluation',
              ...evalData.map(
                d =>
                  `"${d.brand}","${d.category}",${d.composite_score},${d.evaluation_count},${d.total_mentions},${(d.citation_rate * 100).toFixed(1)}%,${(d.intent_coverage * 100).toFixed(1)}%,${d.last_evaluation}`
              ),
            ].join('\n');
            const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `geo-evaluation-summary-${dateStr}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
          } else if (format === 'json') {
            exportToJSON(
              { report: 'Evaluation Summary', generated: new Date().toISOString(), data: evalData },
              `geo-evaluation-summary-${dateStr}`
            );
          }
          break;
        }
        case 'comparison': {
          // Export model comparison data from score cards
          const modelMap: Record<string, { score: number; count: number; mentions: number }> = {};
          filteredBrands.forEach(b => {
            const modelScores = b.score?.model_scores;
            if (!modelScores) return;
            Object.entries(modelScores).forEach(([model, data]) => {
              const existing = modelMap[model] ?? { score: 0, count: 0, mentions: 0 };
              modelMap[model] = {
                score: existing.score + (data?.score ?? 0),
                count: existing.count + 1,
                mentions: existing.mentions + (data?.mentions ?? 0),
              };
            });
          });

          const modelData = Object.entries(modelMap).map(([model, data]) => ({
            model,
            avg_score: data.count > 0 ? Math.round(data.score / data.count) : 0,
            total_mentions: data.mentions,
            brands_evaluated: data.count,
          }));

          if (format === 'csv') {
            const csvLines = [
              'Model,Avg Score,Total Mentions,Brands Evaluated',
              ...modelData.map(
                d => `"${d.model}",${d.avg_score},${d.total_mentions},${d.brands_evaluated}`
              ),
            ].join('\n');
            const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `geo-model-comparison-${dateStr}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
          } else if (format === 'json') {
            exportToJSON(
              { report: 'Model Comparison', generated: new Date().toISOString(), models: modelData },
              `geo-model-comparison-${dateStr}`
            );
          }
          break;
        }
      }

      setCompletedState(prev => ({ ...prev, [stateKey]: true }));
      setTimeout(() => {
        setCompletedState(prev => ({ ...prev, [stateKey]: false }));
      }, 2000);
    } finally {
      setExportingState(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-violet-600" />
              Reports & Export
            </h1>
            <p className="text-slate-500 mt-1">
              Generate and download reports of your GEO performance data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Data Overview */}
        <Card className="border-slate-200 bg-gradient-to-r from-violet-50 to-blue-50">
          <CardContent className="py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">{filteredBrands.length}</p>
                <p className="text-xs text-slate-500">Brands</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredBrands.filter(b => b.score).length}
                </p>
                <p className="text-xs text-slate-500">With Scores</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                <p className="text-xs text-slate-500">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredBrands.reduce((sum, b) => sum + (b.score?.total_mentions ?? 0), 0)}
                </p>
                <p className="text-xs text-slate-500">Total Mentions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">Filter by category:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              All ({brands.length})
            </button>
            {categories.map(cat => {
              const count = brands.filter(b => b.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    categoryFilter === cat
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Cards */}
        {brandsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {REPORT_CONFIGS.map(report => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl ${report.bg}`}>
                        <Icon className={`w-5 h-5 ${report.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {report.formats.map(format => {
                        const FormatIcon = FORMAT_ICONS[format];
                        const stateKey = `${report.id}-${format}`;
                        const isExporting = exportingState[stateKey];
                        const isCompleted = completedState[stateKey];

                        return (
                          <Button
                            key={format}
                            variant="outline"
                            size="sm"
                            disabled={isExporting || filteredBrands.length === 0}
                            onClick={() => handleExport(report.id, format)}
                            className="gap-2"
                          >
                            {isExporting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <FormatIcon className="w-4 h-4" />
                            )}
                            {isCompleted ? 'Downloaded!' : FORMAT_LABELS[format]}
                            {!isExporting && !isCompleted && (
                              <Download className="w-3 h-3 ml-1 opacity-50" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    {categoryFilter !== 'all' && (
                      <p className="text-xs text-slate-400 mt-3">
                        Filtered to {filteredBrands.length} brands in &ldquo;{categoryFilter}&rdquo;
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Export History Note */}
        <Card className="border-slate-200 border-dashed">
          <CardContent className="py-6 text-center">
            <Download className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Reports are generated with the latest data and downloaded to your device
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Use category filters above to scope reports to specific brand segments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
