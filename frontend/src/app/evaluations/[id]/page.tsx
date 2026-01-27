'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEvaluationDetail } from '@/hooks/useEvaluations';
import { useBrands } from '@/hooks/useBrands';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock,
    ChevronDown, ChevronUp, Eye, Link2, FileText, MessageSquare
} from 'lucide-react';
import type { EvaluationResult } from '@/lib/types';

function formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
}

function ResultCard({ result, brandName }: { result: EvaluationResult; brandName: string }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="overflow-hidden">
            <button
                onClick={() => setExpanded(prev => !prev)}
                className="w-full text-left"
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-semibold text-slate-900">{brandName}</span>
                                <Badge variant="outline" className="text-xs">{result.model_name}</Badge>
                                <Badge variant="outline" className="text-xs bg-slate-50">{result.intent_category}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 truncate">{result.prompt_text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className={`flex items-center gap-1 ${result.is_mentioned ? 'text-green-600' : 'text-slate-500'}`}>
                                    <Eye className="w-3 h-3" />
                                    {result.is_mentioned ? `Mentioned (#${result.mention_rank ?? '-'})` : 'Not mentioned'}
                                </span>
                                <span className={`flex items-center gap-1 ${result.is_cited ? 'text-blue-600' : 'text-slate-500'}`}>
                                    <Link2 className="w-3 h-3" />
                                    {result.is_cited ? 'Cited' : 'No citation'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Repr: {result.representation_score}
                                </span>
                                {result.response_time_ms != null && (
                                    <span className="text-slate-500">
                                        {(result.response_time_ms / 1000).toFixed(1)}s
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                    </div>
                </CardContent>
            </button>

            {expanded && (
                <div className="border-t bg-slate-50 p-4 space-y-4">
                    {/* Full Prompt */}
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Prompt</p>
                        <p className="text-sm text-slate-800">{result.prompt_text}</p>
                    </div>

                    {/* AI Response */}
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            AI Response ({result.model_name})
                        </p>
                        <div className="bg-white border rounded-lg p-3 text-sm text-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap">
                            {result.response_text}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white border rounded p-2 text-center">
                            <p className="text-xs text-slate-500">Mentioned</p>
                            <p className={`text-lg font-bold ${result.is_mentioned ? 'text-green-600' : 'text-slate-500'}`}>
                                {result.is_mentioned ? 'Yes' : 'No'}
                            </p>
                        </div>
                        <div className="bg-white border rounded p-2 text-center">
                            <p className="text-xs text-slate-500">Rank</p>
                            <p className="text-lg font-bold text-slate-800">
                                {result.mention_rank ?? '-'}
                            </p>
                        </div>
                        <div className="bg-white border rounded p-2 text-center">
                            <p className="text-xs text-slate-500">Cited</p>
                            <p className={`text-lg font-bold ${result.is_cited ? 'text-blue-600' : 'text-slate-500'}`}>
                                {result.is_cited ? 'Yes' : 'No'}
                            </p>
                        </div>
                        <div className="bg-white border rounded p-2 text-center">
                            <p className="text-xs text-slate-500">Repr. Score</p>
                            <p className="text-lg font-bold text-purple-600">
                                {result.representation_score}
                            </p>
                        </div>
                    </div>

                    {/* Mention Context */}
                    {result.mention_context && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Mention Context</p>
                            <p className="text-sm text-slate-700 bg-white border rounded p-2">{result.mention_context}</p>
                        </div>
                    )}

                    {/* Description */}
                    {result.description_text && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Brand Description in Response</p>
                            <p className="text-sm text-slate-700 bg-white border rounded p-2">{result.description_text}</p>
                        </div>
                    )}

                    {/* Sentiment */}
                    {result.sentiment && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Sentiment</p>
                            <Badge variant="outline">{result.sentiment}</Badge>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

export default function EvaluationDetailPage() {
    const params = useParams();
    const runId = params.id as string;
    const { run, loading, error } = useEvaluationDetail(runId);
    const { brands } = useBrands();
    const [filterBrand, setFilterBrand] = useState<string>('');
    const [filterPrompt, setFilterPrompt] = useState<string>('');

    const brandMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const b of brands) {
            map.set(b.id, b.name);
        }
        return map;
    }, [brands]);

    const filteredResults = useMemo(() => {
        if (!run?.results) return [];
        return run.results.filter(r => {
            if (filterBrand && r.brand_id !== filterBrand) return false;
            if (filterPrompt && !r.prompt_text.toLowerCase().includes(filterPrompt.toLowerCase())) return false;
            return true;
        });
    }, [run, filterBrand, filterPrompt]);

    // Summary stats from results
    const stats = useMemo(() => {
        if (!run?.results) return { total: 0, mentioned: 0, cited: 0, uniqueBrands: 0, uniquePrompts: 0 };
        const results = run.results;
        return {
            total: results.length,
            mentioned: results.filter(r => r.is_mentioned).length,
            cited: results.filter(r => r.is_cited).length,
            uniqueBrands: new Set(results.map(r => r.brand_id)).size,
            uniquePrompts: new Set(results.map(r => r.prompt_text)).size,
        };
    }, [run]);

    // Get unique brands from results for filter dropdown
    const resultBrands = useMemo(() => {
        if (!run?.results) return [];
        const unique = [...new Set(run.results.map(r => r.brand_id))];
        return unique.map(id => ({ id, name: brandMap.get(id) ?? id.slice(0, 8) })).sort((a, b) => a.name.localeCompare(b.name));
    }, [run, brandMap]);

    if (loading) {
        return (
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <Link href="/evaluations" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Evaluations
                    </Link>
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
                        <span className="ml-2 text-slate-500">Loading evaluation details...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !run) {
        return (
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <Link href="/evaluations" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Evaluations
                    </Link>
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700">{error ?? 'Evaluation not found'}</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const statusIcon = run.status === 'completed'
        ? <CheckCircle className="w-5 h-5 text-green-600" />
        : run.status === 'failed'
            ? <XCircle className="w-5 h-5 text-red-600" />
            : <Clock className="w-5 h-5 text-blue-600" />;

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Link href="/evaluations" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> Back to Evaluations
                </Link>

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        {statusIcon}
                        <h1 className="text-2xl font-bold text-slate-900">
                            {run.name ?? `Evaluation ${run.id.slice(0, 8)}`}
                        </h1>
                        <Badge variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'outline'}
                            className={run.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                            {run.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Models: {run.models_used.join(', ')} | Started: {formatDate(run.started_at)} | {run.prompt_count} prompts
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-xs text-slate-500">Total Results</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.mentioned}</p>
                            <p className="text-xs text-slate-500">Brand Mentions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.cited}</p>
                            <p className="text-xs text-slate-500">Citations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{stats.uniqueBrands}</p>
                            <p className="text-xs text-slate-500">Brands Evaluated</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{stats.uniquePrompts}</p>
                            <p className="text-xs text-slate-500">Unique Prompts</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mention Rate Bar */}
                {stats.total > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Overall Mention Rate</span>
                                <span className="text-sm font-bold text-slate-900">
                                    {Math.round((stats.mentioned / stats.total) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div
                                    className="bg-green-500 h-3 rounded-full transition-all"
                                    style={{ width: `${(stats.mentioned / stats.total) * 100}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                    <select
                        value={filterBrand}
                        onChange={e => setFilterBrand(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm bg-white"
                    >
                        <option value="">All Brands ({stats.uniqueBrands})</option>
                        {resultBrands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by prompt text..."
                        value={filterPrompt}
                        onChange={e => setFilterPrompt(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm flex-1 min-w-[200px]"
                    />
                    <span className="text-sm text-slate-500 self-center">
                        {filteredResults.length} results
                    </span>
                </div>

                {/* Results */}
                <div className="space-y-3">
                    {filteredResults.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-slate-500">
                                {run.results?.length === 0
                                    ? 'No results in this evaluation run.'
                                    : 'No results match your filters.'}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredResults.map(result => (
                            <ResultCard
                                key={result.id}
                                result={result}
                                brandName={brandMap.get(result.brand_id) ?? result.brand_id.slice(0, 8)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
