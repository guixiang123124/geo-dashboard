"""
Articles API — GEO Learning Center dynamic content.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.article import Article

router = APIRouter()


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class ArticleOut(BaseModel):
    id: int
    title: str
    summary: str
    content: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    category: str
    tags: Optional[str] = None
    image_url: Optional[str] = None
    reading_time_min: int
    is_featured: bool
    published_at: datetime

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    articles: list[ArticleOut]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=ArticleListResponse)
async def list_articles(
    category: Optional[str] = Query(None, description="Filter by category: news, report, tip, case_study"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """List published articles with optional filters."""
    query = select(Article).where(Article.is_published == True)

    if category:
        query = query.where(Article.category == category)
    if tag:
        query = query.where(Article.tags.ilike(f"%{tag}%"))
    if featured is not None:
        query = query.where(Article.is_featured == featured)

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginate
    query = query.order_by(desc(Article.published_at))
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    articles = result.scalars().all()

    return ArticleListResponse(
        articles=[ArticleOut.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get article categories with counts."""
    query = (
        select(Article.category, func.count(Article.id))
        .where(Article.is_published == True)
        .group_by(Article.category)
    )
    result = await db.execute(query)
    return [{"category": row[0], "count": row[1]} for row in result.all()]


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: int, db: AsyncSession = Depends(get_db)):
    """Get single article by ID."""
    result = await db.execute(select(Article).where(Article.id == article_id, Article.is_published == True))
    article = result.scalar_one_or_none()
    if not article:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleOut.model_validate(article)
