'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Target,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params?.id as string;
  const { brands, loading } = useBrands();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'from-green-600 to-emerald-600';
    if (value >= 50) return 'from-yellow-600 to-orange-600';
    return 'from-red-600 to-pink-600';
  };

  const getTrendIcon = (value: number) => {
    if (value >= 70) return <TrendingUp className="w-5 h-5 text-green-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

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
            <div className="flex gap-2">
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Composite Score Highlight */}
        {score && (
          <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Overall GEO Score</p>
                  <div className="flex items-center gap-4">
                    <div className={`text-6xl font-extrabold bg-gradient-to-r ${getScoreColor(score.composite_score)} bg-clip-text text-transparent`}>
                      {score.composite_score}
                    </div>
                    {getTrendIcon(score.composite_score)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-2">Performance Metrics</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Mentions</p>
                      <p className="text-lg font-bold text-slate-900">{score.total_mentions}</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Citation Rate</p>
                      <p className="text-lg font-bold text-slate-900">{(score.citation_rate * 100).toFixed(0)}%</p>
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
            {/* Visibility */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Visibility</CardTitle>
                    <CardDescription className="text-xs">Brand presence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-700 mb-4">{score.visibility_score}</div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${score.visibility_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Citation */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Citation</CardTitle>
                    <CardDescription className="text-xs">Source references</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-700 mb-4">{score.citation_score}</div>
                <div className="w-full bg-green-100 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${score.citation_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Representation */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Framing</CardTitle>
                    <CardDescription className="text-xs">Message quality</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-700 mb-4">{score.representation_score}</div>
                <div className="w-full bg-amber-100 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: `${score.representation_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Intent */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Intent</CardTitle>
                    <CardDescription className="text-xs">Query alignment</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-700 mb-4">{score.intent_score}</div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${score.intent_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-600">Brand ID</span>
                <span className="font-mono text-sm text-slate-900">{brand.id}</span>
              </div>
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
              {score && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Last Evaluation</span>
                  <span className="text-slate-900">
                    {score.last_evaluation_date
                      ? new Date(score.last_evaluation_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {score && score.composite_score >= 80 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900">Excellent Performance</p>
                    <p className="text-sm text-green-700 mt-1">
                      This brand is performing exceptionally well across all GEO dimensions.
                    </p>
                  </div>
                )}
                {score && score.composite_score >= 50 && score.composite_score < 80 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-semibold text-yellow-900">Good Performance</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      There are opportunities to improve visibility and citation rates.
                    </p>
                  </div>
                )}
                {score && score.composite_score < 50 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-900">Needs Attention</p>
                    <p className="text-sm text-red-700 mt-1">
                      Consider optimizing content and improving brand presence in AI responses.
                    </p>
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
