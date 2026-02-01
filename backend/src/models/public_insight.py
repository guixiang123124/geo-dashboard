"""
Models for public dataset insights.
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, Integer, Float, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class PublicInsight(Base):
    """
    Aggregated insights from public datasets.
    Stores pre-computed statistics for quick access.
    """
    
    __tablename__ = "public_insights"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Insight type
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # Types: "trending", "llm_comparison", "sentiment", "category_summary", "temporal"
    
    # Associated brand/category (optional)
    brand: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    
    # Data payload
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    
    # Statistics
    mention_count: Mapped[int] = mapped_column(Integer, default=0)
    positive_count: Mapped[int] = mapped_column(Integer, default=0)
    negative_count: Mapped[int] = mapped_column(Integer, default=0)
    neutral_count: Mapped[int] = mapped_column(Integer, default=0)
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Metadata
    data_source: Mapped[str] = mapped_column(String(100), default="mixed")
    period_start: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    period_end: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<PublicInsight(id={self.id}, type={self.insight_type}, brand={self.brand})>"


class BrandMention(Base):
    """
    Individual brand mentions extracted from public datasets.
    """
    
    __tablename__ = "brand_mentions"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    
    # Brand info
    brand: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Source info
    source_id: Mapped[str] = mapped_column(String(100), nullable=False)  # conversation/review ID
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # "lmsys", "amazon", etc.
    model_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)  # LLM model
    
    # Content
    context: Mapped[str] = mapped_column(Text, nullable=False)  # Text around mention
    query: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Original query
    
    # Sentiment
    sentiment: Mapped[str] = mapped_column(String(20), nullable=False, default="neutral")
    sentiment_confidence: Mapped[float] = mapped_column(Float, default=0.5)
    
    # Timestamp from source
    mention_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    
    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self) -> str:
        return f"<BrandMention(id={self.id}, brand={self.brand}, sentiment={self.sentiment})>"
