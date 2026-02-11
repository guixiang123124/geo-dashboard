'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Link2, MessageSquare, Target, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface DiagnosisData {
  id: string;
  brand_name: string;
  domain: string | null;
  category: string;
  composite_score: number;
  visibility_score: number;
  citation_score: number;
  representation_score: number;
  intent_score: number;
  insights: string[];
  recommendations: string[];
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const color = score >= 60 ? 'bg-emerald-500' : score >= 40 ? 'bg-yellow-500' : score >= 20 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <span className="text-lg font-bold text-slate-900">{score}<span className="text-sm text-slate-400">/100</span></span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ScoreGrade({ score }: { score: number }) {
  if (score >= 80) return <span className="text-emerald-400 font-bold">A</span>;
  if (score >= 60) return <span className="text-green-400 font-bold">B</span>;
  if (score >= 40) return <span className="text-yellow-400 font-bold">C</span>;
  if (score >= 20) return <span className="text-orange-400 font-bold">D</span>;
  return <span className="text-red-400 font-bold">F</span>;
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/v1/diagnosis/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Dynamic meta tags via document.title
  useEffect(() => {
    if (data) {
      document.title = `${data.brand_name} — AI Visibility Score: ${data.composite_score}/100 | Luminos`;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="text-lg text-slate-600">{error || 'Report not found'}</p>
          <a href="/audit" className="text-violet-600 hover:underline">Run your own brand diagnosis →</a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* OG meta tags for social sharing (rendered via head) */}
      <head>
        <meta property="og:title" content={`${data.brand_name} — AI Visibility Score: ${data.composite_score}/100`} />
        <meta property="og:description" content={`See how ${data.brand_name} performs across AI platforms. Scored ${data.composite_score}/100 on Luminos AI Visibility Audit.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${data.brand_name} — AI Visibility Score: ${data.composite_score}/100`} />
      </head>

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-sm text-violet-700">
              <Sparkles className="w-3.5 h-3.5" />
              AI Visibility Report
            </div>
          </div>

          {/* Score Hero */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-1">{data.brand_name}</h1>
            <p className="text-violet-200 text-sm mb-6">{data.category}</p>
            <div className="text-7xl font-bold mb-2">{data.composite_score}</div>
            <div className="text-violet-200 text-sm">AI Visibility Score</div>
            <div className="text-xl mt-2">Grade: <ScoreGrade score={data.composite_score} /></div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Score Breakdown</h2>
            <ScoreBar label="Visibility" score={data.visibility_score} icon={Eye} />
            <ScoreBar label="Citation" score={data.citation_score} icon={Link2} />
            <ScoreBar label="Framing" score={data.representation_score} icon={MessageSquare} />
            <ScoreBar label="Intent Coverage" score={data.intent_score} icon={Target} />
          </div>

          {/* Insights */}
          {data.insights && data.insights.length > 0 && (
            <div className="bg-white rounded-xl border p-6 space-y-3">
              <h2 className="font-semibold text-slate-900">Key Insights</h2>
              {data.insights.slice(0, 3).map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border p-6 space-y-3">
              <h2 className="font-semibold text-slate-900">Top Recommendations</h2>
              {data.recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-violet-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-700">{i + 1}</span>
                  </div>
                  <span className="text-sm text-slate-700">{rec}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <a
            href="/audit"
            className="block bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 text-center hover:from-violet-700 hover:to-indigo-700 transition-all"
          >
            <p className="text-lg font-semibold mb-1">Run your own free brand diagnosis →</p>
            <p className="text-violet-200 text-sm">See how AI platforms perceive your brand</p>
          </a>

          {/* Branding */}
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">Powered by <span className="font-semibold text-slate-500">Luminos</span> — AI Brand Visibility Platform</p>
          </div>
        </div>
      </div>
    </>
  );
}
