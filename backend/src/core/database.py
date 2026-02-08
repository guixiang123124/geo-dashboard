"""
Database configuration and session management.
Uses SQLAlchemy 2.0 with async support.
"""

import os
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import DeclarativeBase


def get_database_url() -> str:
    """
    Get the database URL, converting various PostgreSQL URL formats to asyncpg.
    """
    # Try DATABASE_URL env var directly first (Railway sets this)
    url = os.environ.get("DATABASE_URL", "")
    
    if not url:
        # Fall back to settings
        from .config import settings
        url = settings.DATABASE_URL
    
    if not url:
        # Final fallback: SQLite
        return "sqlite+aiosqlite:///./geo_dashboard.db"
    
    # Convert various PostgreSQL URL formats
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    print(f"Database URL: {url[:30]}...")
    return url


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Lazy engine initialization
_engine: Optional[AsyncEngine] = None
_session_factory: Optional[async_sessionmaker] = None


def _get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        from .config import settings
        db_url = get_database_url()
        _engine = create_async_engine(
            db_url,
            echo=settings.DEBUG,
            future=True,
        )
    return _engine


def _get_session_factory() -> async_sessionmaker:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            _get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions."""
    factory = _get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    engine = _get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    global _engine
    if _engine:
        await _engine.dispose()
        _engine = None
