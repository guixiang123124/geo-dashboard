'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ModelSelectorProps {
    models: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

const MODEL_COLORS: Record<string, string> = {
    ChatGPT: 'bg-green-100 text-green-700 border-green-200',
    Gemini: 'bg-blue-100 text-blue-700 border-blue-200',
    Claude: 'bg-purple-100 text-purple-700 border-purple-200',
    Perplexity: 'bg-orange-100 text-orange-700 border-orange-200',
};

export function ModelSelector({ models, selected, onChange }: ModelSelectorProps) {
    const handleToggle = (model: string) => {
        if (selected.includes(model)) {
            onChange(selected.filter(m => m !== model));
        } else {
            onChange([...selected, model]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">AI Models</label>
            <div className="flex flex-wrap gap-2">
                {models.map((model) => {
                    const isSelected = selected.includes(model);
                    return (
                        <Badge
                            key={model}
                            variant="outline"
                            className={`cursor-pointer transition-all ${
                                isSelected ? MODEL_COLORS[model] : 'opacity-50 hover:opacity-100'
                            }`}
                            onClick={() => handleToggle(model)}
                        >
                            {model}
                        </Badge>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500">
                {selected.length} of {models.length} selected
            </p>
        </div>
    );
}
