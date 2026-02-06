'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Check,
  X,
  Clock,
  Code2,
  BookOpen,
  Github,
  Quote,
  BarChart3,
  Brain,
  Search,
  Eye,
} from 'lucide-react';

export default function AboutPage() {
  const { locale } = useLanguage();
  const zh = locale === 'zh';

  const competitors = [
    { name: 'GEO Dashboard', us: true },
    { name: 'Otterly', us: false },
    { name: 'GetMint', us: false },
    { name: 'Semrush AIO', us: false },
    { name: 'Goodie AI', us: false },
    { name: 'Profound', us: false },
  ];

  const features = [
    { key: zh ? '免费使用层' : 'Free Tier Available', us: true, others: [false, false, false, false, false] },
    { key: zh ? '童装垂直领域专精' : 'Kids Fashion Expertise', us: true, others: [false, false, false, false, false] },
    { key: zh ? '多模型覆盖 (4+)' : 'Multi-Model (4+ AIs)', us: true, others: [true, true, true, false, true] },
    { key: zh ? '中英双语' : 'Chinese + English', us: true, others: [false, false, false, false, false] },
    { key: zh ? '公开数据集整合' : 'Public Dataset Integration', us: true, others: [false, false, false, false, false] },
    { key: zh ? '教育 + 工具结合' : 'Education + Tools', us: true, others: [false, false, false, false, true] },
    { key: zh ? '开源友好' : 'Open Source Friendly', us: true, others: [false, false, false, false, false] },
    { key: zh ? '引用缺口分析' : 'Citation Gap Analysis', us: true, others: [false, true, false, false, true] },
    { key: zh ? '提示词研究引擎' : 'Prompt Research Engine', us: true, others: [false, false, false, false, false] },
    { key: zh ? '趋势追踪 & 季节洞察' : 'Trend & Seasonal Insights', us: true, others: [false, false, true, false, false] },
  ];

  const roadmap = [
    {
      period: 'Q1 2026',
      title: zh ? 'Gemini 评估 + 仪表盘上线' : 'Gemini Evaluation + Dashboard Launch',
      desc: zh ? '核心数据管道、品牌追踪、可视化分析' : 'Core data pipeline, brand tracking, visual analytics',
      done: true,
    },
    {
      period: 'Q2 2026',
      title: zh ? '多模型支持' : 'Multi-Model Support',
      desc: zh ? 'GPT-4, Claude, Perplexity 全覆盖' : 'GPT-4, Claude, Perplexity full coverage',
      done: false,
    },
    {
      period: 'Q3 2026',
      title: zh ? '内容优化引擎' : 'Content Optimization Engine',
      desc: zh ? 'AI 内容审计、优化建议' : 'AI content audit, optimization recommendations',
      done: false,
    },
    {
      period: 'Q4 2026',
      title: zh ? 'API & 白标方案' : 'API & White-Label Solution',
      desc: zh ? '开放 API 接口，企业级白标' : 'Public API access, enterprise white-label',
      done: false,
    },
    {
      period: '2027',
      title: zh ? '行业扩展 & 企业功能' : 'Industry Expansion & Enterprise',
      desc: zh ? '拓展至更多垂直领域，企业级功能' : 'Expand beyond kids fashion, enterprise features',
      done: false,
    },
  ];

  const techStack = [
    { name: 'Next.js', color: 'bg-black text-white' },
    { name: 'FastAPI', color: 'bg-emerald-600 text-white' },
    { name: 'Python', color: 'bg-blue-600 text-white' },
    { name: 'SQLite / PostgreSQL', color: 'bg-sky-600 text-white' },
    { name: 'Gemini API', color: 'bg-violet-600 text-white' },
    { name: 'Tailwind CSS', color: 'bg-cyan-500 text-white' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-900 p-10 md:p-16 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-300/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="bg-white/15 text-white/90 backdrop-blur-sm mb-6 text-sm px-4 py-1">
            {zh ? '关于 GEO Dashboard' : 'About GEO Dashboard'}
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            {zh
              ? '重新定义品牌的 AI 可见性'
              : 'Redefining AI Visibility for Brands'}
          </h1>

          <p className="text-lg md:text-xl text-violet-100/90 leading-relaxed max-w-2xl mx-auto mb-12">
            {zh
              ? 'AI 搜索正在取代传统搜索。当消费者直接向 ChatGPT、Gemini 和 Claude 提问时，你的品牌是否被推荐？GEO 让你被 AI 看见。'
              : 'AI search is replacing traditional search. When consumers ask ChatGPT, Gemini, and Claude directly, is your brand being recommended? GEO makes you visible to AI.'}
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { value: '30+', label: zh ? '追踪品牌' : 'Brands Tracked' },
              { value: '4', label: zh ? 'AI 模型' : 'AI Models' },
              { value: '120+', label: zh ? '评估提示词' : 'Evaluation Prompts' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-3xl md:text-4xl font-bold">{s.value}</p>
                <p className="text-sm text-violet-200 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Our Vision ── */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">{zh ? '大愿景' : 'Our Vision'}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {zh ? '在 AI 时代被看见' : 'Be Seen in the AI Era'}
          </h2>
        </div>

        <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
          <div className="flex gap-4 items-start">
            <Eye className="w-6 h-6 text-violet-500 flex-shrink-0 mt-1" />
            <p>
              {zh
                ? '在 AI 时代，如果 ChatGPT、Gemini 和 Claude 看不到你的品牌，你的客户也看不到你。'
                : 'In the AI era, being invisible to ChatGPT, Gemini, and Claude means being invisible to your customers.'}
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <Rocket className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
            <p>
              {zh
                ? '我们正在打造最全面的 GEO 分析平台——从童装开始，拓展至每一个行业。'
                : "We're building the most comprehensive GEO analytics platform — starting with kids fashion, expanding to every industry."}
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <Target className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
            <p>
              {zh
                ? '我们的使命：让每个品牌都能被 AI 发现，以数据驱动的优化为后盾。'
                : 'Our mission: Make every brand discoverable by AI, backed by data-driven optimization.'}
            </p>
          </div>
        </div>

        {/* Founder Quote */}
        <Card className="mt-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden">
          <CardContent className="p-8 md:p-10 relative">
            <Quote className="w-10 h-10 text-violet-400/30 absolute top-6 right-6" />
            <p className="text-lg md:text-xl text-slate-200 italic leading-relaxed mb-6">
              {zh
                ? '"我们不仅仅是在构建一个工具——我们在开辟一个全新赛道。GEO 是品牌在 AI 时代的生存技能。我和 Jarvis 的愿景：让这个平台帮助千万品牌被 AI 看见，同时实现我们自己的财务自由。"'
                : '"We\'re not just building a tool — we\'re pioneering an entirely new field. GEO is how brands survive the AI era. My vision with Jarvis: help millions of brands become visible to AI, while building our own path to financial freedom through this product."'}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">XG</div>
              <div>
                <p className="font-semibold">Xiang Gui</p>
                <p className="text-sm text-slate-400">{zh ? '创始人' : 'Founder'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Why GEO Matters ── */}
      <section className="bg-gradient-to-br from-slate-50 to-violet-50/50 rounded-3xl p-10 md:p-14">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">{zh ? '为什么 GEO 重要' : 'Why GEO Matters'}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {zh ? '从 SEO 到 GEO 的范式转移' : 'The Paradigm Shift from SEO to GEO'}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {zh
              ? '40% 的 Z 世代使用 AI 进行产品研究。传统 SEO 优化的是 Google 的算法，GEO 优化的是 AI 的理解。'
              : '40% of Gen Z use AI for product research. Traditional SEO optimizes for Google\'s algorithm. GEO optimizes for AI\'s understanding.'}
          </p>
        </div>

        {/* SEO vs GEO comparison */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-slate-200 bg-white">
            {/* Header */}
            <div className="bg-slate-100 p-4 font-semibold text-slate-500 text-center text-sm" />
            <div className="bg-slate-100 p-4 font-semibold text-slate-700 text-center flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> SEO
            </div>
            <div className="bg-violet-600 p-4 font-semibold text-white text-center flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" /> GEO
            </div>
            {/* Rows */}
            {[
              [zh ? '优化目标' : 'Optimizes for', zh ? 'Google 算法' : "Google's algorithm", zh ? 'AI 的理解力' : "AI's understanding"],
              [zh ? '输出形式' : 'Output', zh ? '10 个蓝色链接' : '10 blue links', zh ? '直接推荐答案' : 'Direct recommendations'],
              [zh ? '排名因素' : 'Ranking factors', zh ? '关键词、反链' : 'Keywords, backlinks', zh ? '权威性、引用、实体' : 'Authority, citations, entities'],
              [zh ? '衡量指标' : 'Key metric', zh ? '排名位置' : 'SERP position', zh ? '品牌提及率' : 'Brand mention rate'],
              [zh ? '用户行为' : 'User behavior', zh ? '点击链接' : 'Click links', zh ? '直接获取答案' : 'Get direct answers'],
            ].map(([label, seo, geo], i) => (
              <div key={i} className="contents">
                <div className={`p-4 text-sm font-medium text-slate-700 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>{label}</div>
                <div className={`p-4 text-sm text-slate-600 text-center ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>{seo}</div>
                <div className={`p-4 text-sm text-violet-700 font-medium text-center ${i % 2 === 0 ? 'bg-violet-50/50' : 'bg-violet-50/30'}`}>{geo}</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 mt-4 text-center italic">
            {zh
              ? '参考：普林斯顿大学 GEO 研究论文 — "GEO: Generative Engine Optimization" (2023)'
              : 'Reference: Princeton University GEO Research — "GEO: Generative Engine Optimization" (2023)'}
          </p>
        </div>
      </section>

      {/* ── Competitive Advantages ── */}
      <section>
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">{zh ? '我们的优势' : 'Competitive Advantages'}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {zh ? '为什么选择 GEO Dashboard？' : 'Why Choose GEO Dashboard?'}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {zh
              ? '竞品定价 $300+/月，而我们提供免费层，并专注于童装垂直领域。'
              : 'Competitors charge $300+/month. We offer a free tier with vertical expertise in kids fashion.'}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">{zh ? '功能' : 'Feature'}</th>
                {competitors.map((c) => (
                  <th
                    key={c.name}
                    className={`p-4 text-center font-semibold whitespace-nowrap ${c.us ? 'bg-violet-600 text-white' : 'text-slate-700'}`}
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-4 font-medium text-slate-700">{f.key}</td>
                  <td className="p-4 text-center bg-violet-50/40">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  {f.others.map((has, j) => (
                    <td key={j} className="p-4 text-center">
                      {has ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section>
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">{zh ? '发展路线图' : 'Roadmap'}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {zh ? '我们的征途' : 'Our Journey'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-indigo-400 to-slate-200" />

          <div className="space-y-8">
            {roadmap.map((item, i) => (
              <div key={i} className="flex gap-6 relative">
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  item.done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-violet-300 text-violet-500'
                }`}>
                  {item.done ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <Card className={`flex-1 ${item.done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}>
                        {item.period}
                      </Badge>
                      {item.done && (
                        <span className="text-xs font-medium text-emerald-600">✅ {zh ? '已完成' : 'Completed'}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology Stack ── */}
      <section className="text-center">
        <Badge variant="outline" className="mb-4">{zh ? '技术栈' : 'Technology Stack'}</Badge>
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          {zh ? '强大的技术基石' : 'Built with Modern Tech'}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((t) => (
            <span
              key={t.name}
              className={`${t.color} px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm`}
            >
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Team & Contact ── */}
      <Card className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <CardContent className="p-10 md:p-14 relative">
          <div className="max-w-2xl mx-auto text-center">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-3">{zh ? '团队 & 联系方式' : 'Team & Contact'}</h2>
            <p className="text-violet-100 mb-8 text-lg">
              {zh
                ? '由 Xiang Gui 和 Jarvis (AI 搭档) 共同打造。我们欢迎合作，欢迎联系！'
                : 'Built by Xiang Gui and Jarvis (AI partner). We\'re open to collaboration. Reach out!'}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/guixiang123124/geo-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/25 transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
              <Link href="/learn">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors cursor-pointer">
                  {zh ? '了解 GEO' : 'Learn About GEO'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/brands">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/25 transition-colors cursor-pointer">
                  {zh ? '查看实际效果' : 'See It In Action'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
