"""
API routes for Score management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.scorecard import ScoreCard
from ...models.brand import Brand
from ...models.evaluation import EvaluationRun
from ...schemas.score_schemas import ScoreCardResponse, ScoreHistoryResponse

router = APIRouter()


@router.get("/brand/{brand_id}", response_model=List[ScoreCardResponse])
async def get_brand_scores(
    brand_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Get score history for a specific brand.
    """
    # Verify brand exists and belongs to workspace
    brand_result = await db.execute(
        select(Brand).where(
            Brand.id == brand_id,
            Brand.workspace_id == workspace_id,
        )
    )
    brand = brand_result.scalar_one_or_none()

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Get scores
    query = (
        select(ScoreCard)
        .where(ScoreCard.brand_id == brand_id)
        .order_by(ScoreCard.created_at.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    scores = result.scalars().all()

    return scores


@router.get("/brand/{brand_id}/latest", response_model=ScoreCardResponse)
async def get_latest_brand_score(
    brand_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the latest score for a specific brand.
    """
    # Verify brand exists and belongs to workspace
    brand_result = await db.execute(
        select(Brand).where(
            Brand.id == brand_id,
            Brand.workspace_id == workspace_id,
        )
    )
    brand = brand_result.scalar_one_or_none()

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Get latest score
    query = (
        select(ScoreCard)
        .where(ScoreCard.brand_id == brand_id)
        .order_by(ScoreCard.created_at.desc())
        .limit(1)
    )

    result = await db.execute(query)
    score = result.scalar_one_or_none()

    if not score:
        raise HTTPException(status_code=404, detail="No scores found for this brand")

    return score


@router.get("/workspace", response_model=List[ScoreCardResponse])
async def get_workspace_scores(
    workspace_id: str = Query(..., description="Workspace ID"),
    latest_only: bool = Query(True, description="Return only latest score per brand"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all scores for a workspace.

    If latest_only=True, returns only the most recent score for each brand.
    """
    if latest_only:
        # Subquery to get latest score ID per brand
        from sqlalchemy import func

        subquery = (
            select(
                ScoreCard.brand_id,
                func.max(ScoreCard.created_at).label("max_created_at"),
            )
            .join(Brand, Brand.id == ScoreCard.brand_id)
            .where(Brand.workspace_id == workspace_id)
            .group_by(ScoreCard.brand_id)
            .subquery()
        )

        # Get scores matching the latest created_at for each brand
        query = (
            select(ScoreCard)
            .join(Brand, Brand.id == ScoreCard.brand_id)
            .join(
                subquery,
                (ScoreCard.brand_id == subquery.c.brand_id)
                & (ScoreCard.created_at == subquery.c.max_created_at),
            )
            .where(Brand.workspace_id == workspace_id)
        )
    else:
        # Get all scores for workspace
        query = (
            select(ScoreCard)
            .join(Brand, Brand.id == ScoreCard.brand_id)
            .where(Brand.workspace_id == workspace_id)
            .order_by(ScoreCard.created_at.desc())
        )

    result = await db.execute(query)
    scores = result.scalars().all()

    return scores


@router.get("/trends")
async def get_score_trends(
    workspace_id: str = Query(..., description="Workspace ID"),
    brand_id: Optional[str] = Query(None, description="Filter by brand ID"),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
    """
    Get historical trend data for time series charts.

    Returns aggregated scores grouped by evaluation run date.
    If brand_id is provided, returns trends for that brand only.
    Otherwise returns average across all brands.
    """
    if brand_id:
        query = (
            select(ScoreCard)
            .where(ScoreCard.brand_id == brand_id)
            .order_by(ScoreCard.created_at.asc())
        )
        result = await db.execute(query)
        scores = result.scalars().all()

        return [
            {
                "date": s.created_at.isoformat(),
                "composite": s.composite_score,
                "visibility": s.visibility_score,
                "citation": s.citation_score,
                "representation": s.representation_score,
                "intent": s.intent_score,
                "evaluation_run_id": s.evaluation_run_id,
            }
            for s in scores
        ]
    else:
        query = (
            select(
                ScoreCard.evaluation_run_id,
                func.avg(ScoreCard.composite_score).label("composite"),
                func.avg(ScoreCard.visibility_score).label("visibility"),
                func.avg(ScoreCard.citation_score).label("citation"),
                func.avg(ScoreCard.representation_score).label("representation"),
                func.avg(ScoreCard.intent_score).label("intent"),
                func.min(ScoreCard.created_at).label("date"),
                func.count(ScoreCard.id).label("brand_count"),
            )
            .join(Brand, Brand.id == ScoreCard.brand_id)
            .where(Brand.workspace_id == workspace_id)
            .group_by(ScoreCard.evaluation_run_id)
            .order_by(func.min(ScoreCard.created_at).asc())
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                "date": row.date.isoformat() if row.date else None,
                "composite": round(row.composite or 0),
                "visibility": round(row.visibility or 0),
                "citation": round(row.citation or 0),
                "representation": round(row.representation or 0),
                "intent": round(row.intent or 0),
                "evaluation_run_id": row.evaluation_run_id,
                "brand_count": row.brand_count,
            }
            for row in rows
        ]


@router.get("/comparison")
async def get_brand_comparison(
    workspace_id: str = Query(..., description="Workspace ID"),
    brand_ids: str = Query(..., description="Comma-separated brand IDs"),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
    """
    Get latest scores for multiple brands for head-to-head comparison.
    """
    id_list = [bid.strip() for bid in brand_ids.split(",") if bid.strip()]

    if not id_list:
        return []

    subquery = (
        select(
            ScoreCard.brand_id,
            func.max(ScoreCard.created_at).label("max_created_at"),
        )
        .join(Brand, Brand.id == ScoreCard.brand_id)
        .where(
            Brand.workspace_id == workspace_id,
            ScoreCard.brand_id.in_(id_list),
        )
        .group_by(ScoreCard.brand_id)
        .subquery()
    )

    query = (
        select(ScoreCard, Brand.name, Brand.category)
        .join(Brand, Brand.id == ScoreCard.brand_id)
        .join(
            subquery,
            (ScoreCard.brand_id == subquery.c.brand_id)
            & (ScoreCard.created_at == subquery.c.max_created_at),
        )
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "brand_id": score.brand_id,
            "brand_name": name,
            "category": category,
            "composite_score": score.composite_score,
            "visibility_score": score.visibility_score,
            "citation_score": score.citation_score,
            "representation_score": score.representation_score,
            "intent_score": score.intent_score,
            "total_mentions": score.total_mentions,
            "citation_rate": score.citation_rate,
            "intent_coverage": score.intent_coverage,
            "model_scores": score.model_scores,
            "last_evaluation_date": (
                score.last_evaluation_date.isoformat()
                if score.last_evaluation_date
                else None
            ),
        }
        for score, name, category in rows
    ]
