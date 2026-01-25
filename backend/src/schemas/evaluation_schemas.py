"""
Pydantic schemas for Evaluation API endpoints.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class EvaluationRunCreate(BaseModel):
    """Schema for creating a new evaluation run."""
    name: str = Field(..., min_length=1, max_length=255)
    brand_ids: List[str] = Field(..., min_items=1)
    models: List[str] = Field(..., min_items=1)
    prompt_ids: Optional[List[str]] = None  # If None, use all prompts


class EvaluationRunResponse(BaseModel):
    """Schema for evaluation run responses."""
    id: str
    workspace_id: str
    name: str
    models_used: List[str]
    prompt_count: int
    status: str
    progress: int
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EvaluationResultResponse(BaseModel):
    """Schema for individual evaluation result."""
    id: str
    evaluation_run_id: str
    brand_id: str
    prompt_id: str
    model_name: str
    prompt_text: str
    intent_category: str
    response_text: str
    response_time_ms: int
    is_mentioned: bool
    mention_rank: Optional[int] = None
    mention_context: Optional[str] = None
    is_cited: bool
    citation_urls: List[str]
    representation_score: int
    description_text: Optional[str] = None
    sentiment: Optional[str] = None
    intent_fit_score: Optional[float] = None
    evaluated_at: datetime

    class Config:
        from_attributes = True


class EvaluationRunDetailResponse(EvaluationRunResponse):
    """Schema for detailed evaluation run with results."""
    results: List[EvaluationResultResponse]
