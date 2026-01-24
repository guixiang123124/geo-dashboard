import { BRANDS, SCORES } from '@/lib/data';
import ScoreCard from '@/components/geo/ScoreCard';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 text-neutral-900">
      <header className="mb-8 flex items-center justify-between text-neutral-900">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">GEO Dashboard</h1>
          <p className="text-muted-foreground">Tracking AI Attribution for Kids Fashion</p>
        </div>
        <Button>Subscribe for Insights</Button>
      </header>

      <main>
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

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900">Latest Attribution Insights</h2>
          <div className="p-6 bg-white rounded-xl border shadow-sm text-neutral-900">
            <p className="text-gray-600">
              <strong>TinyThreads (Visibility +5%):</strong> Recent optimization of "Best Sustainable Kids" pages has improved visibility in Claude 3.5.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
