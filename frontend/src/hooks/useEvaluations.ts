/**
 * React hooks for fetching evaluation runs and results from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { evaluationsApi, DEFAULT_WORKSPACE_ID } from '@/lib/api';
import type { EvaluationRun, EvaluationRunDetail, EvaluationResult } from '@/lib/types';

export function useEvaluationRuns() {
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await evaluationsApi.list(DEFAULT_WORKSPACE_ID);
      setRuns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { runs, loading, error, refetch };
}

export function useEvaluationDetail(runId: string | null) {
  const [run, setRun] = useState<EvaluationRunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setRun(null);
      return;
    }

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await evaluationsApi.get(runId!, DEFAULT_WORKSPACE_ID);
        setRun(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch evaluation details');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [runId]);

  return { run, loading, error };
}

export function useEvaluationResults(
  runId: string | null,
  brandId?: string,
  modelName?: string
) {
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setResults([]);
      return;
    }

    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const data = await evaluationsApi.getResults(
          runId!,
          DEFAULT_WORKSPACE_ID,
          brandId,
          modelName
        );
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch evaluation results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [runId, brandId, modelName]);

  return { results, loading, error };
}
