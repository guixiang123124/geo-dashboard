import { ALL_EVALUATION_RUNS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function EvaluationsPage() {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'running':
                return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any, className: string }> = {
            completed: { variant: 'default', className: 'bg-green-100 text-green-700 border-green-200' },
            running: { variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200' },
            failed: { variant: 'default', className: 'bg-red-100 text-red-700 border-red-200' },
            pending: { variant: 'outline', className: '' },
        };

        return (
            <Badge variant={variants[status]?.variant || 'outline'} className={variants[status]?.className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
                    <p className="text-gray-600 mt-2">Track evaluation runs and AI model performance</p>
                </div>

                {/* Evaluation Runs */}
                <div className="space-y-4">
                    {ALL_EVALUATION_RUNS.map((run) => (
                        <Card key={run.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {getStatusIcon(run.status)}
                                            <h3 className="font-semibold text-gray-900 text-lg">{run.brandName}</h3>
                                            {getStatusBadge(run.status)}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Models</p>
                                                <p className="font-semibold text-gray-900 mt-1">
                                                    {run.modelsUsed.join(', ')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Progress</p>
                                                <p className="font-semibold text-gray-900 mt-1">
                                                    {run.completedPrompts}/{run.totalPrompts} ({run.progress}%)
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Started</p>
                                                <p className="font-semibold text-gray-900 mt-1">
                                                    {run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Duration</p>
                                                <p className="font-semibold text-gray-900 mt-1">
                                                    {run.duration || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {run.status === 'running' && (
                                            <div className="mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${run.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Coming Soon */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <PlayCircle className="w-12 h-12 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">Evaluation Details Coming Soon</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Click on evaluation runs to see detailed AI responses, brand mentions, and citation analysis.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
