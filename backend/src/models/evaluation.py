"""
Evaluation models for tracking AI evaluation runs and results.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer, Boolean, Text, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class EvaluationRun(Base):
    """Evaluation run tracking multiple brand evaluations."""

    __tablename__ = "evaluation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)

    # Run Configuration
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    models_used: Mapped[List[str]] = mapped_column(JSON, nullable=False)  # ["ChatGPT", "Gemini"]
    prompt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Status
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", index=True)
    # Status: pending, running, completed, failed
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # 0-100
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="evaluation_runs")
    results: Mapped[List["EvaluationResult"]] = relationship(
        "EvaluationResult", back_populates="evaluation_run", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<EvaluationRun(id={self.id}, status={self.status}, progress={self.progress}%)>"


class EvaluationResult(Base):
    """Individual evaluation result for a brand-prompt-model combination."""

    __tablename__ = "evaluation_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    evaluation_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("evaluation_runs.id"), nullable=False, index=True)
    brand_id: Mapped[str] = mapped_column(String(36), ForeignKey("brands.id"), nullable=False, index=True)
    prompt_id: Mapped[str] = mapped_column(String(36), ForeignKey("prompts.id"), nullable=False, index=True)

    # Model & Prompt
    model_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # ChatGPT, Gemini, Claude, Perplexity
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    intent_category: Mapped[str] = mapped_column(String(100), nullable=False)

    # AI Response
    response_text: Mapped[str] = mapped_column(Text, nullable=False)
    response_time_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Metrics (A: Visibility)
    is_mentioned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    mention_rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Position in list (1-based)
    mention_context: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Surrounding text

    # Metrics (B: Citation)
    is_cited: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    citation_urls: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)

    # Metrics (C: Representation)
    representation_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # 0-3 scale
    description_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # positive, neutral, negative

    # Metrics (D: Intent Fit)
    intent_fit_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 0.0-1.0

    # Timestamps
    evaluated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    evaluation_run: Mapped["EvaluationRun"] = relationship("EvaluationRun", back_populates="results")
    brand: Mapped["Brand"] = relationship("Brand", back_populates="evaluation_results")
    prompt: Mapped["Prompt"] = relationship("Prompt")

    def __repr__(self) -> str:
        return f"<EvaluationResult(id={self.id}, model={self.model_name}, mentioned={self.is_mentioned})>"
