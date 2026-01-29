"""
Pydantic schemas for Prompt management.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class PromptBase(BaseModel):
    """Base prompt schema."""
    text: str = Field(..., min_length=1, max_length=2000, description="Prompt text")
    intent_category: str = Field(..., min_length=1, max_length=100, description="Intent category")
    weight: int = Field(default=5, ge=1, le=10, description="Importance weight (1-10)")
    description: Optional[str] = Field(None, description="Prompt description")


class PromptCreate(PromptBase):
    """Schema for creating a prompt."""
    pass


class PromptUpdate(BaseModel):
    """Schema for updating a prompt (all fields optional)."""
    text: Optional[str] = Field(None, min_length=1, max_length=2000)
    intent_category: Optional[str] = Field(None, min_length=1, max_length=100)
    weight: Optional[int] = Field(None, ge=1, le=10)
    description: Optional[str] = None


class PromptResponse(BaseModel):
    """Schema for prompt response."""
    id: str
    text: str
    intent_category: str
    weight: int
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PromptListResponse(BaseModel):
    """Schema for paginated prompt list response."""
    prompts: List[PromptResponse]
    total: int
    page: int
    page_size: int


class PromptCategoryResponse(BaseModel):
    """Schema for prompt category summary."""
    category: str
    count: int
