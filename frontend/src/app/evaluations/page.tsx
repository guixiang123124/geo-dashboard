'use client';

import Link from 'next/link';
import { useEvaluationRuns } from '@/hooks/useEvaluations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';

function formatDuration(startedAt: string | undefined, completedAt: string | undefined): string {
    if (!startedAt) return '-';
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const diffMs = end - start;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
}

export default function EvaluationsPage() {
    const { runs, loading, error, refetch } = useEvaluationRuns();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'running':
                return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'outline' | 'secondary' | 'destructive'; className: string }> = {
            completed: { variant: 'default', className: 'bg-green-100 text-green-700 border-green-200' },
            running: { variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200' },
            failed: { variant: 'destructive', className: '' },
            pending: { variant: 'outline', className: '' },
        };
        const config = variants[status] ?? { variant: 'outline' as const, className: '' };

        return (
            <Badge variant={config.variant} className={config.className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Evaluations</h1>
                        <p className="text-slate-600 mt-2">Track evaluation runs and AI model performance</p>
                    </div>
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500">Loading evaluations...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Evaluations</h1>
                        <p className="text-slate-600 mt-2">Track evaluation runs and AI model performance</p>
                    </div>
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700">{error}</span>
                            <button onClick={refetch} className="ml-auto text-sm text-red-600 underline">Retry</button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Evaluations</h1>
                        <p className="text-slate-600 mt-2">Track evaluation runs and AI model performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={refetch}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <Link href="/evaluations/new">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700">
                                <PlayCircle className="w-4 h-4" />
                                Run Evaluation
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">{runs.length}</p>
                            <p className="text-sm text-slate-600">Total Runs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{runs.filter(r => r.status === 'completed').length}</p>
                            <p className="text-sm text-slate-600">Completed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{runs.filter(r => r.status === 'running').length}</p>
                            <p className="text-sm text-slate-600">Running</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{runs.filter(r => r.status === 'failed').length}</p>
                            <p className="text-sm text-slate-600">Failed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Evaluation Runs */}
                {runs.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <PlayCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No evaluation runs yet</h3>
                            <p className="text-slate-500 mt-1">Start an evaluation to see results here.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {runs.map((run) => (
                            <Link key={run.id} href={`/evaluations/${run.id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {getStatusIcon(run.status)}
                                                    <h3 className="font-semibold text-slate-900 text-lg">
                                                        {run.name ?? `Evaluation ${run.id.slice(0, 8)}`}
                                                    </h3>
                                                    {getStatusBadge(run.status)}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-600">Models</p>
                                                        <p className="font-semibold text-slate-900 mt-1">
                                                            {run.models_used.join(', ')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Prompts</p>
                                                        <p className="font-semibold text-slate-900 mt-1">
                                                            {run.prompt_count}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Progress</p>
                                                        <p className="font-semibold text-slate-900 mt-1">
                                                            {run.progress}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Started</p>
                                                        <p className="font-semibold text-slate-900 mt-1">
                                                            {formatDate(run.started_at)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600">Duration</p>
                                                        <p className="font-semibold text-slate-900 mt-1">
                                                            {formatDuration(run.started_at, run.completed_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                {run.status === 'running' && (
                                                    <div className="mt-4">
                                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${run.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Error message */}
                                                {run.error_message && (
                                                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                                        {run.error_message.length > 120
                                                            ? run.error_message.slice(0, 120) + '...'
                                                            : run.error_message}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 mt-2 ml-4 flex-shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
