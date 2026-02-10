#!/usr/bin/env python3
"""
Fetch latest GEO/AEO articles from the web and seed to database.
Run weekly via cron or manually.

Usage:
    python fetch_geo_articles.py [--db-url DATABASE_URL]
"""

import argparse
import asyncio
import json
import os
import re
import sys
from datetime import datetime, timedelta

import httpx
import psycopg2

# Brave Search API
BRAVE_API_KEY = os.environ.get("BRAVE_API_KEY", "")

# Search queries to rotate through
SEARCH_QUERIES = [
    "GEO generative engine optimization latest 2026",
    "AEO answer engine optimization tips",
    "AI search optimization brand visibility",
    "ChatGPT Google AI Overview SEO strategy",
    "how to rank in AI search results",
    "generative engine optimization case study",
    "AI brand mentions optimization report",
    "GEO vs SEO differences strategy",
    "AI overview optimization best practices",
    "brand visibility AI chatbot recommendations",
]

CATEGORY_MAP = {
    "report": ["report", "study", "research", "benchmark", "data", "analysis"],
    "tip": ["tips", "how to", "guide", "strategy", "tactics", "best practices", "checklist"],
    "case_study": ["case study", "success story", "example", "results"],
    "news": [],  # default
}

TRUSTED_SOURCES = {
    "searchengineland.com": "Search Engine Land",
    "searchenginejournal.com": "Search Engine Journal",
    "moz.com": "Moz",
    "ahrefs.com": "Ahrefs",
    "semrush.com": "Semrush",
    "hubspot.com": "HubSpot",
    "neilpatel.com": "Neil Patel",
    "backlinko.com": "Backlinko",
    "conductor.com": "Conductor",
    "brightedge.com": "BrightEdge",
    "wordstream.com": "WordStream",
    "contentatscale.ai": "Content at Scale",
    "martech.org": "MarTech",
    "adweek.com": "Adweek",
    "digiday.com": "Digiday",
    "techcrunch.com": "TechCrunch",
    "theverge.com": "The Verge",
    "wired.com": "Wired",
    "forbes.com": "Forbes",
    "blog.google": "Google Blog",
}


def classify_category(title: str, snippet: str) -> str:
    """Classify article category based on title and snippet."""
    text = (title + " " + snippet).lower()
    for cat, keywords in CATEGORY_MAP.items():
        if any(kw in text for kw in keywords):
            return cat
    return "news"


def extract_tags(title: str, snippet: str) -> str:
    """Extract relevant tags from content."""
    text = (title + " " + snippet).lower()
    tags = []
    tag_keywords = {
        "GEO": ["geo", "generative engine optimization"],
        "AEO": ["aeo", "answer engine"],
        "AI Search": ["ai search", "ai overview", "chatgpt", "gemini", "perplexity"],
        "SEO": ["seo", "search engine"],
        "Brand Visibility": ["brand visibility", "brand mention"],
        "Content Strategy": ["content strategy", "content optimization"],
        "E-commerce": ["e-commerce", "ecommerce", "shopify"],
        "Local SEO": ["local seo", "local search"],
        "Technical": ["technical", "structured data", "schema"],
    }
    for tag, keywords in tag_keywords.items():
        if any(kw in text for kw in keywords):
            tags.append(tag)
    return ",".join(tags[:5]) if tags else "GEO"


def estimate_reading_time(text: str) -> int:
    """Estimate reading time in minutes."""
    words = len(text.split())
    return max(2, min(15, words // 200))


def get_source_name(url: str) -> str:
    """Extract source name from URL."""
    for domain, name in TRUSTED_SOURCES.items():
        if domain in url:
            return name
    # Extract domain name
    match = re.search(r'https?://(?:www\.)?([^/]+)', url)
    if match:
        domain = match.group(1)
        return domain.split('.')[0].title()
    return "Web"


async def search_brave(query: str, count: int = 5) -> list[dict]:
    """Search using Brave API."""
    if not BRAVE_API_KEY:
        print(f"[warn] No BRAVE_API_KEY, skipping search for: {query}")
        return []

    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
    }
    params = {
        "q": query,
        "count": count,
        "freshness": "pm",  # past month
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            results = data.get("web", {}).get("results", [])
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "snippet": r.get("description", ""),
                    "age": r.get("age", ""),
                }
                for r in results
            ]
        except Exception as e:
            print(f"[error] Brave search failed for '{query}': {e}")
            return []


async def fetch_and_summarize(url: str) -> str | None:
    """Fetch article content and create a summary."""
    async with httpx.AsyncClient(timeout=15, follow_redirects=True, headers={
        "User-Agent": "Mozilla/5.0 (compatible; LuminosBot/1.0)"
    }) as client:
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                return None
            text = resp.text
            # Strip HTML tags
            text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
            text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
            text = re.sub(r'<[^>]+>', ' ', text)
            text = re.sub(r'\s+', ' ', text).strip()
            # Take first ~2000 chars for summary context
            return text[:2000] if len(text) > 100 else None
        except Exception:
            return None


def build_article(search_result: dict, content_preview: str | None) -> dict:
    """Build article dict from search result."""
    title = search_result["title"]
    snippet = search_result["snippet"]
    url = search_result["url"]

    category = classify_category(title, snippet)
    tags = extract_tags(title, snippet + (content_preview or ""))
    source_name = get_source_name(url)
    reading_time = estimate_reading_time(content_preview or snippet)

    # Build a richer summary from snippet
    summary = snippet
    if content_preview and len(content_preview) > len(snippet):
        # Use first ~500 chars of content as extended summary
        clean = content_preview[:500].strip()
        if clean:
            summary = clean + "..."

    return {
        "title": title[:500],
        "summary": summary[:2000],
        "content": None,  # Could generate full markdown content with AI later
        "source_url": url[:1000],
        "source_name": source_name[:200],
        "category": category,
        "tags": tags[:500],
        "image_url": None,
        "reading_time_min": reading_time,
        "is_featured": False,
        "is_published": True,
        "published_at": datetime.utcnow(),
    }


def seed_articles(db_url: str, articles: list[dict]):
    """Insert articles into database, skip duplicates by source_url."""
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Ensure table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            summary TEXT NOT NULL,
            content TEXT,
            source_url VARCHAR(1000),
            source_name VARCHAR(200),
            category VARCHAR(100) NOT NULL DEFAULT 'news',
            tags VARCHAR(500),
            image_url VARCHAR(1000),
            reading_time_min INTEGER DEFAULT 3,
            is_featured BOOLEAN DEFAULT FALSE,
            is_published BOOLEAN DEFAULT TRUE,
            published_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)

    inserted = 0
    for article in articles:
        # Check duplicate
        cur.execute("SELECT id FROM articles WHERE source_url = %s", (article["source_url"],))
        if cur.fetchone():
            continue

        cur.execute("""
            INSERT INTO articles (title, summary, content, source_url, source_name, category, tags, 
                                  image_url, reading_time_min, is_featured, is_published, published_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            article["title"], article["summary"], article["content"],
            article["source_url"], article["source_name"], article["category"],
            article["tags"], article["image_url"], article["reading_time_min"],
            article["is_featured"], article["is_published"], article["published_at"],
        ))
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    return inserted


async def main(db_url: str, max_queries: int = 5):
    """Main: search, fetch, build, seed."""
    print(f"[fetch_geo_articles] Starting at {datetime.now()}")

    all_articles = []
    queries = SEARCH_QUERIES[:max_queries]

    for i, query in enumerate(queries):
        print(f"[{i+1}/{len(queries)}] Searching: {query}")
        results = await search_brave(query, count=5)
        print(f"  → {len(results)} results")

        for r in results:
            # Optionally fetch content preview
            content = await fetch_and_summarize(r["url"])
            article = build_article(r, content)
            all_articles.append(article)

        # Rate limit: 1 req/sec for Brave free tier
        await asyncio.sleep(1.5)

    print(f"\n[fetch_geo_articles] Total articles collected: {len(all_articles)}")

    # Deduplicate by URL
    seen_urls = set()
    unique = []
    for a in all_articles:
        if a["source_url"] not in seen_urls:
            seen_urls.add(a["source_url"])
            unique.append(a)

    print(f"[fetch_geo_articles] Unique articles: {len(unique)}")

    # Mark top 3 as featured
    for a in unique[:3]:
        a["is_featured"] = True

    # Seed to DB
    inserted = seed_articles(db_url, unique)
    print(f"[fetch_geo_articles] Inserted {inserted} new articles (skipped {len(unique) - inserted} duplicates)")
    print(f"[fetch_geo_articles] Done at {datetime.now()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db-url", default=os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"
    ))
    parser.add_argument("--max-queries", type=int, default=5)
    args = parser.parse_args()

    asyncio.run(main(args.db_url, args.max_queries))
