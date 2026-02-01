"""
Dataset fetcher for downloading and caching public datasets.
For demo purposes, generates synthetic data that mimics real dataset patterns.
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta


class DatasetFetcher:
    """
    Fetches and caches public datasets for brand mention analysis.
    For demo purposes, generates realistic synthetic data.
    """
    
    # Cache directory for datasets
    CACHE_DIR = Path(__file__).parent.parent.parent.parent / "data" / "datasets_cache"
    
    # Sample LLM models for LMSYS-style data
    LLM_MODELS = [
        "GPT-4",
        "GPT-4o",
        "Claude-3-Opus",
        "Claude-3.5-Sonnet",
        "Gemini-Pro",
        "Gemini-1.5-Pro",
        "Llama-3-70B",
        "Mistral-Large",
        "Command-R+",
    ]
    
    # Categories and associated brands
    BRAND_CATEGORIES: Dict[str, Dict[str, Any]] = {
        "Technology": {
            "brands": ["Apple", "Microsoft", "Google", "Amazon", "Meta", "NVIDIA", "Samsung", "Tesla", "OpenAI", "Anthropic"],
            "weight": 0.25,
        },
        "E-commerce": {
            "brands": ["Amazon", "Shopify", "eBay", "Alibaba", "Etsy", "Walmart", "Target", "Best Buy", "Wayfair", "Chewy"],
            "weight": 0.15,
        },
        "Fashion": {
            "brands": ["Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Lululemon", "Patagonia", "North Face", "Gucci", "Louis Vuitton"],
            "weight": 0.12,
        },
        "Food & Beverage": {
            "brands": ["Starbucks", "McDonald's", "Coca-Cola", "PepsiCo", "Nestlé", "Chipotle", "Whole Foods", "Trader Joe's", "Beyond Meat", "Oatly"],
            "weight": 0.1,
        },
        "Finance": {
            "brands": ["JPMorgan", "Goldman Sachs", "Visa", "Mastercard", "PayPal", "Stripe", "Square", "Coinbase", "Robinhood", "Fidelity"],
            "weight": 0.12,
        },
        "Healthcare": {
            "brands": ["Pfizer", "Johnson & Johnson", "UnitedHealth", "CVS Health", "Moderna", "AbbVie", "Merck", "Eli Lilly", "Novo Nordisk", "Teladoc"],
            "weight": 0.08,
        },
        "Entertainment": {
            "brands": ["Netflix", "Disney", "Spotify", "YouTube", "TikTok", "Twitch", "HBO Max", "Paramount+", "Apple TV+", "Amazon Prime Video"],
            "weight": 0.1,
        },
        "Automotive": {
            "brands": ["Tesla", "Toyota", "Ford", "BMW", "Mercedes-Benz", "Rivian", "Lucid", "Honda", "Volkswagen", "BYD"],
            "weight": 0.08,
        },
    }
    
    # Sample query templates
    QUERY_TEMPLATES = [
        "What are the best {category} brands?",
        "Can you recommend a good {brand} alternative?",
        "Compare {brand} vs competitors",
        "Is {brand} worth the price?",
        "What do you think about {brand}?",
        "Review of {brand} products",
        "Why is {brand} so popular?",
        "{brand} customer service experience",
        "Best {category} products in 2024",
        "Should I buy from {brand}?",
    ]
    
    def __init__(self):
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    def get_lmsys_sample(self, num_conversations: int = 500) -> List[Dict[str, Any]]:
        """
        Get LMSYS-Chat-1M style conversations (synthetic for demo).
        
        Args:
            num_conversations: Number of conversations to generate
            
        Returns:
            List of conversation dictionaries
        """
        cache_file = self.CACHE_DIR / "lmsys_sample.json"
        
        # Check cache
        if cache_file.exists():
            with open(cache_file, 'r') as f:
                data = json.load(f)
                if len(data) >= num_conversations:
                    return data[:num_conversations]
        
        # Generate synthetic data
        conversations = []
        base_date = datetime.now() - timedelta(days=90)
        
        for i in range(num_conversations):
            # Pick random category weighted by frequency
            category = random.choices(
                list(self.BRAND_CATEGORIES.keys()),
                weights=[c["weight"] for c in self.BRAND_CATEGORIES.values()],
            )[0]
            
            brands_in_category = self.BRAND_CATEGORIES[category]["brands"]
            brand = random.choice(brands_in_category)
            model = random.choice(self.LLM_MODELS)
            
            # Generate query
            template = random.choice(self.QUERY_TEMPLATES)
            query = template.format(category=category.lower(), brand=brand)
            
            # Generate response with brand mention
            response = self._generate_response(brand, category, model)
            
            # Add some time variation
            timestamp = base_date + timedelta(
                days=random.randint(0, 90),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            
            conversations.append({
                "id": f"conv_{i:06d}",
                "model": model,
                "timestamp": timestamp.isoformat(),
                "query": query,
                "response": response,
                "brands_mentioned": [brand],
                "category": category,
                "sentiment": random.choice(["positive", "positive", "neutral", "negative"]),  # Skewed positive
                "confidence": round(random.uniform(0.7, 0.99), 2),
            })
        
        # Cache the data
        with open(cache_file, 'w') as f:
            json.dump(conversations, f, indent=2)
        
        return conversations
    
    def get_amazon_reviews_sample(self, num_reviews: int = 300) -> List[Dict[str, Any]]:
        """
        Get Amazon Reviews style data (synthetic for demo).
        
        Args:
            num_reviews: Number of reviews to generate
            
        Returns:
            List of review dictionaries
        """
        cache_file = self.CACHE_DIR / "amazon_reviews_sample.json"
        
        if cache_file.exists():
            with open(cache_file, 'r') as f:
                data = json.load(f)
                if len(data) >= num_reviews:
                    return data[:num_reviews]
        
        reviews = []
        base_date = datetime.now() - timedelta(days=180)
        
        for i in range(num_reviews):
            category = random.choices(
                list(self.BRAND_CATEGORIES.keys()),
                weights=[c["weight"] for c in self.BRAND_CATEGORIES.values()],
            )[0]
            
            brand = random.choice(self.BRAND_CATEGORIES[category]["brands"])
            rating = random.choices([1, 2, 3, 4, 5], weights=[0.05, 0.08, 0.12, 0.35, 0.40])[0]
            
            sentiment = "positive" if rating >= 4 else "negative" if rating <= 2 else "neutral"
            
            timestamp = base_date + timedelta(
                days=random.randint(0, 180),
                hours=random.randint(0, 23),
            )
            
            reviews.append({
                "id": f"review_{i:06d}",
                "brand": brand,
                "category": category,
                "rating": rating,
                "sentiment": sentiment,
                "timestamp": timestamp.isoformat(),
                "title": f"{'Great' if rating >= 4 else 'Average' if rating == 3 else 'Poor'} {brand} product",
                "verified_purchase": random.random() > 0.2,
            })
        
        with open(cache_file, 'w') as f:
            json.dump(reviews, f, indent=2)
        
        return reviews
    
    def _generate_response(self, brand: str, category: str, model: str) -> str:
        """Generate a synthetic LLM response mentioning the brand."""
        templates = [
            f"{brand} is one of the leading brands in the {category.lower()} industry. They're known for quality and innovation.",
            f"When it comes to {category.lower()}, {brand} is often recommended for its reliability and customer service.",
            f"I'd suggest looking at {brand} - they have a strong reputation in {category.lower()} with competitive pricing.",
            f"{brand} has been making waves in {category.lower()}. Many users appreciate their attention to detail.",
            f"For {category.lower()} products, {brand} is a solid choice. They've maintained consistent quality over the years.",
        ]
        return random.choice(templates)
    
    def clear_cache(self):
        """Clear all cached datasets."""
        for cache_file in self.CACHE_DIR.glob("*.json"):
            cache_file.unlink()
    
    def get_available_datasets(self) -> List[Dict[str, Any]]:
        """Get information about available datasets."""
        return [
            {
                "id": "lmsys_chat",
                "name": "LMSYS-Chat-1M (Sample)",
                "description": "Sample of LLM conversations with brand mentions",
                "records": 500,
                "source": "Synthetic (based on LMSYS patterns)",
            },
            {
                "id": "amazon_reviews",
                "name": "Amazon Reviews (Sample)",
                "description": "Product reviews with brand sentiment",
                "records": 300,
                "source": "Synthetic (based on Amazon patterns)",
            },
        ]
