'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Clock, Loader2, ChevronRight, BarChart3 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface DiagnosisHistoryItem {
  id: string;
  brand_name: string;
  composite_score: number;
  models_used: string[];
  created_at: string;
  category?: string;
}

function ScoreGrade({ score }: { score: number }) {
  if (score >= 80) return <span className="text-emerald-400 font-bold">A</span>;
  if (score >= 60) return <span className="text-green-400 font-bold">B</span>;
  if (score >= 40) return <span className="text-yellow-400 font-bold">C</span>;
  if (score >= 20) return <span className="text-orange-400 font-bold">D</span>;
  return <span className="text-red-400 font-bold">F</span>;
}

function ModelBadge({ model }: { model: string }) {
  const styles: Record<string, string> = {
    gemini: 'bg-blue-100 text-blue-700 border-blue-200',
    grok: 'bg-orange-100 text-orange-700 border-orange-200',
    openai: 'bg-green-100 text-green-700 border-green-200',
    perplexity: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  const labels: Record<string, string> = {
    gemini: 'Gemini',
    grok: 'Grok',
    openai: 'GPT-4o',
    perplexity: 'Perplexity',
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${styles[model] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {labels[model] || model}
    </span>
  );
}

export default function DiagnosisHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_URL}/api/v1/diagnosis/history`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch history (${res.status})`);
        }
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : data.items || data.results || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Diagnosis History</h1>
        <p className="text-slate-500">View your past brand AI visibility diagnoses</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      )}

      {error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <p className="text-orange-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && history.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Search className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-700">No diagnoses yet</h3>
            <p className="text-sm text-slate-500">
              Run your first brand diagnosis to see results here.
            </p>
            <Button
              onClick={() => router.push('/audit')}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Run Diagnosis
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => {
            const scoreColor =
              item.composite_score >= 60 ? 'text-emerald-600' :
              item.composite_score >= 40 ? 'text-yellow-600' :
              'text-red-600';

            return (
              <Card
                key={item.id}
                className="hover:border-violet-300 transition-colors cursor-pointer"
                onClick={() => router.push(`/audit?id=${item.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{item.brand_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(item.created_at)}
                          </div>
                          {item.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {item.models_used.map((m) => (
                            <ModelBadge key={m} model={m} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${scoreColor}`}>
                          {item.composite_score}
                        </div>
                        <div className="text-xs text-slate-400">
                          Grade: <ScoreGrade score={item.composite_score} />
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
