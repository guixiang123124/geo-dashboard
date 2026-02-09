'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'zh';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ─── Translations ────────────────────────────────────────────
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Sidebar nav
    'nav.dashboard': 'Dashboard',
    'nav.diagnosis': 'AI Diagnosis',
    'nav.brands': 'Brands',
    'nav.competitors': 'Competitors',
    'nav.trends': 'Trends',
    'nav.insights': 'Insights',
    'nav.learn': 'GEO Learning',
    'nav.settings': 'Settings',
    'nav.more': 'More',
    // Legacy keys (kept for compatibility)
    'nav.optimize': 'Optimization',
    'nav.analytics': 'Analytics',
    'nav.prompts': 'Prompt Research',
    'nav.compete': 'Competitive',
    'nav.evaluations': 'Evaluations',
    'nav.reports': 'Reports',
    'nav.audit': 'AI Diagnosis',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',

    // Landing page
    'landing.tagline': 'Free Instant AI Visibility Diagnosis',
    'landing.hero.title1': 'Is Your Brand Visible',
    'landing.hero.title2': 'to AI Search?',
    'landing.hero.desc': '40% of Gen Z use ChatGPT and Gemini for product research. Get your AI visibility score in 10 seconds — completely free.',
    'landing.hero.diagnosisTime': 'Diagnosis Time',
    'landing.hero.aiPrompts': 'AI-Generated Prompts',
    'landing.hero.aiPlatforms': 'AI Platforms',
    'landing.cta.diagnoseFree': 'Diagnose Free',
    'landing.cta.tryFree': 'Try It Free — No Signup',
    'landing.cta.startFree': 'Start Free',
    'landing.cta.freeBrandAudit': 'Free Brand Audit',
    'landing.cta.signIn': 'Sign In',
    'landing.how.title': 'How It Works',
    'landing.how.subtitle': 'From domain to diagnosis in four simple steps',
    'landing.dashboard.tag': 'Dashboard',
    'landing.dashboard.title': 'Your AI Visibility Command Center',
    'landing.dashboard.desc': 'See how your brand stacks up against competitors with real-time SOV scores, brand rankings, and trend sparklines.',
    'landing.diagnosis.tag': 'Free AI Diagnosis',
    'landing.diagnosis.title': 'Instant AI Brand Diagnosis',
    'landing.diagnosis.desc': 'Enter any domain → AI crawls your site → generates smart prompts → scores you in real time. Try it free, no signup required.',
    'landing.compete.tag': 'Competitive Intelligence',
    'landing.compete.title': 'Know Exactly Where You Stand',
    'landing.compete.desc': 'Head-to-head brand comparison, category benchmarks, and citation gap analysis.',
    'landing.prompts.tag': 'Prompt Research',
    'landing.prompts.title': 'Understand What AI Says About You',
    'landing.prompts.desc': 'AI-generated prompts tailored to your brand. Custom prompt support. Organized by intent.',
    'landing.trends.tag': 'Trends & Analytics',
    'landing.trends.title': 'Track Your AI Visibility Trajectory',
    'landing.trends.desc': 'Score changes over time, industry trend monitoring, and cross-platform analytics.',
    'landing.optimize.tag': 'Optimization & Learning',
    'landing.optimize.title': 'Not Just Data — Actionable Insights',
    'landing.optimize.desc': 'AI-driven recommendations and a GEO knowledge base to help you improve.',
    'landing.platform.tag': 'Multi-Platform',
    'landing.platform.title': 'One Dashboard, All AI Platforms',
    'landing.platform.desc': 'Different AI models recommend different brands. Test yours across all major platforms.',
    'landing.pricing.title': 'Simple Pricing',
    'landing.pricing.subtitle': 'Start free. Upgrade when you need more.',
    'landing.final.title': 'Ready to See How AI Views Your Brand?',
    'landing.final.desc': 'Get your free AI visibility diagnosis in 10 seconds. No credit card. No signup.',
    'landing.footer.noCreditCard': 'No credit card',
    'landing.footer.results10s': 'Results in 10 seconds',
    'landing.footer.freeToStart': '100% free to start',

    // Header
    'header.welcome': 'Welcome back',
    'header.subtitle': 'Track your brand performance in the AI era',
    'header.signin': 'Sign In',
    'header.signup': 'Sign Up',
    'header.signout': 'Sign out',
    'header.settings': 'Settings',

    // Dashboard
    'dash.title': 'AI Visibility Dashboard',
    'dash.subtitle': 'Generative Engine Optimization — measuring how AI platforms represent your brands',
    'dash.runEval': 'Run Evaluation',
    'dash.addBrand': 'Add Brand',
    'dash.viewReports': 'View Reports',
    'dash.lastEval': 'Last evaluated',
    'dash.noEval': 'No evaluations yet',
    'dash.brands': 'Brands',
    'dash.avgScore': 'Avg Score',
    'dash.visible': 'Visible',
    'dash.mentions': 'Mentions',
    'dash.citation': 'Citation',
    'dash.topScore': 'Top Score',
    'dash.evaluated': 'evaluated',
    'dash.mentionedByAI': 'mentioned by AI',
    'dash.acrossPrompts': 'across all prompts',
    'dash.avgCitationRate': 'avg citation rate',
    'dash.compositeGEO': 'composite GEO',
    'dash.scoreDimensions': 'GEO Score Dimensions',
    'dash.scoreDimDesc': 'The composite GEO score (0-100) is calculated from four dimensions',
    'dash.visibility': 'Visibility',
    'dash.citationDim': 'Citation',
    'dash.framing': 'Framing',
    'dash.intent': 'Intent',
    'dash.avgAcross': 'avg across',
    'dash.brandsBrands': 'brands',
    'dash.brandPerf': 'Brand Performance',
    'dash.visibleToAI': 'brands visible to AI out of',
    'dash.viewAnalytics': 'View Analytics',
    'dash.topPerformers': 'Top Performers',
    'dash.highestGEO': 'Highest GEO composite scores',
    'dash.noScoresYet': 'No brands with scores yet',
    'dash.needsAttention': 'Needs Attention',
    'dash.notMentioned': 'brands not mentioned by AI',
    'dash.allPerforming': 'All brands performing well',
    'dash.lowScoring': 'Low scoring brands',
    'dash.notVisibleZero': 'Not visible (score 0)',
    'dash.sov': 'Share of Voice',
    'dash.sovDesc': 'Brand market share in AI responses',
    'dash.topBrand': 'Top Brand',
    'dash.viewCompete': 'View competitive details',
    'dash.trendTitle': 'Visibility Trends',
    'dash.trendDesc': '8-week brand AI visibility changes (Demo)',
    'dash.viewTrends': 'View full trend analysis',
    'dash.promptResearch': 'Prompt Research',
    'dash.promptDesc': 'Analyze real AI prompts to discover brand exposure opportunities',
    'dash.competeTitle': 'Competitive Benchmark',
    'dash.competeDesc': 'Head-to-head brand comparison, Citation Gap analysis',
    'dash.trendsTitle': 'Trend Tracking',
    'dash.trendsDesc': 'Track visibility changes, seasonal trends, and AI platform differences',
    'dash.howScoring': 'How GEO Scoring Works',
    'dash.geoExplain': 'GEO (Generative Engine Optimization) measures how AI models represent your brand when users ask relevant questions.',
    'dash.visDesc': 'Is the brand mentioned in AI responses?',
    'dash.citDesc': 'Does AI link to or cite the brand?',
    'dash.framDesc': 'How positively is the brand described?',
    'dash.intDesc': 'Does AI recommend the brand for the right queries?',
    'dash.scoreInterp': 'Score interpretation',
    'dash.strong': 'Strong AI presence, frequently mentioned and recommended',
    'dash.moderate': 'Moderate presence, mentioned in some contexts',
    'dash.low': 'Low visibility, rarely mentioned by AI',
    'dash.zero': 'Not mentioned in any AI responses',
    'dash.basedOn': 'Scores are based on evaluation against Gemini 2.0 Flash. Multi-model support coming soon.',
    'dash.planned': 'planned',

    // Prompts page
    'prompts.title': 'Prompt Research Tool',
    'prompts.subtitle': 'Discover which AI prompts trigger brand mentions, analyze intent distribution and brand coverage matrix',
    'prompts.funnelTitle': 'Intent Funnel Analysis',
    'prompts.awareness': 'Awareness',
    'prompts.consideration': 'Consideration',
    'prompts.decision': 'Decision',
    'prompts.mentions': 'mentions',
    'prompts.hotTitle': 'Hot Prompts Top 10',
    'prompts.testTitle': 'Test a Prompt',
    'prompts.testPlaceholder': 'Enter any prompt to see simulated brand mentions...',
    'prompts.testBtn': 'Test',
    'prompts.simResult': 'Simulated Result (Demo)',
    'prompts.sentiment': 'Sentiment',
    'prompts.brandMentions': 'Brand mentions',
    'prompts.matrixTitle': 'Brand-Prompt Coverage Matrix',
    'prompts.prompt': 'Prompt',
    'prompts.library': 'Prompt Library',
    'prompts.all': 'All',
    'prompts.search': 'Search prompts...',
    'prompts.intentCol': 'Intent',
    'prompts.mentionsCol': 'Brand Mentions',
    'prompts.difficulty': 'Difficulty',
    'prompts.topBrands': 'Top Brands',
    'prompts.trending': 'Trending',

    // Compete page
    'compete.title': 'Competitive Benchmark',
    'compete.subtitle': 'Multi-dimensional brand comparison, discover citation gaps and competitive opportunities',
    'compete.selectBrands': 'Select brands (2-4)',
    'compete.radarTitle': 'Multi-Dimensional Radar',
    'compete.landscapeTitle': 'Competitive Landscape Map',
    'compete.bubbleSize': 'Bubble size = mentions',
    'compete.aiRecType': 'AI Recommendation Type',
    'compete.composite': 'Composite',
    'compete.citationGap': 'Citation Gap Analysis',
    'compete.citationGapDesc': 'Sources cited for competitors but not for',
    'compete.citedBy': 'Cited by',
    'compete.actionTitle': 'Recommended Actions',

    // Trends page
    'trends.title': 'Trend Tracking',
    'trends.subtitle': 'Track brand visibility changes on AI platforms, discover category trends and seasonal insights',
    'trends.weeklyTitle': 'Weekly Visibility Trends',
    'trends.moversTitle': 'Movers & Shakers',
    'trends.categoryTitle': 'Category Trends',
    'trends.seasonTitle': 'Seasonal Insights',
    'trends.platformTitle': 'AI Platform Comparison',
    'trends.brand': 'Brand',

    // Learn page
    'learn.title': 'GEO Learning Center',
    'learn.subtitle': 'Master Generative Engine Optimization — improve your brand\'s AI visibility',

    // Optimize page
    'optimize.title': 'Optimization Suggestions',
    'optimize.subtitle': 'AI-driven recommendations to improve your brand\'s GEO performance',

    // System
    'system.status': 'System Status',
    'system.operational': 'All Systems Operational',
    'system.updated': 'Last updated: just now',
  },

  zh: {
    // Sidebar nav
    'nav.dashboard': '仪表盘',
    'nav.diagnosis': 'AI 诊断',
    'nav.brands': '品牌管理',
    'nav.competitors': '竞品分析',
    'nav.trends': '趋势追踪',
    'nav.insights': '洞察探索',
    'nav.learn': 'GEO 学习中心',
    'nav.settings': '设置',
    'nav.more': '更多',
    // Legacy keys
    'nav.optimize': '优化建议',
    'nav.analytics': '数据分析',
    'nav.prompts': 'Prompt 研究',
    'nav.compete': '竞品对标',
    'nav.evaluations': '评估记录',
    'nav.reports': '报告中心',
    'nav.audit': 'AI 诊断',
    'nav.pricing': '定价',
    'nav.about': '关于',

    // Landing page
    'landing.tagline': '免费即时 AI 可见性诊断',
    'landing.hero.title1': '你的品牌在 AI 搜索中',
    'landing.hero.title2': '可见吗？',
    'landing.hero.desc': '40% 的 Z 世代使用 ChatGPT 和 Gemini 进行产品研究。10 秒内获得你的 AI 可见性评分 — 完全免费。',
    'landing.hero.diagnosisTime': '诊断时间',
    'landing.hero.aiPrompts': 'AI 生成的提示词',
    'landing.hero.aiPlatforms': 'AI 平台',
    'landing.cta.diagnoseFree': '免费诊断',
    'landing.cta.tryFree': '免费试用 — 无需注册',
    'landing.cta.startFree': '免费开始',
    'landing.cta.freeBrandAudit': '免费品牌审计',
    'landing.cta.signIn': '登录',
    'landing.how.title': '工作原理',
    'landing.how.subtitle': '从域名到诊断，只需四个简单步骤',
    'landing.dashboard.tag': '仪表盘',
    'landing.dashboard.title': '你的 AI 可见性指挥中心',
    'landing.dashboard.desc': '查看你的品牌与竞品的对比，包括实时 SOV 评分、品牌排名和趋势曲线。',
    'landing.diagnosis.tag': '免费 AI 诊断',
    'landing.diagnosis.title': '即时 AI 品牌诊断',
    'landing.diagnosis.desc': '输入任意域名 → AI 爬取你的网站 → 生成智能提示词 → 实时评分。免费试用，无需注册。',
    'landing.compete.tag': '竞品情报',
    'landing.compete.title': '准确了解你的市场位置',
    'landing.compete.desc': '品牌一对一对比、品类基准和引用差距分析。',
    'landing.prompts.tag': 'Prompt 研究',
    'landing.prompts.title': '了解 AI 如何谈论你',
    'landing.prompts.desc': '为你的品牌量身定制的 AI 提示词。支持自定义提示词。按意图分类。',
    'landing.trends.tag': '趋势与分析',
    'landing.trends.title': '追踪你的 AI 可见性轨迹',
    'landing.trends.desc': '评分随时间变化、行业趋势监控和跨平台分析。',
    'landing.optimize.tag': '优化与学习',
    'landing.optimize.title': '不只是数据 — 可执行的洞察',
    'landing.optimize.desc': 'AI 驱动的建议和 GEO 知识库，助你改进。',
    'landing.platform.tag': '多平台',
    'landing.platform.title': '一个仪表盘，所有 AI 平台',
    'landing.platform.desc': '不同 AI 模型推荐不同品牌。在所有主要平台上测试你的品牌。',
    'landing.pricing.title': '简单定价',
    'landing.pricing.subtitle': '免费开始。需要时升级。',
    'landing.final.title': '准备好看看 AI 如何看待你的品牌了吗？',
    'landing.final.desc': '10 秒内获得免费 AI 可见性诊断。无需信用卡。无需注册。',
    'landing.footer.noCreditCard': '无需信用卡',
    'landing.footer.results10s': '10 秒出结果',
    'landing.footer.freeToStart': '100% 免费起步',

    // Header
    'header.welcome': '欢迎回来',
    'header.subtitle': '追踪你的品牌在 AI 时代的表现',
    'header.signin': '登录',
    'header.signup': '注册',
    'header.signout': '退出登录',
    'header.settings': '设置',

    // Dashboard
    'dash.title': 'GEO 品牌表现总览',
    'dash.subtitle': '生成式引擎优化 — 衡量 AI 平台如何展现你的品牌',
    'dash.runEval': '运行评估',
    'dash.addBrand': '添加品牌',
    'dash.viewReports': '查看报告',
    'dash.lastEval': '上次评估',
    'dash.noEval': '暂无评估',
    'dash.brands': '品牌数',
    'dash.avgScore': '平均分',
    'dash.visible': '可见品牌',
    'dash.mentions': '提及次数',
    'dash.citation': '引用率',
    'dash.topScore': '最高分',
    'dash.evaluated': '已评估',
    'dash.mentionedByAI': '被 AI 提及',
    'dash.acrossPrompts': '跨所有提示词',
    'dash.avgCitationRate': '平均引用率',
    'dash.compositeGEO': 'GEO 综合分',
    'dash.scoreDimensions': 'GEO 评分维度',
    'dash.scoreDimDesc': 'GEO 综合分 (0-100) 由四个维度计算得出',
    'dash.visibility': '可见度',
    'dash.citationDim': '引用度',
    'dash.framing': '表述质量',
    'dash.intent': '意图匹配',
    'dash.avgAcross': '平均，共',
    'dash.brandsBrands': '个品牌',
    'dash.brandPerf': '品牌表现',
    'dash.visibleToAI': '个品牌被 AI 识别，共评估',
    'dash.viewAnalytics': '查看分析',
    'dash.topPerformers': '表现最佳',
    'dash.highestGEO': 'GEO 综合分最高的品牌',
    'dash.noScoresYet': '暂无评分数据',
    'dash.needsAttention': '需要关注',
    'dash.notMentioned': '个品牌未被 AI 提及',
    'dash.allPerforming': '所有品牌表现良好',
    'dash.lowScoring': '低分品牌',
    'dash.notVisibleZero': '不可见 (0分)',
    'dash.sov': '市场声量份额',
    'dash.sovDesc': '品牌在 AI 回答中的市场占有率',
    'dash.topBrand': '第一名',
    'dash.viewCompete': '查看竞品详细对标',
    'dash.trendTitle': '可见性趋势',
    'dash.trendDesc': '近 8 周品牌 AI 可见性变化 (Demo)',
    'dash.viewTrends': '查看完整趋势分析',
    'dash.promptResearch': 'Prompt 研究',
    'dash.promptDesc': '分析用户在 AI 中的真实提问，发现品牌曝光机会',
    'dash.competeTitle': '竞品对标',
    'dash.competeDesc': 'Head-to-head 品牌对比，发现 Citation Gap',
    'dash.trendsTitle': '趋势追踪',
    'dash.trendsDesc': '追踪品牌可见性变化，季节性趋势和 AI 平台差异',
    'dash.howScoring': 'GEO 评分机制',
    'dash.geoExplain': 'GEO（生成式引擎优化）衡量 AI 模型在用户提问时如何展示你的品牌。',
    'dash.visDesc': 'AI 回答中是否提到了该品牌？',
    'dash.citDesc': 'AI 是否提供了品牌链接或引用？',
    'dash.framDesc': '品牌被描述得多正面？',
    'dash.intDesc': 'AI 是否在正确的查询中推荐了该品牌？',
    'dash.scoreInterp': '分数解读',
    'dash.strong': '强 AI 存在感，频繁被提及和推荐',
    'dash.moderate': '中等存在感，在部分场景中被提及',
    'dash.low': '低可见度，很少被 AI 提及',
    'dash.zero': '在任何 AI 回答中都未被提及',
    'dash.basedOn': '评分基于 Gemini 2.0 Flash 模型。多模型支持即将推出。',
    'dash.planned': '计划中',

    // Prompts page
    'prompts.title': 'Prompt 研究工具',
    'prompts.subtitle': '发现哪些 AI 提示词触发品牌提及，分析提示词意图分布与品牌覆盖矩阵',
    'prompts.funnelTitle': '意图漏斗分析',
    'prompts.awareness': '认知阶段',
    'prompts.consideration': '考虑阶段',
    'prompts.decision': '决策阶段',
    'prompts.mentions': '次提及',
    'prompts.hotTitle': '热门提示词 Top 10',
    'prompts.testTitle': '测试提示词',
    'prompts.testPlaceholder': '输入任意提示词，查看模拟 AI 回答中的品牌提及...',
    'prompts.testBtn': '测试',
    'prompts.simResult': '模拟结果 (Demo)',
    'prompts.sentiment': '情感倾向',
    'prompts.brandMentions': '品牌提及数',
    'prompts.matrixTitle': '品牌-提示词覆盖矩阵',
    'prompts.prompt': '提示词',
    'prompts.library': '提示词库',
    'prompts.all': '全部',
    'prompts.search': '搜索提示词...',
    'prompts.intentCol': '意图',
    'prompts.mentionsCol': '品牌提及',
    'prompts.difficulty': '难度',
    'prompts.topBrands': 'Top 品牌',
    'prompts.trending': '趋势',

    // Compete page
    'compete.title': '竞品对标分析',
    'compete.subtitle': '品牌间多维度对比，发现引用差距与竞争机会',
    'compete.selectBrands': '选择品牌 (2-4)',
    'compete.radarTitle': '多维雷达对比',
    'compete.landscapeTitle': '竞争格局地图',
    'compete.bubbleSize': '气泡大小 = 提及次数',
    'compete.aiRecType': 'AI 推荐类型',
    'compete.composite': '综合',
    'compete.citationGap': '引用差距分析',
    'compete.citationGapDesc': '以下信息来源被竞品引用，但',
    'compete.citedBy': '被',
    'compete.actionTitle': '推荐行动计划',

    // Trends page
    'trends.title': '趋势追踪',
    'trends.subtitle': '追踪品牌在 AI 平台的可见度变化，发现品类趋势与季节性洞察',
    'trends.weeklyTitle': '周度可见度趋势',
    'trends.moversTitle': '涨跌榜',
    'trends.categoryTitle': '品类趋势',
    'trends.seasonTitle': '季节性洞察',
    'trends.platformTitle': 'AI 平台对比',
    'trends.brand': '品牌',

    // Learn page
    'learn.title': 'GEO 学习中心',
    'learn.subtitle': '掌握生成式引擎优化 — 提升品牌 AI 可见度',

    // Optimize page
    'optimize.title': '优化建议',
    'optimize.subtitle': 'AI 驱动的建议，帮助提升品牌 GEO 表现',

    // System
    'system.status': '系统状态',
    'system.operational': '所有系统正常运行',
    'system.updated': '刚刚更新',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('geo-locale') as Locale) || 'en';
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('geo-locale', newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] || translations['en'][key] || key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
