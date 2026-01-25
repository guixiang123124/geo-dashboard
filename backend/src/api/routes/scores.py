"""
API routes for Score management.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.scorecard import ScoreCard
from ...models.brand import Brand
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
