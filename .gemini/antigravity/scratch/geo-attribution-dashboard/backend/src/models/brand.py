"""
Brand model representing kids fashion brands to track.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class Brand(Base):
    """Brand model for tracking kids fashion brands."""

    __tablename__ = "brands"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)

    # Brand Information
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Category & Positioning
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "Sustainable Kids Fashion"
    positioning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Brand positioning statement
    price_tier: Mapped[str] = mapped_column(String(50), nullable=False, default="mid-range")  # budget, mid-range, premium, luxury

    # Target Audience
    target_age_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., "0-12 years"

    # SEO & Keywords
    target_keywords: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)  # ["organic cotton", "sustainable"]
    competitors: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)  # ["Brand A", "Brand B"]

    # Metadata
    metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # Additional flexible data

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="brands")
    evaluation_results: Mapped[List["EvaluationResult"]] = relationship(
        "EvaluationResult", back_populates="brand", cascade="all, delete-orphan"
    )
    scores: Mapped[List["ScoreCard"]] = relationship(
        "ScoreCard", back_populates="brand", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Brand(id={self.id}, name={self.name}, category={self.category})>"
