'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays, subMonths } from 'date-fns';

export interface DateRange {
    start: string;
    end: string;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const PRESETS = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', months: 3 },
    { label: 'Last 6 months', months: 6 },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const handlePresetClick = (preset: typeof PRESETS[0]) => {
        const end = new Date();
        const start = preset.days
            ? subDays(end, preset.days)
            : subMonths(end, preset.months!);

        onChange({
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd'),
        });
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Date Range</label>
            <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                    <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(preset)}
                        className="text-sm"
                    >
                        <Calendar className="w-3 h-3 mr-1" />
                        {preset.label}
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                <span>Selected: {format(new Date(value.start), 'MMM d, yyyy')}</span>
                <span>-</span>
                <span>{format(new Date(value.end), 'MMM d, yyyy')}</span>
            </div>
        </div>
    );
}
