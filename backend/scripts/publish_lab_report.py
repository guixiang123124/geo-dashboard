"""
Publish a Lab Report to the Luminos Learning Center.
Usage: python publish_lab_report.py
"""
import asyncio
import sys
sys.path.insert(0, "/Users/xianggui/.openclaw/workspace/geo-dashboard/backend")

from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.models.article import Article

DB_URL = "postgresql+asyncpg://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"

REPORTS = [
    {
        "title": "Gemini Is the Hardest AI to Crack — And That's Where Your Brand Strategy Should Start",
        "summary": "Our analysis of 135 AI queries across 3 major platforms reveals Gemini consistently ranks brands lower and mentions them less frequently than OpenAI or Grok. For brands serious about AI visibility, Gemini performance is the true north metric.",
        "content": """# Gemini Is the Hardest AI to Crack — And That's Where Your Brand Strategy Should Start

## The Punchline

**If your brand shows up on Gemini, you've earned it.** Our multi-platform diagnosis of DTC brands reveals that Google's Gemini is the most conservative AI when recommending brands — making it the most valuable signal of true organic visibility.

## The Data

We ran comprehensive 45-prompt diagnostics across Gemini, OpenAI (GPT), and Grok on multiple DTC brands. Here's what we found:

### Brand Mention Rates by Platform

| Brand | Gemini | OpenAI | Grok | Gap (Grok vs Gemini) |
|-------|--------|--------|------|---------------------|
| Bombas | 46% | 46% | 53% | +7pp |
| Glossier | 44% | 46% | 51% | +7pp |
| Nike* | 77% | 84% | 91% | +14pp |
| Allbirds | 48% | — | — | (free tier) |

*Nike data from prior batch evaluation.

### Key Findings

**1. Grok is the most brand-friendly AI (+7-14pp vs Gemini)**

Grok consistently mentions brands more frequently and at higher positions. This makes Grok scores look flattering but potentially misleading. A high Grok score alone doesn't mean your brand has strong AI visibility.

**2. Gemini is the gatekeeper**

Google's AI is the most selective about which brands to recommend. It requires stronger real-world signals — authoritative content, third-party citations, structured data — before surfacing a brand. This makes Gemini the "hard mode" of AI visibility.

**3. OpenAI sits in the middle — but closer to Gemini**

GPT's brand mention rates typically align within 2-5pp of Gemini, suggesting similar training data curation standards. The OpenAI-Gemini corridor represents the "true" baseline of brand visibility.

**4. Generic visibility is dramatically lower than brand-specific**

When we remove brand names from prompts (pure organic discovery), visibility drops to single digits:
- Bombas: 46% overall → **9% generic visibility**
- Glossier: 48% overall → **9% generic visibility**
- Allbirds: 48% overall → **8% generic visibility**

This means most brands are only visible when users already know to ask about them. The holy grail is appearing in generic category queries like "best socks for running" or "recommend skincare brands."

## What This Means for Your Strategy

### The Gemini-First Framework

1. **Benchmark on Gemini, not Grok.** If you're measuring AI visibility, Gemini scores should be your primary KPI. A brand that scores well on Gemini will almost certainly score well everywhere else.

2. **Focus on generic prompt performance.** Brand-specific queries ("Is Nike good?") will always mention you. The real test is whether AI recommends you unprompted in category queries.

3. **Model-weighted scoring matters.** We now weight Gemini 1.5x in our composite score calculations, reflecting its role as the hardest platform to crack. This gives brands a more honest assessment of their AI visibility.

### Actionable Steps

- **Audit your Gemini presence first** — Run a diagnosis and check your Gemini-specific score
- **Create category-authority content** — Buying guides, comparison articles, expert roundups that position your brand as a category leader
- **Earn third-party mentions** — AI models heavily weight authoritative sources (review sites, industry publications, expert recommendations)
- **Implement structured data** — Schema.org markup helps AI models accurately extract and cite your brand information

## Methodology

- **Prompts**: 45 per brand (25 generic + 20 brand-specific) across 6 intent dimensions
- **Models**: Gemini 2.0 Flash, OpenAI GPT-4o-mini, Grok (xAI)
- **Metrics**: Mention rate, sentiment analysis, rank position, citation detection
- **Scoring**: Model-weighted composite (Gemini 1.5x, OpenAI 1.0x, Grok 0.8x)

---

*This is a Luminos Lab Report — original research from real AI platform evaluations. [Run your own free brand diagnosis →](/audit)*
""",
        "source_name": "Luminos Lab",
        "category": "report",
        "tags": "lab-report,gemini,multi-platform,brand-visibility,original-research",
        "reading_time_min": 5,
        "is_featured": True,
    },
    {
        "title": "The 9% Problem: Why 91% of DTC Brands Are Invisible to AI When It Matters Most",
        "summary": "Generic AI queries — where users don't name a specific brand — are the highest-value discovery channel. Yet our data shows most DTC brands appear in less than 10% of these queries. Here's why, and what to do about it.",
        "content": """# The 9% Problem: Why 91% of DTC Brands Are Invisible to AI When It Matters Most

## The Punchline

**Your brand gets mentioned when people ask about you. But when they ask about your *category*, you're invisible.** This is the single biggest gap in AI brand strategy today — and it's where the revenue opportunity lives.

## The Discovery Gap

We analyzed brand visibility across two types of AI queries:

- **Brand-specific**: "Is Bombas good?" / "Bombas reviews" — the user already knows you
- **Generic**: "Best socks for running" / "Recommend skincare brands" — pure discovery

The results are stark:

| Brand | Brand-Specific Mention Rate | Generic Mention Rate | Discovery Gap |
|-------|---------------------------|---------------------|---------------|
| Bombas | 100% | 9% | -91pp |
| Glossier | 100% | 9% | -91pp |
| Allbirds | 100% | 8% | -92pp |
| Nike* | 100% | 72% | -28pp |

*Only Nike — a globally dominant brand — breaks through the generic barrier significantly.*

## Why This Matters More Than You Think

### AI is becoming the new search

When a consumer asks ChatGPT "what are the best running socks?", AI doesn't show 10 blue links. It gives a curated list of 5-10 brands. **If you're not on that list, you don't exist in that conversation.**

### Generic queries = highest purchase intent

Someone searching "best socks for running" is actively shopping. They haven't decided on a brand yet. This is the exact moment you want to be recommended — and it's the exact moment most DTC brands are missing.

### The compounding effect

Each AI recommendation reinforces itself. Brands that appear consistently in generic queries build stronger "AI brand equity" over time, making it harder for competitors to displace them.

## What Determines Generic Visibility?

Based on our analysis of 8 industry verticals and 180+ brands:

### 1. Category Authority (Most Important)
Brands that dominate generic queries have deep, authoritative content about their category — not just their products. Think buying guides, expert comparisons, educational content.

### 2. Third-Party Validation
AI models heavily weight mentions from trusted sources: review sites (Wirecutter, Consumer Reports), industry publications, and expert recommendations. Being featured in "best of" lists is now an AI visibility strategy.

### 3. Brand Scale and Recognition
There's a clear correlation between brand awareness and generic AI visibility. But it's not just about being big — niche brands with strong category authority can punch above their weight.

### 4. Structured Data
Proper Schema.org markup (Product, Organization, FAQ, Review) helps AI models accurately extract and represent your brand information.

## The Path from 9% to 30%+

Based on brands that score well on generic visibility:

1. **Publish category-defining content** — Be the go-to resource for your category, not just your brand
2. **Earn editorial mentions** — Pitch to review sites, seek expert endorsements, sponsor roundups
3. **Optimize for AI extraction** — Structured data, clear brand positioning, consistent messaging across touchpoints
4. **Monitor and iterate** — Regular diagnosis to track which generic queries you're appearing in (and which you're not)

## Industry Benchmark: Where Does Your Vertical Stand?

From our 8-vertical industry intelligence data:

| Industry | Avg Composite Score | Leader Score |
|----------|-------------------|-------------|
| SaaS & Technology | 32.6 | 65+ |
| Kids Fashion | 28.1 | 55+ |
| Education & EdTech | 18.7 | 40+ |
| Travel & Hospitality | 18.4 | 42+ |
| Real Estate & Home | 16.6 | 38+ |
| Food & Beverage | 15.9 | 35+ |
| Health & Wellness | 14.1 | 33+ |
| Fintech | 12.2 | 30+ |

The gap between average and leader in every vertical is 2-3x. This means significant room for improvement — and competitive advantage — for brands that invest in AI visibility now.

---

*Luminos Lab Report #2 — Based on 9,600+ real AI evaluations across 8 industries. [Check your brand's generic visibility →](/audit)*
""",
        "source_name": "Luminos Lab",
        "category": "report",
        "tags": "lab-report,generic-visibility,discovery,dtc,original-research",
        "reading_time_min": 6,
        "is_featured": True,
    },
]


async def main():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        for r in REPORTS:
            article = Article(
                title=r["title"],
                summary=r["summary"],
                content=r["content"],
                source_url=None,
                source_name=r["source_name"],
                category=r["category"],
                tags=r["tags"],
                reading_time_min=r["reading_time_min"],
                is_featured=r["is_featured"],
                is_published=True,
                published_at=datetime.utcnow(),
            )
            session.add(article)
            print(f"✅ Added: {r['title'][:60]}...")

        await session.commit()
        print(f"\n🚀 Published {len(REPORTS)} Lab Reports!")

    await engine.dispose()

asyncio.run(main())
