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
import { useLanguage } from '@/contexts/LanguageContext';

// GEO Best Practices Data
const geoStrategies = [
  {
    id: 1,
    title: 'Add Authoritative Citations and Statistics',
    titleZh: '添加权威引用和统计数据',
    description: 'Including citations from authoritative sources and specific statistics in your content can increase AI citation likelihood by up to 40%',
    descriptionZh: '在内容中加入来自权威来源的引用和具体统计数据，可提升 AI 引用可能性高达 40%',
    impact: 'high',
    difficulty: 'medium',
    example: 'e.g., "According to Forrester research, 89% of B2B buyers have adopted AI as a key information source for purchasing decisions"',
    exampleZh: '例如："根据 Forrester 研究，89% 的 B2B 买家已采用 AI 作为购买决策的关键信息来源"',
  },
  {
    id: 2,
    title: 'Structured Content Layout',
    titleZh: '结构化内容布局',
    description: 'Use clear H2/H3 headings, bullet lists, tables, etc., making it easier for AI to extract and cite information',
    descriptionZh: '使用清晰的 H2/H3 标题、项目符号列表、表格等，让 AI 更容易提取和引用信息',
    impact: 'high',
    difficulty: 'low',
    example: 'Place a 40-80 word "quick answer" summary at the top of each page',
    exampleZh: '在每个页面顶部放置 40-80 字的"快速回答"摘要',
  },
  {
    id: 3,
    title: 'Schema Markup Structured Data',
    titleZh: 'Schema Markup 结构化数据',
    description: 'Add FAQPage, HowTo, Product and other Schema markup to help AI understand content structure',
    descriptionZh: '添加 FAQPage、HowTo、Product 等 Schema 标记，帮助 AI 理解内容结构',
    impact: 'high',
    difficulty: 'high',
    example: 'Add Product schema to product pages, including price, rating, and inventory info',
    exampleZh: '为产品页添加 Product schema，包含价格、评分、库存等信息',
  },
  {
    id: 4,
    title: 'E-E-A-T Signal Enhancement',
    titleZh: 'E-E-A-T 信号强化',
    description: 'Demonstrate expertise, authority, and trustworthiness: author bios, certifications, third-party reviews',
    descriptionZh: '展示专业性、权威性、可信度：作者简介、资质认证、第三方评价',
    impact: 'medium',
    difficulty: 'medium',
    example: 'Attribute articles to real authors with LinkedIn profiles and professional credentials',
    exampleZh: '文章署名真实作者，附带 LinkedIn 链接和专业资质',
  },
  {
    id: 5,
    title: 'Regular Content Updates',
    titleZh: '定期内容更新',
    description: 'AI favors fresh content — regularly updating high-value pages helps maintain visibility',
    descriptionZh: 'AI 偏好新鲜内容，定期更新高价值页面可维持可见性',
    impact: 'medium',
    difficulty: 'low',
    example: 'Review and update Tier-1 revenue-related pages quarterly',
    exampleZh: '每季度审查和更新 Tier-1 收入相关页面',
  },
  {
    id: 6,
    title: 'Entity Relationship Mapping',
    titleZh: '实体关系映射',
    description: 'Clearly define page topic entities and establish linking relationships with related concepts',
    descriptionZh: '明确定义页面主题实体，并与相关概念建立链接关系',
    impact: 'medium',
    difficulty: 'high',
    example: 'Link brand pages to Wikipedia, industry standards, and authoritative media citations',
    exampleZh: '将品牌页面与 Wikipedia、行业标准、权威媒体建立引用关系',
  },
];

const keyMetrics = [
  {
    name: 'AI Visibility Score',
    nameZh: 'AI 可见性分数',
    description: 'How frequently the brand is mentioned in AI responses',
    descriptionZh: '品牌在 AI 回答中被提及的频率',
    icon: TrendingUp,
    color: 'text-violet-600',
  },
  {
    name: 'Citation Rate',
    nameZh: '引用率 (Citation Rate)',
    description: 'Percentage of AI responses that directly cite brand links',
    descriptionZh: 'AI 回答中直接引用品牌链接的比例',
    icon: FileText,
    color: 'text-blue-600',
  },
  {
    name: 'Share of Voice',
    nameZh: 'Share of Voice',
    description: 'AI mention share relative to competitors',
    descriptionZh: '相对竞争对手的 AI 提及占比',
    icon: BarChart3,
    color: 'text-emerald-600',
  },
  {
    name: 'Sentiment Score',
    nameZh: '情感分数',
    description: 'Positive/negative/neutral ratio when AI describes the brand',
    descriptionZh: 'AI 描述品牌时的正面/负面/中性比例',
    icon: Star,
    color: 'text-amber-600',
  },
  {
    name: 'Intent Coverage',
    nameZh: '意图覆盖率',
    description: 'Brand coverage across different user intent queries',
    descriptionZh: '品牌在不同用户意图查询中的覆盖程度',
    icon: Target,
    color: 'text-rose-600',
  },
  {
    name: 'Ranking Position',
    nameZh: '排名位置',
    description: 'Average ranking in AI list-style responses',
    descriptionZh: '在 AI 列表式回答中的平均排名',
    icon: Zap,
    color: 'text-cyan-600',
  },
];

const industryStats = [
  { stat: '1B+', label: 'Daily ChatGPT Queries', labelZh: '每日 ChatGPT 查询量', source: 'OpenAI 2025' },
  { stat: '89%', label: 'B2B Buyers Use AI for Decisions', labelZh: 'B2B 买家使用 AI 辅助决策', source: 'Forrester' },
  { stat: '60%+', label: 'Consumers Use AI for Shopping Research', labelZh: '消费者用 AI 做购物研究', source: 'Bloomreach' },
  { stat: '40%', label: 'Visibility Boost from GEO Optimization', labelZh: 'GEO 优化可提升的可见性', source: 'Princeton GEO Research' },
];

const resources = [
  {
    title: 'GEO: Generative Engine Optimization',
    source: 'Princeton University / KDD 2024',
    url: 'https://arxiv.org/abs/2311.09735',
    type: 'research',
    description: 'First academic GEO paper, proposing optimization framework and GEO-bench benchmark',
    descriptionZh: '首篇 GEO 学术论文，提出优化框架和 GEO-bench 基准',
  },
  {
    title: '10-Step GEO Framework',
    source: 'Profound',
    url: 'https://www.tryprofound.com/resources/articles/generative-engine-optimization-geo-guide-2025',
    type: 'guide',
    description: 'Enterprise-level 10-step GEO implementation framework with benchmarks and metrics',
    descriptionZh: '企业级 GEO 实施的 10 步框架，包含基准和指标',
  },
  {
    title: 'GEO Best Practices Checklist',
    source: 'Directive Consulting',
    url: 'https://directiveconsulting.com/blog/a-guide-to-generative-engine-optimization-geo-best-practices/',
    type: 'guide',
    description: 'Actionable content structure, technical implementation, and authority signal checklist',
    descriptionZh: '可操作的内容结构、技术实施和权威信号清单',
  },
  {
    title: 'Complete GEO Guide',
    source: 'Backlinko',
    url: 'https://backlinko.com/generative-engine-optimization-geo',
    type: 'guide',
    description: 'Complete GEO guide by SEO expert Brian Dean',
    descriptionZh: 'SEO 专家 Brian Dean 的 GEO 完整指南',
  },
  {
    title: 'What is GEO?',
    source: 'Search Engine Land',
    url: 'https://searchengineland.com/guide/what-is-geo',
    type: 'education',
    description: 'Complete beginner\'s guide to search visibility in the AI era',
    descriptionZh: 'AI 时代搜索可见性的完整入门指南',
  },
  {
    title: 'GEO-bench Dataset',
    source: 'HuggingFace',
    url: 'https://huggingface.co/datasets/GEO-Optim/geo-bench',
    type: 'data',
    description: 'Public dataset of 10,000 GEO evaluation queries',
    descriptionZh: '10,000 个 GEO 评估查询的公开数据集',
  },
];

const geoVsSeo = [
  { dimension: 'Primary Goal', dimensionZh: '主要目标', seo: 'Search result page ranking', seoZh: '搜索结果页排名', geo: 'Get cited in AI responses', geoZh: 'AI 回答中被引用' },
  { dimension: 'Trust Signals', dimensionZh: '信任信号', seo: 'Backlinks, domain authority', seoZh: '反向链接、域名权重', geo: 'Authoritative citations, structured data', geoZh: '引用权威、结构化数据' },
  { dimension: 'User Input', dimensionZh: '用户输入', seo: 'Keywords', seoZh: '关键词', geo: 'Natural language conversation', geoZh: '自然语言对话' },
  { dimension: 'Success Metrics', dimensionZh: '成功指标', seo: 'Traffic, rankings', seoZh: '流量、排名', geo: 'AI citation rate, Share of Voice', geoZh: 'AI 引用率、Share of Voice' },
  { dimension: 'Content Format', dimensionZh: '内容格式', seo: 'Long-form SEO articles', seoZh: '长篇 SEO 文章', geo: 'Structured, easily extractable info blocks', geoZh: '结构化、易提取的信息块' },
  { dimension: 'Update Frequency', dimensionZh: '更新频率', seo: 'Periodic optimization', seoZh: '定期优化', geo: 'Continuous updates for freshness', geoZh: '持续更新以保持新鲜度' },
];

export default function LearnPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const checklistItems = [
    t('learn.check1'), t('learn.check2'), t('learn.check3'), t('learn.check4'),
    t('learn.check5'), t('learn.check6'), t('learn.check7'), t('learn.check8'),
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('learn.title')}</h1>
            <p className="text-violet-100 mt-1">{t('learn.subtitle')}</p>
          </div>
        </div>
        <p className="text-violet-100 max-w-2xl">{t('learn.heroDesc')}</p>
      </div>

      {/* Industry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {industryStats.map((item, i) => (
          <Card key={i} className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-violet-600">{item.stat}</p>
              <p className="text-sm text-slate-600 mt-1">{locale === 'zh' ? item.labelZh : item.label}</p>
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
            {t('learn.tab.overview')}
          </TabsTrigger>
          <TabsTrigger value="strategies" className="gap-2">
            <Target className="w-4 h-4" />
            {t('learn.tab.strategies')}
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('learn.tab.metrics')}
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <BookOpen className="w-4 h-4" />
            {t('learn.tab.resources')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* What is GEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                {t('learn.whatIsGeo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                <strong>Generative Engine Optimization (GEO)</strong> — {t('learn.whatIsGeoDesc')}
              </p>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-violet-800 flex items-start gap-2">
                  <Quote className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{t('learn.geoQuote')}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* GEO vs SEO */}
          <Card>
            <CardHeader>
              <CardTitle>{t('learn.geoVsSeo')}</CardTitle>
              <CardDescription>{t('learn.geoVsSeoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">{t('learn.dim.dimension')}</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">{t('learn.dim.seo')}</th>
                      <th className="text-left py-3 px-4 font-medium text-violet-600">{t('learn.dim.geo')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geoVsSeo.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{locale === 'zh' ? row.dimensionZh : row.dimension}</td>
                        <td className="py-3 px-4 text-slate-600">{locale === 'zh' ? row.seoZh : row.seo}</td>
                        <td className="py-3 px-4 text-violet-700 bg-violet-50/50">{locale === 'zh' ? row.geoZh : row.geo}</td>
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
                {t('learn.whyGeo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">{t('learn.userBehavior')}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{t('learn.userBehaviorDesc')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold">{t('learn.firstMover')}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{t('learn.firstMoverDesc')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-rose-600" />
                    <h4 className="font-semibold">{t('learn.brandControl')}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{t('learn.brandControlDesc')}</p>
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
                        <h3 className="font-semibold text-lg">{locale === 'zh' ? strategy.titleZh : strategy.title}</h3>
                      </div>
                      <p className="text-slate-600 mb-3">{locale === 'zh' ? strategy.descriptionZh : strategy.description}</p>
                      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">{t('learn.example')}:</span> {locale === 'zh' ? strategy.exampleZh : strategy.example}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={strategy.impact === 'high' ? 'default' : 'secondary'}>
                        {strategy.impact === 'high' ? t('learn.highImpact') : t('learn.medImpact')}
                      </Badge>
                      <Badge variant="outline">
                        {strategy.difficulty === 'low' ? t('learn.easyImpl') :
                         strategy.difficulty === 'medium' ? t('learn.medDifficulty') : t('learn.techRequired')}
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
                {t('learn.checklist')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {checklistItems.map((item, i) => (
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
                      <h3 className="font-semibold">{locale === 'zh' ? metric.nameZh : metric.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{locale === 'zh' ? metric.descriptionZh : metric.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Measurement Framework */}
          <Card>
            <CardHeader>
              <CardTitle>{t('learn.frameworkTitle')}</CardTitle>
              <CardDescription>{t('learn.frameworkDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{t('learn.frameworkVis')}</div>
                  <div className="flex-1 h-3 bg-violet-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{t('learn.frameworkCit')}</div>
                  <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{t('learn.frameworkAcc')}</div>
                  <div className="flex-1 h-3 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{t('learn.frameworkInt')}</div>
                  <div className="flex-1 h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">{t('learn.frameworkFormula')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4">
            {resources.map((resource, i) => (
              <a key={i} href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="hover:shadow-md hover:border-violet-300 transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-sm text-violet-600 mb-2">{resource.source}</p>
                        <p className="text-slate-600">{locale === 'zh' ? resource.descriptionZh : resource.description}</p>
                      </div>
                      <Badge variant={
                        resource.type === 'research' ? 'default' :
                        resource.type === 'guide' ? 'secondary' :
                        resource.type === 'data' ? 'outline' : 'secondary'
                      }>
                        {resource.type === 'research' ? t('learn.resourceType.research') :
                         resource.type === 'guide' ? t('learn.resourceType.guide') :
                         resource.type === 'data' ? t('learn.resourceType.data') : t('learn.resourceType.education')}
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
                  <h3 className="text-xl font-bold mb-2">{t('learn.ctaTitle')}</h3>
                  <p className="text-violet-100">{t('learn.ctaDesc')}</p>
                </div>
                <a href="/brands" className="flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors">
                  {t('learn.ctaBtn')}
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
