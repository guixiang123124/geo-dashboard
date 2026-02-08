"""
API routes for Brand management.
"""

from typing import List
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.brand import Brand
from ...schemas.brand_schemas import (
    BrandCreate,
    BrandUpdate,
    BrandResponse,
    BrandListResponse,
)

router = APIRouter()


@router.get("", response_model=BrandListResponse)
async def list_brands(
    workspace_id: str = Query(..., description="Workspace ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: str = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all brands for a workspace with pagination.
    """
    query = select(Brand).where(Brand.workspace_id == workspace_id)

    if category:
        query = query.where(Brand.category == category)

    # Get total count
    count_result = await db.execute(select(Brand).where(Brand.workspace_id == workspace_id))
    total = len(count_result.scalars().all())

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    brands = result.scalars().all()

    return BrandListResponse(
        brands=brands,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific brand by ID.
    """
    result = await db.execute(
        select(Brand).where(
            Brand.id == brand_id,
            Brand.workspace_id == workspace_id,
        )
    )
    brand = result.scalar_one_or_none()

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    return brand


@router.post("", response_model=BrandResponse, status_code=201)
async def create_brand(
    brand_data: BrandCreate,
    workspace_id: str = Query(..., description="Workspace ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new brand.
    """
    brand = Brand(
        id=str(uuid4()),
        workspace_id=workspace_id,
        **brand_data.model_dump(),
    )

    db.add(brand)
    await db.commit()
    await db.refresh(brand)

    return brand


@router.patch("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: str,
    brand_data: BrandUpdate,
    workspace_id: str = Query(..., description="Workspace ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Update an existing brand.
    """
    result = await db.execute(
        select(Brand).where(
            Brand.id == brand_id,
            Brand.workspace_id == workspace_id,
        )
    )
    brand = result.scalar_one_or_none()

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Update only provided fields
    update_data = brand_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(brand, field, value)

    await db.commit()
    await db.refresh(brand)

    return brand


@router.delete("/{brand_id}", status_code=204)
async def delete_brand(
    brand_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a brand.
    """
    result = await db.execute(
        select(Brand).where(
            Brand.id == brand_id,
            Brand.workspace_id == workspace_id,
        )
    )
    brand = result.scalar_one_or_none()

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    await db.delete(brand)
    await db.commit()

    return None
