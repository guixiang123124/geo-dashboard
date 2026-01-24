"""
Prompt model for evaluation prompts.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Prompt(Base):
    """Prompt model for evaluation prompts."""

    __tablename__ = "prompts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Prompt Content
    text: Mapped[str] = mapped_column(Text, nullable=False)
    intent_category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # Intent categories: general, price, sustainability, occasion, age_specific, safety, quality, trend, use_case, value, geography

    # Metadata
    weight: Mapped[int] = mapped_column(Integer, default=5, nullable=False)  # 1-10, importance weighting
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return f"<Prompt(id={self.id}, intent_category={self.intent_category}, text={self.text[:50]}...)>"
