'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Dimension = 'visibility' | 'citation' | 'representation' | 'intent';

interface DimensionSelectorProps {
    selected: Dimension[];
    onChange: (selected: Dimension[]) => void;
}

const DIMENSIONS: Array<{ key: Dimension; label: string; color: string }> = [
    { key: 'visibility', label: 'Visibility', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { key: 'citation', label: 'Citation', color: 'bg-green-100 text-green-700 border-green-200' },
    { key: 'representation', label: 'Representation', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { key: 'intent', label: 'Intent', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export function DimensionSelector({ selected, onChange }: DimensionSelectorProps) {
    const handleToggle = (dimension: Dimension) => {
        if (selected.includes(dimension)) {
            onChange(selected.filter(d => d !== dimension));
        } else {
            onChange([...selected, dimension]);
        }
    };

    const handleSelectAll = () => {
        onChange(DIMENSIONS.map(d => d.key));
    };

    const handleDeselectAll = () => {
        onChange([]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Dimensions</label>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-xs h-7"
                    >
                        All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeselectAll}
                        className="text-xs h-7"
                    >
                        None
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {DIMENSIONS.map((dimension) => {
                    const isSelected = selected.includes(dimension.key);
                    return (
                        <Badge
                            key={dimension.key}
                            variant="outline"
                            className={`cursor-pointer transition-all ${
                                isSelected ? dimension.color : 'opacity-50 hover:opacity-100'
                            }`}
                            onClick={() => handleToggle(dimension.key)}
                        >
                            {isSelected && <Check className="w-3 h-3 mr-1" />}
                            {dimension.label}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}
