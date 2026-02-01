"""
Preprocessor for aggregating brand mention statistics.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime, timedelta
import statistics


class InsightPreprocessor:
    """
    Aggregates and preprocesses brand mention data for insights.
    """
    
    def __init__(self):
        self.brand_mentions: List[Dict[str, Any]] = []
        self.reviews: List[Dict[str, Any]] = []
    
    def load_data(
        self,
        mentions: List[Dict[str, Any]],
        reviews: Optional[List[Dict[str, Any]]] = None,
    ):
        """Load extracted brand mentions and reviews."""
        self.brand_mentions = mentions
        self.reviews = reviews or []
    
    def get_trending_brands(
        self,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Get top trending brands by mention count.
        
        Args:
            category: Filter by category (optional)
            limit: Maximum number of brands to return
            
        Returns:
            List of trending brand statistics
        """
        # Count mentions per brand
        brand_counts = defaultdict(lambda: {
            "count": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0,
            "models": set(),
        })
        
        for mention in self.brand_mentions:
            if category and mention.get("category") != category:
                continue
            
            brand = mention["brand"]
            brand_counts[brand]["count"] += 1
            brand_counts[brand]["category"] = mention.get("category", "Unknown")
            
            sentiment = mention.get("sentiment", "neutral")
            brand_counts[brand][sentiment] += 1
            
            if mention.get("model"):
                brand_counts[brand]["models"].add(mention["model"])
        
        # Add review data
        for review in self.reviews:
            if category and review.get("category") != category:
                continue
            
            brand = review["brand"]
            brand_counts[brand]["count"] += 1
            brand_counts[brand]["category"] = review.get("category", "Unknown")
            
            sentiment = review.get("sentiment", "neutral")
            brand_counts[brand][sentiment] += 1
        
        # Sort by count and format
        sorted_brands = sorted(
            brand_counts.items(),
            key=lambda x: x[1]["count"],
            reverse=True,
        )[:limit]
        
        result = []
        for brand, stats in sorted_brands:
            total = stats["count"]
            positive_pct = round(stats["positive"] / total * 100, 1) if total > 0 else 0
            
            result.append({
                "brand": brand,
                "category": stats["category"],
                "mention_count": total,
                "positive_count": stats["positive"],
                "negative_count": stats["negative"],
                "neutral_count": stats["neutral"],
                "positive_percentage": positive_pct,
                "sentiment_score": round((stats["positive"] - stats["negative"]) / total * 100, 1) if total > 0 else 0,
                "model_coverage": len(stats["models"]),
            })
        
        return result
    
    def get_llm_comparison(
        self,
        brand: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get brand mention comparison across LLM models.
        
        Args:
            brand: Filter to specific brand (optional)
            
        Returns:
            List of model comparison data
        """
        model_stats = defaultdict(lambda: {
            "total_mentions": 0,
            "brands": defaultdict(int),
            "positive": 0,
            "negative": 0,
            "neutral": 0,
        })
        
        for mention in self.brand_mentions:
            if brand and mention["brand"] != brand:
                continue
            
            model = mention.get("model", "Unknown")
            model_stats[model]["total_mentions"] += 1
            model_stats[model]["brands"][mention["brand"]] += 1
            
            sentiment = mention.get("sentiment", "neutral")
            model_stats[model][sentiment] += 1
        
        result = []
        for model, stats in model_stats.items():
            total = stats["total_mentions"]
            result.append({
                "model": model,
                "total_mentions": total,
                "unique_brands": len(stats["brands"]),
                "positive_rate": round(stats["positive"] / total * 100, 1) if total > 0 else 0,
                "negative_rate": round(stats["negative"] / total * 100, 1) if total > 0 else 0,
                "neutral_rate": round(stats["neutral"] / total * 100, 1) if total > 0 else 0,
                "top_brands": sorted(
                    stats["brands"].items(),
                    key=lambda x: x[1],
                    reverse=True,
                )[:5],
            })
        
        return sorted(result, key=lambda x: x["total_mentions"], reverse=True)
    
    def get_sentiment_breakdown(
        self,
        brand: str,
    ) -> Dict[str, Any]:
        """
        Get detailed sentiment breakdown for a brand.
        
        Args:
            brand: Brand name
            
        Returns:
            Sentiment analysis for the brand
        """
        mentions = [m for m in self.brand_mentions if m["brand"] == brand]
        reviews = [r for r in self.reviews if r["brand"] == brand]
        
        all_data = mentions + reviews
        
        if not all_data:
            return {
                "brand": brand,
                "total_mentions": 0,
                "sentiment_distribution": {
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0,
                },
                "average_confidence": 0,
                "by_model": [],
                "by_time": [],
            }
        
        # Sentiment counts
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        confidences = []
        model_sentiment = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0})
        
        for item in all_data:
            sentiment = item.get("sentiment", "neutral")
            sentiment_counts[sentiment] += 1
            
            if "confidence" in item:
                confidences.append(item["confidence"])
            
            model = item.get("model", "Reviews")
            model_sentiment[model][sentiment] += 1
        
        total = len(all_data)
        
        return {
            "brand": brand,
            "total_mentions": total,
            "sentiment_distribution": {
                "positive": sentiment_counts["positive"],
                "negative": sentiment_counts["negative"],
                "neutral": sentiment_counts["neutral"],
            },
            "sentiment_percentages": {
                "positive": round(sentiment_counts["positive"] / total * 100, 1),
                "negative": round(sentiment_counts["negative"] / total * 100, 1),
                "neutral": round(sentiment_counts["neutral"] / total * 100, 1),
            },
            "average_confidence": round(statistics.mean(confidences), 2) if confidences else 0,
            "sentiment_score": round(
                (sentiment_counts["positive"] - sentiment_counts["negative"]) / total * 100, 1
            ),
            "by_model": [
                {
                    "model": model,
                    "positive": stats["positive"],
                    "negative": stats["negative"],
                    "neutral": stats["neutral"],
                }
                for model, stats in model_sentiment.items()
            ],
        }
    
    def get_categories(self) -> List[Dict[str, Any]]:
        """
        Get available categories with statistics.
        
        Returns:
            List of category info
        """
        category_stats = defaultdict(lambda: {
            "brand_count": set(),
            "mention_count": 0,
        })
        
        for mention in self.brand_mentions:
            cat = mention.get("category", "Unknown")
            category_stats[cat]["brand_count"].add(mention["brand"])
            category_stats[cat]["mention_count"] += 1
        
        for review in self.reviews:
            cat = review.get("category", "Unknown")
            category_stats[cat]["brand_count"].add(review["brand"])
            category_stats[cat]["mention_count"] += 1
        
        return [
            {
                "category": cat,
                "brand_count": len(stats["brand_count"]),
                "mention_count": stats["mention_count"],
            }
            for cat, stats in sorted(
                category_stats.items(),
                key=lambda x: x[1]["mention_count"],
                reverse=True,
            )
        ]
    
    def get_temporal_trends(
        self,
        brand: Optional[str] = None,
        days: int = 30,
    ) -> List[Dict[str, Any]]:
        """
        Get temporal trends of brand mentions.
        
        Args:
            brand: Filter to specific brand
            days: Number of days to analyze
            
        Returns:
            Time series data
        """
        # Group by date
        date_stats = defaultdict(lambda: {
            "total": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0,
        })
        
        for mention in self.brand_mentions:
            if brand and mention["brand"] != brand:
                continue
            
            if "timestamp" in mention:
                try:
                    dt = datetime.fromisoformat(mention["timestamp"].replace("Z", "+00:00"))
                    date_key = dt.strftime("%Y-%m-%d")
                    date_stats[date_key]["total"] += 1
                    date_stats[date_key][mention.get("sentiment", "neutral")] += 1
                except (ValueError, TypeError):
                    pass
        
        # Sort by date and return
        return [
            {
                "date": date,
                "total": stats["total"],
                "positive": stats["positive"],
                "negative": stats["negative"],
                "neutral": stats["neutral"],
            }
            for date, stats in sorted(date_stats.items())
        ]
    
    def generate_summary(self) -> Dict[str, Any]:
        """Generate overall summary statistics."""
        total_mentions = len(self.brand_mentions) + len(self.reviews)
        unique_brands = len(set(
            m["brand"] for m in self.brand_mentions
        ) | set(
            r["brand"] for r in self.reviews
        ))
        
        sentiment_total = {"positive": 0, "negative": 0, "neutral": 0}
        for item in self.brand_mentions + self.reviews:
            sentiment_total[item.get("sentiment", "neutral")] += 1
        
        return {
            "total_mentions": total_mentions,
            "unique_brands": unique_brands,
            "categories": len(self.get_categories()),
            "sentiment_overview": sentiment_total,
            "data_sources": {
                "llm_conversations": len(self.brand_mentions),
                "reviews": len(self.reviews),
            },
        }
