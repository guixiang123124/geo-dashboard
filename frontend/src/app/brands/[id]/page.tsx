'use client';

import { useState } from 'react';
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
  ThumbsUp,
  ThumbsDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Tag,
  Globe,
  DollarSign,
  Users,
  Swords,
} from 'lucide-react';
import Link from 'next/link';
import { useBrands } from '@/hooks/useBrands';
import { useEvaluationResults } from '@/hooks/useEvaluations';

function getScoreLevel(value: number): 'high' | 'medium' | 'low' | 'none' {
  if (value >= 25) return 'high';
  if (value >= 10) return 'medium';
  if (value > 0) return 'low';
  return 'none';
}

const levelLabels: Record<string, { label: string; color: string; badge: string }> = {
  high: { label: 'Strong', color: 'text-green-700', badge: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: 'Moderate', color: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  low: { label: 'Low', color: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  none: { label: 'Not Visible', color: 'text-slate-500', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const normalizeBar = (val: number) => Math.min(100, Math.max(0, val * 2));

type TabId = 'overview' | 'results' | 'info';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params?.id as string;
  const { brands, loading } = useBrands();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // Fetch evaluation results for this brand across all runs
  const latestRunId = brands.find(b => b.id === brandId)?.score?.evaluation_run_id;
  const { results: evalResults, loading: resultsLoading } = useEvaluationResults(
    latestRunId ?? '', brandId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  const brand = brands.find((b) => b.id === brandId);

  if (!brand) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Brand Not Found</CardTitle>
            <CardDescription>The requested brand could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/brands">
              <Button><ArrowLeft className="w-4 h-4 mr-2" />Back to Brands</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = brand.score;
  const level = score ? getScoreLevel(score.composite_score) : 'none';
  const levelInfo = levelLabels[level];

  // Sentiment summary from evaluation results
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0, total: 0 };
  const mentionedResults = evalResults.filter(r => r.is_mentioned);
  for (const r of evalResults) {
    if (r.sentiment === 'positive') sentimentCounts.positive++;
    else if (r.sentiment === 'negative') sentimentCounts.negative++;
    else if (r.sentiment === 'neutral') sentimentCounts.neutral++;
    sentimentCounts.total++;
  }

  const toggleExpand = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dimensions = score
    ? [
        { label: 'Visibility', desc: 'Mentioned in AI responses', weight: '35%', value: score.visibility_score, icon: Eye, color: 'blue' },
        { label: 'Citation', desc: 'Linked or cited by AI', weight: '25%', value: score.citation_score, icon: LinkIcon, color: 'green' },
        { label: 'Framing', desc: 'Positive representation quality', weight: '25%', value: score.representation_score, icon: MessageSquare, color: 'amber' },
        { label: 'Intent', desc: 'Recommended for right queries', weight: '15%', value: score.intent_score, icon: Target, color: 'purple' },
      ]
    : [];

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview' },
    { id: 'results' as TabId, label: `AI Responses (${evalResults.length})` },
    { id: 'info' as TabId, label: 'Brand Info' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/brands">
          <Button variant="ghost" size="sm" className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-1" />
            All Brands
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{brand.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-sm">{brand.category}</Badge>
              {brand.domain && (
                <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  {brand.domain}<ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <Link href="/evaluations/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <FileSearch className="w-4 h-4 mr-2" />
              Run Evaluation
            </Button>
          </Link>
        </div>
      </div>

      {/* Score Summary Bar */}
      {score && (
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-extrabold ${levelInfo.color}`}>
                  {score.composite_score}
                </div>
                <div>
                  <Badge className={levelInfo.badge}>{levelInfo.label}</Badge>
                  <p className="text-xs text-slate-500 mt-1">GEO Score</p>
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200 hidden md:block" />
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-500">Mentions</p>
                  <p className="text-xl font-bold text-slate-900">{score.total_mentions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Citation Rate</p>
                  <p className="text-xl font-bold text-slate-900">{(score.citation_rate * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Intent Coverage</p>
                  <p className="text-xl font-bold text-slate-900">{(score.intent_coverage * 100).toFixed(0)}%</p>
                </div>
              </div>
              {sentimentCounts.total > 0 && (
                <>
                  <div className="h-12 w-px bg-slate-200 hidden md:block" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{sentimentCounts.positive}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Minus className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">{sentimentCounts.neutral}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-600">{sentimentCounts.negative}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dimension Scores */}
          {score && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dimensions.map((dim) => {
                const Icon = dim.icon;
                const colorMap: Record<string, { icon: string; text: string; bar: string; barBg: string }> = {
                  blue: { icon: 'bg-blue-600', text: 'text-blue-700', bar: 'bg-blue-600', barBg: 'bg-blue-100' },
                  green: { icon: 'bg-green-600', text: 'text-green-700', bar: 'bg-green-600', barBg: 'bg-green-100' },
                  amber: { icon: 'bg-amber-600', text: 'text-amber-700', bar: 'bg-amber-600', barBg: 'bg-amber-100' },
                  purple: { icon: 'bg-purple-600', text: 'text-purple-700', bar: 'bg-purple-600', barBg: 'bg-purple-100' },
                };
                const c = colorMap[dim.color];
                return (
                  <Card key={dim.label} className="border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1.5 ${c.icon} rounded-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{dim.label}</span>
                        <span className="text-xs text-slate-400 ml-auto">{dim.weight}</span>
                      </div>
                      <p className={`text-3xl font-bold ${c.text} mb-2`}>{dim.value}</p>
                      <div className={`w-full ${c.barBg} rounded-full h-1.5`}>
                        <div className={`${c.bar} h-1.5 rounded-full transition-all`}
                          style={{ width: `${normalizeBar(dim.value)}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Model Breakdown */}
          {score?.model_scores && Object.keys(score.model_scores).length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Performance by AI Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(score.model_scores).map(([model, entry]) => {
                    const modelLevel = getScoreLevel(entry.score);
                    return (
                      <div key={model} className="flex items-center gap-4">
                        <span className="font-medium text-slate-900 w-28 truncate text-sm">{model}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-semibold ${levelLabels[modelLevel].color}`}>
                              {entry.score}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {entry.mentions} mention{entry.mentions !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-violet-500 h-2 rounded-full transition-all"
                              style={{ width: `${normalizeBar(entry.score)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sentiment Breakdown (3A-3) */}
          {sentimentCounts.total > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sentiment Analysis</CardTitle>
                <CardDescription>How AI models describe this brand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Positive', count: sentimentCounts.positive, color: 'green', icon: ThumbsUp },
                    { label: 'Neutral', count: sentimentCounts.neutral, color: 'slate', icon: Minus },
                    { label: 'Negative', count: sentimentCounts.negative, color: 'red', icon: ThumbsDown },
                  ].map((s) => {
                    const pct = sentimentCounts.total > 0
                      ? ((s.count / sentimentCounts.total) * 100).toFixed(0)
                      : '0';
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                        <Icon className={`w-5 h-5 mx-auto mb-2 text-${s.color}-600`} />
                        <p className="text-2xl font-bold text-slate-900">{s.count}</p>
                        <p className="text-xs text-slate-500">{s.label} ({pct}%)</p>
                      </div>
                    );
                  })}
                </div>
                {/* Sentiment bar */}
                <div className="flex rounded-full h-3 mt-4 overflow-hidden bg-slate-100">
                  {sentimentCounts.positive > 0 && (
                    <div className="bg-green-500 transition-all"
                      style={{ width: `${(sentimentCounts.positive / sentimentCounts.total) * 100}%` }} />
                  )}
                  {sentimentCounts.neutral > 0 && (
                    <div className="bg-slate-300 transition-all"
                      style={{ width: `${(sentimentCounts.neutral / sentimentCounts.total) * 100}%` }} />
                  )}
                  {sentimentCounts.negative > 0 && (
                    <div className="bg-red-500 transition-all"
                      style={{ width: `${(sentimentCounts.negative / sentimentCounts.total) * 100}%` }} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Insights */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {score && score.composite_score >= 25 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <p className="font-semibold text-green-900">Strong GEO Presence</p>
                    <p className="text-green-700 mt-0.5">
                      Frequently mentioned and well-represented in AI responses with {score.total_mentions} mentions.
                    </p>
                  </div>
                )}
                {score && score.composite_score >= 10 && score.composite_score < 25 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <p className="font-semibold text-blue-900">Moderate Presence</p>
                    <p className="text-blue-700 mt-0.5">
                      Appears in some AI responses ({score.total_mentions} mentions). Focus on improving visibility and citations.
                    </p>
                  </div>
                )}
                {score && score.composite_score > 0 && score.composite_score < 10 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <p className="font-semibold text-amber-900">Low Visibility</p>
                    <p className="text-amber-700 mt-0.5">
                      Rarely mentioned by AI. Consider optimizing content and building online authority.
                    </p>
                  </div>
                )}
                {score && score.composite_score === 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <p className="font-semibold text-red-900">Not Yet Visible</p>
                    <p className="text-red-700 mt-0.5">
                      Not mentioned in any AI responses. Improve SEO and create authoritative content.
                    </p>
                  </div>
                )}
                {!score && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                    <p className="font-semibold text-slate-900">No Evaluation Data</p>
                    <p className="text-slate-600 mt-0.5">Run an evaluation to see GEO performance.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Responses Tab (3A-4 enhancement) */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {resultsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
          ) : evalResults.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No evaluation results</p>
              <p className="text-slate-500 text-sm mt-1">Run an evaluation to see AI responses for this brand.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {evalResults.length} results &middot; {mentionedResults.length} mentions
                </p>
              </div>
              {evalResults.map((result) => {
                const isExpanded = expandedResults.has(result.id);
                return (
                  <Card key={result.id} className="border-slate-200">
                    <CardContent className="p-4">
                      {/* Compact row */}
                      <button
                        onClick={() => toggleExpand(result.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">
                              {result.prompt_text}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-xs border-slate-200">
                                {result.model_name}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-slate-200">
                                {result.intent_category.replace(/_/g, ' ')}
                              </Badge>
                              {result.is_mentioned ? (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                  Mentioned{result.mention_rank ? ` #${result.mention_rank}` : ''}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-slate-400">
                                  Not Mentioned
                                </Badge>
                              )}
                              {result.sentiment && (
                                <Badge variant="outline" className={`text-xs ${
                                  result.sentiment === 'positive' ? 'bg-green-50 text-green-700 border-green-200' :
                                  result.sentiment === 'negative' ? 'bg-red-50 text-red-600 border-red-200' :
                                  'text-slate-500'
                                }`}>
                                  {result.sentiment}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              AI Response
                            </p>
                            <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 max-h-64 overflow-y-auto whitespace-pre-wrap">
                              {highlightBrandName(result.response_text, brand.name)}
                            </div>
                          </div>
                          {result.mention_context && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Mention Context
                              </p>
                              <p className="text-sm text-slate-700 bg-amber-50 rounded-lg p-3">
                                {result.mention_context}
                              </p>
                            </div>
                          )}
                          {result.description_text && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Brand Description
                              </p>
                              <p className="text-sm text-slate-700">{result.description_text}</p>
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-slate-500">
                            <span>Representation: {result.representation_score}/3</span>
                            {result.response_time_ms && <span>Response: {result.response_time_ms}ms</span>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Brand Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brand Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: Package, label: 'Category', value: brand.category },
                  { icon: Globe, label: 'Website', value: brand.domain, link: true },
                  { icon: DollarSign, label: 'Price Tier', value: brand.price_tier },
                  { icon: Users, label: 'Target Age', value: brand.target_age_range },
                ].filter(item => item.value).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-500 w-24">{item.label}</span>
                      {item.link ? (
                        <a href={`https://${item.value}`} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          {item.value}<ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-slate-900">{item.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Positioning & Keywords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {brand.positioning && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Positioning</p>
                  <p className="text-sm text-slate-700">{brand.positioning}</p>
                </div>
              )}
              {brand.target_keywords && brand.target_keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.target_keywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs border-slate-200">
                        <Tag className="w-3 h-3 mr-1" />{kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {brand.competitors && brand.competitors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Competitors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.competitors.map((comp) => (
                      <Badge key={comp} variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                        <Swords className="w-3 h-3 mr-1" />{comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {score && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evaluation Stats</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Evaluations</p>
                      <p className="text-lg font-bold text-slate-900">{score.evaluation_count}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Last Run</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {score.last_evaluation_date
                          ? new Date(score.last_evaluation_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function highlightBrandName(text: string, brandName: string): React.ReactNode {
  if (!brandName || !text) return text;
  const regex = new RegExp(`(${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-violet-100 text-violet-900 px-0.5 rounded">{part}</mark>
      : part
  );
}
