"""
Pydantic schemas for Brand API endpoints.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class BrandBase(BaseModel):
    """Base brand schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=512)
    category: str = Field(..., max_length=100)
    positioning: Optional[str] = None
    price_tier: str = Field(default="mid-range", max_length=50)
    target_age_range: Optional[str] = Field(None, max_length=100)
    target_keywords: List[str] = Field(default_factory=list)
    competitors: List[str] = Field(default_factory=list)
    extra_data: Optional[dict] = None


class BrandCreate(BrandBase):
    """Schema for creating a new brand."""
    pass


class BrandUpdate(BaseModel):
    """Schema for updating a brand (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=512)
    category: Optional[str] = Field(None, max_length=100)
    positioning: Optional[str] = None
    price_tier: Optional[str] = Field(None, max_length=50)
    target_age_range: Optional[str] = Field(None, max_length=100)
    target_keywords: Optional[List[str]] = None
    competitors: Optional[List[str]] = None
    extra_data: Optional[dict] = None


class BrandResponse(BrandBase):
    """Schema for brand responses."""
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BrandListResponse(BaseModel):
    """Schema for paginated brand list."""
    brands: List[BrandResponse]
    total: int
    page: int
    page_size: int
