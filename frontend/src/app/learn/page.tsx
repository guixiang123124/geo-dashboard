'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Shield,
  FileText,
  BarChart3,
  Quote,
  Star,
  Clock,
  Users,
} from 'lucide-react';

// GEO Best Practices Data
const geoStrategies = [
  {
    id: 1,
    title: '添加权威引用和统计数据',
    description: '在内容中加入来自权威来源的引用和具体统计数据，可提升 AI 引用可能性高达 40%',
    impact: 'high',
    difficulty: 'medium',
    example: '例如："根据 Forrester 研究，89% 的 B2B 买家已采用 AI 作为购买决策的关键信息来源"',
  },
  {
    id: 2,
    title: '结构化内容布局',
    description: '使用清晰的 H2/H3 标题、项目符号列表、表格等，让 AI 更容易提取和引用信息',
    impact: 'high',
    difficulty: 'low',
    example: '在每个页面顶部放置 40-80 字的"快速回答"摘要',
  },
  {
    id: 3,
    title: 'Schema Markup 结构化数据',
    description: '添加 FAQPage、HowTo、Product 等 Schema 标记，帮助 AI 理解内容结构',
    impact: 'high',
    difficulty: 'high',
    example: '为产品页添加 Product schema，包含价格、评分、库存等信息',
  },
  {
    id: 4,
    title: 'E-E-A-T 信号强化',
    description: '展示专业性、权威性、可信度：作者简介、资质认证、第三方评价',
    impact: 'medium',
    difficulty: 'medium',
    example: '文章署名真实作者，附带 LinkedIn 链接和专业资质',
  },
  {
    id: 5,
    title: '定期内容更新',
    description: 'AI 偏好新鲜内容，定期更新高价值页面可维持可见性',
    impact: 'medium',
    difficulty: 'low',
    example: '每季度审查和更新 Tier-1 收入相关页面',
  },
  {
    id: 6,
    title: '实体关系映射',
    description: '明确定义页面主题实体，并与相关概念建立链接关系',
    impact: 'medium',
    difficulty: 'high',
    example: '将品牌页面与 Wikipedia、行业标准、权威媒体建立引用关系',
  },
];

const keyMetrics = [
  {
    name: 'AI 可见性分数',
    description: '品牌在 AI 回答中被提及的频率',
    icon: TrendingUp,
    color: 'text-violet-600',
  },
  {
    name: '引用率 (Citation Rate)',
    description: 'AI 回答中直接引用品牌链接的比例',
    icon: FileText,
    color: 'text-blue-600',
  },
  {
    name: 'Share of Voice',
    description: '相对竞争对手的 AI 提及占比',
    icon: BarChart3,
    color: 'text-emerald-600',
  },
  {
    name: '情感分数',
    description: 'AI 描述品牌时的正面/负面/中性比例',
    icon: Star,
    color: 'text-amber-600',
  },
  {
    name: '意图覆盖率',
    description: '品牌在不同用户意图查询中的覆盖程度',
    icon: Target,
    color: 'text-rose-600',
  },
  {
    name: '排名位置',
    description: '在 AI 列表式回答中的平均排名',
    icon: Zap,
    color: 'text-cyan-600',
  },
];

const industryStats = [
  { stat: '1B+', label: '每日 ChatGPT 查询量', source: 'OpenAI 2025' },
  { stat: '89%', label: 'B2B 买家使用 AI 辅助决策', source: 'Forrester' },
  { stat: '60%+', label: '消费者用 AI 做购物研究', source: 'Bloomreach' },
  { stat: '40%', label: 'GEO 优化可提升的可见性', source: 'Princeton GEO 研究' },
];

const resources = [
  {
    title: 'GEO: Generative Engine Optimization',
    source: 'Princeton University / KDD 2024',
    url: 'https://arxiv.org/abs/2311.09735',
    type: 'research',
    description: '首篇 GEO 学术论文，提出优化框架和 GEO-bench 基准',
  },
  {
    title: '10-Step GEO Framework',
    source: 'Profound',
    url: 'https://www.tryprofound.com/resources/articles/generative-engine-optimization-geo-guide-2025',
    type: 'guide',
    description: '企业级 GEO 实施的 10 步框架，包含基准和指标',
  },
  {
    title: 'GEO Best Practices Checklist',
    source: 'Directive Consulting',
    url: 'https://directiveconsulting.com/blog/a-guide-to-generative-engine-optimization-geo-best-practices/',
    type: 'guide',
    description: '可操作的内容结构、技术实施和权威信号清单',
  },
  {
    title: 'Complete GEO Guide',
    source: 'Backlinko',
    url: 'https://backlinko.com/generative-engine-optimization-geo',
    type: 'guide',
    description: 'SEO 专家 Brian Dean 的 GEO 完整指南',
  },
  {
    title: 'What is GEO?',
    source: 'Search Engine Land',
    url: 'https://searchengineland.com/guide/what-is-geo',
    type: 'education',
    description: 'AI 时代搜索可见性的完整入门指南',
  },
  {
    title: 'GEO-bench Dataset',
    source: 'HuggingFace',
    url: 'https://huggingface.co/datasets/GEO-Optim/geo-bench',
    type: 'data',
    description: '10,000 个 GEO 评估查询的公开数据集',
  },
];

const geoVsSeo = [
  { dimension: '主要目标', seo: '搜索结果页排名', geo: 'AI 回答中被引用' },
  { dimension: '信任信号', seo: '反向链接、域名权重', geo: '引用权威、结构化数据' },
  { dimension: '用户输入', seo: '关键词', geo: '自然语言对话' },
  { dimension: '成功指标', seo: '流量、排名', geo: 'AI 引用率、Share of Voice' },
  { dimension: '内容格式', seo: '长篇 SEO 文章', geo: '结构化、易提取的信息块' },
  { dimension: '更新频率', seo: '定期优化', geo: '持续更新以保持新鲜度' },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">GEO 学习中心</h1>
            <p className="text-violet-100 mt-1">
              掌握 AI 时代的品牌可见性优化
            </p>
          </div>
        </div>
        <p className="text-violet-100 max-w-2xl">
          Generative Engine Optimization (GEO) 是优化内容以在 ChatGPT、Gemini、Claude 等 AI 
          平台的回答中获得引用和推荐的实践。这里汇集了最新的研究、最佳实践和行业洞察。
        </p>
      </div>

      {/* Industry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {industryStats.map((item, i) => (
          <Card key={i} className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-violet-600">{item.stat}</p>
              <p className="text-sm text-slate-600 mt-1">{item.label}</p>
              <p className="text-xs text-slate-400 mt-2">{item.source}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            概述
          </TabsTrigger>
          <TabsTrigger value="strategies" className="gap-2">
            <Target className="w-4 h-4" />
            优化策略
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            关键指标
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <BookOpen className="w-4 h-4" />
            学习资源
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* What is GEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                什么是 GEO？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                <strong>Generative Engine Optimization (GEO)</strong> 是一种新兴的内容优化方法，
                旨在帮助品牌在 AI 驱动的搜索引擎（如 ChatGPT、Google Gemini、Perplexity、Claude）
                生成的回答中获得更高的可见性和引用率。
              </p>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-violet-800 flex items-start gap-2">
                  <Quote className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    "在 GEO 时代，成功不再只是搜索排名第一，而是成为 AI 在回答用户问题时
                    首先想到并推荐的品牌。"
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* GEO vs SEO */}
          <Card>
            <CardHeader>
              <CardTitle>GEO vs 传统 SEO</CardTitle>
              <CardDescription>理解两种优化方法的关键差异</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">维度</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">传统 SEO</th>
                      <th className="text-left py-3 px-4 font-medium text-violet-600">GEO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geoVsSeo.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{row.dimension}</td>
                        <td className="py-3 px-4 text-slate-600">{row.seo}</td>
                        <td className="py-3 px-4 text-violet-700 bg-violet-50/50">{row.geo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Why GEO Matters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                为什么现在必须关注 GEO？
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">用户行为转变</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    越来越多用户直接向 AI 提问而非使用传统搜索，改变了信息发现的方式
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold">先发优势</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    AI 模型的训练数据会固化认知，早期建立存在感可形成持久优势
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-rose-600" />
                    <h4 className="font-semibold">品牌控制</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    如果不主动优化，AI 可能会错误描述你的品牌或推荐竞争对手
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <div className="grid gap-4">
            {geoStrategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-sm font-bold">
                          {strategy.id}
                        </span>
                        <h3 className="font-semibold text-lg">{strategy.title}</h3>
                      </div>
                      <p className="text-slate-600 mb-3">{strategy.description}</p>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">示例：</span> {strategy.example}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={strategy.impact === 'high' ? 'default' : 'secondary'}>
                        {strategy.impact === 'high' ? '高影响' : '中影响'}
                      </Badge>
                      <Badge variant="outline">
                        {strategy.difficulty === 'low' ? '易实施' : 
                         strategy.difficulty === 'medium' ? '中等难度' : '需技术'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Checklist */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
                快速检查清单
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  '每个页面有 40-80 字的快速摘要',
                  'H2/H3 使用问题式标题',
                  '关键信息用列表和表格呈现',
                  '添加 FAQPage Schema',
                  '文章署名真实作者',
                  '引用权威来源并标注年份',
                  '季度更新高价值页面',
                  '建立第三方权威平台存在',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyMetrics.map((metric, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 ${metric.color}`}>
                      <metric.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{metric.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{metric.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Measurement Framework */}
          <Card>
            <CardHeader>
              <CardTitle>GEO 评估框架</CardTitle>
              <CardDescription>基于 Princeton GEO 研究的评分维度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">可见性 (35%)</div>
                  <div className="flex-1 h-3 bg-violet-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">引用率 (25%)</div>
                  <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">表述准确 (25%)</div>
                  <div className="flex-1 h-3 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">意图覆盖 (15%)</div>
                  <div className="flex-1 h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                综合评分 = 可见性×35% + 引用率×25% + 表述准确×25% + 意图覆盖×15%
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4">
            {resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="hover:shadow-md hover:border-violet-300 transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-sm text-violet-600 mb-2">{resource.source}</p>
                        <p className="text-slate-600">{resource.description}</p>
                      </div>
                      <Badge variant={
                        resource.type === 'research' ? 'default' :
                        resource.type === 'guide' ? 'secondary' :
                        resource.type === 'data' ? 'outline' : 'secondary'
                      }>
                        {resource.type === 'research' ? '学术研究' :
                         resource.type === 'guide' ? '实操指南' :
                         resource.type === 'data' ? '数据集' : '教程'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">开始优化你的品牌</h3>
                  <p className="text-violet-100">
                    使用 GEO Insights 追踪你的品牌在 AI 平台中的表现
                  </p>
                </div>
                <a
                  href="/brands"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
                >
                  查看品牌分析
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
