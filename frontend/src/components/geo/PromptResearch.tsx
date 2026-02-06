'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquareText,
  TrendingUp,
  Eye,
  Target,
  ShoppingCart,
  HelpCircle,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface PromptData {
  id: string;
  text: string;
  category: 'awareness' | 'consideration' | 'decision';
  intent: string;
  volume: 'high' | 'medium' | 'low';
  yourBrandMentioned: boolean;
  topBrands: string[];
  opportunity: 'high' | 'medium' | 'low';
}

// Mock data for demo
const mockPrompts: PromptData[] = [
  {
    id: '1',
    text: 'What are the best organic kids clothing brands?',
    category: 'awareness',
    intent: '品牌发现',
    volume: 'high',
    yourBrandMentioned: false,
    topBrands: ['Primary.com', 'Pact', 'Hanna Andersson'],
    opportunity: 'high',
  },
  {
    id: '2',
    text: 'Best sustainable baby clothes in the US',
    category: 'awareness',
    intent: '可持续时尚',
    volume: 'high',
    yourBrandMentioned: true,
    topBrands: ["Burt's Bees Baby", 'Tea Collection', 'Your Brand'],
    opportunity: 'medium',
  },
  {
    id: '3',
    text: "Carter's vs OshKosh for toddler clothes",
    category: 'consideration',
    intent: '品牌对比',
    volume: 'medium',
    yourBrandMentioned: false,
    topBrands: ["Carter's", 'OshKosh'],
    opportunity: 'low',
  },
  {
    id: '4',
    text: 'Where to buy affordable kids party dresses',
    category: 'decision',
    intent: '购买意图',
    volume: 'high',
    yourBrandMentioned: false,
    topBrands: ['Amazon', 'Target', 'Janie and Jack'],
    opportunity: 'high',
  },
  {
    id: '5',
    text: 'Best winter jackets for kids 2026',
    category: 'consideration',
    intent: '产品研究',
    volume: 'medium',
    yourBrandMentioned: true,
    topBrands: ['Patagonia', 'North Face', 'Your Brand'],
    opportunity: 'medium',
  },
  {
    id: '6',
    text: 'Is Primary.com worth the price?',
    category: 'decision',
    intent: '购买决策',
    volume: 'low',
    yourBrandMentioned: false,
    topBrands: ['Primary.com'],
    opportunity: 'low',
  },
  {
    id: '7',
    text: 'Cute outfit ideas for toddler girl',
    category: 'awareness',
    intent: '灵感搜索',
    volume: 'high',
    yourBrandMentioned: false,
    topBrands: ['Pinterest', 'Instagram'],
    opportunity: 'medium',
  },
  {
    id: '8',
    text: 'Best kids clothing brands for sensitive skin',
    category: 'consideration',
    intent: '特殊需求',
    volume: 'medium',
    yourBrandMentioned: true,
    topBrands: ['Pact', 'Your Brand', 'Hanna Andersson'],
    opportunity: 'high',
  },
];

const funnelStages = [
  { id: 'awareness', label: '认知', icon: Eye, color: 'blue', description: '用户开始了解品类' },
  { id: 'consideration', label: '考虑', icon: Scale, color: 'amber', description: '对比不同选项' },
  { id: 'decision', label: '决策', icon: ShoppingCart, color: 'green', description: '准备购买' },
];

export function PromptResearch() {
  const [activeStage, setActiveStage] = useState<string>('all');

  const filteredPrompts = activeStage === 'all' 
    ? mockPrompts 
    : mockPrompts.filter(p => p.category === activeStage);

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getOpportunityBadge = (opportunity: string) => {
    switch (opportunity) {
      case 'high':
        return <Badge className="bg-violet-100 text-violet-700">高机会</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-700">中机会</Badge>;
      default:
        return <Badge variant="outline">低机会</Badge>;
    }
  };

  // Stats
  const stats = {
    total: mockPrompts.length,
    mentioned: mockPrompts.filter(p => p.yourBrandMentioned).length,
    highOpportunity: mockPrompts.filter(p => p.opportunity === 'high' && !p.yourBrandMentioned).length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-violet-600" />
              Prompt 研究
            </CardTitle>
            <CardDescription>
              分析用户在 AI 平台的真实提问，发现品牌曝光机会
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{stats.total} 个提示词</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-700">{stats.mentioned}</span>
            </div>
            <p className="text-xs text-emerald-600">品牌已覆盖</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-red-700">{stats.total - stats.mentioned}</span>
            </div>
            <p className="text-xs text-red-600">尚未覆盖</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-2xl font-bold text-violet-700">{stats.highOpportunity}</span>
            </div>
            <p className="text-xs text-violet-600">高机会缺口</p>
          </div>
        </div>

        {/* Funnel Stage Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveStage('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStage === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部
          </button>
          {funnelStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeStage === stage.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <stage.icon className="w-4 h-4" />
              {stage.label}
            </button>
          ))}
        </div>

        {/* Funnel Visualization */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
          {funnelStages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  stage.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stage.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  <stage.icon className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm">{stage.label}</p>
                <p className="text-xs text-slate-500">{stage.description}</p>
                <p className="text-lg font-bold mt-1">
                  {mockPrompts.filter(p => p.category === stage.id).length}
                </p>
              </div>
              {i < funnelStages.length - 1 && (
                <ArrowRight className="w-6 h-6 text-slate-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Prompt List */}
        <div className="space-y-3">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                prompt.yourBrandMentioned
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : prompt.opportunity === 'high'
                  ? 'bg-violet-50/50 border-violet-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <p className="font-medium">"{prompt.text}"</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{prompt.intent}</Badge>
                    <Badge className={getVolumeColor(prompt.volume)}>
                      {prompt.volume === 'high' ? '高频' : prompt.volume === 'medium' ? '中频' : '低频'}
                    </Badge>
                    {prompt.yourBrandMentioned ? (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        已覆盖
                      </Badge>
                    ) : (
                      getOpportunityBadge(prompt.opportunity)
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">AI 推荐的品牌:</p>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {prompt.topBrands.slice(0, 3).map((brand, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded ${
                          brand === 'Your Brand'
                            ? 'bg-emerald-100 text-emerald-700 font-medium'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action CTA */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white">
          <div>
            <p className="font-semibold">发现 {stats.highOpportunity} 个高价值机会</p>
            <p className="text-sm text-violet-100">优化内容以覆盖这些高频提示词</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors">
            查看优化建议
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PromptResearch;
