import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './card';

type TrendDirection = 'up' | 'down' | 'stable';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: TrendDirection;
    change?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function StatCard({ label, value, trend, change, icon, className }: StatCardProps) {
    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-slate-600" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-slate-600';
    };

    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-slate-600 font-medium mb-1">{label}</p>
                        <p className="text-3xl font-bold text-slate-900">{value}</p>
                        {(trend || change) && (
                            <div className="flex items-center gap-1 mt-2">
                                {getTrendIcon()}
                                {change && (
                                    <span className={`text-sm font-medium ${getTrendColor()}`}>
                                        {change}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {icon && (
                        <div className="flex-shrink-0 text-slate-500">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
