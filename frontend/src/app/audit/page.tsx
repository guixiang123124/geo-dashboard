'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search, Shield, CheckCircle2, AlertTriangle, XCircle, Globe, FileText,
  Code, Eye, Award, ExternalLink, ArrowRight, BarChart3, Zap, Lock, Star
} from 'lucide-react';

// Demo audit data for Carter's
const demoAudit = {
  url: 'carters.com',
  overallScore: 72,
  grade: 'B+',
  percentile: 65,
  technical: [
    { name: 'Schema.org Product markup', status: 'pass', detail: 'Found on 92% of product pages' },
    { name: 'FAQ structured data', status: 'pass', detail: '15 FAQ pages with proper markup' },
    { name: 'Organization schema', status: 'warn', detail: 'Missing on main pages' },
    { name: 'Meta descriptions', status: 'pass', detail: 'Present on 85% of pages' },
    { name: 'HowTo / Review schema', status: 'fail', detail: 'No HowTo or Review schema detected' },
    { name: 'Sitemap.xml accessible', status: 'pass', detail: 'Valid sitemap with 12,450 URLs' },
  ],
  content: {
    headings: { score: 8, max: 10, detail: 'Good H1→H2→H3 hierarchy on most pages' },
    lists: { score: 8, max: 10, detail: 'Product features use bullet lists' },
    tables: { score: 3, max: 10, detail: 'Size charts exist but not using <table> markup' },
    faqs: { score: 7, max: 10, detail: '15 FAQ pages, could expand to category pages' },
    wordCount: { score: 6, max: 10, detail: 'Avg 280 words/page, recommend 500+' },
  },
  eeat: {
    experience: { score: 82, detail: 'Product reviews with customer photos' },
    expertise: { score: 75, detail: 'Detailed size guides and material descriptions' },
    authority: { score: 68, detail: 'Mentioned on 12 authoritative external sites' },
    trust: { score: 90, detail: 'SSL, privacy policy, clear return policy' },
  },
  competitors: [
    { name: "Carter's", schema: 72, content: 75, eeat: 79, overall: 72 },
    { name: 'Hanna Andersson', schema: 65, content: 80, eeat: 85, overall: 68 },
    { name: 'Primary.com', schema: 80, content: 70, eeat: 72, overall: 70 },
    { name: 'Tea Collection', schema: 58, content: 82, eeat: 76, overall: 65 },
  ],
  actions: [
    { priority: 'high', text: 'Add Organization schema to homepage and about page', impact: '+5 score' },
    { priority: 'high', text: 'Implement Review/Rating schema on product pages', impact: '+8 score' },
    { priority: 'high', text: 'Add HowTo schema to size guide pages', impact: '+4 score' },
    { priority: 'medium', text: 'Expand FAQ coverage to all category pages', impact: '+3 score' },
    { priority: 'medium', text: 'Convert size charts to proper HTML tables', impact: '+3 score' },
    { priority: 'medium', text: 'Increase content depth to 500+ words per page', impact: '+4 score' },
    { priority: 'low', text: 'Optimize image alt texts with descriptive keywords', impact: '+2 score' },
    { priority: 'low', text: 'Add breadcrumb structured data', impact: '+1 score' },
  ],
};

export default function AuditPage() {
  const { locale } = useLanguage();
  const zh = locale === 'zh';
  const [url, setUrl] = useState('carters.com');
  const [analyzed, setAnalyzed] = useState(true);
  const data = demoAudit;

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : s >= 40 ? 'text-orange-500' : 'text-red-500';
  const gradeColor = (g: string) =>
    g.startsWith('A') ? 'bg-green-100 text-green-700' : g.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';

  const statusIcon = (s: string) => {
    if (s === 'pass') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (s === 'warn') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const priorityStyle = (p: string) => {
    if (p === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{zh ? 'AI 内容审计' : 'AI Content Audit'}</h1>
        </div>
        <p className="text-violet-100 mb-6 max-w-2xl">
          {zh
            ? '分析你的品牌网站对 AI 的友好程度。检查结构化数据、内容格式、E-E-A-T 信号，获取优化建议。'
            : 'Analyze how AI-friendly your brand website is. Check structured data, content format, E-E-A-T signals, and get optimization recommendations.'}
        </p>
        <div className="flex gap-3 max-w-xl">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-300" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Button
            onClick={() => setAnalyzed(true)}
            className="bg-white text-violet-700 hover:bg-violet-50 px-6 font-semibold"
          >
            <Search className="w-4 h-4 mr-2" />
            {zh ? '分析' : 'Analyze'}
          </Button>
        </div>
      </div>

      {analyzed && (
        <>
          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={data.overallScore >= 70 ? '#8b5cf6' : '#f59e0b'}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${data.overallScore * 3.14} 314`}
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="55" textAnchor="middle" className="text-3xl font-bold fill-slate-900" fontSize="28">{data.overallScore}</text>
                    <text x="60" y="72" textAnchor="middle" className="fill-slate-500" fontSize="12">/100</text>
                  </svg>
                </div>
                <span className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${gradeColor(data.grade)}`}>
                  {zh ? '等级' : 'Grade'}: {data.grade}
                </span>
                <p className="text-sm text-slate-500 mt-2 text-center">
                  {zh ? `优于 ${data.percentile}% 的童装品牌` : `Better than ${data.percentile}% of kids fashion brands`}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-600" />
                  {zh ? 'E-E-A-T 信号评估' : 'E-E-A-T Signal Assessment'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.eeat).map(([key, val]) => {
                    const labels: Record<string, [string, string]> = {
                      experience: ['Experience 经验', 'Experience'],
                      expertise: ['Expertise 专业', 'Expertise'],
                      authority: ['Authority 权威', 'Authoritativeness'],
                      trust: ['Trust 信任', 'Trustworthiness'],
                    };
                    const label = zh ? labels[key][0] : labels[key][1];
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{label}</span>
                          <span className={scoreColor(val.score)}>{val.score}/100</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${val.score >= 80 ? 'bg-green-500' : val.score >= 60 ? 'bg-violet-500' : 'bg-orange-500'}`}
                            style={{ width: `${val.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{val.detail}</p>
                      </div>
                    );
                  })}
                </div>
                {/* Radar chart */}
                <div className="mt-6 flex justify-center">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    {[80, 60, 40, 20].map((r) => (
                      <polygon key={r} points={[0,1,2,3].map((i) => {
                        const a = (i * Math.PI * 2) / 4 - Math.PI / 2;
                        return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
                      }).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    ))}
                    <polygon
                      points={[data.eeat.experience.score, data.eeat.expertise.score, data.eeat.authority.score, data.eeat.trust.score]
                        .map((s, i) => {
                          const a = (i * Math.PI * 2) / 4 - Math.PI / 2;
                          const r = (s / 100) * 80;
                          return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
                        }).join(' ')}
                      fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="2"
                    />
                    {['E', 'E', 'A', 'T'].map((l, i) => {
                      const a = (i * Math.PI * 2) / 4 - Math.PI / 2;
                      return <text key={i} x={100 + 92 * Math.cos(a)} y={100 + 92 * Math.sin(a)} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 font-semibold" fontSize="12">{l}</text>;
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-violet-600" />
                {zh ? '技术 SEO for AI 检查' : 'Technical SEO for AI Checks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.technical.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.status === 'pass' ? 'bg-green-50/50 border-green-200' :
                    item.status === 'warn' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-red-50/50 border-red-200'
                  }`}>
                    {statusIcon(item.status)}
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {zh ? '通过' : 'Pass'}: {data.technical.filter(t=>t.status==='pass').length}</span>
                <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-yellow-500" /> {zh ? '警告' : 'Warning'}: {data.technical.filter(t=>t.status==='warn').length}</span>
                <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" /> {zh ? '失败' : 'Fail'}: {data.technical.filter(t=>t.status==='fail').length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Content Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                {zh ? '内容结构分析' : 'Content Structure Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">{zh ? 'AI 从结构化内容中提取信息的效率评分' : 'How efficiently AI can extract information from your content structure'}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(data.content).map(([key, val]) => {
                  const labels: Record<string, [string, string]> = {
                    headings: ['标题层级', 'Headings'],
                    lists: ['列表格式', 'Lists'],
                    tables: ['表格数据', 'Tables'],
                    faqs: ['FAQ覆盖', 'FAQs'],
                    wordCount: ['内容深度', 'Word Count'],
                  };
                  const label = zh ? labels[key]?.[0] : labels[key]?.[1];
                  const pct = (val.score / val.max) * 100;
                  return (
                    <div key={key} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg viewBox="0 0 60 60" className="w-full h-full">
                          <circle cx="30" cy="30" r="24" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                          <circle cx="30" cy="30" r="24" fill="none"
                            stroke={pct >= 70 ? '#8b5cf6' : pct >= 40 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={`${pct * 1.508} 150.8`}
                            transform="rotate(-90 30 30)"
                          />
                          <text x="30" y="34" textAnchor="middle" fontSize="14" className="fill-slate-800 font-bold">{val.score}</text>
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-slate-700">{label}</p>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{val.detail}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-600" />
                {zh ? '竞品内容对比' : 'Competitor Content Comparison'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">{zh ? '品牌' : 'Brand'}</th>
                      <th className="text-center py-3 px-2 text-slate-500 font-medium">Schema</th>
                      <th className="text-center py-3 px-2 text-slate-500 font-medium">{zh ? '内容' : 'Content'}</th>
                      <th className="text-center py-3 px-2 text-slate-500 font-medium">E-E-A-T</th>
                      <th className="text-center py-3 px-2 text-slate-500 font-medium">{zh ? '总分' : 'Overall'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.competitors.map((comp, i) => (
                      <tr key={i} className={`border-b border-slate-100 ${i === 0 ? 'bg-violet-50/50' : ''}`}>
                        <td className="py-3 px-2 font-medium text-slate-800">
                          {i === 0 && <Star className="w-3 h-3 inline mr-1 text-violet-500" />}
                          {comp.name}
                        </td>
                        {[comp.schema, comp.content, comp.eeat, comp.overall].map((v, j) => (
                          <td key={j} className="text-center py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              v >= 75 ? 'bg-green-100 text-green-700' : v >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            }`}>{v}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-600" />
                {zh ? '优化行动清单' : 'Optimization Action Items'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-violet-200 transition-colors">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityStyle(action.priority)}`}>
                      {action.priority === 'high' ? (zh ? '高' : 'HIGH') : action.priority === 'medium' ? (zh ? '中' : 'MED') : (zh ? '低' : 'LOW')}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{action.text}</span>
                    <span className="text-xs font-semibold text-violet-600 whitespace-nowrap">{action.impact}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
                <p className="text-sm font-semibold text-violet-800 mb-1">
                  {zh ? '💡 预计提升' : '💡 Estimated Improvement'}
                </p>
                <p className="text-sm text-violet-600">
                  {zh
                    ? '完成所有高优先级任务后，预计 AI 内容审计分数可提升至 89/100（+17分）'
                    : 'Completing all high-priority items could raise your AI Content Audit score to 89/100 (+17 points)'}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
