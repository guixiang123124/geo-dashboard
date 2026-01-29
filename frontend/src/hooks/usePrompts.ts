'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Prompt, PromptCategory } from '@/lib/types';
import { promptsApi } from '@/lib/api';

export function usePrompts(category?: string, search?: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promptsApi.list(1, 200, category, search);
      setPrompts(data.prompts);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load prompts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return { prompts, total, loading, error, refetch: fetchPrompts };
}

export function usePromptCategories() {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await promptsApi.categories();
        setCategories(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load categories';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { categories, loading, error };
}
