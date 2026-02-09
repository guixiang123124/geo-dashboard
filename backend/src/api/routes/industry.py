"""
Industry Intelligence API — serves real evaluation data for category-level insights.
Supports multi-industry filtering via category parameter.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case, and_, text
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.brand import Brand
from ...models.prompt import Prompt
from ...models.evaluation import EvaluationResult
from ...models.scorecard import ScoreCard

router = APIRouter()


def _category_filter(category: Optional[str]):
    """Return a list of conditions for category filtering."""
    if not category:
        return []
    return [Brand.category == category]


@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all industry categories with brand/eval counts and avg composite."""
    result = await db.execute(
        select(
            Brand.category,
            func.count(func.distinct(Brand.id)).label("brand_count"),
            func.count(EvaluationResult.id).label("eval_count"),
        )
        .join(EvaluationResult, EvaluationResult.brand_id == Brand.id, isouter=True)
        .group_by(Brand.category)
        .order_by(func.count(EvaluationResult.id).desc())
    )
    rows = result.all()

    # Get avg composite per category from scorecards
    score_result = await db.execute(
        select(
            Brand.category,
            func.avg(ScoreCard.composite_score).label("avg_composite"),
        )
        .join(ScoreCard, ScoreCard.brand_id == Brand.id)
        .group_by(Brand.category)
    )
    score_map = {r[0]: round(r[1], 1) if r[1] else 0 for r in score_result.all()}

    return {
        "categories": [
            {
                "category": r[0],
                "brand_count": r[1],
                "eval_count": r[2],
                "avg_composite": score_map.get(r[0], 0),
            }
            for r in rows
            if r[0]  # skip nulls
        ]
    }


@router.get("/rankings")
async def get_brand_rankings(
    sort_by: str = Query("composite", description="Sort field"),
    limit: int = Query(30, ge=1, le=100),
    category: Optional[str] = Query(None, description="Filter by industry category"),
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

    query = (
        select(
            Brand.name, Brand.domain, Brand.category,
            ScoreCard.composite_score, ScoreCard.visibility_score,
            ScoreCard.citation_score, ScoreCard.representation_score,
            ScoreCard.intent_score, ScoreCard.total_mentions,
            ScoreCard.evaluation_count,
        )
        .join(ScoreCard, ScoreCard.brand_id == Brand.id)
    )

    conditions = _category_filter(category)
    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(order_col.desc()).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return {
        "rankings": [
            {
                "rank": i + 1,
                "name": r[0], "domain": r[1], "category": r[2],
                "composite": r[3], "visibility": r[4], "citation": r[5],
                "representation": r[6], "intent": r[7], "mentions": r[8],
                "evaluations": r[9],
            }
            for i, r in enumerate(rows)
        ],
        "total": len(rows),
        "sort_by": sort_by,
    }


@router.get("/intent-matrix")
async def get_intent_matrix(
    category: Optional[str] = Query(None, description="Filter by industry category"),
    db: AsyncSession = Depends(get_db),
):
    """Brand × Intent heatmap."""
    query = (
        select(
            Brand.name,
            EvaluationResult.intent_category,
            func.count().label("total"),
            func.sum(case((EvaluationResult.is_mentioned, 1), else_=0)).label("mentioned"),
        )
        .join(Brand, Brand.id == EvaluationResult.brand_id)
    )

    conditions = _category_filter(category)
    if conditions:
        query = query.where(and_(*conditions))

    query = query.group_by(Brand.name, EvaluationResult.intent_category).order_by(Brand.name, EvaluationResult.intent_category)
    result = await db.execute(query)
    rows = result.all()

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
    category: Optional[str] = Query(None, description="Filter by industry category"),
    db: AsyncSession = Depends(get_db),
):
    """Summary statistics, optionally filtered by category."""
    cat_conditions = _category_filter(category)

    # Base subquery for brand IDs in category
    if cat_conditions:
        brand_ids_sq = select(Brand.id).where(and_(*cat_conditions)).scalar_subquery()
        eval_filter = [EvaluationResult.brand_id.in_(select(Brand.id).where(and_(*cat_conditions)))]
        score_filter = [ScoreCard.brand_id.in_(select(Brand.id).where(and_(*cat_conditions)))]
    else:
        eval_filter = []
        score_filter = []

    # Total results
    q = select(func.count()).select_from(EvaluationResult)
    if eval_filter:
        q = q.where(and_(*eval_filter))
    total = (await db.execute(q)).scalar()

    # Mentioned
    q = select(func.count()).select_from(EvaluationResult).where(EvaluationResult.is_mentioned == True)
    if eval_filter:
        q = q.where(and_(*eval_filter))
    mentioned = (await db.execute(q)).scalar()

    # Brands
    q = select(func.count(func.distinct(EvaluationResult.brand_id)))
    if eval_filter:
        q = q.where(and_(*eval_filter))
    brands = (await db.execute(q)).scalar()

    # Prompts
    q = select(func.count(func.distinct(EvaluationResult.prompt_id)))
    if eval_filter:
        q = q.where(and_(*eval_filter))
    prompts = (await db.execute(q)).scalar()

    # Intent breakdown
    q = (
        select(
            EvaluationResult.intent_category,
            func.count().label("total"),
            func.sum(case((EvaluationResult.is_mentioned, 1), else_=0)).label("mentioned"),
        )
        .group_by(EvaluationResult.intent_category)
        .order_by(func.sum(case((EvaluationResult.is_mentioned, 1), else_=0)).desc())
    )
    if eval_filter:
        q = q.where(and_(*eval_filter))
    intent_rows = (await db.execute(q)).all()
    intents = [
        {"intent": r[0], "total": r[1], "mentioned": r[2], "rate": round((r[2] / r[1]) * 100, 1) if r[1] else 0}
        for r in intent_rows
    ]

    # Sentiment
    q = (
        select(EvaluationResult.sentiment, func.count())
        .where(EvaluationResult.is_mentioned == True)
        .group_by(EvaluationResult.sentiment)
    )
    if eval_filter:
        q = q.where(and_(*eval_filter))
    sentiment_rows = (await db.execute(q)).all()
    sentiments = {r[0] or "unknown": r[1] for r in sentiment_rows}

    # Score distribution
    q = select(
        func.avg(ScoreCard.composite_score),
        func.min(ScoreCard.composite_score),
        func.max(ScoreCard.composite_score),
        func.avg(ScoreCard.visibility_score),
        func.avg(ScoreCard.citation_score),
        func.avg(ScoreCard.representation_score),
        func.avg(ScoreCard.intent_score),
    )
    if score_filter:
        q = q.where(and_(*score_filter))
    score_row = (await db.execute(q)).one()

    # Top brand
    q = (
        select(Brand.name, ScoreCard.composite_score)
        .join(ScoreCard, ScoreCard.brand_id == Brand.id)
    )
    if cat_conditions:
        q = q.where(and_(*cat_conditions))
    q = q.order_by(ScoreCard.composite_score.desc()).limit(1)
    top_result = (await db.execute(q)).first()
    top_brand = {"name": top_result[0], "composite": top_result[1]} if top_result else None

    return {
        "total_evaluations": total,
        "total_mentioned": mentioned,
        "mention_rate": round((mentioned / total) * 100, 1) if total else 0,
        "total_brands": brands,
        "total_prompts": prompts,
        "intent_breakdown": intents,
        "sentiment_distribution": sentiments,
        "score_averages": {
            "composite": round(score_row[0], 1) if score_row[0] else 0,
            "composite_min": round(score_row[1], 1) if score_row[1] else 0,
            "composite_max": round(score_row[2], 1) if score_row[2] else 0,
            "visibility": round(score_row[3]) if score_row[3] else 0,
            "citation": round(score_row[4]) if score_row[4] else 0,
            "representation": round(score_row[5]) if score_row[5] else 0,
            "intent": round(score_row[6]) if score_row[6] else 0,
        },
        "top_brand": top_brand,
    }


@router.get("/raw")
async def get_raw_data(
    brand: Optional[str] = Query(None),
    intent: Optional[str] = Query(None),
    mentioned: Optional[bool] = Query(None),
    sentiment: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None, description="Filter by industry category"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=10, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Raw evaluation data with filtering and pagination."""
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

    conditions = []
    if category:
        conditions.append(Brand.category == category)
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

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    offset = (page - 1) * page_size
    query = query.order_by(Brand.name, EvaluationResult.intent_category).offset(offset).limit(page_size)
    result = await db.execute(query)
    rows = result.all()

    return {
        "data": [
            {
                "brand": r[0], "prompt": r[1], "intent": r[2], "model": r[3],
                "mentioned": r[4], "rank": r[5],
                "context": r[6][:300] if r[6] else None,
                "sentiment": r[7],
                "response": r[8][:3000] if r[8] else None,
                "response_time_ms": r[9], "cited": r[10], "representation": r[11],
            }
            for r in rows
        ],
        "pagination": {
            "page": page, "page_size": page_size,
            "total": total, "total_pages": (total + page_size - 1) // page_size,
        },
        "filters": {
            "brand": brand, "intent": intent, "mentioned": mentioned,
            "sentiment": sentiment, "search": search, "category": category,
        },
    }


@router.get("/brands")
async def get_industry_brands(
    category: Optional[str] = Query(None, description="Filter by industry category"),
    db: AsyncSession = Depends(get_db),
):
    """List all brands for filter dropdowns."""
    query = select(Brand.name, Brand.domain, Brand.category).order_by(Brand.name)
    if category:
        query = query.where(Brand.category == category)
    result = await db.execute(query)
    return {"brands": [{"name": r[0], "domain": r[1], "category": r[2]} for r in result.all()]}


@router.get("/intents")
async def get_intent_categories(
    category: Optional[str] = Query(None, description="Filter by industry category"),
    db: AsyncSession = Depends(get_db),
):
    """List all intent categories for filter dropdowns."""
    if category:
        query = (
            select(EvaluationResult.intent_category)
            .join(Brand, Brand.id == EvaluationResult.brand_id)
            .where(Brand.category == category)
            .distinct()
            .order_by(EvaluationResult.intent_category)
        )
    else:
        query = select(EvaluationResult.intent_category).distinct().order_by(EvaluationResult.intent_category)
    result = await db.execute(query)
    return {"intents": [r[0] for r in result.all()]}
