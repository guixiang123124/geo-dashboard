import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GEOScore } from '@/lib/data';

interface ScoreCardProps {
    brandName: string;
    category: string;
    score: GEOScore;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ brandName, category, score }) => {
    const getScoreColor = (value: number) => {
        if (value >= 80) return "text-green-600";
        if (value >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-col">
                    <CardTitle className="text-xl font-bold">{brandName}</CardTitle>
                    <span className="text-sm text-muted-foreground">{category}</span>
                </div>
                <div className={`text-4xl font-extrabold ${getScoreColor(score.composite)}`}>
                    {score.composite}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs text-muted-foreground uppercase">Visibility</span>
                        <span className="font-semibold text-lg">{score.visibility}%</span>
                    </div>
                    <div className="flex flex-col p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs text-muted-foreground uppercase">Citation</span>
                        <span className="font-semibold text-lg">{score.citation}%</span>
                    </div>
                    <div className="flex flex-col p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs text-muted-foreground uppercase">Framing</span>
                        <span className="font-semibold text-lg">{score.representation}%</span>
                    </div>
                    <div className="flex flex-col p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs text-muted-foreground uppercase">Intent</span>
                        <span className="font-semibold text-lg">{score.intent}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ScoreCard;
