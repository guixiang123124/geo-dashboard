import Link from 'next/link';
import { BRANDS, SCORES, getAggregateStats, getTopBottomBrands } from '@/lib/data';
import ScoreCard from '@/components/geo/ScoreCard';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

export default function Home() {
  const stats = getAggregateStats();
  const { top3, bottom3 } = getTopBottomBrands();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Brands"
            value={stats.totalBrands}
            icon={<Target className="w-6 h-6" />}
          />
          <StatCard
            label="Average GEO Score"
            value={stats.avgComposite}
            trend={stats.trend}
            change={`${stats.changePercent > 0 ? '+' : ''}${stats.changePercent}%`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            label="Best Dimension"
            value={stats.bestDimension}
            icon={<BarChart3 className="w-6 h-6" />}
          />
        </div>

        {/* Brand ScoreCards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-neutral-900">Brand Performance</h2>
            <Link href="/analytics">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BRANDS.map((brand) => (
              <ScoreCard
                key={brand.id}
                brandName={brand.name}
                category={brand.category}
                score={SCORES[brand.id]}
              />
            ))}
          </div>
        </section>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {top3.map((brand, index) => (
                  <div key={brand.brandId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{brand.brandName}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{brand.scores.composite}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottom3.map((brand, index) => (
                  <div key={brand.brandId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{brand.brandName}</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{brand.scores.composite}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Attribution Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <strong>TinyThreads (Visibility +5%):</strong> Recent optimization of "Best Sustainable Kids" pages has improved visibility in Claude 3.5.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    <strong>LuxeMini (Citation +8%):</strong> Adding structured data and semantic URLs increased citation rates across all AI platforms.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
