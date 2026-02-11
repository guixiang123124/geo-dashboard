"""
DiagnosisRecord model for storing AI visibility diagnosis results.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class DiagnosisRecord(Base):
    """Stores completed diagnosis results."""

    __tablename__ = "diagnosis_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    brand_name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    composite_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    visibility_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    citation_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    representation_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    intent_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_prompts: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mentioned_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    models_used: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    results_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    insights: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    competitors_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    per_model_scores: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
