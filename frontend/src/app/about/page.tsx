'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Sparkles,
  Target,
  Users,
  Zap,
  Globe,
  Heart,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Shield,
  Lightbulb,
  Rocket,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative max-w-3xl">
          <Badge className="bg-white/20 text-white mb-4">Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Making Great Brands Visible in the AI Era
          </h1>
          <p className="text-xl text-violet-100 leading-relaxed">
            We believe the future of information discovery is conversational. 
            When people ask AI for recommendations, the best brands, products, 
            and content should be recognized and recommended — not buried.
          </p>
        </div>
      </div>

      {/* The Problem */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Badge variant="outline" className="mb-4">The Challenge</Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Search is Evolving. Are You?
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            Every day, billions of people ask ChatGPT, Gemini, Claude, and Perplexity 
            for recommendations. They're not clicking through ten blue links anymore — 
            they're getting direct answers.
          </p>
          <p className="text-lg text-slate-600 mb-4">
            <strong className="text-slate-900">The question is:</strong> When someone 
            asks "What's the best [your category]?", does the AI mention your brand?
          </p>
          <p className="text-lg text-slate-600">
            If not, you're invisible to an entire generation of consumers who never 
            make it to traditional search results.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-red-600 mb-2">60%+</p>
              <p className="text-sm text-red-700">of consumers use AI for shopping research</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-amber-600 mb-2">1B+</p>
              <p className="text-sm text-amber-700">daily queries to ChatGPT alone</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">89%</p>
              <p className="text-sm text-blue-700">of B2B buyers use AI in their journey</p>
            </CardContent>
          </Card>
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-violet-600 mb-2">2-7</p>
              <p className="text-sm text-violet-700">brands cited per AI response on average</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Our Vision */}
      <Card className="bg-slate-900 text-white overflow-hidden">
        <CardContent className="p-12">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              We envision a world where the best brands, the most helpful services, 
              and the most interesting content are naturally recognized by AI platforms. 
              Not through tricks or spam, but because they genuinely deserve to be recommended.
            </p>
            <p className="text-lg text-violet-300 italic">
              "GEO isn't about gaming AI — it's about helping AI understand 
              what makes your brand valuable, so it can recommend you with confidence."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What We Do */}
      <div>
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">What We Do</Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Generative Engine Optimization (GEO)
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We help brands understand and optimize their visibility across 
            AI platforms — from ChatGPT to Gemini to Claude and beyond.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Measure</h3>
              <p className="text-slate-600">
                Track how AI platforms describe and recommend your brand across 
                thousands of real user queries. See your visibility score, 
                share of voice, and citation rate.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Understand</h3>
              <p className="text-slate-600">
                Discover why some brands get recommended and others don't. 
                Analyze what content structures, authority signals, and 
                entity relationships drive AI citations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Optimize</h3>
              <p className="text-slate-600">
                Get actionable recommendations to improve your AI visibility. 
                From schema markup to content structure to authority building — 
                we show you exactly what to fix.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Our Principles */}
      <div className="bg-gradient-to-br from-slate-50 to-violet-50 rounded-3xl p-12">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Our Principles</Badge>
          <h2 className="text-3xl font-bold text-slate-900">
            Built on Integrity
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Quality Over Tricks</h3>
              <p className="text-slate-600">
                We help brands that deserve to be recommended. No black-hat tactics, 
                no spam. Just making genuinely good content more discoverable.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Global Perspective</h3>
              <p className="text-slate-600">
                Built for the US market first, with a deep understanding of 
                global brands. We think internationally from day one.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Human + AI Partnership</h3>
              <p className="text-slate-600">
                We're not just building tools — we're pioneering a new way for 
                humans and AI to work together, making each other better.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Data-Driven Insights</h3>
              <p className="text-slate-600">
                Every recommendation backed by real data from AI platforms. 
                No guesswork — just measurable, actionable intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Future */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-4">Looking Ahead</Badge>
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          The Future of Discovery
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          We're at the beginning of a fundamental shift in how people find information. 
          The brands that understand and embrace GEO today will dominate 
          the AI-powered discovery landscape of tomorrow.
        </p>
        <p className="text-lg text-slate-600 mb-12">
          Our mission is to ensure that when AI recommends something, 
          it's recommending brands that truly deserve it — brands that are 
          interesting, valuable, and trustworthy.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/learn">
            <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
              Learn About GEO
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/brands">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              See It In Action
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Contact */}
      <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">Let's Build Together</h2>
          <p className="text-violet-100 mb-6 max-w-xl mx-auto">
            Whether you're a brand looking to improve your AI visibility, 
            or an investor interested in the future of search — we'd love to talk.
          </p>
          <a 
            href="mailto:hello@geoinsights.ai"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
          >
            Get In Touch
            <ArrowRight className="w-4 h-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
