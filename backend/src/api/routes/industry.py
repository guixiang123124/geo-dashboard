"""
Industry Intelligence API — serves real evaluation data for category-level insights.
Queries the 3600 real Gemini evaluation results in the DB.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.brand import Brand
from ...models.prompt import Prompt
from ...models.evaluation import EvaluationResult
from ...models.scorecard import ScoreCard

router = APIRouter()


@router.get("/rankings")
async def get_brand_rankings(
    sort_by: str = Query("composite", description="Sort field: composite, visibility, citation, representation, intent, mentions"),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Brand leaderboard with all score dimensions."""
    order_map = {
        "composite": ScoreCard.composite_score,
        "visibility": ScoreCard.visibility_score,
        "citation": ScoreCard.citation_score,
        "representation": ScoreCard.representation_score,
        "intent": ScoreCard.intent_score,
        "mentions": ScoreCard.total_mentions,
    }
    order_col = order_map.get(sort_by, ScoreCard.composite_score)

    result = await db.execute(
        select(
            Brand.name, Brand.domain, Brand.category,
            ScoreCard.composite_score, ScoreCard.visibility_score,
            ScoreCard.citation_score, ScoreCard.representation_score,
            ScoreCard.intent_score, ScoreCard.total_mentions,
            ScoreCard.evaluation_count,
        )
        .join(ScoreCard, ScoreCard.brand_id == Brand.id)
        .order_by(order_col.desc())
        .limit(limit)
    )
    rows = result.all()

    return {
        "rankings": [
            {
                "rank": i + 1,
                "name": r[0],
                "domain": r[1],
                "category": r[2],
                "composite": r[3],
                "visibility": r[4],
                "citation": r[5],
                "representation": r[6],
                "intent": r[7],
                "mentions": r[8],
                "evaluations": r[9],
            }
            for i, r in enumerate(rows)
        ],
        "total": len(rows),
        "sort_by": sort_by,
    }


@router.get("/intent-matrix")
async def get_intent_matrix(
    db: AsyncSession = Depends(get_db),
):
    """Brand × Intent heatmap — mention rate per brand per intent category."""
    result = await db.execute(
        select(
            Brand.name,
            EvaluationResult.intent_category,
            func.count().label("total"),
            func.sum(case((EvaluationResult.is_mentioned, 1), else_=0)).label("mentioned"),
        )
        .join(Brand, Brand.id == EvaluationResult.brand_id)
        .group_by(Brand.name, EvaluationResult.intent_category)
        .order_by(Brand.name, EvaluationResult.intent_category)
    )
    rows = result.all()

    # Build matrix
    matrix = {}
    intents = set()
    for name, intent, total, mentioned in rows:
        if name not in matrix:
            matrix[name] = {}
        rate = round((mentioned / total) * 100) if total else 0
        matrix[name][intent] = {"rate": rate, "mentioned": mentioned, "total": total}
        intents.add(intent)

    return {
        "matrix": matrix,
        "intents": sorted(intents),
        "brands": sorted(matrix.keys()),
    }


@router.get("/stats")
async def get_industry_stats(
    db: AsyncSession = Depends(get_db),
):
    """Summary statistics for the industry evaluation data."""
    # Total results
    total_q = await db.execute(select(func.count()).select_from(EvaluationResult))
    total = total_q.scalar()

    # Mentioned
    mentioned_q = await db.execute(
        select(func.count()).select_from(EvaluationResult).where(EvaluationResult.is_mentioned == True)
    )
    mentioned = mentioned_q.scalar()

    # Brands
    brands_q = await db.execute(select(func.count(func.distinct(EvaluationResult.brand_id))))
    brands = brands_q.scalar()

    # Prompts
    prompts_q = await db.execute(select(func.count(func.distinct(EvaluationResult.prompt_id))))
    prompts = prompts_q.scalar()

    # Intent breakdown
    intent_q = await db.execute(
        select(
            EvaluationResult.intent_category,
            func.count().label("total"),
            func.sum(case((EvaluationResult.is_mentioned, 1), else_=0)).label("mentioned"),
        )
        .group_by(EvaluationResult.intent_category)
        .order_by(func.sum(case((EvaluationResult.is_mentioned, 1), else_=0)).desc())
    )
    intents = [
        {"intent": r[0], "total": r[1], "mentioned": r[2], "rate": round((r[2] / r[1]) * 100, 1) if r[1] else 0}
        for r in intent_q.all()
    ]

    # Sentiment
    sentiment_q = await db.execute(
        select(EvaluationResult.sentiment, func.count())
        .where(EvaluationResult.is_mentioned == True)
        .group_by(EvaluationResult.sentiment)
    )
    sentiments = {r[0] or "unknown": r[1] for r in sentiment_q.all()}

    # Score distribution
    score_q = await db.execute(
        select(
            func.avg(ScoreCard.composite_score),
            func.min(ScoreCard.composite_score),
            func.max(ScoreCard.composite_score),
            func.avg(ScoreCard.visibility_score),
            func.avg(ScoreCard.citation_score),
            func.avg(ScoreCard.representation_score),
            func.avg(ScoreCard.intent_score),
        )
    )
    score_row = score_q.one()

    return {
        "total_evaluations": total,
        "total_mentioned": mentioned,
        "mention_rate": round((mentioned / total) * 100, 1) if total else 0,
        "total_brands": brands,
        "total_prompts": prompts,
        "intent_breakdown": intents,
        "sentiment_distribution": sentiments,
        "score_averages": {
            "composite": round(score_row[0]) if score_row[0] else 0,
            "composite_min": score_row[1] or 0,
            "composite_max": score_row[2] or 0,
            "visibility": round(score_row[3]) if score_row[3] else 0,
            "citation": round(score_row[4]) if score_row[4] else 0,
            "representation": round(score_row[5]) if score_row[5] else 0,
            "intent": round(score_row[6]) if score_row[6] else 0,
        },
    }


@router.get("/raw")
async def get_raw_data(
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    intent: Optional[str] = Query(None, description="Filter by intent category"),
    mentioned: Optional[bool] = Query(None, description="Filter by mentioned status"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    search: Optional[str] = Query(None, description="Search in prompt text or response"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=10, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Raw evaluation data with filtering and pagination. Returns full response text for verification."""
    # Base query
    query = (
        select(
            Brand.name.label("brand_name"),
            EvaluationResult.prompt_text,
            EvaluationResult.intent_category,
            EvaluationResult.model_name,
            EvaluationResult.is_mentioned,
            EvaluationResult.mention_rank,
            EvaluationResult.mention_context,
            EvaluationResult.sentiment,
            EvaluationResult.response_text,
            EvaluationResult.response_time_ms,
            EvaluationResult.is_cited,
            EvaluationResult.representation_score,
        )
        .join(Brand, Brand.id == EvaluationResult.brand_id)
    )

    # Apply filters
    conditions = []
    if brand:
        conditions.append(Brand.name.ilike(f"%{brand}%"))
    if intent:
        conditions.append(EvaluationResult.intent_category == intent)
    if mentioned is not None:
        conditions.append(EvaluationResult.is_mentioned == mentioned)
    if sentiment:
        conditions.append(EvaluationResult.sentiment == sentiment)
    if search:
        conditions.append(
            EvaluationResult.prompt_text.ilike(f"%{search}%")
            | EvaluationResult.response_text.ilike(f"%{search}%")
        )

    if conditions:
        query = query.where(and_(*conditions))

    # Count total
    count_query = select(func.count()).select_from(
        query.subquery()
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(Brand.name, EvaluationResult.intent_category).offset(offset).limit(page_size)

    result = await db.execute(query)
    rows = result.all()

    return {
        "data": [
            {
                "brand": r[0],
                "prompt": r[1],
                "intent": r[2],
                "model": r[3],
                "mentioned": r[4],
                "rank": r[5],
                "context": r[6][:300] if r[6] else None,
                "sentiment": r[7],
                "response": r[8][:3000] if r[8] else None,
                "response_time_ms": r[9],
                "cited": r[10],
                "representation": r[11],
            }
            for r in rows
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
        },
        "filters": {
            "brand": brand,
            "intent": intent,
            "mentioned": mentioned,
            "sentiment": sentiment,
            "search": search,
        },
    }


@router.get("/brands")
async def get_industry_brands(
    db: AsyncSession = Depends(get_db),
):
    """List all brands with their basic info for filter dropdowns."""
    result = await db.execute(
        select(Brand.name, Brand.domain, Brand.category)
        .order_by(Brand.name)
    )
    return {"brands": [{"name": r[0], "domain": r[1], "category": r[2]} for r in result.all()]}


@router.get("/intents")
async def get_intent_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all intent categories for filter dropdowns."""
    result = await db.execute(
        select(EvaluationResult.intent_category).distinct().order_by(EvaluationResult.intent_category)
    )
    return {"intents": [r[0] for r in result.all()]}
