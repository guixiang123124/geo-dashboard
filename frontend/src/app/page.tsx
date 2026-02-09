'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  ArrowRight, BarChart3, Eye, Globe, Zap, Shield, TrendingUp,
  Star, CheckCircle2, Users, Search, Clock, Sparkles, Target,
  MessageSquare, Link2, BookOpen, Lightbulb, Layers, Brain,
  LineChart, Award, ArrowUpRight, ChevronRight, Play,
  FileText, Compass, ShoppingCart, Info, GitCompare,
  Menu, X, ChevronDown, LayoutDashboard, Crosshair,
  Building2, GraduationCap, BookMarked
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

/* ── Animate on scroll ── */
function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 text-sm text-violet-700 mb-4">
      {children}
    </div>
  );
}

function BrandInput({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="max-w-xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Enter your brand or domain (e.g., carters.com)"
            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
          />
        </div>
        <Button type="submit" size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-8 h-auto rounded-xl">
          Diagnose Free <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  function go(v: string) {
    router.push(v.trim() ? `/audit?q=${encodeURIComponent(v.trim())}` : '/audit');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─── S1: Hero ─── */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <SectionTag><Zap className="w-4 h-4" /> {t('landing.tagline')}</SectionTag>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              {t('landing.hero.title1')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                {t('landing.hero.title2')}
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              {t('landing.hero.desc')}
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <BrandInput onSubmit={go} />
          </FadeIn>
          <FadeIn delay={400}>
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-8">
              {[['10s', t('landing.hero.diagnosisTime')], ['10+', t('landing.hero.aiPrompts')], ['4', t('landing.hero.aiPlatforms')]].map(([num, label]) => (
                <div key={label as string}>
                  <div className="text-3xl font-bold text-violet-600">{num}</div>
                  <div className="text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S2: How It Works ─── */}
      <section id="how" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{t('landing.how.title')}</h2>
            <p className="text-center text-slate-600 mb-16">{t('landing.how.subtitle')}</p>
          </FadeIn>
          <div className="space-y-8">
            {[
              { step: '1', icon: Globe, title: 'Enter Your Domain or Brand', desc: 'Type your website URL or brand name. We auto-detect your industry, products, and positioning.' },
              { step: '2', icon: Brain, title: 'AI Crawls & Generates Smart Prompts', desc: 'We crawl your site and use AI to generate 10+ tailored search prompts that real consumers would ask.' },
              { step: '3', icon: Layers, title: 'Real-Time Evaluation Across AI Platforms', desc: 'Each prompt is tested against multiple AI platforms — Gemini, ChatGPT, Grok, and Perplexity.' },
              { step: '4', icon: BarChart3, title: 'Get Score + Recommendations in 10 Seconds', desc: 'Receive a comprehensive GEO Score with visibility, citation, framing, and intent metrics — plus actionable next steps.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <FadeIn key={step} delay={i * 100}>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">{title}</h3>
                    <p className="text-slate-600">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── S3: Dashboard Overview ─── */}
      <section id="dashboard" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag><BarChart3 className="w-4 h-4" /> {t('landing.dashboard.tag')}</SectionTag>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.dashboard.title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.dashboard.desc')}</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
              {/* Mock dashboard header */}
              <div className="bg-slate-900 px-6 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-sm text-slate-400">luminos.app/dashboard</span>
              </div>
              <div className="p-8">
                {/* Stat cards row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Brands Tracked', value: '12', icon: Users, change: '+3 this month' },
                    { label: 'Avg GEO Score', value: '67', icon: BarChart3, change: '+5 pts' },
                    { label: 'AI Mentions', value: '148', icon: MessageSquare, change: '↑ 23%' },
                    { label: 'Citation Rate', value: '34%', icon: Link2, change: '↑ 8%' },
                  ].map(({ label, value, icon: Icon, change }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-emerald-600 font-medium">{change}</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{value}</div>
                      <div className="text-xs text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
                {/* SOV bar chart mockup */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h4 className="font-semibold text-slate-900 text-sm mb-4">📊 Share of Voice</h4>
                    <div className="space-y-3">
                      {[
                        { brand: 'Your Brand', pct: 32, color: 'bg-violet-500' },
                        { brand: 'Competitor A', pct: 28, color: 'bg-indigo-400' },
                        { brand: 'Competitor B', pct: 22, color: 'bg-blue-400' },
                        { brand: 'Competitor C', pct: 18, color: 'bg-slate-300' },
                      ].map(({ brand, pct, color }) => (
                        <div key={brand} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">{brand}</span>
                            <span className="font-medium text-slate-900">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h4 className="font-semibold text-slate-900 text-sm mb-4">📈 Trend (8 Weeks)</h4>
                    <div className="flex items-end gap-2 h-32">
                      {[42, 45, 48, 52, 55, 60, 63, 67].map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-violet-400 rounded-t" style={{ height: `${v * 1.5}px` }} />
                          <span className="text-[10px] text-slate-400">W{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-violet-50 border-t border-violet-100 p-4 text-center">
                <span className="text-sm text-slate-600">Real-time data • Auto-refreshing • Multi-brand support</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S4: AI Brand Diagnosis (Free) ─── */}
      <section id="diagnosis" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag><Sparkles className="w-4 h-4" /> {t('landing.diagnosis.tag')}</SectionTag>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.diagnosis.title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.diagnosis.desc')}</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Process flow */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">What happens under the hood</h3>
                {[
                  { icon: Globe, label: 'AI crawls your website', desc: 'Extracts brand positioning, products, and key differentiators' },
                  { icon: Brain, label: 'Smart prompt generation', desc: '10+ consumer-intent prompts tailored to your industry' },
                  { icon: Zap, label: 'Real-time AI evaluation', desc: 'Tests each prompt against live AI models' },
                  { icon: Target, label: 'Four-dimensional scoring', desc: 'Visibility · Citation · Framing · Intent Coverage' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{label}</div>
                      <div className="text-sm text-slate-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Carter's demo card */}
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Carter&apos;s</h3>
                      <p className="text-violet-200 text-sm mt-1">Kids &amp; Baby Clothing · carters.com</p>
                      <div className="flex items-center gap-1 mt-2 text-violet-300 text-sm">
                        <Clock className="w-3.5 h-3.5" /> 8.2s · 10 smart prompts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold">55</div>
                      <div className="text-violet-200 text-xs mt-1">GEO Score</div>
                      <div className="text-lg mt-0.5">Grade: <span className="text-yellow-300 font-bold">C</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <ScoreBar label="Visibility" score={70} color="bg-emerald-500" />
                  <ScoreBar label="Citation" score={20} color="bg-orange-500" />
                  <ScoreBar label="Framing" score={65} color="bg-emerald-500" />
                  <ScoreBar label="Intent Coverage" score={75} color="bg-emerald-500" />
                  <div className="pt-3 border-t text-xs text-slate-400 flex justify-between">
                    <span>7/10 prompts mentioned brand</span>
                    <span>Gemini 2.0 Flash</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="text-center mt-10">
              <Link href="/audit">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-8 h-14 rounded-xl">
                  {t('landing.cta.tryFree')} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S5: Competitive Intelligence ─── */}
      <section id="compete" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag><GitCompare className="w-4 h-4" /> {t('landing.compete.tag')}</SectionTag>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.compete.title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.compete.desc')}</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <GitCompare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Head-to-Head Compare</h3>
                <p className="text-sm text-slate-600">Pick any two brands and see exactly how AI ranks them side by side across every dimension.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Category Benchmarks</h3>
                <p className="text-sm text-slate-600">See how your brand performs relative to the entire category. Radar charts, SOV analysis, and more.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Citation Gap Analysis</h3>
                <p className="text-sm text-slate-600">Discover sources cited for competitors but not for you — then close the gaps with targeted content.</p>
              </div>
            </div>
          </FadeIn>
          {/* Mini mockup */}
          <FadeIn delay={300}>
            <div className="mt-10 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md">
              <div className="bg-slate-50 border-b px-6 py-3 text-sm font-medium text-slate-700">🏆 Competitive Landscape — Kids Clothing</div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  {[
                    { name: "Carter's", score: 55, badge: '🥈' },
                    { name: 'Nike Kids', score: 72, badge: '🥇' },
                    { name: 'H&M Kids', score: 48, badge: '🥉' },
                    { name: 'Gap Kids', score: 35, badge: '' },
                  ].map(({ name, score, badge }) => (
                    <div key={name} className="space-y-2">
                      <div className="text-2xl">{badge || '—'}</div>
                      <div className="font-semibold text-slate-900">{name}</div>
                      <div className={`text-2xl font-bold ${score >= 60 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{score}</div>
                      <div className="text-xs text-slate-400">GEO Score</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S6: Smart Prompt Research ─── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag><MessageSquare className="w-4 h-4" /> {t('landing.prompts.tag')}</SectionTag>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.prompts.title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.prompts.desc')}</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Intent categories */}
              <div className="space-y-4">
                {[
                  { icon: Compass, label: 'Discovery', desc: '"What are the best kids clothing brands?"', color: 'bg-blue-100 text-blue-600', count: 4 },
                  { icon: GitCompare, label: 'Comparison', desc: '"Carter\'s vs OshKosh vs Nike Kids"', color: 'bg-purple-100 text-purple-600', count: 3 },
                  { icon: ShoppingCart, label: 'Purchase', desc: '"Where to buy affordable baby clothes?"', color: 'bg-emerald-100 text-emerald-600', count: 2 },
                  { icon: Info, label: 'Informational', desc: '"Are Carter\'s clothes good quality?"', color: 'bg-amber-100 text-amber-600', count: 1 },
                ].map(({ icon: Icon, label, desc, color, count }) => (
                  <div key={label} className="bg-white rounded-xl p-5 border border-slate-200 flex gap-4 items-start hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{label}</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{count} prompts</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 italic">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Feature highlights */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <h3 className="font-semibold text-slate-900 text-lg">🔬 Prompt Research Tool</h3>
                {[
                  'AI auto-generates 10+ prompts from your domain',
                  'Add your own custom prompts to test',
                  'See which brands AI mentions for each prompt',
                  'Intent funnel: Discovery → Consideration → Decision',
                  'Brand-Prompt coverage matrix',
                  'Trending prompts in your category',
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S7: Trend Tracking & Analytics ─── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag><TrendingUp className="w-4 h-4" /> {t('landing.trends.tag')}</SectionTag>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.trends.title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.trends.desc')}</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: LineChart, title: 'Weekly Score Trends', desc: 'Track how your GEO score evolves week over week. Spot improvements and drops instantly.', emoji: '📈' },
                { icon: TrendingUp, title: 'Movers & Shakers', desc: 'See which brands are gaining or losing AI visibility in your category. Stay ahead of shifts.', emoji: '🔥' },
                { icon: BarChart3, title: 'Deep Analytics', desc: 'Prompt-level breakdowns, model comparison charts, and exportable reports for your team.', emoji: '📊' },
              ].map(({ icon: Icon, title, desc, emoji }) => (
                <div key={title} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all">
                  <div className="text-3xl mb-3">{emoji}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S8: Optimization & Learning ─── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <SectionTag><Lightbulb className="w-4 h-4" /> {t('landing.optimize.tag')}</SectionTag>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.optimize.title')}</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.optimize.desc')}</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Optimization Engine</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { priority: 'High', text: 'Add Schema.org markup for Product and Organization', color: 'text-red-600 bg-red-50' },
                    { priority: 'High', text: 'Create FAQ page targeting top AI prompts', color: 'text-red-600 bg-red-50' },
                    { priority: 'Med', text: 'Improve E-E-A-T signals with author bios', color: 'text-amber-600 bg-amber-50' },
                    { priority: 'Low', text: 'Add comparison page vs competitors', color: 'text-blue-600 bg-blue-50' },
                  ].map(({ priority, text, color }) => (
                    <div key={text} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${color}`}>{priority}</span>
                      <span className="text-sm text-slate-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">GEO Learning Center</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'What is GEO?', desc: 'Understand generative engine optimization from scratch', tag: 'Beginner' },
                    { title: 'Schema Markup for AI', desc: 'Structured data that AI models can parse', tag: 'Technical' },
                    { title: 'E-E-A-T for AI Search', desc: 'Build authority signals that LLMs trust', tag: 'Strategy' },
                    { title: 'Content Optimization', desc: 'Write content that AI recommends', tag: 'Content' },
                  ].map(({ title, desc, tag }) => (
                    <div key={title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer">
                      <FileText className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{title}</span>
                          <span className="text-xs text-violet-500 bg-violet-50 px-2 py-0.5 rounded">{tag}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S9: Multi-Platform Coverage ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <SectionTag><Globe className="w-4 h-4" /> {t('landing.platform.tag')}</SectionTag>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.platform.title')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">{t('landing.platform.desc')}</p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Gemini', emoji: '✨', status: 'Live', color: 'border-emerald-200 bg-emerald-50' },
                { name: 'ChatGPT', emoji: '🤖', status: 'Live', color: 'border-emerald-200 bg-emerald-50' },
                { name: 'Grok', emoji: '⚡', status: 'Live', color: 'border-emerald-200 bg-emerald-50' },
                { name: 'Perplexity', emoji: '🔍', status: 'Live', color: 'border-emerald-200 bg-emerald-50' },
              ].map(({ name, emoji, status, color }) => (
                <div key={name} className={`rounded-xl p-6 border-2 ${color} transition-all hover:shadow-md`}>
                  <div className="text-4xl mb-3">{emoji}</div>
                  <div className="font-semibold text-slate-900 text-lg">{name}</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">● {status}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S10: Pricing ─── */}
      <section id="pricing" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">{t('landing.pricing.title')}</h2>
            <p className="text-lg text-slate-600 text-center mb-12">{t('landing.pricing.subtitle')}</p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Free', price: '$0', period: 'forever', features: ['3 brands', '1 AI model (Gemini)', 'Basic GEO Score', 'Monthly reports', 'Community support'], cta: 'Get Started', highlight: false },
                { name: 'Pro', price: '$49', period: '/month', features: ['20 brands', '3 AI models', 'Full GEO Score + trends', 'Prompt research', 'Competitive benchmark', 'Priority support'], cta: 'Start Pro Trial', highlight: true },
                { name: 'Business', price: '$299', period: '/month', features: ['Unlimited brands', 'All AI models', 'API access', 'White-label reports', 'Content audit', 'Dedicated manager'], cta: 'Contact Sales', highlight: false },
              ].map(({ name, price, period, features, cta, highlight }) => (
                <div key={name} className={`rounded-xl p-8 border-2 bg-white ${highlight ? 'border-violet-500 ring-2 ring-violet-100 scale-105' : 'border-slate-200'}`}>
                  {highlight && <div className="text-xs font-semibold text-violet-600 uppercase mb-2">Most Popular</div>}
                  <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-bold text-slate-900">{price}</span>
                    <span className="text-slate-500">{period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/audit">
                    <Button className={`w-full ${highlight ? 'bg-violet-600 hover:bg-violet-700' : ''}`} variant={highlight ? 'default' : 'outline'}>
                      {cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── S11: Final CTA ─── */}
      <section className="py-24 px-6 bg-gradient-to-r from-violet-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.final.title')}</h2>
            <p className="text-lg text-violet-100 mb-8">
              {t('landing.final.desc')}
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <form
              onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); go(fd.get('q') as string || ''); }}
              className="max-w-xl mx-auto"
            >
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Enter your brand or domain..."
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 outline-none text-slate-900"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-white text-violet-700 hover:bg-violet-50 text-lg px-8 h-auto rounded-xl font-semibold">
                  {t('landing.cta.startFree')} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </form>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-violet-200">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> {t('landing.footer.noCreditCard')}</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> {t('landing.footer.results10s')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {t('landing.footer.freeToStart')}</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">Luminos</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/audit" className="hover:text-white transition">Free Brand Audit</Link>
            <a href="https://github.com/guixiang123124/geo-dashboard" className="hover:text-white transition">GitHub</a>
          </div>
          <div className="text-sm">© 2026 Luminos. Built with ❤️</div>
        </div>
      </footer>
    </div>
  );
}
