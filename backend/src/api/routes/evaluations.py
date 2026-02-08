"""
API routes for Evaluation management.
"""

from typing import List
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.evaluation import EvaluationRun, EvaluationResult
from ...schemas.evaluation_schemas import (
    EvaluationRunCreate,
    EvaluationRunResponse,
    EvaluationRunDetailResponse,
    EvaluationResultResponse,
)

router = APIRouter()


@router.get("", response_model=List[EvaluationRunResponse])
async def list_evaluation_runs(
    workspace_id: str = Query(..., description="Workspace ID"),
    status: str = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all evaluation runs for a workspace.
    """
    query = select(EvaluationRun).where(EvaluationRun.workspace_id == workspace_id)

    if status:
        query = query.where(EvaluationRun.status == status)

    query = query.order_by(EvaluationRun.created_at.desc())

    result = await db.execute(query)
    runs = result.scalars().all()

    return runs


@router.get("/{run_id}", response_model=EvaluationRunDetailResponse)
async def get_evaluation_run(
    run_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific evaluation run with results.
    """
    # Get evaluation run
    result = await db.execute(
        select(EvaluationRun).where(
            EvaluationRun.id == run_id,
            EvaluationRun.workspace_id == workspace_id,
        )
    )
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(status_code=404, detail="Evaluation run not found")

    # Get results
    results_query = select(EvaluationResult).where(
        EvaluationResult.evaluation_run_id == run_id
    )
    results_result = await db.execute(results_query)
    results = results_result.scalars().all()

    return EvaluationRunDetailResponse(
        **run.__dict__,
        results=results,
    )


@router.post("", response_model=EvaluationRunResponse, status_code=201)
async def create_evaluation_run(
    run_data: EvaluationRunCreate,
    workspace_id: str = Query(..., description="Workspace ID"),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new evaluation run.

    This will start a background task to execute the evaluation.
    """
    run = EvaluationRun(
        id=str(uuid4()),
        workspace_id=workspace_id,
        name=run_data.name,
        models_used=run_data.models,
        prompt_count=0,  # Will be updated by evaluation service
        status="pending",
        progress=0,
    )

    db.add(run)
    await db.commit()
    await db.refresh(run)

    # TODO: Start background evaluation task
    # if background_tasks:
    #     background_tasks.add_task(
    #         run_evaluation,
    #         run_id=run.id,
    #         brand_ids=run_data.brand_ids,
    #         models=run_data.models,
    #         prompt_ids=run_data.prompt_ids,
    #     )

    return run


@router.get("/{run_id}/results", response_model=List[EvaluationResultResponse])
async def get_evaluation_results(
    run_id: str,
    workspace_id: str = Query(..., description="Workspace ID"),
    brand_id: str = Query(None, description="Filter by brand"),
    model_name: str = Query(None, description="Filter by AI model"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get evaluation results for a specific run.
    """
    # Verify run exists and belongs to workspace
    run_result = await db.execute(
        select(EvaluationRun).where(
            EvaluationRun.id == run_id,
            EvaluationRun.workspace_id == workspace_id,
        )
    )
    run = run_result.scalar_one_or_none()

    if not run:
        raise HTTPException(status_code=404, detail="Evaluation run not found")

    # Get results
    query = select(EvaluationResult).where(
        EvaluationResult.evaluation_run_id == run_id
    )

    if brand_id:
        query = query.where(EvaluationResult.brand_id == brand_id)

    if model_name:
        query = query.where(EvaluationResult.model_name == model_name)

    result = await db.execute(query)
    results = result.scalars().all()

    return results
