'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface FilterBarProps {
    children: React.ReactNode;
    onClearAll?: () => void;
    className?: string;
}

export function FilterBar({ children, onClearAll, className = '' }: FilterBarProps) {
    return (
        <Card className={className}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                        {children}
                    </div>
                    {onClearAll && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearAll}
                            className="whitespace-nowrap"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
