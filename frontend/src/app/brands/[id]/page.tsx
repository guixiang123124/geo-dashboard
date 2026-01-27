'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Target,
  Activity,
  FileSearch,
} from 'lucide-react';
import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';

function getScoreLevel(value: number): 'high' | 'medium' | 'low' | 'none' {
  if (value >= 25) return 'high';
  if (value >= 10) return 'medium';
  if (value > 0) return 'low';
  return 'none';
}

const levelLabels: Record<string, { label: string; color: string }> = {
  high: { label: 'Strong', color: 'text-green-700' },
  medium: { label: 'Moderate', color: 'text-blue-700' },
  low: { label: 'Low', color: 'text-amber-700' },
  none: { label: 'Not Visible', color: 'text-slate-500' },
};

const normalizeBar = (val: number) => Math.min(100, Math.max(0, val * 2));

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params?.id as string;
  const { brands, loading } = useBrands();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading brand details...</p>
        </div>
      </div>
    );
  }

  const brand = brands.find((b) => b.id === brandId);

  if (!brand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Brand Not Found</CardTitle>
            <CardDescription>The requested brand could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/brands">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Brands
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = brand.score;
  const level = score ? getScoreLevel(score.composite_score) : 'none';
  const levelInfo = levelLabels[level];

  const dimensions = score
    ? [
        { label: 'Visibility', desc: 'Mentioned in AI responses', weight: '35%', value: score.visibility_score, icon: Eye, color: 'blue' },
        { label: 'Citation', desc: 'Linked or cited by AI', weight: '25%', value: score.citation_score, icon: LinkIcon, color: 'green' },
        { label: 'Framing', desc: 'Positive representation quality', weight: '25%', value: score.representation_score, icon: MessageSquare, color: 'amber' },
        { label: 'Intent', desc: 'Recommended for right queries', weight: '15%', value: score.intent_score, icon: Target, color: 'purple' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/brands">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Brands
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{brand.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  {brand.category}
                </Badge>
                {brand.domain && (
                  <a
                    href={`https://${brand.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {brand.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <Link href="/evaluations">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <FileSearch className="w-4 h-4 mr-2" />
                View Evaluations
              </Button>
            </Link>
          </div>
        </div>

        {/* Composite Score Highlight */}
        {score && (
          <Card className="border-slate-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Overall GEO Score</p>
                  <div className="flex items-center gap-4">
                    <div className={`text-6xl font-extrabold ${levelInfo.color}`}>
                      {score.composite_score}
                    </div>
                    <div>
                      <Badge className={`${
                        level === 'high' ? 'bg-green-100 text-green-700 border-green-200' :
                        level === 'medium' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        level === 'low' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {levelInfo.label}
                      </Badge>
                      <p className="text-xs text-slate-600 mt-1">out of 100</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-2">Key Metrics</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Mentions</p>
                      <p className="text-lg font-bold text-slate-900">{score.total_mentions}</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Citation Rate</p>
                      <p className="text-lg font-bold text-slate-900">{(score.citation_rate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Intent Coverage</p>
                      <p className="text-lg font-bold text-slate-900">{(score.intent_coverage * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dimension Scores */}
        {score && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              const colorMap: Record<string, { border: string; bg: string; icon: string; text: string; bar: string; barBg: string }> = {
                blue: { border: 'border-slate-200', bg: 'bg-white', icon: 'bg-blue-600', text: 'text-blue-700', bar: 'bg-blue-600', barBg: 'bg-blue-100' },
                green: { border: 'border-slate-200', bg: 'bg-white', icon: 'bg-green-600', text: 'text-green-700', bar: 'bg-green-600', barBg: 'bg-green-100' },
                amber: { border: 'border-slate-200', bg: 'bg-white', icon: 'bg-amber-600', text: 'text-amber-700', bar: 'bg-amber-600', barBg: 'bg-amber-100' },
                purple: { border: 'border-slate-200', bg: 'bg-white', icon: 'bg-purple-600', text: 'text-purple-700', bar: 'bg-purple-600', barBg: 'bg-purple-100' },
              };
              const c = colorMap[dim.color];
              return (
                <Card key={dim.label} className={`${c.border} ${c.bg}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 ${c.icon} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dim.label}</CardTitle>
                        <CardDescription className="text-xs">{dim.desc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${c.text}`}>{dim.value}</span>
                      <span className="text-sm text-slate-500">weight: {dim.weight}</span>
                    </div>
                    <div className={`w-full ${c.barBg} rounded-full h-2`}>
                      <div
                        className={`${c.bar} h-2 rounded-full transition-all`}
                        style={{ width: `${normalizeBar(dim.value)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Model Breakdown */}
        {score?.model_scores && Object.keys(score.model_scores).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by AI Model</CardTitle>
              <CardDescription>How this brand performs across different AI platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(score.model_scores).map(([model, entry]) => {
                  const modelLevel = getScoreLevel(entry.score);
                  return (
                    <div key={model} className="flex items-center gap-4">
                      <span className="font-medium text-slate-900 w-36 truncate">{model}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${levelLabels[modelLevel].color}`}>
                              {entry.score}
                            </span>
                            <span className="text-xs text-slate-500">({levelLabels[modelLevel].label})</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Activity className="w-3 h-3" />
                            {entry.mentions} mention{entry.mentions !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div
                            className="bg-violet-500 h-2.5 rounded-full"
                            style={{ width: `${normalizeBar(entry.score)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-600">Category</span>
                <Badge>{brand.category}</Badge>
              </div>
              {brand.domain && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Website</span>
                  <a
                    href={`https://${brand.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {brand.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {brand.positioning && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Positioning</span>
                  <span className="text-slate-900 text-right max-w-xs">{brand.positioning}</span>
                </div>
              )}
              {brand.price_tier && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Price Tier</span>
                  <Badge variant="outline">{brand.price_tier}</Badge>
                </div>
              )}
              {brand.target_age_range && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Target Age</span>
                  <span className="text-slate-900">{brand.target_age_range}</span>
                </div>
              )}
              {score && (
                <>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-600">Evaluations Run</span>
                    <span className="text-slate-900">{score.evaluation_count}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Last Evaluation</span>
                    <span className="text-slate-900">
                      {score.last_evaluation_date
                        ? new Date(score.last_evaluation_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {score && score.composite_score >= 25 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900">Strong GEO Presence</p>
                    <p className="text-sm text-green-700 mt-1">
                      This brand is frequently mentioned and well-represented in AI responses.
                      It appears in {score.total_mentions} AI outputs with a {(score.citation_rate * 100).toFixed(0)}% citation rate.
                    </p>
                  </div>
                )}
                {score && score.composite_score >= 10 && score.composite_score < 25 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900">Moderate Presence</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This brand appears in some AI responses ({score.total_mentions} mentions).
                      Focus on improving visibility and citation rates to strengthen GEO performance.
                    </p>
                  </div>
                )}
                {score && score.composite_score > 0 && score.composite_score < 10 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-semibold text-amber-900">Low Visibility</p>
                    <p className="text-sm text-amber-700 mt-1">
                      AI mentions this brand rarely. Consider optimizing content, building authority,
                      and ensuring accurate brand information is widely available online.
                    </p>
                  </div>
                )}
                {score && score.composite_score === 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-900">Not Yet Visible</p>
                    <p className="text-sm text-red-700 mt-1">
                      This brand was not mentioned in any AI responses. This is common for smaller
                      or newer brands. Strategies: improve SEO, create authoritative content,
                      get featured in industry publications that AI models reference.
                    </p>
                  </div>
                )}
                {!score && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="font-semibold text-slate-900">No Evaluation Data</p>
                    <p className="text-sm text-slate-700 mt-1">
                      Run an evaluation to see this brand&apos;s GEO performance.
                    </p>
                  </div>
                )}

                {/* Dimension-specific insights */}
                {score && score.composite_score > 0 && (
                  <div className="pt-2 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Dimension highlights</p>
                    {score.visibility_score > 0 && score.citation_score === 0 && (
                      <p className="text-sm text-slate-600">
                        - Brand is mentioned but never cited with links. Adding structured data and authoritative sources may help.
                      </p>
                    )}
                    {score.intent_score > score.visibility_score && (
                      <p className="text-sm text-slate-600">
                        - Strong intent alignment relative to visibility suggests AI understands the brand well when it mentions it.
                      </p>
                    )}
                    {score.representation_score > score.visibility_score && (
                      <p className="text-sm text-slate-600">
                        - When mentioned, the brand is described positively. Focus on increasing mention frequency.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
