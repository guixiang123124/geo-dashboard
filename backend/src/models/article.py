"""
Article model for GEO Learning Center — dynamic blog content.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Article(Base):
    """Dynamic article/blog post for the GEO Learning Center."""
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Full markdown content
    source_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    source_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)  # e.g. "Search Engine Journal"
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="news")  # news, report, tip, case_study
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # comma-separated
    image_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    reading_time_min: Mapped[int] = mapped_column(Integer, default=3)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
