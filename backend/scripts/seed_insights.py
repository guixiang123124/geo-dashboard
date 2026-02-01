#!/usr/bin/env python3
"""
Seed script for generating demo insights data.
Populates the database with pre-computed insights from public datasets.
"""

import sys
import os
from pathlib import Path

# Add backend src to path
backend_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(backend_path))

import asyncio
from uuid import uuid4
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from core.database import Base, get_database_url
from models.public_insight import PublicInsight, BrandMention
from services.public_datasets import DatasetFetcher, BrandExtractor, InsightPreprocessor


async def seed_insights():
    """Generate and seed insights data."""
    print("🚀 Starting insights data seeding...")
    
    # Create async engine
    engine = create_async_engine(get_database_url(), echo=False)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with AsyncSessionLocal() as session:
        # Initialize services
        print("📊 Initializing data services...")
        fetcher = DatasetFetcher()
        extractor = BrandExtractor()
        preprocessor = InsightPreprocessor()
        
        # Fetch datasets
        print("📥 Fetching LMSYS conversations sample...")
        conversations = fetcher.get_lmsys_sample(500)
        print(f"   Retrieved {len(conversations)} conversations")
        
        print("📥 Fetching Amazon reviews sample...")
        reviews = fetcher.get_amazon_reviews_sample(300)
        print(f"   Retrieved {len(reviews)} reviews")
        
        # Extract brand mentions
        print("🔍 Extracting brand mentions...")
        mentions = extractor.batch_extract(conversations)
        print(f"   Found {len(mentions)} brand mentions")
        
        # Add review data as mentions
        review_mentions = []
        for review in reviews:
            review_mentions.append({
                "brand": review["brand"],
                "category": review["category"],
                "sentiment": review["sentiment"],
                "confidence": 0.9 if review.get("verified_purchase") else 0.7,
                "timestamp": review["timestamp"],
                "model": "Reviews",
                "source_id": review["id"],
            })
        
        all_mentions = mentions + review_mentions
        preprocessor.load_data(all_mentions, reviews)
        
        # Generate and store insights
        print("💾 Storing brand mentions...")
        mention_count = 0
        for m in all_mentions[:200]:  # Store sample of mentions
            mention = BrandMention(
                id=str(uuid4()),
                brand=m["brand"],
                category=m.get("category", "Unknown"),
                source_id=m.get("conversation_id", m.get("source_id", str(uuid4()))),
                source_type="lmsys" if "conversation_id" in m else "amazon",
                model_name=m.get("model"),
                context=m.get("context", "")[:500],
                query=m.get("query", "")[:500] if m.get("query") else None,
                sentiment=m.get("sentiment", "neutral"),
                sentiment_confidence=m.get("confidence", 0.5),
                mention_date=datetime.fromisoformat(m["timestamp"].replace("Z", "+00:00")) if m.get("timestamp") else None,
            )
            session.add(mention)
            mention_count += 1
        
        await session.commit()
        print(f"   Stored {mention_count} brand mentions")
        
        # Generate aggregated insights
        print("📈 Generating aggregated insights...")
        
        # Trending brands insight
        trending = preprocessor.get_trending_brands(limit=20)
        trending_insight = PublicInsight(
            id=str(uuid4()),
            insight_type="trending",
            data={"brands": trending},
            mention_count=sum(b["mention_count"] for b in trending),
            positive_count=sum(b["positive_count"] for b in trending),
            negative_count=sum(b["negative_count"] for b in trending),
            neutral_count=sum(b["neutral_count"] for b in trending),
            data_source="mixed",
            period_start=datetime.now() - timedelta(days=90),
            period_end=datetime.now(),
        )
        session.add(trending_insight)
        
        # LLM comparison insight
        llm_comparison = preprocessor.get_llm_comparison()
        llm_insight = PublicInsight(
            id=str(uuid4()),
            insight_type="llm_comparison",
            data={"models": llm_comparison},
            mention_count=sum(m["total_mentions"] for m in llm_comparison),
            data_source="lmsys",
        )
        session.add(llm_insight)
        
        # Category summary
        categories = preprocessor.get_categories()
        category_insight = PublicInsight(
            id=str(uuid4()),
            insight_type="category_summary",
            data={"categories": categories},
            mention_count=sum(c["mention_count"] for c in categories),
            data_source="mixed",
        )
        session.add(category_insight)
        
        # Per-brand sentiment insights
        for brand_data in trending[:10]:  # Top 10 brands
            brand_name = brand_data["brand"]
            sentiment = preprocessor.get_sentiment_breakdown(brand_name)
            
            dist = sentiment["sentiment_distribution"]
            brand_insight = PublicInsight(
                id=str(uuid4()),
                insight_type="sentiment",
                brand=brand_name,
                category=brand_data["category"],
                data=sentiment,
                mention_count=sentiment["total_mentions"],
                positive_count=dist["positive"],
                negative_count=dist["negative"],
                neutral_count=dist["neutral"],
                sentiment_score=sentiment.get("sentiment_score", 0),
                data_source="mixed",
            )
            session.add(brand_insight)
        
        await session.commit()
        print("   Stored aggregated insights")
        
        # Summary
        summary = preprocessor.generate_summary()
        print("\n✅ Seeding complete!")
        print(f"   Total mentions: {summary['total_mentions']}")
        print(f"   Unique brands: {summary['unique_brands']}")
        print(f"   Categories: {summary['categories']}")
        print(f"   Data sources: LLM={summary['data_sources']['llm_conversations']}, Reviews={summary['data_sources']['reviews']}")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_insights())
