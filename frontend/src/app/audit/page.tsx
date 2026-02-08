'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search, Eye, Link2, MessageSquare, Target, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, XCircle, ArrowRight, Zap, BarChart3,
  Globe, Loader2, ChevronRight, Star, Shield, Award, Sparkles
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BrandScore {
  composite: number | null;
  visibility: number | null;
  citation: number | null;
  representation: number | null;
  intent: number | null;
  total_mentions: number | null;
  citation_rate: number | null;
}

interface SearchResult {
  id: string;
  name: string;
  domain: string;
  category: string;
  score: BrandScore | null;
}

function ScoreGrade({ score }: { score: number }) {
  if (score >= 80) return <span className="text-emerald-600 font-bold">A</span>;
  if (score >= 60) return <span className="text-green-600 font-bold">B</span>;
  if (score >= 40) return <span className="text-yellow-600 font-bold">C</span>;
  if (score >= 20) return <span className="text-orange-600 font-bold">D</span>;
  return <span className="text-red-600 font-bold">F</span>;
}

function ScoreBar({ label, score, icon: Icon, weight }: { label: string; score: number; icon: React.ElementType; weight: string }) {
  const color = score >= 60 ? 'bg-emerald-500' : score >= 40 ? 'bg-yellow-500' : score >= 20 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-xs text-slate-400">{weight}</span>
        </div>
        <span className="text-lg font-bold text-slate-900">{score}<span className="text-sm text-slate-400">/100</span></span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function getInsights(score: BrandScore): { type: 'success' | 'warning' | 'danger'; text: string }[] {
  const insights: { type: 'success' | 'warning' | 'danger'; text: string }[] = [];
  
  if ((score.visibility ?? 0) >= 70) {
    insights.push({ type: 'success', text: 'Strong AI visibility — your brand is frequently mentioned in AI responses' });
  } else if ((score.visibility ?? 0) >= 30) {
    insights.push({ type: 'warning', text: 'Moderate AI visibility — your brand appears in some AI responses but not consistently' });
  } else {
    insights.push({ type: 'danger', text: 'Low AI visibility — AI models rarely mention your brand when users ask relevant questions' });
  }
  
  if ((score.citation ?? 0) < 10) {
    insights.push({ type: 'danger', text: 'Almost zero citations — AI never links back to your website. Adding structured data and authoritative content can help.' });
  }
  
  if ((score.intent ?? 0) >= 80) {
    insights.push({ type: 'success', text: 'Excellent intent coverage — your brand appears across diverse search intents' });
  } else if ((score.intent ?? 0) < 40) {
    insights.push({ type: 'warning', text: 'Limited intent coverage — your brand only appears for specific types of queries' });
  }
  
  if ((score.representation ?? 0) < 20) {
    insights.push({ type: 'warning', text: 'When mentioned, AI provides minimal context about your brand. Enriching your online presence can improve this.' });
  }
  
  return insights;
}

function getRecommendations(score: BrandScore): string[] {
  const recs: string[] = [];
  if ((score.visibility ?? 0) < 50) {
    recs.push('Create comprehensive, factual content about your brand that AI models can learn from');
    recs.push('Build authoritative backlinks from industry publications and review sites');
  }
  if ((score.citation ?? 0) < 10) {
    recs.push('Add Schema.org structured data (Product, Organization, FAQ) to your website');
    recs.push('Publish detailed product comparisons and buying guides');
  }
  if ((score.representation ?? 0) < 30) {
    recs.push('Ensure your brand description, mission, and unique value proposition are clearly stated across the web');
    recs.push('Get featured in industry roundups and "best of" articles');
  }
  if ((score.intent ?? 0) < 60) {
    recs.push('Create content targeting different user intents: informational, comparison, and purchase');
  }
  if (recs.length === 0) {
    recs.push('Continue maintaining high-quality content and monitor for changes in AI visibility');
    recs.push('Consider expanding to track visibility across multiple AI platforms (ChatGPT, Claude, Perplexity)');
  }
  return recs.slice(0, 4);
}

export default function AuditPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popular brands for quick access
  const popularBrands = [
    'Carter\'s', 'Zara Kids', 'H&M Kids', 'Gap Kids', 'Hanna Andersson',
    'Primary', 'Tea Collection', 'Old Navy Kids'
  ];

  async function handleSearch(searchQuery?: string) {
    const q = searchQuery || query;
    if (!q.trim()) return;
    
    setSearching(true);
    setError(null);
    setResult(null);
    setSuggestions([]);
    
    try {
      const res = await fetch(`${API_URL}/api/v1/brands/search?q=${encodeURIComponent(q)}&workspace_id=ws-demo-001`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      
      if (data.results.length === 0) {
        setShowResults(true);
        setError(`"${q}" not found in our database yet. We currently track 30 kids fashion brands.`);
      } else if (data.results.length === 1) {
        setResult(data.results[0]);
        setShowResults(true);
      } else {
        setSuggestions(data.results);
        setShowResults(true);
      }
    } catch {
      setError('Failed to connect to the API. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function selectBrand(brand: SearchResult) {
    setResult(brand);
    setSuggestions([]);
    setQuery(brand.name);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-medium text-violet-700">Free AI Visibility Audit</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900">
          Is Your Brand Visible to AI?
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Find out how ChatGPT, Gemini, and other AI platforms see your brand.
          Get an instant diagnostic report with actionable recommendations.
        </p>
      </div>

      {/* Search Box */}
      <Card className="border-2 border-violet-100 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter a brand name (e.g., Carter's, Zara Kids)..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={searching || !query.trim()}
              className="px-8 py-4 text-lg bg-violet-600 hover:bg-violet-700 rounded-xl h-auto"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Audit'}
            </Button>
          </div>
          
          {/* Quick Access */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-400 py-1">Try:</span>
            {popularBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => { setQuery(brand); handleSearch(brand); }}
                className="text-sm px-3 py-1 rounded-full bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-700 border border-slate-200 hover:border-violet-300 transition-all"
              >
                {brand}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Multiple Results */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Multiple brands found — select one:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectBrand(s)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-violet-50 border border-slate-100 hover:border-violet-200 transition-all"
              >
                <div className="text-left">
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-sm text-slate-500">{s.category}</div>
                </div>
                <div className="flex items-center gap-3">
                  {s.score && (
                    <span className="text-2xl font-bold text-violet-600">{s.score.composite}</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && showResults && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
            <p className="text-lg text-orange-800">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-orange-600">Want us to audit your brand?</p>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Request Custom Audit <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && result.score && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Overall Score */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{result.name}</h2>
                  <p className="text-violet-200 mt-1">{result.category}</p>
                  {result.domain && (
                    <div className="flex items-center gap-1 mt-2 text-violet-200">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{result.domain}</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold">{result.score.composite}</div>
                  <div className="text-violet-200 text-sm mt-1">AI Visibility Score</div>
                  <div className="text-2xl mt-1">
                    Grade: <ScoreGrade score={result.score.composite ?? 0} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Score Dimensions */}
            <CardContent className="p-8 space-y-5">
              <h3 className="font-semibold text-slate-900 text-lg">Score Breakdown</h3>
              <ScoreBar label="Visibility" score={result.score.visibility ?? 0} icon={Eye} weight="35%" />
              <ScoreBar label="Citation" score={result.score.citation ?? 0} icon={Link2} weight="25%" />
              <ScoreBar label="Framing" score={result.score.representation ?? 0} icon={MessageSquare} weight="25%" />
              <ScoreBar label="Intent Coverage" score={result.score.intent ?? 0} icon={Target} weight="15%" />
              
              <div className="pt-4 border-t flex items-center justify-between text-sm text-slate-500">
                <span>Based on 120 prompts across Gemini 2.0 Flash</span>
                <span>{result.score.total_mentions ?? 0} total mentions</span>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getInsights(result.score).map((insight, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                  insight.type === 'success' ? 'bg-emerald-50' :
                  insight.type === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  {insight.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> :
                   insight.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /> :
                   <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <span className={`text-sm ${
                    insight.type === 'success' ? 'text-emerald-800' :
                    insight.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
                  }`}>{insight.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-violet-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecommendations(result.score).map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-violet-700">{i + 1}</span>
                    </div>
                    <span className="text-sm text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
            <CardContent className="p-8 text-center space-y-4">
              <Award className="w-12 h-12 text-violet-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Want to Improve Your Score?</h3>
              <p className="text-slate-600 max-w-lg mx-auto">
                Our team can help optimize your brand&apos;s AI visibility across all major platforms.
                Get a detailed action plan and ongoing monitoring.
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button className="bg-violet-600 hover:bg-violet-700 px-6 py-3 h-auto text-base">
                  Get Full Report <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="px-6 py-3 h-auto text-base border-violet-300 text-violet-700 hover:bg-violet-50">
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No score result */}
      {result && !result.score && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center space-y-4">
            <BarChart3 className="w-12 h-12 text-orange-500 mx-auto" />
            <h3 className="text-lg font-semibold text-orange-900">Brand found but not yet evaluated</h3>
            <p className="text-orange-700">{result.name} is in our database but hasn&apos;t been scored yet.</p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Request Evaluation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bottom Info - show when no results */}
      {!showResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="text-center p-6">
            <Eye className="w-8 h-8 text-violet-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Visibility Score</h3>
            <p className="text-sm text-slate-500">How often AI mentions your brand when users ask relevant questions</p>
          </Card>
          <Card className="text-center p-6">
            <Link2 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Citation Score</h3>
            <p className="text-sm text-slate-500">Whether AI links back to your website as a source</p>
          </Card>
          <Card className="text-center p-6">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Intent Coverage</h3>
            <p className="text-sm text-slate-500">How many types of user questions trigger your brand mention</p>
          </Card>
        </div>
      )}
    </div>
  );
}
