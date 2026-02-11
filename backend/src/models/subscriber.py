"""Subscriber model for email collection."""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from ..core.database import Base


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(500), unique=True, nullable=False)
    source = Column(String(100), default="audit_page")
    subscribed_at = Column(DateTime, default=datetime.utcnow)
