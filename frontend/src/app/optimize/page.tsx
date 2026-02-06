'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wand2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
  Code,
  FileText,
  Quote,
  Link2,
  Users,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Mock data - simulating a brand audit result (like Semrush/GetMint)
const auditResult = {
  brand: 'Example Kids Fashion',
  domain: 'examplekids.com',
  overallScore: 58,
  lastAudit: '2026-02-05',
  categories: {
    content: { score: 65, issues: 3, passed: 5 },
    technical: { score: 45, issues: 5, passed: 2 },
    authority: { score: 72, issues: 2, passed: 6 },
    freshness: { score: 50, issues: 4, passed: 3 },
  },
};

// Optimization recommendations (inspired by GetMint/Semrush)
const recommendations = [
  {
    id: 1,
    category: 'content',
    priority: 'high',
    title: '添加产品 FAQ Schema',
    description: 'AI 模型更容易从结构化 FAQ 中提取信息并引用',
    impact: '+25% 引用可能性',
    effort: '2-4 小时',
    status: 'pending',
    details: {
      problem: '当前产品页面缺少 FAQPage schema markup，AI 难以识别常见问题和答案',
      solution: '为每个产品类别页添加 FAQPage schema，包含 5-10 个常见问题',
      example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What age range is this suitable for?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "This item is designed for children aged 2-6 years."
    }
  }]
}
</script>`,
      competitors: ['Carter\'s', 'Primary.com', 'Hanna Andersson'],
    },
  },
  {
    id: 2,
    category: 'technical',
    priority: 'high',
    title: '创建 llms.txt 文件',
    description: '告诉 AI 爬虫如何理解你的网站结构',
    impact: '+15% AI 爬虫效率',
    effort: '1 小时',
    status: 'pending',
    details: {
      problem: '网站缺少 llms.txt 文件，AI 爬虫无法快速了解网站内容概览',
      solution: '在根目录创建 llms.txt，包含网站主要内容分类和链接',
      example: `# Example Kids Fashion - llms.txt
# Children's clothing brand focused on sustainable fashion

## Main Categories
- /boys/ - Boys clothing (2-12 years)
- /girls/ - Girls clothing (2-12 years)
- /baby/ - Baby clothing (0-24 months)

## Key Information
- Founded: 2020
- Specialty: Organic cotton, sustainable materials
- Price Range: $$`,
      competitors: [],
    },
  },
  {
    id: 3,
    category: 'content',
    priority: 'high',
    title: '在首页添加品牌定位摘要',
    description: '40-80 字的品牌简介让 AI 快速理解你是谁',
    impact: '+30% 品牌描述准确性',
    effort: '1 小时',
    status: 'pending',
    details: {
      problem: '首页缺少简洁的品牌定位描述，AI 可能错误理解或描述你的品牌',
      solution: '在首页显眼位置添加 40-80 字的品牌定位摘要',
      example: `Example Kids Fashion 是一家专注于可持续童装的美国品牌，
成立于 2020 年。我们使用 100% 有机棉，为 0-12 岁儿童提供
舒适、环保、时尚的服装选择。价格定位中端，主打北美市场。`,
      competitors: ['Primary.com', 'Tea Collection'],
    },
  },
  {
    id: 4,
    category: 'authority',
    priority: 'medium',
    title: '增加第三方权威引用',
    description: '链接到行业报告、媒体报道可提升可信度',
    impact: '+20% 信任信号',
    effort: '4-8 小时',
    status: 'pending',
    details: {
      problem: '内容缺少对权威来源的引用，降低了 AI 对内容可信度的评估',
      solution: '在产品页和博客中引用行业报告、检测认证、媒体报道',
      example: '例如："根据 OEKO-TEX® 认证标准，我们的面料不含有害化学物质..."',
      competitors: ['Pact', 'Burt\'s Bees Baby'],
    },
  },
  {
    id: 5,
    category: 'technical',
    priority: 'medium',
    title: '添加 Product Schema',
    description: '让 AI 正确理解产品价格、库存、评分',
    impact: '+18% 产品信息准确性',
    effort: '3-6 小时',
    status: 'in_progress',
    details: {
      problem: '产品页缺少完整的 Product schema，AI 无法准确获取价格和库存信息',
      solution: '为每个产品添加完整的 Product schema，包含价格、库存、评分',
      example: `{
  "@type": "Product",
  "name": "Organic Cotton T-Shirt",
  "brand": "Example Kids Fashion",
  "offers": {
    "@type": "Offer",
    "price": "24.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}`,
      competitors: ['Carter\'s', 'OshKosh'],
    },
  },
  {
    id: 6,
    category: 'freshness',
    priority: 'medium',
    title: '更新产品描述添加时间戳',
    description: '显示"最后更新"日期表明内容新鲜度',
    impact: '+12% 新鲜度信号',
    effort: '2-4 小时',
    status: 'pending',
    details: {
      problem: '页面没有显示更新日期，AI 可能认为内容过时',
      solution: '在产品页和文章页显示"最后更新: YYYY-MM-DD"',
      example: '<time datetime="2026-02-01">最后更新: 2026年2月1日</time>',
      competitors: [],
    },
  },
  {
    id: 7,
    category: 'authority',
    priority: 'low',
    title: '建立 Entity Stack (实体堆叠)',
    description: '在 BBB, G2, Trustpilot 等平台建立一致的品牌存在',
    impact: '+15% 实体识别',
    effort: '8-16 小时',
    status: 'pending',
    details: {
      problem: '品牌在第三方平台的存在感不足，AI 难以验证品牌真实性',
      solution: '在 20-30 个权威平台创建一致的品牌 profile',
      example: '创建: BBB, Crunchbase, G2, Trustpilot, Glassdoor, Facebook, Instagram...',
      competitors: ['Janie and Jack', 'Tea Collection'],
    },
  },
];

// Citation Gap Analysis (like GetMint)
const citationGaps = [
  {
    query: 'best organic kids clothing brands',
    yourRank: null, // not mentioned
    competitors: [
      { name: 'Primary.com', rank: 1, source: 'primary.com/about' },
      { name: 'Pact', rank: 2, source: 'wearpact.com/kids' },
      { name: 'Hanna Andersson', rank: 3, source: 'hannaandersson.com' },
    ],
  },
  {
    query: 'sustainable children fashion US',
    yourRank: 5,
    competitors: [
      { name: 'Tea Collection', rank: 1, source: 'teacollection.com' },
      { name: 'Mini Mioche', rank: 2, source: 'minimioche.com' },
    ],
  },
  {
    query: 'affordable baby clothes online',
    yourRank: null,
    competitors: [
      { name: 'Carter\'s', rank: 1, source: 'carters.com' },
      { name: 'Old Navy', rank: 2, source: 'oldnavy.com' },
      { name: 'Target', rank: 3, source: 'target.com/baby' },
    ],
  },
];

export default function OptimizePage() {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">高优先级</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700">中优先级</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">低优先级</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'technical':
        return <Code className="w-4 h-4" />;
      case 'authority':
        return <Users className="w-4 h-4" />;
      case 'freshness':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wand2 className="w-7 h-7 text-violet-600" />
            GEO 优化建议
          </h1>
          <p className="text-slate-500 mt-1">
            基于 AI 搜索最佳实践的个性化优化建议
          </p>
        </div>
        <Badge variant="outline" className="text-slate-500">
          Demo 数据
        </Badge>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">GEO 就绪分数</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-5xl font-bold ${getScoreColor(auditResult.overallScore)}`}>
                  {auditResult.overallScore}
                </span>
                <span className="text-slate-400 text-lg">/ 100</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">
                {auditResult.brand} · {auditResult.domain}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(auditResult.categories).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-xs text-slate-400 capitalize">{
                    key === 'content' ? '内容' :
                    key === 'technical' ? '技术' :
                    key === 'authority' ? '权威' : '新鲜度'
                  }</p>
                  <p className={`text-xl font-bold ${getScoreColor(value.score)}`}>
                    {value.score}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(auditResult.categories).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{
                  key === 'content' ? '内容结构' :
                  key === 'technical' ? '技术实现' :
                  key === 'authority' ? '权威信号' : '内容新鲜度'
                }</span>
                <span className={`text-lg font-bold ${getScoreColor(value.score)}`}>
                  {value.score}
                </span>
              </div>
              <Progress value={value.score} className="h-2" />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {value.issues} 问题
                </span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {value.passed} 通过
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            优化建议
          </CardTitle>
          <CardDescription>
            按优先级排序的具体优化步骤，点击展开查看详情
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border rounded-lg transition-all ${
                expandedRec === rec.id ? 'border-violet-300 bg-violet-50/50' : 'hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    rec.category === 'content' ? 'bg-blue-100 text-blue-600' :
                    rec.category === 'technical' ? 'bg-purple-100 text-purple-600' :
                    rec.category === 'authority' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-slate-500">{rec.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getPriorityBadge(rec.priority)}
                  <Badge variant="outline" className="text-emerald-600">
                    {rec.impact}
                  </Badge>
                  {expandedRec === rec.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedRec === rec.id && (
                <div className="px-4 pb-4 border-t pt-4 space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">问题</h5>
                    <p className="text-sm text-slate-600">{rec.details.problem}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-1">解决方案</h5>
                    <p className="text-sm text-slate-600">{rec.details.solution}</p>
                  </div>
                  {rec.details.example && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 mb-1">示例代码</h5>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
                        {rec.details.example}
                      </pre>
                    </div>
                  )}
                  {rec.details.competitors.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 mb-1">竞品已实施</h5>
                      <div className="flex gap-2">
                        {rec.details.competitors.map((comp, i) => (
                          <Badge key={i} variant="secondary">{comp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-500">
                      预估工作量: {rec.effort}
                    </span>
                    <button className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium">
                      标记为已完成 <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Citation Gap Analysis (GetMint style) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Citation Gap 分析
          </CardTitle>
          <CardDescription>
            你的品牌缺席但竞品被引用的查询（学习 GetMint 截流功能）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {citationGaps.map((gap, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">"{gap.query}"</p>
                    <p className="text-sm text-slate-500">
                      你的排名: {gap.yourRank ? `#${gap.yourRank}` : (
                        <span className="text-red-600">未出现</span>
                      )}
                    </p>
                  </div>
                  {!gap.yourRank && (
                    <Badge className="bg-red-100 text-red-700">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Citation Gap
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">AI 引用的竞品:</p>
                  {gap.competitors.map((comp, j) => (
                    <div key={j} className="flex items-center justify-between text-sm bg-slate-50 rounded p-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                          #{comp.rank}
                        </span>
                        <span className="font-medium">{comp.name}</span>
                      </div>
                      <a
                        href={`https://${comp.source}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        {comp.source}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                  分析竞品内容结构 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">需要帮助实施这些优化？</h3>
              <p className="text-violet-100">
                查看 GEO 学习中心获取详细的实施指南
              </p>
            </div>
            <a
              href="/learn"
              className="flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
            >
              查看学习中心
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
