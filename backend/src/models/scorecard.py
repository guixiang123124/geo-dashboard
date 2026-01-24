"""
ScoreCard model for aggregated GEO scores.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class ScoreCard(Base):
    """Aggregated GEO scores for a brand."""

    __tablename__ = "score_cards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    brand_id: Mapped[str] = mapped_column(String(36), ForeignKey("brands.id"), nullable=False, index=True)
    evaluation_run_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("evaluation_runs.id"), nullable=True, index=True
    )

    # GEO Scores (0-100 scale)
    composite_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    visibility_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    citation_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    representation_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    intent_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Detailed Metrics
    total_mentions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    avg_rank: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    citation_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)  # 0.0-1.0
    intent_coverage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)  # 0.0-1.0

    # Model Breakdown
    model_scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # {"ChatGPT": {"score": 85, "mentions": 10}, "Gemini": {...}}

    # Metadata
    evaluation_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_evaluation_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    brand: Mapped["Brand"] = relationship("Brand", back_populates="scores")
    evaluation_run: Mapped[Optional["EvaluationRun"]] = relationship("EvaluationRun")

    def __repr__(self) -> str:
        return f"<ScoreCard(id={self.id}, brand_id={self.brand_id}, composite={self.composite_score})>"
