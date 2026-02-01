"""
Brand extractor for identifying and analyzing brand mentions in text.
Uses pattern matching and heuristics for demo purposes.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
from datetime import datetime


class BrandExtractor:
    """
    Extracts brand mentions from text and performs sentiment analysis.
    Uses rule-based extraction for demo purposes.
    """
    
    # Known brands by category for NER-like extraction
    KNOWN_BRANDS = {
        # Technology
        "Apple": {"category": "Technology", "aliases": ["iPhone", "MacBook", "iPad", "Apple Inc"]},
        "Microsoft": {"category": "Technology", "aliases": ["Windows", "Xbox", "Azure", "MS"]},
        "Google": {"category": "Technology", "aliases": ["Alphabet", "Gmail", "Android", "Chrome"]},
        "Amazon": {"category": "Technology", "aliases": ["AWS", "Alexa", "Prime"]},
        "Meta": {"category": "Technology", "aliases": ["Facebook", "Instagram", "WhatsApp"]},
        "NVIDIA": {"category": "Technology", "aliases": ["GeForce", "RTX"]},
        "Samsung": {"category": "Technology", "aliases": ["Galaxy"]},
        "Tesla": {"category": "Automotive", "aliases": ["Model S", "Model 3", "Model Y"]},
        "OpenAI": {"category": "Technology", "aliases": ["ChatGPT", "GPT-4", "DALL-E"]},
        "Anthropic": {"category": "Technology", "aliases": ["Claude"]},
        
        # E-commerce
        "Shopify": {"category": "E-commerce", "aliases": []},
        "eBay": {"category": "E-commerce", "aliases": []},
        "Alibaba": {"category": "E-commerce", "aliases": ["AliExpress"]},
        "Etsy": {"category": "E-commerce", "aliases": []},
        "Walmart": {"category": "E-commerce", "aliases": []},
        "Target": {"category": "E-commerce", "aliases": []},
        
        # Fashion
        "Nike": {"category": "Fashion", "aliases": ["Air Jordan", "Just Do It"]},
        "Adidas": {"category": "Fashion", "aliases": ["Yeezy"]},
        "Zara": {"category": "Fashion", "aliases": []},
        "H&M": {"category": "Fashion", "aliases": ["Hennes & Mauritz"]},
        "Uniqlo": {"category": "Fashion", "aliases": []},
        "Lululemon": {"category": "Fashion", "aliases": []},
        "Patagonia": {"category": "Fashion", "aliases": []},
        "North Face": {"category": "Fashion", "aliases": ["TNF"]},
        "Gucci": {"category": "Fashion", "aliases": []},
        "Louis Vuitton": {"category": "Fashion", "aliases": ["LV", "LVMH"]},
        
        # Food & Beverage
        "Starbucks": {"category": "Food & Beverage", "aliases": []},
        "McDonald's": {"category": "Food & Beverage", "aliases": ["McDonalds", "Mickey D's"]},
        "Coca-Cola": {"category": "Food & Beverage", "aliases": ["Coke"]},
        "PepsiCo": {"category": "Food & Beverage", "aliases": ["Pepsi"]},
        "Nestlé": {"category": "Food & Beverage", "aliases": ["Nestle"]},
        
        # Finance
        "JPMorgan": {"category": "Finance", "aliases": ["JP Morgan", "Chase"]},
        "Visa": {"category": "Finance", "aliases": []},
        "Mastercard": {"category": "Finance", "aliases": []},
        "PayPal": {"category": "Finance", "aliases": ["Venmo"]},
        "Stripe": {"category": "Finance", "aliases": []},
        
        # Entertainment
        "Netflix": {"category": "Entertainment", "aliases": []},
        "Disney": {"category": "Entertainment", "aliases": ["Disney+", "Pixar", "Marvel"]},
        "Spotify": {"category": "Entertainment", "aliases": []},
        "YouTube": {"category": "Entertainment", "aliases": ["YT"]},
        "TikTok": {"category": "Entertainment", "aliases": []},
    }
    
    # Sentiment indicators
    POSITIVE_WORDS = {
        "excellent", "great", "amazing", "wonderful", "fantastic", "love",
        "best", "recommend", "quality", "reliable", "innovative", "leading",
        "top", "impressive", "outstanding", "superior", "trusted", "solid",
    }
    
    NEGATIVE_WORDS = {
        "terrible", "awful", "bad", "poor", "worst", "hate", "avoid",
        "disappointing", "overpriced", "unreliable", "problem", "issue",
        "complaint", "broken", "scam", "ripoff", "fail", "garbage",
    }
    
    def __init__(self):
        # Build reverse lookup for aliases
        self.alias_to_brand = {}
        for brand, info in self.KNOWN_BRANDS.items():
            self.alias_to_brand[brand.lower()] = brand
            for alias in info.get("aliases", []):
                self.alias_to_brand[alias.lower()] = brand
    
    def extract_brands(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract brand mentions from text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            List of brand mention dictionaries
        """
        mentions = []
        text_lower = text.lower()
        
        for alias, brand in self.alias_to_brand.items():
            # Word boundary matching
            pattern = r'\b' + re.escape(alias) + r'\b'
            matches = list(re.finditer(pattern, text_lower, re.IGNORECASE))
            
            for match in matches:
                # Extract context around mention
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                context = text[start:end]
                
                mentions.append({
                    "brand": brand,
                    "category": self.KNOWN_BRANDS[brand]["category"],
                    "position": match.start(),
                    "context": context,
                    "matched_term": match.group(),
                })
        
        # Remove duplicates (same brand in same position)
        seen = set()
        unique_mentions = []
        for m in mentions:
            key = (m["brand"], m["position"])
            if key not in seen:
                seen.add(key)
                unique_mentions.append(m)
        
        return unique_mentions
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of text.
        
        Args:
            text: Input text
            
        Returns:
            Sentiment analysis results
        """
        text_lower = text.lower()
        words = set(re.findall(r'\b\w+\b', text_lower))
        
        positive_count = len(words & self.POSITIVE_WORDS)
        negative_count = len(words & self.NEGATIVE_WORDS)
        
        if positive_count > negative_count:
            sentiment = "positive"
            confidence = min(0.95, 0.5 + (positive_count - negative_count) * 0.1)
        elif negative_count > positive_count:
            sentiment = "negative"
            confidence = min(0.95, 0.5 + (negative_count - positive_count) * 0.1)
        else:
            sentiment = "neutral"
            confidence = 0.6
        
        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 2),
            "positive_indicators": positive_count,
            "negative_indicators": negative_count,
        }
    
    def extract_with_sentiment(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract brands and analyze sentiment for each mention.
        
        Args:
            text: Input text
            
        Returns:
            Brand mentions with sentiment analysis
        """
        mentions = self.extract_brands(text)
        
        for mention in mentions:
            # Analyze sentiment of the context
            sentiment_result = self.analyze_sentiment(mention["context"])
            mention.update(sentiment_result)
        
        return mentions
    
    def batch_extract(
        self,
        conversations: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Extract brand mentions from multiple conversations.
        
        Args:
            conversations: List of conversation dictionaries
            
        Returns:
            All extracted brand mentions
        """
        all_mentions = []
        
        for conv in conversations:
            # Extract from both query and response
            text = f"{conv.get('query', '')} {conv.get('response', '')}"
            mentions = self.extract_with_sentiment(text)
            
            for mention in mentions:
                mention["conversation_id"] = conv.get("id")
                mention["model"] = conv.get("model")
                mention["timestamp"] = conv.get("timestamp")
                all_mentions.append(mention)
        
        return all_mentions
    
    def get_brand_info(self, brand_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a known brand."""
        if brand_name in self.KNOWN_BRANDS:
            return {
                "name": brand_name,
                **self.KNOWN_BRANDS[brand_name],
            }
        return None
    
    def get_all_brands(self) -> List[str]:
        """Get list of all known brands."""
        return list(self.KNOWN_BRANDS.keys())
    
    def get_brands_by_category(self, category: str) -> List[str]:
        """Get brands in a specific category."""
        return [
            brand for brand, info in self.KNOWN_BRANDS.items()
            if info["category"] == category
        ]
    
    def get_categories(self) -> List[str]:
        """Get all available categories."""
        return list(set(info["category"] for info in self.KNOWN_BRANDS.values()))
