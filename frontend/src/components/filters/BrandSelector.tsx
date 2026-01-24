'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Brand {
    id: string;
    name: string;
}

interface BrandSelectorProps {
    brands: Brand[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export function BrandSelector({ brands, selected, onChange }: BrandSelectorProps) {
    const handleToggle = (brandId: string) => {
        if (selected.includes(brandId)) {
            onChange(selected.filter(id => id !== brandId));
        } else {
            onChange([...selected, brandId]);
        }
    };

    const handleSelectAll = () => {
        onChange(brands.map(b => b.id));
    };

    const handleDeselectAll = () => {
        onChange([]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Brands</label>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-xs h-7"
                    >
                        Select All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeselectAll}
                        className="text-xs h-7"
                    >
                        Clear
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {brands.map((brand) => {
                    const isSelected = selected.includes(brand.id);
                    return (
                        <Badge
                            key={brand.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all ${
                                isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleToggle(brand.id)}
                        >
                            {isSelected && <Check className="w-3 h-3 mr-1" />}
                            {brand.name}
                        </Badge>
                    );
                })}
            </div>
            <p className="text-xs text-gray-500">
                {selected.length} of {brands.length} selected
            </p>
        </div>
    );
}
