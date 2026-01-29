'use client';

import { useState, useEffect } from 'react';
import { modelsApi, type AIModelInfo } from '@/lib/api';

export function useModels() {
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        setError(null);
        const data = await modelsApi.list();
        setModels(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load models';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  const availableModels = models.filter(m => m.available);
  const unavailableModels = models.filter(m => !m.available);

  return { models, availableModels, unavailableModels, loading, error };
}
