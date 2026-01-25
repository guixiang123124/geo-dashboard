import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GEOScore } from '@/lib/types';
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

const ScoreCard: React.FC<ScoreCardProps> = ({ brandName, category, score }) => {
    const getScoreGradient = (value: number) => {
        if (value >= 80) return "from-green-500 to-emerald-500";
        if (value >= 50) return "from-yellow-500 to-orange-500";
        return "from-red-500 to-pink-500";
    };

    const getScoreColor = (value: number) => {
        if (value >= 80) return "from-green-600 to-emerald-600";
        if (value >= 50) return "from-yellow-600 to-orange-600";
        return "from-red-600 to-pink-600";
    };

    const getBadgeColor = (value: number) => {
        if (value >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (value >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const getTrendIcon = (value: number) => {
        if (value >= 70) return <TrendingUp className="w-3 h-3" />;
        if (value >= 40) return <Minus className="w-3 h-3" />;
        return <TrendingDown className="w-3 h-3" />;
    };

    return (
        <Link href={`/brands/${score.brandId}`}>
            <Card className="w-full group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border-slate-200/60 cursor-pointer overflow-hidden">
                {/* Header with Brand Info */}
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex flex-col space-y-1">
                        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                            {brandName}
                        </CardTitle>
                        <Badge variant="outline" className="w-fit text-xs">
                            {category}
                        </Badge>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className={`text-3xl font-extrabold bg-gradient-to-r ${getScoreColor(score.scores.composite)} bg-clip-text text-transparent`}>
                            {score.scores.composite}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${score.scores.composite >= 70 ? 'text-green-600' : score.scores.composite >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {getTrendIcon(score.scores.composite)}
                            <span>GEO Score</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Dimension Scores */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Visibility */}
                        <div className="relative p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 group-hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-900">Visibility</span>
                            </div>
                            <div className="text-xl font-bold text-blue-700">{score.scores.visibility}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-b-lg"
                                 style={{ width: `${score.scores.visibility}%` }}></div>
                        </div>

                        {/* Citation */}
                        <div className="relative p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 group-hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-900">Citation</span>
                            </div>
                            <div className="text-xl font-bold text-green-700">{score.scores.citation}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-lg"
                                 style={{ width: `${score.scores.citation}%` }}></div>
                        </div>

                        {/* Representation */}
                        <div className="relative p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 group-hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-medium text-amber-900">Framing</span>
                            </div>
                            <div className="text-xl font-bold text-amber-700">{score.scores.representation}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-b-lg"
                                 style={{ width: `${score.scores.representation}%` }}></div>
                        </div>

                        {/* Intent */}
                        <div className="relative p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 group-hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-900">Intent</span>
                            </div>
                            <div className="text-xl font-bold text-purple-700">{score.scores.intent}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-b-lg"
                                 style={{ width: `${score.scores.intent}%` }}></div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <span>{score.totalMentions} mentions</span>
                        <span>{(score.citationRate * 100).toFixed(0)}% cited</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ScoreCard;
