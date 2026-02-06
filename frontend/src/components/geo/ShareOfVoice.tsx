'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface BrandSOV {
  name: string;
  mentions: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: string;
}

interface ShareOfVoiceProps {
  data?: BrandSOV[];
  title?: string;
  description?: string;
  showTrend?: boolean;
}

// Default mock data for demo
const defaultData: BrandSOV[] = [
  { name: "Carter's", mentions: 156, percentage: 28, trend: 'up', trendValue: 3, color: '#8b5cf6' },
  { name: 'Primary.com', mentions: 89, percentage: 16, trend: 'up', trendValue: 5, color: '#3b82f6' },
  { name: 'Hanna Andersson', mentions: 78, percentage: 14, trend: 'stable', trendValue: 0, color: '#10b981' },
  { name: 'Tea Collection', mentions: 67, percentage: 12, trend: 'down', trendValue: 2, color: '#f59e0b' },
  { name: 'Janie and Jack', mentions: 56, percentage: 10, trend: 'up', trendValue: 1, color: '#ec4899' },
  { name: 'Others', mentions: 110, percentage: 20, trend: 'stable', trendValue: 0, color: '#94a3b8' },
];

export function ShareOfVoice({ 
  data = defaultData, 
  title = "Share of Voice",
  description = "品牌在 AI 回答中的提及占比",
  showTrend = true 
}: ShareOfVoiceProps) {
  const total = data.reduce((sum, d) => sum + d.mentions, 0);
  
  // Calculate pie chart segments
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const startAngle = cumulativePercentage * 3.6; // 360 / 100
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;
    return { ...item, startAngle, endAngle };
  });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  // Create SVG pie chart path
  const createPieSlice = (startAngle: number, endAngle: number, color: string, index: number) => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    // Calculate points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Determine if the arc should be large (> 180 degrees)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return (
      <path
        key={index}
        d={pathData}
        fill={color}
        stroke="white"
        strokeWidth="2"
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-600" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-slate-500">
            {total} 总提及
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="flex-shrink-0 flex justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              {segments.map((segment, i) => 
                createPieSlice(segment.startAngle, segment.endAngle, segment.color, i)
              )}
              {/* Center circle for donut effect */}
              <circle cx="100" cy="100" r="45" fill="white" />
              <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-slate-900">
                {data[0]?.percentage}%
              </text>
              <text x="100" y="115" textAnchor="middle" className="text-xs fill-slate-500">
                Top Brand
              </text>
            </svg>
          </div>

          {/* Legend & Details */}
          <div className="flex-1 space-y-2">
            {data.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.mentions} 次提及</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{item.percentage}%</span>
                  {showTrend && (
                    <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)}
                      {item.trendValue > 0 && (
                        <span className="text-xs">{item.trend === 'up' ? '+' : '-'}{item.trendValue}%</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Share of Voice 衡量品牌在 AI 平台回答中被提及的相对占比。
            高 SOV 意味着当用户询问相关问题时，AI 更可能推荐你的品牌。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShareOfVoice;
