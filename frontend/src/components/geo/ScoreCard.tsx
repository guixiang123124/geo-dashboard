import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Link as LinkIcon, MessageSquare, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreData {
    brandId: string;
    brandName?: string;
    scores: {
        composite: number;
        visibility: number;
        citation: number;
        representation: number;
        intent: number;
    };
    totalMentions: number;
    avgRank?: number;
    citationRate: number;
    intentCoverage?: number;
    lastUpdated?: string;
}

interface ScoreCardProps {
    brandName: string;
    category: string;
    score: ScoreData;
}

// GEO scores are typically 0-100 but real evaluations often produce
// lower scores (0-50 range). These thresholds are calibrated accordingly.
function getScoreLevel(value: number): 'high' | 'medium' | 'low' | 'none' {
    if (value >= 25) return 'high';
    if (value >= 10) return 'medium';
    if (value > 0) return 'low';
    return 'none';
}

const levelColors = {
    high: { text: 'text-green-700', bg: 'bg-green-100 text-green-700 border-green-200' },
    medium: { text: 'text-blue-700', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
    low: { text: 'text-amber-700', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    none: { text: 'text-slate-500', bg: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const ScoreCard: React.FC<ScoreCardProps> = ({ brandName, category, score }) => {
    const level = getScoreLevel(score.scores.composite);
    const colors = levelColors[level];

    const getTrendIcon = (value: number) => {
        if (value >= 25) return <TrendingUp className="w-3 h-3" />;
        if (value >= 10) return <Minus className="w-3 h-3" />;
        return <TrendingDown className="w-3 h-3" />;
    };

    // Normalize score for progress bar — use relative scale for visual impact
    const normalizeBar = (val: number) => Math.min(100, Math.max(0, val * 2));

    return (
        <Link href={`/brands/${score.brandId}`}>
            <Card className="w-full group hover:shadow-lg transition-all duration-200 border-slate-200 cursor-pointer overflow-hidden">
                {/* Header with Brand Info */}
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="flex flex-col space-y-1">
                        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                            {brandName}
                        </CardTitle>
                        <Badge variant="outline" className="w-fit text-xs">
                            {category}
                        </Badge>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className={`text-3xl font-extrabold ${colors.text}`}>
                            {score.scores.composite}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${colors.text}`}>
                            {getTrendIcon(score.scores.composite)}
                            <span>GEO Score</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Dimension Scores */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Visibility */}
                        <div className="relative p-3 bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-900">Visibility</span>
                            </div>
                            <div className="text-xl font-bold text-blue-700">{score.scores.visibility}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-100">
                                <div className="h-full bg-blue-500 rounded-r"
                                     style={{ width: `${normalizeBar(score.scores.visibility)}%` }} />
                            </div>
                        </div>

                        {/* Citation */}
                        <div className="relative p-3 bg-green-50 rounded-lg border border-green-100 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-900">Citation</span>
                            </div>
                            <div className="text-xl font-bold text-green-700">{score.scores.citation}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-green-100">
                                <div className="h-full bg-green-500 rounded-r"
                                     style={{ width: `${normalizeBar(score.scores.citation)}%` }} />
                            </div>
                        </div>

                        {/* Representation */}
                        <div className="relative p-3 bg-amber-50 rounded-lg border border-amber-100 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-medium text-amber-900">Framing</span>
                            </div>
                            <div className="text-xl font-bold text-amber-700">{score.scores.representation}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-100">
                                <div className="h-full bg-amber-500 rounded-r"
                                     style={{ width: `${normalizeBar(score.scores.representation)}%` }} />
                            </div>
                        </div>

                        {/* Intent */}
                        <div className="relative p-3 bg-purple-50 rounded-lg border border-purple-100 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-900">Intent</span>
                            </div>
                            <div className="text-xl font-bold text-purple-700">{score.scores.intent}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-100">
                                <div className="h-full bg-purple-500 rounded-r"
                                     style={{ width: `${normalizeBar(score.scores.intent)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <span>{score.totalMentions} mention{score.totalMentions !== 1 ? 's' : ''}</span>
                        <span>{(score.citationRate * 100).toFixed(0)}% cited</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ScoreCard;
