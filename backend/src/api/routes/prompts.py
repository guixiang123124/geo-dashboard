"""
API routes for Prompt management.
"""

from typing import Optional
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.prompt import Prompt
from ...schemas.prompt_schemas import (
    PromptCreate,
    PromptUpdate,
    PromptResponse,
    PromptListResponse,
    PromptCategoryResponse,
)

router = APIRouter()


@router.get("/categories", response_model=list[PromptCategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all distinct prompt categories with counts."""
    result = await db.execute(
        select(
            Prompt.intent_category,
            func.count(Prompt.id).label("count"),
        ).group_by(Prompt.intent_category).order_by(Prompt.intent_category)
    )
    rows = result.all()
    return [
        PromptCategoryResponse(category=row[0], count=row[1])
        for row in rows
    ]


@router.get("/", response_model=PromptListResponse)
async def list_prompts(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    category: Optional[str] = Query(None, description="Filter by intent category"),
    search: Optional[str] = Query(None, description="Search prompt text"),
    db: AsyncSession = Depends(get_db),
):
    """List all prompts with optional filters and pagination."""
    query = select(Prompt)

    if category:
        query = query.where(Prompt.intent_category == category)

    if search:
        query = query.where(Prompt.text.ilike(f"%{search}%"))

    # Total count
    count_query = select(func.count(Prompt.id))
    if category:
        count_query = count_query.where(Prompt.intent_category == category)
    if search:
        count_query = count_query.where(Prompt.text.ilike(f"%{search}%"))

    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(Prompt.intent_category, Prompt.created_at.desc())
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    prompts = result.scalars().all()

    return PromptListResponse(
        prompts=prompts,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific prompt by ID."""
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    return prompt


@router.post("/", response_model=PromptResponse, status_code=201)
async def create_prompt(
    prompt_data: PromptCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new prompt."""
    prompt = Prompt(
        id=str(uuid4()),
        **prompt_data.model_dump(),
    )

    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)

    return prompt


@router.patch("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    prompt_data: PromptUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing prompt."""
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    update_data = prompt_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prompt, field, value)

    await db.commit()
    await db.refresh(prompt)

    return prompt


@router.delete("/{prompt_id}", status_code=204)
async def delete_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a prompt."""
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    await db.delete(prompt)
    await db.commit()

    return None
