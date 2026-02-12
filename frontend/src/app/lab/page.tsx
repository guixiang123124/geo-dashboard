'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  ExternalLink,
  Clock,
  ArrowRight,
  Star,
  BarChart3,
  TrendingUp,
  Zap,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://geo-insights-api-production.up.railway.app';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string | null;
  source_url: string | null;
  source_name: string | null;
  category: string;
  tags: string | null;
  reading_time_min: number;
  is_featured: boolean;
  published_at: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function LabArticle({ article, index }: { article: Article; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const tags = article.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];

  return (
    <article className="border border-gray-800 rounded-2xl bg-gray-900/50 overflow-hidden hover:border-emerald-500/30 transition-all">
      {/* Header */}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
            <FlaskConical className="w-3.5 h-3.5" />
            Luminos Lab #{index + 1}
          </span>
          <span className="text-xs text-gray-500">{formatDate(article.published_at)}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.reading_time_min} min read
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
          {article.title}
        </h2>

        <p className="text-gray-400 text-base leading-relaxed mb-4">
          {article.summary}
        </p>

        <div className="flex items-center gap-2 mb-4">
          {tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              {tag}
            </span>
          ))}
        </div>

        {article.content && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {expanded ? 'Collapse' : 'Read full report'}
            <ArrowRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {expanded && article.content && (
        <div className="px-6 md:px-8 pb-8 border-t border-gray-800">
          <div
            className="prose prose-invert prose-emerald max-w-none mt-6
                       prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300
                       prose-strong:text-white prose-a:text-emerald-400
                       prose-table:text-sm prose-th:text-left prose-th:text-gray-400 prose-th:font-medium
                       prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2
                       prose-th:border-b prose-th:border-gray-700
                       prose-td:border-b prose-td:border-gray-800"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
          />
        </div>
      )}
    </article>
  );
}

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr/>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Wrap list items
  html = html.replace(new RegExp('(<li>.*?<\\/li>)+', 'gs'), (match) => `<ul>${match}</ul>`);

  // Tables (basic)
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    if (cells.every(c => /^[\s-:]+$/.test(c))) return ''; // separator row
    const tag = 'td';
    return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
  });
  html = html.replace(/(<tr>.*?<\/tr>)+/gs, (match) => {
    // First row as header
    const firstRow = match.replace(/<tr>(.*?)<\/tr>/, (_, inner) =>
      '<thead><tr>' + inner.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>') + '</tr></thead>'
    );
    return `<table>${firstRow.replace(/<tr>/, '<tbody><tr>')}</tbody></table>`;
  });

  return `<p>${html}</p>`;
}

export default function LabPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLabArticles() {
      try {
        const resp = await fetch(`${API_BASE}/api/v1/articles?category=lab&page_size=50`);
        if (resp.ok) {
          const data = await resp.json();
          setArticles(data.articles || []);
        }
      } catch (e) {
        console.error('Failed to fetch lab articles:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchLabArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
            <FlaskConical className="w-5 h-5" />
            LUMINOS LAB
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Original AI Visibility<br />Research & Insights
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            We run real diagnostics across multiple AI platforms to uncover how brands actually appear in AI search.
            No theory — just data from Gemini, ChatGPT, and Grok.
          </p>

          {/* Stats bar */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-400">1,620+ AI evaluations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-400">6 brands analyzed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-400">3 AI platforms</span>
            </div>
          </div>
        </div>

        {/* Articles */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl bg-gray-900/50 border border-gray-800 p-8 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-800 rounded w-full mb-2" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-6">
            {articles.map((article, i) => (
              <LabArticle key={article.id} article={article} index={articles.length - 1 - i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <FlaskConical className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Research reports coming soon.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/20 text-center">
          <h3 className="text-xl font-bold mb-2">Want to see how your brand performs?</h3>
          <p className="text-gray-400 mb-4">Run a free AI visibility diagnosis — results in under 60 seconds.</p>
          <a
            href="/audit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Free Brand Diagnosis
          </a>
        </div>
      </div>
    </div>
  );
}
