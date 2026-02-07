'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Eye, Globe, Zap, Shield, TrendingUp, Star, CheckCircle2, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">GEO Insights</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-violet-600 transition">Features</a>
            <a href="#how" className="hover:text-violet-600 transition">How It Works</a>
            <a href="#pricing" className="hover:text-violet-600 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 text-sm text-violet-700 mb-6">
            <Zap className="w-4 h-4" />
            The first GEO analytics platform for brands
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Is Your Brand Visible
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              to AI Search?
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            40% of Gen Z use ChatGPT and Gemini for product research. 
            GEO Insights tells you if AI recommends your brand — and how to make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-8 h-14">
                Try Free Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                Learn About GEO
              </Button>
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              ['30+', 'Brands Tracked'],
              ['4', 'AI Models'],
              ['120+', 'Test Prompts'],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-3xl font-bold text-violet-600">{num}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">The Problem</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
            Traditional SEO optimizes for Google's algorithm. But AI search engines like ChatGPT, Gemini, and Claude 
            generate answers — they don't just link. If AI doesn't know your brand, your customers won't either.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-red-500 font-semibold mb-2">❌ Without GEO</div>
              <p className="text-slate-600 text-sm">
                "What are the best kids clothing brands?" → AI recommends your competitors. 
                You're invisible. Lost revenue you never knew about.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-violet-200 ring-1 ring-violet-100">
              <div className="text-green-600 font-semibold mb-2">✅ With GEO Insights</div>
              <p className="text-slate-600 text-sm">
                You know exactly how AI describes your brand, where you rank, what's missing, 
                and get actionable steps to improve your AI visibility score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600">Comprehensive GEO analytics in one platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: 'GEO Score Dashboard', desc: 'Four-dimensional scoring: Visibility, Citation, Representation, and Intent Coverage. Know exactly where you stand.' },
              { icon: Search, title: 'Prompt Research', desc: 'Discover what questions users ask AI about your industry. Find high-impact prompts that drive brand mentions.' },
              { icon: TrendingUp, title: 'Trend Tracking', desc: 'Track your brand\'s AI visibility over time. Spot trends, seasonal patterns, and competitive shifts.' },
              { icon: Shield, title: 'AI Content Audit', desc: 'Analyze your website\'s AI-friendliness. Check Schema markup, E-E-A-T signals, and content structure.' },
              { icon: Users, title: 'Competitive Benchmark', desc: 'See how you compare against competitors across all GEO dimensions. Identify citation gaps and opportunities.' },
              { icon: Globe, title: 'Multi-Model Coverage', desc: 'Test across Gemini, ChatGPT, Claude, and Perplexity. Different AIs recommend different brands.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Add Your Brand', desc: 'Enter your brand name and website. We auto-detect your industry and competitors.' },
              { step: '2', title: 'AI Evaluates', desc: 'We send 120+ real-world prompts to Gemini, ChatGPT, and Claude. Each response is analyzed for your brand presence.' },
              { step: '3', title: 'Get Your Score', desc: 'Receive a comprehensive GEO Score with visibility, citation, representation, and intent metrics.' },
              { step: '4', title: 'Optimize', desc: 'Follow actionable recommendations to improve how AI sees and recommends your brand.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Simple Pricing</h2>
          <p className="text-lg text-slate-600 text-center mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['3 brands', '1 AI model (Gemini)', 'Basic GEO Score', 'Monthly reports', 'Community support'], cta: 'Get Started', highlight: false },
              { name: 'Pro', price: '$49', period: '/month', features: ['20 brands', '3 AI models', 'Full GEO Score + trends', 'Prompt research', 'Competitive benchmark', 'Priority support'], cta: 'Start Pro Trial', highlight: true },
              { name: 'Business', price: '$199', period: '/month', features: ['Unlimited brands', 'All AI models', 'API access', 'White-label reports', 'Content audit', 'Dedicated manager'], cta: 'Contact Sales', highlight: false },
            ].map(({ name, price, period, features, cta, highlight }) => (
              <div key={name} className={`rounded-xl p-8 border-2 ${highlight ? 'border-violet-500 ring-2 ring-violet-100 scale-105' : 'border-slate-200'}`}>
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
                <Link href="/">
                  <Button className={`w-full ${highlight ? 'bg-violet-600 hover:bg-violet-700' : ''}`} variant={highlight ? 'default' : 'outline'}>
                    {cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to See How AI Views Your Brand?</h2>
          <p className="text-lg text-violet-100 mb-8">
            Join 30+ brands already tracking their GEO performance. Free forever plan available.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 text-lg px-8 h-14">
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">GEO Insights</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/learn" className="hover:text-white transition">Learn GEO</Link>
            <a href="https://github.com/guixiang123124/geo-dashboard" className="hover:text-white transition">GitHub</a>
          </div>
          <div className="text-sm">© 2026 GEO Insights. Built with ❤️</div>
        </div>
      </footer>
    </div>
  );
}
