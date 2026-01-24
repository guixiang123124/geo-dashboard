"""
Workspace model for multi-tenant isolation.
Each client/organization has their own workspace.
"""

from datetime import datetime
from typing import List
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class Workspace(Base):
    """Workspace model for multi-tenant isolation."""

    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    # API Configuration
    api_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    brands: Mapped[List["Brand"]] = relationship(
        "Brand", back_populates="workspace", cascade="all, delete-orphan"
    )
    evaluation_runs: Mapped[List["EvaluationRun"]] = relationship(
        "EvaluationRun", back_populates="workspace", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Workspace(id={self.id}, name={self.name}, slug={self.slug})>"
