/**
 * React hook for fetching brands and their scores from the API
 */

import { useState, useEffect } from 'react';
import { brandsAPI, scoresAPI, DEFAULT_WORKSPACE_ID, type Brand, type ScoreCard } from '@/lib/api';

export interface BrandWithScore extends Brand {
  score?: ScoreCard;
}

export function useBrands() {
  const [brands, setBrands] = useState<BrandWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrandsAndScores() {
      try {
        setLoading(true);
        setError(null);

        // Fetch brands
        const brandsResponse = await brandsAPI.list(DEFAULT_WORKSPACE_ID, 1, 100);

        // Fetch latest scores for all brands
        const brandsWithScores: BrandWithScore[] = await Promise.all(
          brandsResponse.brands.map(async (brand) => {
            try {
              const score = await scoresAPI.getBrandLatest(brand.id, DEFAULT_WORKSPACE_ID);
              return { ...brand, score: score ?? undefined };
            } catch {
              // Brand might not have scores yet
              return brand;
            }
          })
        );

        setBrands(brandsWithScores);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brands');
        console.error('Error fetching brands:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBrandsAndScores();
  }, []);

  return { brands, loading, error };
}

export function useBrand(brandId: string) {
  const [brand, setBrand] = useState<BrandWithScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrandAndScore() {
      try {
        setLoading(true);
        setError(null);

        const brandData = await brandsAPI.get(brandId, DEFAULT_WORKSPACE_ID);

        try {
          const score = await scoresAPI.getBrandLatest(brandId, DEFAULT_WORKSPACE_ID);
          setBrand({ ...brandData, score: score ?? undefined });
        } catch {
          setBrand(brandData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brand');
        console.error('Error fetching brand:', err);
      } finally {
        setLoading(false);
      }
    }

    if (brandId) {
      fetchBrandAndScore();
    }
  }, [brandId]);

  return { brand, loading, error };
}
