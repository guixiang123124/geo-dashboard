"""
Smart Brand Diagnosis API — real-time AI visibility audit.

Flow:
1. Accept domain or brand name (+ optional custom prompts)
2. Crawl website → extract brand profile
3. Gemini generates tailored evaluation prompts
4. Evaluate brand against each prompt via ALL available AI models
5. Score and return diagnosis report
6. Save results to database
"""

import asyncio
import json
import os
import re
import time
from datetime import datetime
from typing import Optional
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import settings
from ...core.database import get_db
from ...models.diagnosis import DiagnosisRecord

router = APIRouter()

# ---------------------------------------------------------------------------
# Google GenAI SDK
# ---------------------------------------------------------------------------
try:
    from google import genai
    _genai_client = None

    def get_genai_client():
        global _genai_client
        if _genai_client is None:
            _genai_client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        return _genai_client
except ImportError:
    genai = None

    def get_genai_client():
        return None


GEMINI_MODEL = "gemini-2.0-flash"


# ---------------------------------------------------------------------------
# Multi-platform AI helpers
# ---------------------------------------------------------------------------

async def call_gemini(prompt: str, max_tokens: int = 512) -> Optional[str]:
    """Call Gemini and return text response."""
    if not settings.GOOGLE_API_KEY:
        return None
    client = get_genai_client()
    if not client:
        return None
    try:
        response = await asyncio.to_thread(
            lambda: client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={"max_output_tokens": max_tokens, "temperature": 0.7},
            )
        )
        return response.text
    except Exception as e:
        print(f"[diagnosis] Gemini API error: {e}")
        return None


async def call_openai(prompt: str, max_tokens: int = 512) -> Optional[str]:
    """Call OpenAI ChatGPT. Returns None if API key not set."""
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                },
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[diagnosis] OpenAI API error: {e}")
    return None


async def call_grok(prompt: str, max_tokens: int = 512) -> Optional[str]:
    """Call xAI Grok. Returns None if API key not set."""
    api_key = settings.XAI_API_KEY
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "grok-3-mini-fast",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                },
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[diagnosis] Grok API error: {e}")
    return None


async def call_perplexity(prompt: str, max_tokens: int = 512) -> Optional[str]:
    """Call Perplexity. Returns None if API key not set."""
    api_key = settings.PERPLEXITY_API_KEY
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.1-sonar-small-128k-online",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": 0.7,
                },
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[diagnosis] Perplexity API error: {e}")
    return None


def get_available_models() -> dict:
    """Return dict of model_name -> callable for all models with API keys set."""
    models = {}
    if settings.GOOGLE_API_KEY:
        models["gemini"] = call_gemini
    if settings.OPENAI_API_KEY:
        models["openai"] = call_openai
    if settings.XAI_API_KEY:
        models["grok"] = call_grok
    if settings.PERPLEXITY_API_KEY:
        models["perplexity"] = call_perplexity
    # Debug: log which models are available
    print(f"[diagnosis] Available models: {list(models.keys())}")
    print(f"[diagnosis] OPENAI_API_KEY set: {bool(settings.OPENAI_API_KEY)}, XAI_API_KEY set: {bool(settings.XAI_API_KEY)}")
    if settings.OPENAI_API_KEY:
        print(f"[diagnosis] OPENAI key prefix: {settings.OPENAI_API_KEY[:10]}...")
    if settings.XAI_API_KEY:
        print(f"[diagnosis] XAI key prefix: {settings.XAI_API_KEY[:10]}...")
    return models


# ---------------------------------------------------------------------------
# Gemini helper for structured generation (profile, prompts)
# ---------------------------------------------------------------------------

async def gemini_generate(prompt: str, max_tokens: int = 512) -> str:
    """Call Gemini and return text response. Raises on failure."""
    result = await call_gemini(prompt, max_tokens)
    if result is None:
        raise HTTPException(500, "Gemini API not available")
    return result


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

# Admin emails get unlimited Pro access
ADMIN_EMAILS = os.environ.get("ADMIN_EMAILS", "guixiang123124@gmail.com").split(",")

class DiagnosisRequest(BaseModel):
    domain: Optional[str] = None
    brand_name: Optional[str] = None
    custom_prompts: Optional[list[str]] = None
    pro: bool = False
    email: Optional[str] = None  # If admin email, auto-upgrade to pro


class PromptResult(BaseModel):
    prompt: str
    intent: str
    prompt_type: str = "generic"  # "generic" (no brand name, tests visibility) or "brand_specific" (tests sentiment/framing)
    mentioned: bool
    rank: Optional[int] = None
    sentiment: Optional[str] = None
    snippet: Optional[str] = None
    model_name: Optional[str] = None
    response_text: Optional[str] = None  # Full AI response for verification


class CompetitorInfo(BaseModel):
    name: str
    mention_count: int
    avg_rank: Optional[float] = None
    sentiment: Optional[str] = None  # positive/neutral/negative
    appeared_in_prompts: list[str] = []  # which prompts mentioned them
    why_mentioned: Optional[str] = None  # brief reason


class DiagnosisScore(BaseModel):
    composite: int
    visibility: int
    citation: int
    representation: int
    intent: int
    total_prompts: int
    mentioned_count: int
    models_used: list[str] = []
    per_model_scores: Optional[dict] = None
    competitor_gap: Optional[int] = None  # Brand mention rate vs category top 3 average
    recommendation_position: Optional[float] = None  # Average rank position in list-type answers
    knowledge_accuracy: Optional[str] = None  # Brief assessment of AI knowledge accuracy


class BrandProfile(BaseModel):
    name: str
    domain: Optional[str] = None
    category: str
    positioning: str
    target_audience: str
    key_products: list[str]


class DiagnosisResponse(BaseModel):
    id: str
    brand: BrandProfile
    score: DiagnosisScore
    results: list[PromptResult]
    insights: list[str]
    recommendations: list[str]
    competitors: list[CompetitorInfo] = []
    generated_prompts_count: int
    evaluation_time_seconds: float


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def crawl_website(domain: str) -> str:
    """Fetch homepage + about page text (max 8k chars)."""
    texts = []
    urls = [f"https://{domain}", f"https://{domain}/pages/about", f"https://{domain}/about"]

    async with httpx.AsyncClient(timeout=10, follow_redirects=True, headers={
        "User-Agent": "Mozilla/5.0 (compatible; LuminosBot/1.0)"
    }) as client:
        for url in urls:
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    text = re.sub(r'<script[^>]*>.*?</script>', '', resp.text, flags=re.DOTALL)
                    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
                    text = re.sub(r'<[^>]+>', ' ', text)
                    text = re.sub(r'\s+', ' ', text).strip()
                    texts.append(text[:3000])
            except Exception:
                continue

    return "\n\n".join(texts)[:8000]


async def extract_brand_profile(domain: str, brand_name: Optional[str], site_text: str) -> BrandProfile:
    """Use Gemini to extract structured brand profile from website text."""
    prompt = f"""Analyze this brand website and extract a structured profile.

Brand name hint: {brand_name or 'unknown'}
Domain: {domain}
Website text (truncated):
{site_text[:4000]}

Return a JSON object with exactly these keys:
- name: brand name
- category: product category (e.g. "Kids Fashion", "Baby Clothing")
- positioning: one-sentence brand positioning
- target_audience: target customer description
- key_products: list of 3-5 main product types

Return ONLY valid JSON, no markdown fences."""

    text = await gemini_generate(prompt, max_tokens=1024)
    try:
        text = re.sub(r'^```json?\s*', '', text.strip())
        text = re.sub(r'\s*```$', '', text.strip())
        data = json.loads(text)
        return BrandProfile(
            name=data.get("name", brand_name or domain),
            domain=domain,
            category=data.get("category", "Unknown"),
            positioning=data.get("positioning", ""),
            target_audience=data.get("target_audience", ""),
            key_products=data.get("key_products", []),
        )
    except (json.JSONDecodeError, KeyError):
        return BrandProfile(
            name=brand_name or domain,
            domain=domain,
            category="Unknown",
            positioning="",
            target_audience="",
            key_products=[],
        )


async def generate_smart_prompts(profile: BrandProfile) -> list[dict]:
    """Generate ~45 tailored evaluation prompts: ~25 generic (visibility) + ~20 brand-specific (sentiment/framing)."""
    prompt = f"""You are an expert in AI visibility (GEO/AEO). Generate exactly 45 search prompts for evaluating this brand's AI visibility.

Brand: {profile.name}
Category: {profile.category}
Products: {', '.join(profile.key_products)}
Target audience: {profile.target_audience}
Positioning: {profile.positioning}

CRITICAL CONTEXT: This brand sells to END CONSUMERS. Generate prompts that CONSUMERS would search.

**Type A — Generic Discovery (25 prompts, DO NOT include the brand name "{profile.name}"):**

1. **Discovery (5 prompts)**: "best [category] brands", "top rated [category]", "most popular [category] brands", "recommended [category] companies", "leading [product] brands"

2. **Comparison (4 prompts)**: "[category] brand comparison", "alternatives to [known competitor]", "[category] vs [category] comparison", "which [category] brand is best"

3. **Purchase Intent (4 prompts)**: "where to buy [product type]", "most affordable [category]", "buy [product] online", "[category] shopping guide"

4. **Trend/Authority (4 prompts)**: "trending [category] 2026", "most innovative [category] companies", "award winning [category] brands", "[category] industry leaders"

5. **Problem-Solving (4 prompts)**: Always phrase to elicit brand recommendations: "which brands make the best [product] for [use case]", "recommend [category] brands for [audience]", "what [category] brands do experts recommend", "which [category] brands are worth the money"

6. **Local/Contextual (4 prompts)**: "best [category] in US", "[category] for [specific audience]", "sustainable [category] brands", "organic [product] brands"

**Type B — Brand-Specific Analysis (20 prompts, MUST include "{profile.name}"):**

1. **Reputation (4 prompts)**: "is {profile.name} good", "{profile.name} reviews", "{profile.name} quality", "what customers say about {profile.name}"

2. **Comparison (4 prompts)**: "{profile.name} vs [real competitor]", "{profile.name} compared to competitors", "alternatives to {profile.name}", "{profile.name} or [competitor]"

3. **Product Deep-dive (4 prompts)**: "{profile.name} best products", "{profile.name} for [use case]", "{profile.name} product reviews", "{profile.name} [specific product type]"

4. **Sentiment Probing (4 prompts)**: "{profile.name} pros and cons", "problems with {profile.name}", "{profile.name} worth it", "{profile.name} customer complaints"

5. **Authority (4 prompts)**: "{profile.name} sustainability", "{profile.name} awards", "{profile.name} company history", "{profile.name} brand story"

Each prompt should have these keys: "text", "intent" (discovery/comparison/purchase_intent/trend/problem_solving/contextual/reputation/product/sentiment/authority), "type" ("generic" or "brand_specific").

IMPORTANT: Use REAL category competitors when possible. For generic prompts, focus on the consumer perspective of {profile.category}.

Return a JSON array of exactly 45 objects. Return ONLY valid JSON, no markdown fences.

Example format:
[
  {{"text": "best {profile.category.lower()} brands", "intent": "discovery", "type": "generic"}},
  {{"text": "is {profile.name} a good brand", "intent": "reputation", "type": "brand_specific"}}
]"""

    text = await gemini_generate(prompt, max_tokens=2048)
    try:
        text = re.sub(r'^```json?\s*', '', text.strip())
        text = re.sub(r'\s*```$', '', text.strip())
        prompts = json.loads(text)
        if isinstance(prompts, list) and len(prompts) >= 30:
            # Cap at 50 max as requested
            return prompts[:50]
    except json.JSONDecodeError:
        print("[diagnosis] Failed to parse Gemini-generated prompts, using fallback")

    # Enhanced fallback: ~45 prompts
    category_lower = profile.category.lower()
    products = profile.key_products if profile.key_products else ["products"]
    main_product = products[0].lower() if products else "products"
    
    fallback_prompts = []
    
    # Generic prompts (~25)
    # Discovery (5)
    fallback_prompts.extend([
        {"text": f"best {category_lower} brands", "intent": "discovery", "type": "generic"},
        {"text": f"top rated {category_lower}", "intent": "discovery", "type": "generic"},
        {"text": f"most popular {category_lower} brands", "intent": "discovery", "type": "generic"},
        {"text": f"recommended {category_lower} companies", "intent": "discovery", "type": "generic"},
        {"text": f"leading {main_product} brands", "intent": "discovery", "type": "generic"},
    ])
    
    # Comparison (4)
    fallback_prompts.extend([
        {"text": f"{category_lower} brand comparison", "intent": "comparison", "type": "generic"},
        {"text": f"alternatives to popular {category_lower}", "intent": "comparison", "type": "generic"},
        {"text": f"which {category_lower} brand is best", "intent": "comparison", "type": "generic"},
        {"text": f"{category_lower} vs {category_lower} comparison", "intent": "comparison", "type": "generic"},
    ])
    
    # Purchase Intent (4)
    fallback_prompts.extend([
        {"text": f"where to buy {main_product}", "intent": "purchase_intent", "type": "generic"},
        {"text": f"most affordable {category_lower}", "intent": "purchase_intent", "type": "generic"},
        {"text": f"buy {main_product} online", "intent": "purchase_intent", "type": "generic"},
        {"text": f"{category_lower} shopping guide", "intent": "purchase_intent", "type": "generic"},
    ])
    
    # Trend/Authority (4)
    fallback_prompts.extend([
        {"text": f"trending {category_lower} 2026", "intent": "trend", "type": "generic"},
        {"text": f"most innovative {category_lower} companies", "intent": "trend", "type": "generic"},
        {"text": f"award winning {category_lower} brands", "intent": "trend", "type": "generic"},
        {"text": f"{category_lower} industry leaders", "intent": "trend", "type": "generic"},
    ])
    
    # Problem-Solving (4) — phrased to elicit brand recommendations
    target = profile.target_audience.lower() if profile.target_audience else "families"
    fallback_prompts.extend([
        {"text": f"which brands make the best {main_product} for {target}", "intent": "problem_solving", "type": "generic"},
        {"text": f"recommend {category_lower} brands for everyday use", "intent": "problem_solving", "type": "generic"},
        {"text": f"what {category_lower} brands do experts recommend", "intent": "problem_solving", "type": "generic"},
        {"text": f"which {category_lower} brands are worth the money", "intent": "problem_solving", "type": "generic"},
    ])
    
    # Local/Contextual (4)
    fallback_prompts.extend([
        {"text": f"best {category_lower} in US", "intent": "contextual", "type": "generic"},
        {"text": f"sustainable {category_lower} brands", "intent": "contextual", "type": "generic"},
        {"text": f"organic {main_product} brands", "intent": "contextual", "type": "generic"},
        {"text": f"{category_lower} for parents", "intent": "contextual", "type": "generic"},
    ])
    
    # Brand-specific prompts (~20)
    # Reputation (4)
    fallback_prompts.extend([
        {"text": f"is {profile.name} good", "intent": "reputation", "type": "brand_specific"},
        {"text": f"{profile.name} reviews", "intent": "reputation", "type": "brand_specific"},
        {"text": f"{profile.name} quality", "intent": "reputation", "type": "brand_specific"},
        {"text": f"what customers say about {profile.name}", "intent": "reputation", "type": "brand_specific"},
    ])
    
    # Comparison (4)
    fallback_prompts.extend([
        {"text": f"{profile.name} vs competitors", "intent": "comparison", "type": "brand_specific"},
        {"text": f"{profile.name} compared to other brands", "intent": "comparison", "type": "brand_specific"},
        {"text": f"alternatives to {profile.name}", "intent": "comparison", "type": "brand_specific"},
        {"text": f"{profile.name} or other {category_lower}", "intent": "comparison", "type": "brand_specific"},
    ])
    
    # Product Deep-dive (4)
    fallback_prompts.extend([
        {"text": f"{profile.name} best products", "intent": "product", "type": "brand_specific"},
        {"text": f"{profile.name} {main_product}", "intent": "product", "type": "brand_specific"},
        {"text": f"{profile.name} product reviews", "intent": "product", "type": "brand_specific"},
        {"text": f"{profile.name} product line", "intent": "product", "type": "brand_specific"},
    ])
    
    # Sentiment Probing (4)
    fallback_prompts.extend([
        {"text": f"{profile.name} pros and cons", "intent": "sentiment", "type": "brand_specific"},
        {"text": f"problems with {profile.name}", "intent": "sentiment", "type": "brand_specific"},
        {"text": f"{profile.name} worth it", "intent": "sentiment", "type": "brand_specific"},
        {"text": f"{profile.name} customer feedback", "intent": "sentiment", "type": "brand_specific"},
    ])
    
    # Authority (4)
    fallback_prompts.extend([
        {"text": f"{profile.name} sustainability", "intent": "authority", "type": "brand_specific"},
        {"text": f"{profile.name} awards", "intent": "authority", "type": "brand_specific"},
        {"text": f"{profile.name} company history", "intent": "authority", "type": "brand_specific"},
        {"text": f"{profile.name} brand story", "intent": "authority", "type": "brand_specific"},
    ])
    
    return fallback_prompts


async def extract_competitors(brand_name: str, responses: list[dict], category: str) -> list[CompetitorInfo]:
    """Extract competitor brands from AI responses using Gemini.
    
    Takes the raw AI responses from generic prompts and identifies
    which brands were mentioned, how often, and in what context.
    """
    if not responses:
        return []

    # Combine response texts (limit to avoid token overflow)
    combined = ""
    for r in responses:
        if r.get("response_text"):
            combined += f"\n---\nPrompt: {r['prompt']}\nResponse:\n{r['response_text'][:1500]}\n"
    
    if not combined.strip():
        return []

    prompt = f"""Analyze these AI responses about "{category}" and extract ALL brand names mentioned (EXCLUDING "{brand_name}" itself).

{combined[:6000]}

For each brand found, return:
- name: exact brand name
- count: how many responses mentioned it
- avg_rank: average position if in numbered lists (null if not ranked)
- sentiment: "positive", "neutral", or "negative" based on context
- why: one brief sentence on why AI recommends/mentions this brand

Return a JSON array sorted by count (highest first), max 15 brands.
Example: [{{"name":"Nike","count":3,"avg_rank":2,"sentiment":"positive","why":"Frequently recommended for quality and durability"}}]
Return ONLY valid JSON array, no markdown fences."""

    try:
        text = await call_gemini(prompt, max_tokens=1024)
        if not text:
            return []
        text = re.sub(r'^```json?\s*', '', text.strip())
        text = re.sub(r'\s*```$', '', text.strip())
        data = json.loads(text)
        if not isinstance(data, list):
            return []
        
        competitors = []
        for item in data[:15]:
            competitors.append(CompetitorInfo(
                name=item.get("name", ""),
                mention_count=item.get("count", 1),
                avg_rank=item.get("avg_rank"),
                sentiment=item.get("sentiment", "neutral"),
                why_mentioned=item.get("why"),
            ))
        return competitors
    except Exception as e:
        print(f"[diagnosis] Competitor extraction error: {e}")
        return []


async def evaluate_prompt(brand_name: str, prompt_text: str, model_name: str, model_fn, prompt_type: str = "generic") -> dict:
    """Evaluate a single prompt against a specific AI model and analyze the response."""
    response_text = await model_fn(prompt_text)
    if response_text is None:
        return {
            "mentioned": False,
            "rank": None,
            "sentiment": None,
            "snippet": None,
            "has_citation": False,
            "response_text": "",
            "model_name": model_name,
        }

    text_lower = response_text.lower()
    brand_lower = brand_name.lower()
    brand_simple = re.sub(r"['\-\s]", "", brand_lower)

    is_mentioned = brand_lower in text_lower or brand_simple in re.sub(r"['\-\s]", "", text_lower)

    # For brand-specific prompts, the brand name is IN the question,
    # so AI will naturally echo it. We need to check if AI actually
    # KNOWS about / RECOMMENDS the brand, not just echoes it.
    if is_mentioned and prompt_type == "brand_specific":
        # Check for "I don't have info" / "I can't verify" patterns
        negative_patterns = [
            "i don't have", "i do not have", "i cannot", "i can't",
            "no specific information", "not able to verify", "not familiar with",
            "i'm not sure", "i am not sure", "no data", "unable to find",
            "don't have real-time", "don't have specific", "as of my last",
            "i couldn't find", "limited information", "not enough information",
            "i apologize", "might be a slight ambiguity",
        ]
        has_negative = any(p in text_lower for p in negative_patterns)
        
        # Check if AI actually provides substantive info about the brand
        positive_knowledge = [
            "known for", "specializes in", "offers", "founded", "popular for",
            "well-known", "established", "headquartered", "their products",
        ]
        has_knowledge = any(p in text_lower for p in positive_knowledge)
        
        # If AI doesn't know the brand, mark as not genuinely mentioned
        if has_negative and not has_knowledge:
            is_mentioned = False

    rank = None
    snippet = None
    if is_mentioned:
        lines = response_text.split("\n")
        for line in lines:
            if brand_lower in line.lower() or brand_simple in re.sub(r"['\-\s]", "", line.lower()):
                # Try numbered list: "1. Brand" or "1) Brand"
                match = re.match(r"^\s*(\d+)[\.\)]\s", line)
                if match:
                    rank = int(match.group(1))
                else:
                    # Try markdown headers: "### 1. Brand" or "**1. Brand**"
                    match = re.match(r"^\s*(?:#{1,4}\s*)?(?:\*\*)?(\d+)[\.\):]?\s", line)
                    if match:
                        rank = int(match.group(1))
                    elif not rank:
                        # Fallback: count peer list items (same indent level) before this line
                        brand_line_idx = lines.index(line) if line in lines else -1
                        if brand_line_idx > 0:
                            # Find the indent/prefix pattern of the brand line
                            brand_prefix = re.match(r'^(\s*[\*\-]\s+)', line)
                            if brand_prefix:
                                prefix_pattern = brand_prefix.group(1)
                                position = 0
                                for prev_line in lines[:brand_line_idx]:
                                    if prev_line.startswith(prefix_pattern) and '**' in prev_line:
                                        position += 1
                                if position > 0:
                                    rank = position + 1
                snippet = line.strip()[:200]
                break

    sentiment = None
    if is_mentioned:
        # Enhanced sentiment analysis: check context around brand mention
        positive_words = ["best", "top", "excellent", "quality", "premium", "trusted", "popular", 
                         "recommended", "great", "love", "known for", "leading", "innovative",
                         "reliable", "standout", "favorite", "well-regarded", "highly rated",
                         "renowned", "exceptional", "superior", "impressive", "strong"]
        negative_words = ["cheap", "poor", "bad", "worst", "avoid", "overpriced", "disappointing", 
                         "unreliable", "controversy", "criticized", "lawsuit", "recall", "complaints",
                         "declining", "problematic", "issues with"]
        
        # Weight: check words near brand mention, not just anywhere in text
        brand_context = ""
        for line in lines:
            if brand_lower in line.lower() or brand_simple in re.sub(r"['\-\s]", "", line.lower()):
                brand_context += " " + line.lower()
        
        context_to_check = brand_context if brand_context else text_lower
        pos_count = sum(1 for w in positive_words if w in context_to_check)
        neg_count = sum(1 for w in negative_words if w in context_to_check)
        
        if pos_count > neg_count:
            sentiment = "positive"
        elif neg_count > pos_count:
            sentiment = "negative"
        else:
            sentiment = "neutral"

    # Check for citations: URLs containing brand name or brand domain
    brand_domain = brand_lower.replace(" ", "").replace("'", "")
    has_citation = bool(
        re.search(r'https?://[^\s]*' + re.escape(brand_domain), text_lower) or
        re.search(r'https?://(?:www\.)?' + re.escape(brand_domain) + r'\.', text_lower) or
        re.search(r'\b' + re.escape(brand_domain) + r'\.com\b', text_lower)
    )

    return {
        "mentioned": is_mentioned,
        "rank": rank,
        "sentiment": sentiment,
        "snippet": snippet,
        "has_citation": has_citation,
        "response_text": response_text,
        "model_name": model_name,
    }


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

@router.post("", response_model=DiagnosisResponse)
async def diagnose_brand(req: DiagnosisRequest, db: AsyncSession = Depends(get_db)):
    """
    Smart brand diagnosis: crawl → profile → generate prompts → evaluate → score → save.
    """
    if not req.domain and not req.brand_name:
        raise HTTPException(400, "Provide either domain or brand_name")

    available_models = get_available_models()
    if not available_models:
        raise HTTPException(500, "No AI API keys configured")

    # Admin auto-upgrade to pro
    is_admin = req.email and req.email.strip().lower() in [e.strip().lower() for e in ADMIN_EMAILS]
    is_pro = req.pro or is_admin
    if is_admin:
        print(f"[diagnosis] Admin access: {req.email}")

    # Model selection based on pro/free tier
    if is_pro:
        # Pro: use ALL available models
        models_to_use = available_models
        print(f"[diagnosis] Pro tier: using all {len(models_to_use)} models")
    else:
        # Free: use only ONE model (prefer Gemini, fallback to any available)
        if "gemini" in available_models:
            models_to_use = {"gemini": available_models["gemini"]}
        else:
            # Take the first available model
            first_model = next(iter(available_models.items()))
            models_to_use = {first_model[0]: first_model[1]}
        print(f"[diagnosis] Free tier: using single model {list(models_to_use.keys())[0]}")

    print(f"[diagnosis] Starting diagnosis: domain={req.domain}, brand={req.brand_name}, models={list(models_to_use.keys())}")

    start_time = time.time()
    domain = req.domain or ""
    brand_name = req.brand_name

    # Step 1: Crawl website (if domain provided)
    site_text = ""
    if domain:
        domain = domain.replace("https://", "").replace("http://", "").rstrip("/")
        site_text = await crawl_website(domain)

    print(f"[diagnosis] Step 1 done: crawled {len(site_text)} chars")

    # Step 2: Extract brand profile
    if site_text:
        profile = await extract_brand_profile(domain, brand_name, site_text)
    else:
        profile_prompt = f"""Create a brief brand profile for "{brand_name}".
Return JSON with keys: name, category, positioning, target_audience, key_products (list).
Return ONLY valid JSON, no markdown fences."""
        text = await gemini_generate(profile_prompt, max_tokens=1024)
        try:
            text = re.sub(r'^```json?\s*', '', text.strip())
            text = re.sub(r'\s*```$', '', text.strip())
            data = json.loads(text)
            profile = BrandProfile(
                name=data.get("name", brand_name),
                domain=domain or None,
                category=data.get("category", "Unknown"),
                positioning=data.get("positioning", ""),
                target_audience=data.get("target_audience", ""),
                key_products=data.get("key_products", []),
            )
        except Exception:
            profile = BrandProfile(
                name=brand_name or domain,
                domain=domain or None,
                category="Unknown",
                positioning="",
                target_audience="",
                key_products=[],
            )

    print(f"[diagnosis] Step 2 done: profile={profile.name}, category={profile.category}")

    # Step 3: Generate smart prompts + append custom prompts
    smart_prompts = await generate_smart_prompts(profile)

    if req.custom_prompts:
        for cp in req.custom_prompts[:5]:
            if cp.strip():
                smart_prompts.append({"text": cp.strip(), "intent": "custom", "type": "custom"})

    # Cap total at 50 max
    smart_prompts = smart_prompts[:50]

    print(f"[diagnosis] Step 3 done: {len(smart_prompts)} prompts (incl custom)")

    # Step 4: Evaluate prompts across selected models
    results: list[PromptResult] = []
    cited_count = 0
    per_model_results: dict[str, list[dict]] = {m: [] for m in models_to_use}

    async def eval_one(sp: dict, model_name: str, model_fn) -> tuple:
        try:
            eval_result = await evaluate_prompt(profile.name, sp["text"], model_name, model_fn, sp.get("type", "generic"))
            resp_text = eval_result.get("response_text", "")
            return (PromptResult(
                prompt=sp["text"],
                intent=sp.get("intent", "discovery"),
                prompt_type=sp.get("type", "generic"),
                mentioned=eval_result["mentioned"],
                rank=eval_result["rank"],
                sentiment=eval_result["sentiment"],
                snippet=eval_result["snippet"],
                model_name=model_name,
                response_text=resp_text[:2000] if resp_text else None,
            ), eval_result.get("has_citation", False), model_name, 
            resp_text, sp)
        except Exception as e:
            return (PromptResult(
                prompt=sp["text"],
                intent=sp.get("intent", "discovery"),
                prompt_type=sp.get("type", "generic"),
                mentioned=False,
                snippet=f"Error: {str(e)[:100]}",
                model_name=model_name,
                response_text=None,
            ), False, model_name, "", sp)

    # Build tasks for all prompts x selected models
    tasks = []
    for sp in smart_prompts:
        for model_name, model_fn in models_to_use.items():
            tasks.append(eval_one(sp, model_name, model_fn))

    generic_responses = []  # Collect for competitor discovery
    all_results = await asyncio.gather(*tasks)
    for pr, has_cite, mn, resp_text, sp in all_results:
        results.append(pr)
        if has_cite:
            cited_count += 1
        per_model_results[mn].append({"mentioned": pr.mentioned, "sentiment": pr.sentiment})
        # Collect generic prompt responses for competitor extraction
        if sp.get("type", "generic") == "generic" and resp_text:
            generic_responses.append({"prompt": sp["text"], "response_text": resp_text})

    # Step 5: Calculate scores
    total = len(results)
    mentioned = sum(1 for r in results if r.mentioned)

    # True visibility = only from GENERIC prompts (no brand name)
    generic_results = [r for r in results if r.prompt_type == "generic"]

    # Intent coverage based on generic prompts only (brand-specific always "mention" the brand)
    intents_with_mention = len(set(r.intent for r in generic_results if r.mentioned))
    total_intents = len(set(r.intent for r in generic_results)) if generic_results else len(set(r.intent for r in results))
    generic_mentioned = sum(1 for r in generic_results if r.mentioned)
    generic_total = len(generic_results) if generic_results else 1

    # Representation: weight generic mentions higher (they're genuine recommendations)
    sentiment_scores = []
    for r in results:
        if r.mentioned:
            weight = 2.0 if r.prompt_type == "generic" else 1.0  # Generic mentions worth 2x
            if r.sentiment == "positive":
                sentiment_scores.append(3 * weight)
            elif r.sentiment == "neutral":
                sentiment_scores.append(2 * weight)
            else:
                sentiment_scores.append(1 * weight)
    total_weight = sum(2.0 if r.prompt_type == "generic" else 1.0 for r in results if r.mentioned) if sentiment_scores else 0
    avg_repr = sum(sentiment_scores) / total_weight if total_weight else 0

    # Visibility based on generic prompts only (true organic discovery)
    visibility = int((generic_mentioned / generic_total) * 100)
    citation = int((cited_count / total) * 100) if total else 0
    representation = int((avg_repr / 3) * 100) if avg_repr else 0
    intent_score = int((intents_with_mention / total_intents) * 100) if total_intents else 0

    # Composite: visibility is king, citation gets minimal weight (AI rarely cites)
    composite = int(visibility * 0.40 + representation * 0.25 + intent_score * 0.25 + citation * 0.10)

    # Per-model scores with weights (Gemini hardest to appear in = most valuable signal)
    MODEL_WEIGHTS = {"gemini": 1.5, "openai": 1.0, "grok": 0.8}
    per_model_scores = {}
    for mn, mr in per_model_results.items():
        if mr:
            m_mentioned = sum(1 for r in mr if r["mentioned"])
            per_model_scores[mn] = int((m_mentioned / len(mr)) * 100)

    # Model-weighted visibility: weight each model's visibility by importance
    if len(per_model_scores) > 1:
        weighted_sum = sum(per_model_scores[m] * MODEL_WEIGHTS.get(m, 1.0) for m in per_model_scores)
        total_model_weight = sum(MODEL_WEIGHTS.get(m, 1.0) for m in per_model_scores)
        weighted_visibility = int(weighted_sum / total_model_weight)
        # Use weighted visibility in composite when multi-model
        composite = int(weighted_visibility * 0.40 + representation * 0.25 + intent_score * 0.25 + citation * 0.10)

    models_used = list(models_to_use.keys())

    # Calculate new metrics (competitor_gap calculated after competitor extraction below)
    competitor_gap = None

    # recommendation_position: Average rank across all results where brand was mentioned and had a rank
    ranks_with_values = [r.rank for r in results if r.mentioned and r.rank is not None and r.rank > 0]
    recommendation_position = sum(ranks_with_values) / len(ranks_with_values) if ranks_with_values else None

    # knowledge_accuracy: Compare AI responses against website info
    knowledge_accuracy = None
    brand_responses = [r.response_text for r in results if r.mentioned and r.response_text and r.prompt_type == "brand_specific"]
    if brand_responses and site_text:
        accuracy_prompt = f"""Given this website info about the brand: {site_text[:500]}
        
And these AI responses about the brand: {' | '.join(brand_responses[:3])}

Rate the accuracy of AI's knowledge about this brand:
- "accurate": AI information matches website facts well
- "partially_accurate": Some correct info, some gaps/errors
- "inaccurate": AI information contradicts or misses key facts
- "insufficient_data": AI admits lack of knowledge

Return only one word: accurate/partially_accurate/inaccurate/insufficient_data"""
        try:
            accuracy_result = await call_gemini(accuracy_prompt, max_tokens=50)
            if accuracy_result:
                knowledge_accuracy = accuracy_result.strip().lower()
                # Ensure it's one of the expected values
                if knowledge_accuracy not in ["accurate", "partially_accurate", "inaccurate", "insufficient_data"]:
                    knowledge_accuracy = "insufficient_data"
        except Exception:
            knowledge_accuracy = "insufficient_data"

    score = DiagnosisScore(
        composite=composite,
        visibility=visibility,
        citation=citation,
        representation=representation,
        intent=intent_score,
        total_prompts=len(smart_prompts),
        mentioned_count=sum(1 for r in results if r.mentioned),
        models_used=models_used,
        per_model_scores=per_model_scores,
        competitor_gap=competitor_gap,
        recommendation_position=recommendation_position,
        knowledge_accuracy=knowledge_accuracy,
    )

    # Step 5.5: Competitor Discovery — extract brands mentioned in generic responses
    competitors = []
    if generic_responses:
        print(f"[diagnosis] Extracting competitors from {len(generic_responses)} generic responses...")
        competitors = await extract_competitors(profile.name, generic_responses, profile.category)
        print(f"[diagnosis] Found {len(competitors)} competitors")

    # Calculate competitor_gap now that competitors are available
    if competitors and len(competitors) >= 3:
        top_3_avg_mentions = sum(c.mention_count for c in competitors[:3]) / 3
        generic_mention_rate = (generic_mentioned / generic_total) * 100 if generic_total else 0
        top_3_mention_rate = min(100, top_3_avg_mentions * 10)
        if top_3_mention_rate > 0:
            competitor_gap = int(min(100, (generic_mention_rate / top_3_mention_rate) * 100))

    # Step 6: Generate insights & recommendations
    insights = []
    if visibility >= 70:
        insights.append(f"Strong organic AI visibility — AI mentions {profile.name} unprompted in {generic_mentioned}/{generic_total} category queries")
    elif visibility >= 30:
        insights.append(f"Moderate organic visibility — mentioned in {generic_mentioned}/{generic_total} generic category queries")
    else:
        insights.append(f"Low organic visibility — AI only mentions {profile.name} in {generic_mentioned}/{generic_total} generic queries (brand not top-of-mind for AI)")

    # Brand-specific insights
    brand_results = [r for r in results if r.prompt_type == "brand_specific"]
    if brand_results:
        positive = sum(1 for r in brand_results if r.sentiment == "positive")
        total_brand = len(brand_results)
        insights.append(f"Brand sentiment: {positive}/{total_brand} brand-specific queries received positive framing")

    if citation == 0:
        insights.append("Zero citations — AI never links to your website in responses")
    if intent_score >= 80:
        insights.append("Excellent intent coverage across discovery, comparison, purchase, and informational queries")
    elif intent_score < 50:
        insights.append(f"Limited intent coverage — brand only appears in {intents_with_mention}/{total_intents} intent categories")

    positive_count = sum(1 for r in results if r.sentiment == "positive")
    if mentioned > 0:
        insights.append(f"Sentiment: {int(positive_count/mentioned*100)}% positive when mentioned")

    if competitors:
        top3 = [c.name for c in competitors[:3]]
        insights.append(f"Competitor Discovery: AI recommends {', '.join(top3)} in your category — these brands occupy the visibility you're missing")

    if len(models_used) > 1:
        insights.append(f"Evaluated across {len(models_used)} AI platforms: {', '.join(models_used)}")
        # Add per-model comparison insight
        if per_model_scores:
            best_model = max(per_model_scores, key=per_model_scores.get)
            worst_model = min(per_model_scores, key=per_model_scores.get)
            if per_model_scores[best_model] - per_model_scores[worst_model] >= 15:
                insights.append(f"Platform gap: {best_model} mentions you {per_model_scores[best_model]}% vs {worst_model} only {per_model_scores[worst_model]}% — optimize for weaker platforms")

    recommendations = []
    if visibility < 50:
        recommendations.append("Create comprehensive, authoritative content about your brand and products that AI models can reference")
        recommendations.append("Get featured in industry roundups, 'best of' articles, and trusted review sites")
    if citation < 10:
        recommendations.append("Add Schema.org structured data (Product, Organization, FAQ) to improve citation likelihood")
        recommendations.append("Publish detailed buying guides and comparison content with clear sourcing")
    if representation < 50:
        recommendations.append("Strengthen your brand narrative — ensure mission, unique value, and differentiators are clearly stated online")
    if intent_score < 60:
        recommendations.append("Diversify content to cover all user intents: discovery, comparison, purchase decisions, and education")
    if competitors and visibility < 70:
        top_comp = competitors[0]
        recommendations.append(f"Study {top_comp.name}'s content strategy — they rank #{int(top_comp.avg_rank) if top_comp.avg_rank else '?'} in your category. Analyze why AI favors them")
    if not recommendations:
        recommendations.append("Maintain high-quality content and monitor AI visibility trends regularly")
        recommendations.append("Consider expanding evaluation to additional AI platforms for cross-platform insights")

    elapsed = round(time.time() - start_time, 1)
    diagnosis_id = str(uuid4())

    response = DiagnosisResponse(
        id=diagnosis_id,
        brand=profile,
        score=score,
        results=results,
        insights=insights,
        recommendations=recommendations[:5],
        competitors=competitors,
        generated_prompts_count=len(smart_prompts),
        evaluation_time_seconds=elapsed,
    )

    # Step 7: Save to database
    try:
        record = DiagnosisRecord(
            id=diagnosis_id,
            brand_name=profile.name,
            domain=profile.domain,
            category=profile.category,
            composite_score=composite,
            visibility_score=visibility,
            citation_score=citation,
            representation_score=representation,
            intent_score=intent_score,
            total_prompts=len(smart_prompts),
            mentioned_count=score.mentioned_count,
            models_used=models_used,
            results_json=[r.model_dump() for r in results],
            insights=insights,
            recommendations=recommendations[:5],
            competitors_json=[c.model_dump() for c in competitors],
            per_model_scores=per_model_scores if per_model_scores else None,
            created_at=datetime.utcnow(),
        )
        db.add(record)
        await db.commit()
        print(f"[diagnosis] Saved diagnosis {diagnosis_id} to DB")
    except Exception as e:
        print(f"[diagnosis] Failed to save to DB: {e}")
        await db.rollback()

    return response


# ---------------------------------------------------------------------------
# History & retrieval endpoints
# ---------------------------------------------------------------------------

@router.get("/history")
async def get_diagnosis_history(
    user_email: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Return the 50 most recent diagnoses, optionally filtered by user_email."""
    query = select(DiagnosisRecord).order_by(DiagnosisRecord.created_at.desc()).limit(50)
    if user_email:
        # Join with users table to filter by email
        from ...models.user import User
        query = (
            select(DiagnosisRecord)
            .join(User, DiagnosisRecord.user_id == User.id)
            .where(User.email == user_email)
            .order_by(DiagnosisRecord.created_at.desc())
            .limit(50)
        )
    result = await db.execute(query)
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "brand_name": r.brand_name,
            "domain": r.domain,
            "category": r.category,
            "composite_score": r.composite_score,
            "models_used": r.models_used,
            "per_model_scores": r.per_model_scores,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]


@router.get("/{diagnosis_id}")
async def get_diagnosis(diagnosis_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific diagnosis by ID with full details."""
    result = await db.execute(
        select(DiagnosisRecord).where(DiagnosisRecord.id == diagnosis_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Diagnosis not found")

    return {
        "id": record.id,
        "brand_name": record.brand_name,
        "domain": record.domain,
        "category": record.category,
        "composite_score": record.composite_score,
        "visibility_score": record.visibility_score,
        "citation_score": record.citation_score,
        "representation_score": record.representation_score,
        "intent_score": record.intent_score,
        "total_prompts": record.total_prompts,
        "mentioned_count": record.mentioned_count,
        "models_used": record.models_used,
        "results_json": record.results_json,
        "insights": record.insights,
        "recommendations": record.recommendations,
        "competitors_json": record.competitors_json,
        "per_model_scores": record.per_model_scores,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


@router.get("/{diagnosis_id}/export")
async def export_diagnosis(diagnosis_id: str, db: AsyncSession = Depends(get_db)):
    """Export complete diagnosis data as JSON (all raw prompt results included)."""
    result = await db.execute(
        select(DiagnosisRecord).where(DiagnosisRecord.id == diagnosis_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Diagnosis not found")

    return {
        "id": record.id,
        "brand_name": record.brand_name,
        "domain": record.domain,
        "category": record.category,
        "scores": {
            "composite": record.composite_score,
            "visibility": record.visibility_score,
            "citation": record.citation_score,
            "representation": record.representation_score,
            "intent": record.intent_score,
        },
        "per_model_scores": record.per_model_scores,
        "total_prompts": record.total_prompts,
        "mentioned_count": record.mentioned_count,
        "models_used": record.models_used,
        "results": record.results_json,
        "insights": record.insights,
        "recommendations": record.recommendations,
        "competitors": record.competitors_json,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


@router.get("/{diagnosis_id}/report")
async def get_diagnosis_report(diagnosis_id: str, db: AsyncSession = Depends(get_db)):
    """Generate a markdown deep-analysis report for a diagnosis."""
    result = await db.execute(
        select(DiagnosisRecord).where(DiagnosisRecord.id == diagnosis_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Diagnosis not found")

    r = record
    results = r.results_json or []
    competitors = r.competitors_json or []
    insights = r.insights or []
    recommendations = r.recommendations or []
    per_model = r.per_model_scores or {}
    models_used = r.models_used or []

    # Stats
    total_prompts = r.total_prompts or len(results)
    mentioned = r.mentioned_count or 0
    mention_rate = round((mentioned / total_prompts * 100), 1) if total_prompts else 0

    generic_results = [p for p in results if p.get("prompt_type") == "generic"]
    brand_results = [p for p in results if p.get("prompt_type") == "brand_specific"]
    generic_mentioned = sum(1 for p in generic_results if p.get("mentioned"))
    brand_mentioned = sum(1 for p in brand_results if p.get("mentioned"))

    # Build markdown
    lines = []
    lines.append(f"# AI Visibility Report: {r.brand_name}")
    lines.append(f"*Generated {r.created_at.strftime('%Y-%m-%d %H:%M UTC') if r.created_at else 'N/A'}*\n")

    # Executive Summary
    if r.composite_score is not None and r.composite_score >= 70:
        grade = "strong"
    elif r.composite_score is not None and r.composite_score >= 40:
        grade = "moderate"
    else:
        grade = "weak"
    lines.append("## Executive Summary")
    lines.append(f"**{r.brand_name}** has **{grade}** AI visibility with a composite score of **{r.composite_score}/100**, "
                  f"mentioned in {mentioned}/{total_prompts} prompts ({mention_rate}%) across {len(models_used)} AI platform(s).\n")

    # Score Breakdown
    lines.append("## Score Breakdown")
    lines.append(f"| Dimension | Score |")
    lines.append(f"|-----------|-------|")
    lines.append(f"| **Composite** | {r.composite_score}/100 |")
    lines.append(f"| Visibility (organic discovery) | {r.visibility_score}/100 |")
    lines.append(f"| Citation (linked references) | {r.citation_score}/100 |")
    lines.append(f"| Representation (sentiment quality) | {r.representation_score}/100 |")
    lines.append(f"| Intent Coverage (query types) | {r.intent_score}/100 |")
    lines.append("")

    # Platform Comparison
    if per_model and len(per_model) > 0:
        lines.append("## Platform Comparison")
        lines.append("| Platform | Mention Rate |")
        lines.append("|----------|-------------|")
        for model, score in sorted(per_model.items(), key=lambda x: x[1], reverse=True):
            lines.append(f"| {model.capitalize()} | {score}% |")
        lines.append("")

    # Top Competitors
    if competitors:
        lines.append("## Top Competitors")
        lines.append("These brands dominate AI recommendations in your category:\n")
        lines.append("| Rank | Brand | Mentions | Avg Position | Sentiment |")
        lines.append("|------|-------|----------|-------------|-----------|")
        for i, c in enumerate(competitors[:10], 1):
            avg_rank = f"#{c.get('avg_rank', 'N/A')}" if c.get('avg_rank') else "N/A"
            lines.append(f"| {i} | {c.get('name', '?')} | {c.get('mention_count', 0)} | {avg_rank} | {c.get('sentiment', 'neutral')} |")
        lines.append("")

    # Generic vs Brand-Specific
    lines.append("## Generic vs Brand-Specific Analysis")
    lines.append(f"- **Generic prompts** (no brand name): {len(generic_results)} total, "
                  f"{generic_mentioned} mentioned ({round(generic_mentioned/len(generic_results)*100, 1) if generic_results else 0}%)")
    lines.append(f"- **Brand-specific prompts** (includes brand name): {len(brand_results)} total, "
                  f"{brand_mentioned} mentioned ({round(brand_mentioned/len(brand_results)*100, 1) if brand_results else 0}%)")
    lines.append("")
    if generic_results and generic_mentioned == 0:
        lines.append("> ⚠️ AI does not organically recommend your brand in category searches. "
                      "This is the most critical gap to address.\n")
    elif generic_results and generic_mentioned / len(generic_results) < 0.3:
        lines.append("> ⚠️ Low organic discovery rate. Your brand appears in less than 30% of generic category queries.\n")

    # Actionable Recommendations
    lines.append("## Actionable Recommendations")
    for i, rec in enumerate(recommendations, 1):
        lines.append(f"{i}. {rec}")
    lines.append("")

    # Insights
    if insights:
        lines.append("## Key Insights")
        for ins in insights:
            lines.append(f"- {ins}")
        lines.append("")

    # Raw Data Summary
    lines.append("## Raw Data Summary")
    lines.append(f"- **Total prompts evaluated**: {total_prompts}")
    lines.append(f"- **Total mentions**: {mentioned} ({mention_rate}%)")
    lines.append(f"- **Models used**: {', '.join(models_used)}")
    lines.append(f"- **Generic prompts**: {len(generic_results)}")
    lines.append(f"- **Brand-specific prompts**: {len(brand_results)}")

    # Sentiment breakdown
    pos = sum(1 for p in results if p.get("mentioned") and p.get("sentiment") == "positive")
    neu = sum(1 for p in results if p.get("mentioned") and p.get("sentiment") == "neutral")
    neg = sum(1 for p in results if p.get("mentioned") and p.get("sentiment") == "negative")
    lines.append(f"- **Sentiment**: {pos} positive, {neu} neutral, {neg} negative")
    lines.append("")

    markdown = "\n".join(lines)
    return {"diagnosis_id": diagnosis_id, "report_markdown": markdown}
