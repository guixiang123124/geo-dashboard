'use client';

import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';

export interface DateRange {
    start: string;
    end: string;
}

export type Dimension = 'visibility' | 'citation' | 'representation' | 'intent';

export interface FilterState {
    dateRange: DateRange;
    brands: string[];
    models: string[];
    dimensions: Dimension[];
}

const DEFAULT_FILTERS: FilterState = {
    dateRange: {
        start: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd'),
    },
    brands: [],
    models: ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'],
    dimensions: ['visibility', 'citation', 'representation', 'intent'],
};

export function useFilters(initialFilters?: Partial<FilterState>) {
    const [filters, setFilters] = useState<FilterState>({
        ...DEFAULT_FILTERS,
        ...initialFilters,
    });

    // Load filters from localStorage on mount
    useEffect(() => {
        const savedFilters = localStorage.getItem('geo-dashboard-filters');
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                setFilters({ ...DEFAULT_FILTERS, ...parsed, ...initialFilters });
            } catch {
                // Ignore invalid saved filters
            }
        }
    }, []);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('geo-dashboard-filters', JSON.stringify(filters));
    }, [filters]);

    const updateFilter = <K extends keyof FilterState>(
        key: K,
        value: FilterState[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    return {
        filters,
        updateFilter,
        resetFilters,
    };
}
