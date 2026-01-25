"""
Pydantic schemas for Score API endpoints.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ScoreCardResponse(BaseModel):
    """Schema for score card responses."""
    id: str
    brand_id: str
    evaluation_run_id: Optional[str] = None
    composite_score: int
    visibility_score: int
    citation_score: int
    representation_score: int
    intent_score: int
    total_mentions: int
    avg_rank: Optional[float] = None
    citation_rate: float
    intent_coverage: float
    model_scores: dict
    evaluation_count: int
    last_evaluation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScoreHistoryResponse(BaseModel):
    """Schema for historical score data."""
    brand_id: str
    brand_name: str
    scores: list[ScoreCardResponse]
