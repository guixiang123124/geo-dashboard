from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class AIModel(str, Enum):
    CHATGPT = "chatgpt"
    GEMINI = "gemini"
    CLAUDE = "claude"
    PERPLEXITY = "perplexity"

class IntentCategory(str, Enum):
    GENERAL = "general"
    PRICE = "price"
    SUSTAINABILITY = "sustainability"
    QUALITY = "quality"
    OCCASION = "occasion"

class Brand(BaseModel):
    """Represents a Brand or Website being measured."""
    name: str
    domain: str
    target_keywords: List[str] = Field(default_factory=list, description="Keywords that should appear in description")
    competitors: List[str] = Field(default_factory=list)

class Prompt(BaseModel):
    """A standardized prompt used for evaluation."""
    text: str
    intent: IntentCategory
    weight: float = 1.0

class EvaluationResult(BaseModel):
    """The raw result of a single AI interaction."""
    timestamp: datetime = Field(default_factory=datetime.now)
    model: AIModel
    prompt_text: str
    response_text: str
    
    # Scored Attributes
    is_mentioned: bool = False
    rank_position: Optional[int] = None
    citation_link: Optional[str] = None
    description_sentiment: Optional[str] = None # positive, neutral, negative
    description_accuracy_score: Optional[int] = None # 0-3
    matched_keywords: List[str] = Field(default_factory=list)

class GEOScoreCard(BaseModel):
    """The aggregated GEO Score for a Brand."""
    brand_name: str
    
    # Dimension Scores (0-100)
    visibility_score: float
    citation_score: float
    representation_score: float
    intent_score: float
    
    # Composite Score
    composite_score: float
    
    generated_at: datetime = Field(default_factory=datetime.now)
