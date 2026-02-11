'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search, Eye, Link2, MessageSquare, Target, TrendingUp,
  AlertTriangle, CheckCircle2, XCircle, ArrowRight, Zap, BarChart3,
  Globe, Loader2, ChevronRight, Star, Award, Sparkles, Clock,
  ThumbsUp, ThumbsDown, Minus, Users, Trophy, Crown, Download, FileText,
  Share2, X, Mail
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---- Types ----

interface BrandProfile {
  name: string;
  domain: string | null;
  category: string;
  positioning: string;
  target_audience: string;
  key_products: string[];
}

interface PromptResult {
  prompt: string;
  intent: string;
  prompt_type: string;
  mentioned: boolean;
  rank: number | null;
  sentiment: string | null;
  snippet: string | null;
  model_name: string | null;
  response_text: string | null;
}

interface DiagnosisScore {
  composite: number;
  visibility: number;
  citation: number;
  representation: number;
  intent: number;
  total_prompts: number;
  mentioned_count: number;
  models_used: string[];
  per_model_scores: Record<string, number> | null;
}

interface CompetitorInfo {
  name: string;
  mention_count: number;
  avg_rank: number | null;
  sentiment: string | null;
  appeared_in_prompts: string[];
  why_mentioned: string | null;
}

interface DiagnosisResponse {
  id: string;
  brand: BrandProfile;
  score: DiagnosisScore;
  results: PromptResult[];
  insights: string[];
  recommendations: string[];
  competitors: CompetitorInfo[];
  generated_prompts_count: number;
  evaluation_time_seconds: number;
}

// Also support legacy search for existing brands
interface LegacyBrandScore {
  composite: number | null;
  visibility: number | null;
  citation: number | null;
  representation: number | null;
  intent: number | null;
  total_mentions: number | null;
  citation_rate: number | null;
}

interface LegacySearchResult {
  id: string;
  name: string;
  domain: string;
  category: string;
  score: LegacyBrandScore | null;
}

// ---- Components ----

function ScoreGrade({ score }: { score: number }) {
  if (score >= 80) return <span className="text-emerald-400 font-bold">A</span>;
  if (score >= 60) return <span className="text-green-400 font-bold">B</span>;
  if (score >= 40) return <span className="text-yellow-400 font-bold">C</span>;
  if (score >= 20) return <span className="text-orange-400 font-bold">D</span>;
  return <span className="text-red-400 font-bold">F</span>;
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

function IntentBadge({ intent }: { intent: string }) {
  const colors: Record<string, string> = {
    discovery: 'bg-blue-100 text-blue-700',
    comparison: 'bg-purple-100 text-purple-700',
    purchase: 'bg-green-100 text-green-700',
    informational: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[intent] || 'bg-slate-100 text-slate-600'}`}>
      {intent}
    </span>
  );
}

function SentimentIcon({ sentiment }: { sentiment: string | null }) {
  if (sentiment === 'positive') return <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (sentiment === 'negative') return <ThumbsDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
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

function ProBlurOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
      <Link href="/pricing" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors shadow-lg">
        <Zap className="w-4 h-4" />
        Upgrade to Pro
      </Link>
    </div>
  );
}

// ---- Progress animation messages ----
const PROGRESS_MESSAGES = [
  'Crawling website...',
  'Analyzing brand profile...',
  'Generating smart prompts...',
  'Evaluating AI responses...',
  'Calculating scores...',
  'Preparing report...',
];

export default function AuditPage() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'domain' | 'brand'>('domain');
  const [loading, setLoading] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [legacyResult, setLegacyResult] = useState<LegacySearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prompts' | 'competitors'>('overview');
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [isPro, setIsPro] = useState(false);

  const [showCustomPrompts, setShowCustomPrompts] = useState(false);
  const [customPromptsText, setCustomPromptsText] = useState('');
  const [shareToast, setShareToast] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Show email banner 5s after diagnosis completes
  useEffect(() => {
    if (!diagnosis) return;
    const alreadySubscribed = localStorage.getItem('luminos_subscribed') === 'true';
    if (alreadySubscribed) return;
    const timer = setTimeout(() => setShowEmailBanner(true), 5000);
    return () => clearTimeout(timer);
  }, [diagnosis]);

  const handleShare = useCallback(() => {
    if (!diagnosis) return;
    const url = `${window.location.origin}/report/${diagnosis.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }, [diagnosis]);

  const handleSubscribe = useCallback(async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    setEmailSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      if (res.ok) {
        setEmailStatus('success');
        localStorage.setItem('luminos_subscribed', 'true');
        setTimeout(() => setShowEmailBanner(false), 2000);
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    } finally {
      setEmailSubmitting(false);
    }
  }, [emailInput]);

  // Popular brands for quick access
  const popularBrands = [
    "Carter's", 'Zara Kids', 'H&M Kids', 'Gap Kids', 'Hanna Andersson',
    'Primary', 'Tea Collection', 'Old Navy Kids'
  ];

  async function handleDiagnosis() {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setDiagnosis(null);
    setLegacyResult(null);
    setProgressIdx(0);

    // Progress animation
    const interval = setInterval(() => {
      setProgressIdx(prev => Math.min(prev + 1, PROGRESS_MESSAGES.length - 1));
    }, 5000);

    try {
      const body: Record<string, unknown> = {};
      if (mode === 'domain') {
        body.domain = input.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      } else {
        body.brand_name = input.trim();
      }

      // Add custom prompts if provided
      if (customPromptsText.trim()) {
        const customPrompts = customPromptsText
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
          .slice(0, 5);
        if (customPrompts.length > 0) {
          body.custom_prompts = customPrompts;
        }
      }

      // Default to free tier
      body.pro = false;

      const res = await fetch(`${API_URL}/api/v1/diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Diagnosis failed (${res.status})`);
      }

      const data: DiagnosisResponse = await res.json();
      setDiagnosis(data);
      setIsPro(data.score.models_used && data.score.models_used.length > 1);
      setActiveTab('overview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Diagnosis failed';
      setError(message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  async function handleQuickSearch(brandName: string) {
    setInput(brandName);
    setMode('brand');

    // First try existing database
    setLoading(true);
    setError(null);
    setDiagnosis(null);
    setLegacyResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/brands/search?q=${encodeURIComponent(brandName)}&workspace_id=ws-demo-001`);
      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0 && data.results[0].score) {
          setLegacyResult(data.results[0]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to live diagnosis
    }

    // If not in DB, run live diagnosis
    setLoading(false);
    setMode('brand');
    // Auto-trigger diagnosis
    setInput(brandName);
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
          Enter your website or brand name. We&apos;ll crawl your site, generate tailored prompts,
          and test how AI platforms see your brand — in under 60 seconds.
        </p>
      </div>

      {/* Input Card */}
      <Card className="border-2 border-violet-100 shadow-lg">
        <CardContent className="p-6 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('domain')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'domain' ? 'bg-violet-100 text-violet-700 border border-violet-300' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-1.5" />
              Website Domain
            </button>
            <button
              onClick={() => setMode('brand')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'brand' ? 'bg-violet-100 text-violet-700 border border-violet-300' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 inline mr-1.5" />
              Brand Name
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDiagnosis()}
                placeholder={mode === 'domain' ? 'e.g., carters.com or hannaandersson.com' : "e.g., Carter's, Zara Kids"}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
              />
            </div>
            <Button
              onClick={handleDiagnosis}
              disabled={loading || !input.trim()}
              className="px-8 py-4 text-lg bg-violet-600 hover:bg-violet-700 rounded-xl h-auto"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Diagnose'}
            </Button>
          </div>

          {/* Quick Access */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-400 py-1">Quick audit:</span>
            {popularBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleQuickSearch(brand)}
                className="text-sm px-3 py-1 rounded-full bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-700 border border-slate-200 hover:border-violet-300 transition-all"
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Advanced: Custom Prompts */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowCustomPrompts(!showCustomPrompts)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showCustomPrompts ? 'rotate-90' : ''}`} />
              Advanced: Custom Prompts
            </button>
            {showCustomPrompts && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-slate-400">
                  Add up to 5 custom search queries (one per line) to include in the diagnosis.
                </p>
                <textarea
                  value={customPromptsText}
                  onChange={(e) => setCustomPromptsText(e.target.value)}
                  placeholder={"best organic baby clothing brands\nwhere to buy affordable kids pajamas\nis Carter's better than Hanna Andersson"}
                  rows={4}
                  className="w-full px-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
                />
                <p className="text-xs text-slate-400">
                  {customPromptsText.split('\n').filter(l => l.trim()).length}/5 custom prompts
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="border-violet-200">
          <CardContent className="p-8 text-center space-y-6">
            <Loader2 className="w-12 h-12 text-violet-600 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{PROGRESS_MESSAGES[progressIdx]}</p>
              <p className="text-sm text-slate-500 mt-2">
                Generating tailored prompts and evaluating across multiple AI platforms...
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 max-w-xs mx-auto">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
            <p className="text-lg text-orange-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Legacy Result (existing brand in DB) */}
      {legacyResult && legacyResult.score && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{legacyResult.name}</h2>
                  <p className="text-violet-200 mt-1">{legacyResult.category}</p>
                  <p className="text-violet-300 text-sm mt-1">From our database of 30 evaluated brands</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold">{legacyResult.score.composite}</div>
                  <div className="text-violet-200 text-sm mt-1">AI Visibility Score</div>
                  <div className="text-2xl mt-1">
                    Grade: <ScoreGrade score={legacyResult.score.composite ?? 0} />
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-8 space-y-5">
              <ScoreBar label="Visibility" score={legacyResult.score.visibility ?? 0} icon={Eye} weight="35%" />
              <ScoreBar label="Citation" score={legacyResult.score.citation ?? 0} icon={Link2} weight="25%" />
              <ScoreBar label="Framing" score={legacyResult.score.representation ?? 0} icon={MessageSquare} weight="25%" />
              <ScoreBar label="Intent Coverage" score={legacyResult.score.intent ?? 0} icon={Target} weight="15%" />
              <div className="pt-4 border-t flex items-center justify-between text-sm text-slate-500">
                <span>Based on 120 prompts across Gemini 2.0 Flash</span>
                <span>{legacyResult.score.total_mentions ?? 0} total mentions</span>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleDiagnosis}
              variant="outline"
              className="border-violet-300 text-violet-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Run Live Diagnosis with Smart Prompts
            </Button>
          </div>
        </div>
      )}

      {/* Smart Diagnosis Result */}
      {diagnosis && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Overall Score Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
              {/* Export & Share Buttons */}
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white relative"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  {shareToast ? 'Link copied!' : 'Share Results'}
                </Button>
              </div>
              <div className="flex justify-end gap-2 mb-4">
                {isPro ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_URL}/api/v1/diagnosis/${diagnosis.id}/report`);
                          if (!res.ok) throw new Error('Failed to fetch report');
                          const data = await res.json();
                          const markdown = data.report || data.markdown || data.content || JSON.stringify(data, null, 2);
                          const blob = new Blob([markdown], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `luminos-${diagnosis.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.md`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Export report failed:', err);
                        }
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Export Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_URL}/api/v1/diagnosis/${diagnosis.id}/export`);
                          if (!res.ok) throw new Error('Failed to fetch data');
                          const data = await res.json();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `luminos-${diagnosis.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-data.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Export data failed:', err);
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Export Raw Data
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-white/20 text-white/50 cursor-not-allowed"
                    disabled
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Export — Pro Only
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{diagnosis.brand.name}</h2>
                  <p className="text-violet-200 mt-1">{diagnosis.brand.category}</p>
                  {diagnosis.brand.domain && (
                    <div className="flex items-center gap-1 mt-2 text-violet-200">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{diagnosis.brand.domain}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-violet-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{diagnosis.evaluation_time_seconds}s · {diagnosis.generated_prompts_count} smart prompts</span>
                  </div>
                  {diagnosis.score.models_used && diagnosis.score.models_used.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      {diagnosis.score.models_used.map((m) => (
                        <span key={m} className="text-xs px-2 py-1 rounded-full bg-white/20 text-white font-medium">
                          {m === 'gemini' ? 'Gemini ✓' : m === 'grok' ? 'Grok ✓' : m === 'openai' ? 'OpenAI ✓' : `${m} ✓`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold">{diagnosis.score.composite}</div>
                  <div className="text-violet-200 text-sm mt-1">AI Visibility Score</div>
                  <div className="text-2xl mt-1">
                    Grade: <ScoreGrade score={diagnosis.score.composite} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Switch */}
            <div className="border-b flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === 'overview' ? 'border-b-2 border-violet-600 text-violet-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === 'prompts' ? 'border-b-2 border-violet-600 text-violet-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Prompt Results ({diagnosis.results.length})
              </button>
              {diagnosis.competitors && diagnosis.competitors.length > 0 && (
                <button
                  onClick={() => setActiveTab('competitors')}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === 'competitors' ? 'border-b-2 border-orange-500 text-orange-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Competitors ({diagnosis.competitors.length})
                </button>
              )}
            </div>

            {activeTab === 'overview' && (
              <CardContent className="p-8 space-y-5">
                <h3 className="font-semibold text-slate-900 text-lg">Score Breakdown</h3>
                <ScoreBar label="Visibility" score={diagnosis.score.visibility} icon={Eye} weight="35%" />
                <ScoreBar label="Citation" score={diagnosis.score.citation} icon={Link2} weight="25%" />
                <ScoreBar label="Framing" score={diagnosis.score.representation} icon={MessageSquare} weight="25%" />
                <ScoreBar label="Intent Coverage" score={diagnosis.score.intent} icon={Target} weight="15%" />
                {diagnosis.score.per_model_scores && Object.keys(diagnosis.score.per_model_scores).length > 1 && (() => {
                  const scores = diagnosis.score.per_model_scores!;
                  const models = Object.keys(scores);
                  const maxScore = Math.max(...Object.values(scores));
                  const minScore = Math.min(...Object.values(scores));
                  const gap = maxScore - minScore;
                  const bestModel = models.find(m => scores[m] === maxScore) || '';
                  const worstModel = models.find(m => scores[m] === minScore) || '';
                  const MODEL_COLORS: Record<string, string> = {
                    gemini: 'bg-blue-500', openai: 'bg-green-500', grok: 'bg-orange-500',
                  };
                  const MODEL_LABELS: Record<string, string> = {
                    gemini: 'Google Gemini', openai: 'OpenAI GPT', grok: 'xAI Grok',
                  };
                  // Per-model sentiment from results
                  const modelSentiment: Record<string, { pos: number; neu: number; neg: number; none: number }> = {};
                  const modelGeneric: Record<string, { mentioned: number; total: number }> = {};
                  models.forEach(m => {
                    modelSentiment[m] = { pos: 0, neu: 0, neg: 0, none: 0 };
                    modelGeneric[m] = { mentioned: 0, total: 0 };
                  });
                  diagnosis.results.forEach(r => {
                    if (r.model_name && modelSentiment[r.model_name]) {
                      if (r.mentioned) {
                        if (r.sentiment === 'positive') modelSentiment[r.model_name].pos++;
                        else if (r.sentiment === 'neutral') modelSentiment[r.model_name].neu++;
                        else if (r.sentiment === 'negative') modelSentiment[r.model_name].neg++;
                        else modelSentiment[r.model_name].none++;
                      }
                      if (r.prompt_type === 'generic') {
                        modelGeneric[r.model_name].total++;
                        if (r.mentioned) modelGeneric[r.model_name].mentioned++;
                      }
                    }
                  });

                  return (
                    <div className="pt-4 border-t space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Platform Comparison
                        </h4>
                        {gap >= 10 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                            {gap}pp platform gap
                          </span>
                        )}
                      </div>

                      {/* Bar Chart */}
                      <div className="space-y-3">
                        {models.sort((a, b) => scores[b] - scores[a]).map(model => (
                          <div key={model} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-700">{MODEL_LABELS[model] || model}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{scores[model]}%</span>
                                {model === bestModel && models.length > 1 && (
                                  <span className="text-xs text-green-600">★ Best</span>
                                )}
                                {model === worstModel && models.length > 1 && gap >= 5 && (
                                  <span className="text-xs text-red-500">⚠ Weakest</span>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                              <div
                                className={`${MODEL_COLORS[model] || 'bg-slate-500'} h-3 rounded-full transition-all duration-500`}
                                style={{ width: `${scores[model]}%` }}
                              />
                            </div>
                            {/* Mini stats row */}
                            <div className="flex gap-3 text-xs text-slate-500">
                              {modelGeneric[model] && modelGeneric[model].total > 0 && (
                                <span>Generic: {Math.round((modelGeneric[model].mentioned / modelGeneric[model].total) * 100)}%</span>
                              )}
                              {modelSentiment[model] && (
                                <span>
                                  👍{modelSentiment[model].pos} 😐{modelSentiment[model].neu} 👎{modelSentiment[model].neg}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Insight */}
                      {gap >= 5 && (
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800">
                          <strong>💡 Insight:</strong> Your brand is {gap}pp more visible on {MODEL_LABELS[bestModel] || bestModel} than {MODEL_LABELS[worstModel] || worstModel}.
                          {worstModel === 'gemini' && ' Gemini (Google AI) is the hardest platform to crack — improving here has the highest strategic value.'}
                          {worstModel === 'openai' && ' Focus on creating authoritative content that ChatGPT can reference.'}
                          {worstModel === 'grok' && ' Grok is typically the most brand-friendly — a low score here suggests broader visibility issues.'}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="pt-4 border-t flex items-center justify-between text-sm text-slate-500">
                  <span>{diagnosis.score.mentioned_count}/{diagnosis.score.total_prompts} prompts mentioned brand</span>
                  <span>
                    {diagnosis.score.models_used && diagnosis.score.models_used.length > 1
                      ? `Evaluated across ${diagnosis.score.models_used.length} AI platforms`
                      : 'Powered by Gemini 2.0 Flash'}
                  </span>
                </div>
              </CardContent>
            )}

            {activeTab === 'prompts' && (
              <CardContent className="p-6 space-y-6">
                {/* Generic Prompts Section */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Generic Discovery Prompts
                    <span className="text-xs text-slate-400 font-normal">(no brand name — tests true visibility)</span>
                  </h4>
                  <div className="space-y-2">
                    {diagnosis.results.filter(r => r.prompt_type === 'generic').map((r, i) => {
                      const globalIdx = diagnosis.results.indexOf(r);
                      const isExpanded = expandedResults.has(globalIdx);
                      return (
                        <div key={globalIdx} className={`rounded-lg border ${
                          r.mentioned ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div 
                            className="flex items-start gap-3 p-3 cursor-pointer"
                            onClick={() => {
                              const next = new Set(expandedResults);
                              isExpanded ? next.delete(globalIdx) : next.add(globalIdx);
                              setExpandedResults(next);
                            }}
                          >
                            <div className="mt-1">
                              {r.mentioned
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                : <XCircle className="w-4 h-4 text-slate-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-800">{r.prompt}</span>
                                <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <IntentBadge intent={r.intent} />
                                {r.model_name && <ModelBadge model={r.model_name} />}
                                {r.mentioned && r.rank && <span className="text-xs text-slate-500">Rank #{r.rank}</span>}
                                {r.mentioned && r.sentiment && <SentimentIcon sentiment={r.sentiment} />}
                              </div>
                            </div>
                          </div>
                          {isExpanded && r.response_text && (
                            isPro ? (
                              <div className="px-10 pb-3">
                                <div className="bg-white rounded border p-3 text-xs text-slate-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                  {r.response_text}
                                </div>
                              </div>
                            ) : (
                              <div className="px-10 pb-3 relative">
                                <div className="bg-white rounded border p-3 text-xs text-slate-600 whitespace-pre-wrap max-h-20 overflow-hidden select-none" style={{ filter: 'blur(4px)' }}>
                                  {r.response_text}
                                </div>
                                <ProBlurOverlay />
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Brand-Specific Prompts Section */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Brand-Specific Prompts
                    <span className="text-xs text-slate-400 font-normal">(contains brand name — tests sentiment &amp; framing)</span>
                  </h4>
                  <div className="space-y-2">
                    {diagnosis.results.filter(r => r.prompt_type === 'brand_specific').map((r, i) => {
                      const globalIdx = diagnosis.results.indexOf(r);
                      const isExpanded = expandedResults.has(globalIdx);
                      return (
                        <div key={globalIdx} className={`rounded-lg border ${
                          r.mentioned ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div 
                            className="flex items-start gap-3 p-3 cursor-pointer"
                            onClick={() => {
                              const next = new Set(expandedResults);
                              isExpanded ? next.delete(globalIdx) : next.add(globalIdx);
                              setExpandedResults(next);
                            }}
                          >
                            <div className="mt-1">
                              {r.mentioned
                                ? <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                : <XCircle className="w-4 h-4 text-slate-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-800">{r.prompt}</span>
                                <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <IntentBadge intent={r.intent} />
                                {r.model_name && <ModelBadge model={r.model_name} />}
                                {r.mentioned && r.rank && <span className="text-xs text-slate-500">Rank #{r.rank}</span>}
                                {r.mentioned && r.sentiment && <SentimentIcon sentiment={r.sentiment} />}
                              </div>
                            </div>
                          </div>
                          {isExpanded && r.response_text && (
                            isPro ? (
                              <div className="px-10 pb-3">
                                <div className="bg-white rounded border p-3 text-xs text-slate-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                  {r.response_text}
                                </div>
                              </div>
                            ) : (
                              <div className="px-10 pb-3 relative">
                                <div className="bg-white rounded border p-3 text-xs text-slate-600 whitespace-pre-wrap max-h-20 overflow-hidden select-none" style={{ filter: 'blur(4px)' }}>
                                  {r.response_text}
                                </div>
                                <ProBlurOverlay />
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            )}

            {activeTab === 'competitors' && diagnosis.competitors && (
              <CardContent className="p-6 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 text-sm">Competitor Discovery</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        These brands were mentioned by AI when users search for your category.
                        They occupy the visibility space you&apos;re competing for.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {diagnosis.competitors.map((comp, i) => {
                    const isLocked = !isPro && i >= 3;
                    return (
                      <div key={i} className="relative">
                        <div className={`flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-orange-200 transition-colors ${isLocked ? 'select-none' : ''}`} style={isLocked ? { filter: 'blur(4px)' } : undefined}>
                          {/* Rank badge */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-slate-100 text-slate-600' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {i === 0 ? <Crown className="w-4 h-4" /> :
                             <span className="text-xs font-bold">{i + 1}</span>}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-900">{comp.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                comp.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                                comp.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {comp.sentiment || 'neutral'}
                              </span>
                            </div>

                            {comp.why_mentioned && (
                              <p className="text-sm text-slate-600 mt-1">{comp.why_mentioned}</p>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>Mentioned {comp.mention_count}x</span>
                              {comp.avg_rank && <span>Avg rank #{Math.round(comp.avg_rank)}</span>}
                            </div>
                          </div>
                        </div>
                        {isLocked && i === 3 && <ProBlurOverlay />}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-violet-900 text-sm mb-2">💡 What This Means</h4>
                  <p className="text-xs text-violet-700">
                    When potential customers ask AI about your category, these are the brands AI recommends instead of you.
                    Study their content strategy, structured data, and online presence to understand why AI favors them — then optimize your brand to compete.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Brand Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-5 h-5 text-slate-500" />
                Detected Brand Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Category:</span>
                  <span className="ml-2 font-medium">{diagnosis.brand.category}</span>
                </div>
                <div>
                  <span className="text-slate-500">Target:</span>
                  <span className="ml-2 font-medium">{diagnosis.brand.target_audience}</span>
                </div>
              </div>
              {diagnosis.brand.positioning && (
                <p className="text-sm text-slate-600 italic">&ldquo;{diagnosis.brand.positioning}&rdquo;</p>
              )}
              {diagnosis.brand.key_products.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {diagnosis.brand.key_products.map((p, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{p}</span>
                  ))}
                </div>
              )}
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
              {diagnosis.insights.map((text, i) => {
                const isGood = text.toLowerCase().includes('strong') || text.toLowerCase().includes('excellent');
                const isBad = text.toLowerCase().includes('low') || text.toLowerCase().includes('zero') || text.toLowerCase().includes('limited');
                const isLocked = !isPro && i >= 2;
                return (
                  <div key={i} className="relative">
                    <div className={`flex items-start gap-3 p-3 rounded-lg ${
                      isGood ? 'bg-emerald-50' : isBad ? 'bg-red-50' : 'bg-yellow-50'
                    } ${isLocked ? 'select-none' : ''}`} style={isLocked ? { filter: 'blur(4px)' } : undefined}>
                      {isGood ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> :
                       isBad ? <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /> :
                       <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                      <span className={`text-sm ${
                        isGood ? 'text-emerald-800' : isBad ? 'text-red-800' : 'text-yellow-800'
                      }`}>{text}</span>
                    </div>
                    {isLocked && i === 2 && <ProBlurOverlay />}
                  </div>
                );
              })}
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
                {diagnosis.recommendations.map((rec, i) => {
                  const isLocked = !isPro && i >= 1;
                  return (
                    <div key={i} className="relative">
                      <div className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg ${isLocked ? 'select-none' : ''}`} style={isLocked ? { filter: 'blur(4px)' } : undefined}>
                        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-violet-700">{i + 1}</span>
                        </div>
                        <span className="text-sm text-slate-700">{rec}</span>
                      </div>
                      {isLocked && i === 1 && <ProBlurOverlay />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Banner */}
          {!isPro && (
            <Card className="border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 overflow-hidden">
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-4xl">🚀</div>
                <h3 className="text-xl font-bold text-slate-900">Unlock Full AI Visibility Report</h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                  Get 3-platform analysis, full competitor data, all insights &amp; recommendations, export reports, and more.
                </p>
                <div className="pt-2">
                  <Link href="/pricing">
                    <Button className="bg-violet-600 hover:bg-violet-700 px-8 py-3 h-auto text-base font-semibold">
                      Upgrade to Pro — $49/mo <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA for Pro users */}
          {isPro && (
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
                  <Link href="/pricing">
                    <Button variant="outline" className="px-6 py-3 h-auto text-base border-violet-300 text-violet-700 hover:bg-violet-50">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bottom Info — show when no results */}
      {!loading && !diagnosis && !legacyResult && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="text-center p-6">
            <Globe className="w-8 h-8 text-violet-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Smart Crawling</h3>
            <p className="text-sm text-slate-500">We crawl your website to understand your brand, products, and positioning</p>
          </Card>
          <Card className="text-center p-6">
            <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">AI-Generated Prompts</h3>
            <p className="text-sm text-slate-500">Tailored search prompts based on your brand&apos;s category and products</p>
          </Card>
          <Card className="text-center p-6">
            <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Real-Time Scoring</h3>
            <p className="text-sm text-slate-500">Live evaluation against Gemini AI with visibility, citation, and intent scores</p>
          </Card>
        </div>
      )}

      {/* Email Subscribe Banner */}
      {showEmailBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 relative">
              <button
                onClick={() => setShowEmailBanner(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-slate-900 text-sm">Get weekly AI visibility insights</p>
                  {emailStatus === 'success' ? (
                    <p className="text-sm text-emerald-600 font-medium">✓ Subscribed! Check your inbox.</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                        placeholder="you@company.com"
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-200 outline-none"
                      />
                      <button
                        onClick={handleSubscribe}
                        disabled={emailSubmitting}
                        className="px-4 py-1.5 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
                      >
                        {emailSubmitting ? '...' : 'Subscribe'}
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">Join 500+ brands monitoring their AI presence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
