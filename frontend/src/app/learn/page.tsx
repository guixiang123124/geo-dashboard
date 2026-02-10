'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  ExternalLink,
  Clock,
  TrendingUp,
  Lightbulb,
  FileText,
  Star,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://geo-insights-api-production.up.railway.app';

interface Article {
  id: number;
  title: string;
  summary: string;
  source_url: string | null;
  source_name: string | null;
  category: string;
  tags: string | null;
  reading_time_min: number;
  is_featured: boolean;
  published_at: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All', icon: <BookOpen className="w-4 h-4" />, color: 'bg-gray-600' },
  news: { label: 'News', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-blue-600' },
  report: { label: 'Reports', icon: <FileText className="w-4 h-4" />, color: 'bg-purple-600' },
  tip: { label: 'Tips & Guides', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-emerald-600' },
  case_study: { label: 'Case Studies', icon: <Star className="w-4 h-4" />, color: 'bg-amber-600' },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const catConfig = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.news;
  const tags = article.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];

  return (
    <a
      href={article.source_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-emerald-500/30 transition-all duration-200 ${
        featured ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        {/* Top row: category + time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${catConfig.color}`}>
              {catConfig.icon}
              {catConfig.label}
            </span>
            {article.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{timeAgo(article.published_at)}</span>
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2 ${
          featured ? 'text-xl md:text-2xl' : 'text-base'
        }`}>
          {article.title}
        </h3>

        {/* Summary */}
        <p className={`text-gray-400 mb-4 line-clamp-3 ${featured ? 'text-sm md:text-base' : 'text-sm'}`}>
          {article.summary}
        </p>

        {/* Bottom row: source + reading time + tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {article.source_name && (
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {article.source_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time_min} min read
            </span>
          </div>
          <div className="flex gap-1">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function LearnPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page_size: '50' });
      if (activeCategory !== 'all') params.set('category', activeCategory);
      const resp = await fetch(`${API_BASE}/api/v1/articles?${params}`);
      if (resp.ok) {
        const data = await resp.json();
        setArticles(data.articles || []);
      }
    } catch (e) {
      console.error('Failed to fetch articles:', e);
    } finally {
      setLoading(false);
    }
  }

  const featured = articles.filter(a => a.is_featured);
  const regular = articles.filter(a => !a.is_featured);

  // Search filter (client-side)
  const filteredRegular = searchQuery
    ? regular.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.tags || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : regular;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
            <BookOpen className="w-4 h-4" />
            GEO Learning Center
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI Visibility Intelligence
          </h1>
          <p className="text-gray-400 text-lg">
            Latest reports, strategies, and insights on Generative Engine Optimization. Updated weekly.
          </p>
        </div>

        {/* Category pills + search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-900/50 border border-gray-800 p-6 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-full mb-1" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Featured articles */}
            {featured.length > 0 && activeCategory === 'all' && !searchQuery && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Featured
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map(a => (
                    <ArticleCard key={a.id} article={a} featured />
                  ))}
                </div>
              </div>
            )}

            {/* All articles */}
            <div>
              {(featured.length > 0 && activeCategory === 'all' && !searchQuery) && (
                <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> Latest
                </h2>
              )}
              {filteredRegular.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRegular.map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No articles found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="mt-12 text-center text-sm text-gray-600">
              <p>Content curated weekly from leading SEO and AI marketing sources.</p>
              <p className="mt-1">Have a great article to suggest? <a href="mailto:support@fashionflow.ai" className="text-emerald-500 hover:underline">Let us know</a></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
