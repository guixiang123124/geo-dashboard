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
    'nav.insights': 'Insights Explorer',
    'nav.learn': 'GEO Learning',
    'nav.optimize': 'Optimization',
    'nav.analytics': 'Analytics',
    'nav.prompts': 'Prompt Research',
    'nav.compete': 'Competitive',
    'nav.trends': 'Trends',
    'nav.brands': 'Brands',
    'nav.evaluations': 'Evaluations',
    'nav.reports': 'Reports',
    'nav.audit': 'AI Audit',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.settings': 'Settings',

    // Nav groups
    'nav.group.core': 'Core',
    'nav.group.analyze': 'Analyze',
    'nav.group.improve': 'Improve',

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
    'nav.insights': '洞察探索',
    'nav.learn': 'GEO 学习中心',
    'nav.optimize': '优化建议',
    'nav.analytics': '数据分析',
    'nav.prompts': 'Prompt 研究',
    'nav.compete': '竞品对标',
    'nav.trends': '趋势追踪',
    'nav.brands': '品牌管理',
    'nav.evaluations': '评估记录',
    'nav.reports': '报告中心',
    'nav.audit': 'AI 审计',
    'nav.pricing': '定价',
    'nav.about': '关于',
    'nav.settings': '设置',

    // Nav groups
    'nav.group.core': '核心',
    'nav.group.analyze': '分析工具',
    'nav.group.improve': '提升',

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
