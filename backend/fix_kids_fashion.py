"""One-time script to fix Kids Fashion brand categories."""
import asyncio
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import async_sessionmaker

async def main():
    url = os.environ.get("DATABASE_URL", "")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(url)
    
    known_categories = [
        'SaaS & Technology', 'Health & Wellness', 'Fintech & Financial Services',
        'Travel & Hospitality', 'Real Estate & Home', 'Education & EdTech', 'Food & Beverage',
        'Kids Fashion'
    ]
    
    async with engine.begin() as conn:
        # Check current categories
        result = await conn.execute(text("SELECT DISTINCT category FROM brands ORDER BY category"))
        cats = [r[0] for r in result.all()]
        print(f"Current categories: {cats}")
        
        # Update brands not in known categories to 'Kids Fashion'
        placeholders = ", ".join(f":cat{i}" for i in range(len(known_categories)))
        params = {f"cat{i}": c for i, c in enumerate(known_categories)}
        
        result = await conn.execute(
            text(f"UPDATE brands SET category = 'Kids Fashion' WHERE category NOT IN ({placeholders})"),
            params
        )
        print(f"Updated {result.rowcount} brands to 'Kids Fashion'")
        
        # Verify
        result = await conn.execute(text("SELECT category, COUNT(*) FROM brands GROUP BY category ORDER BY category"))
        for r in result.all():
            print(f"  {r[0]}: {r[1]} brands")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
