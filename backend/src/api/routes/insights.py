"""
API routes for Public Dataset Insights.
"""

from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from ...services.public_datasets import DatasetFetcher, BrandExtractor, InsightPreprocessor


router = APIRouter()

# Initialize services (singleton pattern for caching)
_fetcher = None
_extractor = None
_preprocessor = None


def get_services():
    """Get or initialize services with cached data."""
    global _fetcher, _extractor, _preprocessor
    
    if _preprocessor is None:
        _fetcher = DatasetFetcher()
        _extractor = BrandExtractor()
        _preprocessor = InsightPreprocessor()
        
        # Load and process data
        conversations = _fetcher.get_lmsys_sample(500)
        reviews = _fetcher.get_amazon_reviews_sample(300)
        
        # Extract brand mentions
        mentions = _extractor.batch_extract(conversations)
        
        # Add review data
        review_mentions = []
        for review in reviews:
            review_mentions.append({
                "brand": review["brand"],
                "category": review["category"],
                "sentiment": review["sentiment"],
                "confidence": 0.9 if review.get("verified_purchase") else 0.7,
                "timestamp": review["timestamp"],
                "model": "Reviews",  # Treat as a separate "model"
            })
        
        _preprocessor.load_data(mentions + review_mentions, reviews)
    
    return _fetcher, _extractor, _preprocessor


# ============ Response Models ============

class TrendingBrand(BaseModel):
    brand: str
    category: str
    mention_count: int
    positive_count: int
    negative_count: int
    neutral_count: int
    positive_percentage: float
    sentiment_score: float
    model_coverage: int


class TrendingResponse(BaseModel):
    brands: List[TrendingBrand]
    total_mentions: int
    categories_available: List[str]


class LLMComparisonItem(BaseModel):
    model: str
    total_mentions: int
    unique_brands: int
    positive_rate: float
    negative_rate: float
    neutral_rate: float
    top_brands: List[tuple]


class LLMComparisonResponse(BaseModel):
    models: List[LLMComparisonItem]
    total_models: int


class SentimentDistribution(BaseModel):
    positive: int
    negative: int
    neutral: int


class SentimentPercentages(BaseModel):
    positive: float
    negative: float
    neutral: float


class ModelSentiment(BaseModel):
    model: str
    positive: int
    negative: int
    neutral: int


class SentimentResponse(BaseModel):
    brand: str
    total_mentions: int
    sentiment_distribution: SentimentDistribution
    sentiment_percentages: SentimentPercentages
    average_confidence: float
    sentiment_score: float
    by_model: List[ModelSentiment]


class CategoryInfo(BaseModel):
    category: str
    brand_count: int
    mention_count: int


class CategoriesResponse(BaseModel):
    categories: List[CategoryInfo]
    total: int


class TemporalDataPoint(BaseModel):
    date: str
    total: int
    positive: int
    negative: int
    neutral: int


class TemporalResponse(BaseModel):
    data: List[TemporalDataPoint]
    brand: Optional[str]
    period_days: int


class SummaryResponse(BaseModel):
    total_mentions: int
    unique_brands: int
    categories: int
    sentiment_overview: dict
    data_sources: dict


# ============ API Endpoints ============

@router.get("/trending", response_model=TrendingResponse)
async def get_trending_brands(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(10, ge=1, le=50, description="Number of brands to return"),
):
    """
    Get top trending brands by mention frequency.
    
    Returns brands sorted by total mentions across LLM conversations and reviews.
    """
    _, _, preprocessor = get_services()
    
    brands = preprocessor.get_trending_brands(category=category, limit=limit)
    categories = preprocessor.get_categories()
    summary = preprocessor.generate_summary()
    
    return TrendingResponse(
        brands=[TrendingBrand(**b) for b in brands],
        total_mentions=summary["total_mentions"],
        categories_available=[c["category"] for c in categories],
    )


@router.get("/llm-comparison", response_model=LLMComparisonResponse)
async def get_llm_comparison(
    brand: Optional[str] = Query(None, description="Filter to specific brand"),
):
    """
    Get brand mention comparison across different LLM models.
    
    Shows how different AI models reference brands and their sentiment patterns.
    """
    _, _, preprocessor = get_services()
    
    comparison = preprocessor.get_llm_comparison(brand=brand)
    
    return LLMComparisonResponse(
        models=[LLMComparisonItem(**m) for m in comparison],
        total_models=len(comparison),
    )


@router.get("/sentiment/{brand}", response_model=SentimentResponse)
async def get_brand_sentiment(
    brand: str,
):
    """
    Get detailed sentiment analysis for a specific brand.
    
    Returns sentiment breakdown across all data sources and models.
    """
    _, extractor, preprocessor = get_services()
    
    # Validate brand exists
    brand_info = extractor.get_brand_info(brand)
    if not brand_info:
        # Try case-insensitive match
        all_brands = extractor.get_all_brands()
        matched = [b for b in all_brands if b.lower() == brand.lower()]
        if matched:
            brand = matched[0]
        else:
            raise HTTPException(status_code=404, detail=f"Brand '{brand}' not found")
    
    sentiment_data = preprocessor.get_sentiment_breakdown(brand)
    
    return SentimentResponse(
        brand=sentiment_data["brand"],
        total_mentions=sentiment_data["total_mentions"],
        sentiment_distribution=SentimentDistribution(**sentiment_data["sentiment_distribution"]),
        sentiment_percentages=SentimentPercentages(**sentiment_data["sentiment_percentages"]),
        average_confidence=sentiment_data["average_confidence"],
        sentiment_score=sentiment_data["sentiment_score"],
        by_model=[ModelSentiment(**m) for m in sentiment_data["by_model"]],
    )


@router.get("/categories", response_model=CategoriesResponse)
async def get_categories():
    """
    Get available categories with their statistics.
    
    Returns all categories found in the dataset with brand and mention counts.
    """
    _, _, preprocessor = get_services()
    
    categories = preprocessor.get_categories()
    
    return CategoriesResponse(
        categories=[CategoryInfo(**c) for c in categories],
        total=len(categories),
    )


@router.get("/temporal", response_model=TemporalResponse)
async def get_temporal_trends(
    brand: Optional[str] = Query(None, description="Filter to specific brand"),
    days: int = Query(30, ge=7, le=90, description="Number of days to analyze"),
):
    """
    Get temporal trends of brand mentions over time.
    
    Returns time series data showing mention frequency and sentiment over time.
    """
    _, _, preprocessor = get_services()
    
    trends = preprocessor.get_temporal_trends(brand=brand, days=days)
    
    return TemporalResponse(
        data=[TemporalDataPoint(**t) for t in trends],
        brand=brand,
        period_days=days,
    )


@router.get("/summary", response_model=SummaryResponse)
async def get_summary():
    """
    Get overall summary statistics for the insights data.
    
    Returns high-level metrics about the dataset.
    """
    _, _, preprocessor = get_services()
    
    summary = preprocessor.generate_summary()
    
    return SummaryResponse(**summary)


@router.get("/brands")
async def list_known_brands(
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """
    Get list of all known brands in the system.
    """
    _, extractor, _ = get_services()
    
    if category:
        brands = extractor.get_brands_by_category(category)
    else:
        brands = extractor.get_all_brands()
    
    return {
        "brands": brands,
        "total": len(brands),
        "category": category,
    }


@router.get("/datasets")
async def list_datasets():
    """
    Get information about available datasets.
    """
    fetcher, _, _ = get_services()
    
    return {
        "datasets": fetcher.get_available_datasets(),
    }


@router.post("/refresh")
async def refresh_data():
    """
    Refresh the cached data (admin endpoint).
    
    Forces re-processing of all datasets.
    """
    global _fetcher, _extractor, _preprocessor
    
    # Clear cache
    if _fetcher:
        _fetcher.clear_cache()
    
    # Reset services
    _fetcher = None
    _extractor = None
    _preprocessor = None
    
    # Reinitialize
    get_services()
    
    return {"status": "refreshed", "message": "Data cache cleared and reprocessed"}
