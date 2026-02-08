"""
Smart Brand Diagnosis API — real-time AI visibility audit.

Flow:
1. Accept domain or brand name
2. Crawl website → extract brand profile
3. Gemini generates tailored evaluation prompts
4. Evaluate brand against each prompt via Gemini
5. Score and return diagnosis report
"""

import asyncio
import json
import re
import time
from typing import Optional
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...core.config import settings

router = APIRouter()

# ---------------------------------------------------------------------------
# Google GenAI SDK (same one used by evaluate_v2.py)
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
# Request / Response schemas
# ---------------------------------------------------------------------------

class DiagnosisRequest(BaseModel):
    domain: Optional[str] = None
    brand_name: Optional[str] = None


class PromptResult(BaseModel):
    prompt: str
    intent: str
    mentioned: bool
    rank: Optional[int] = None
    sentiment: Optional[str] = None
    snippet: Optional[str] = None


class DiagnosisScore(BaseModel):
    composite: int
    visibility: int
    citation: int
    representation: int
    intent: int
    total_prompts: int
    mentioned_count: int


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
                    # Strip HTML tags crudely
                    text = re.sub(r'<script[^>]*>.*?</script>', '', resp.text, flags=re.DOTALL)
                    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
                    text = re.sub(r'<[^>]+>', ' ', text)
                    text = re.sub(r'\s+', ' ', text).strip()
                    texts.append(text[:3000])
            except Exception:
                continue

    return "\n\n".join(texts)[:8000]


async def gemini_generate(prompt: str) -> str:
    """Call Gemini and return text response."""
    client = get_genai_client()
    if not client:
        raise HTTPException(500, "Gemini SDK not available — google-genai not installed")

    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=GEMINI_MODEL,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"[diagnosis] Gemini API error: {e}")
        raise HTTPException(500, f"Gemini API error: {str(e)[:200]}")


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

    text = await gemini_generate(prompt)
    # Parse JSON from response
    try:
        # Strip markdown fences if present
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
    """Generate 20 tailored evaluation prompts based on brand profile."""
    prompt = f"""You are an expert in AI visibility (GEO/AEO). Generate 20 search prompts that real consumers would ask AI assistants about this type of brand/product.

Brand: {profile.name}
Category: {profile.category}
Positioning: {profile.positioning}
Target audience: {profile.target_audience}
Products: {', '.join(profile.key_products)}

Generate exactly 10 prompts in 4 categories (2-3 each):
1. "discovery" — general product discovery ("best X for Y")
2. "comparison" — brand comparisons ("X vs Y", "is X worth it")
3. "purchase" — buying intent ("where to buy X", "X coupon codes")
4. "informational" — educational ("how to choose X", "what to look for in X")

Return a JSON array of objects with keys: "text", "intent" (one of the 4 categories above).
Return ONLY valid JSON, no markdown fences."""

    text = await gemini_generate(prompt)
    try:
        text = re.sub(r'^```json?\s*', '', text.strip())
        text = re.sub(r'\s*```$', '', text.strip())
        prompts = json.loads(text)
        if isinstance(prompts, list):
            return prompts[:10]  # cap at 10 to stay under Railway proxy timeout
    except json.JSONDecodeError:
        pass

    # Fallback: generic prompts
    return [
        {"text": f"What are the best {profile.category.lower()} brands?", "intent": "discovery"},
        {"text": f"Is {profile.name} a good brand?", "intent": "informational"},
        {"text": f"Where to buy {profile.name} products?", "intent": "purchase"},
        {"text": f"{profile.name} reviews and alternatives", "intent": "comparison"},
        {"text": f"Best {profile.key_products[0] if profile.key_products else 'products'} for kids", "intent": "discovery"},
    ]


async def evaluate_prompt(brand_name: str, prompt_text: str) -> dict:
    """Evaluate a single prompt against Gemini and analyze the response."""
    response_text = await gemini_generate(prompt_text)

    # Analyze mention
    text_lower = response_text.lower()
    brand_lower = brand_name.lower()
    # Also check common variations (e.g., "carter's" vs "carters")
    brand_simple = re.sub(r"['\-\s]", "", brand_lower)

    is_mentioned = brand_lower in text_lower or brand_simple in re.sub(r"['\-\s]", "", text_lower)

    # Find rank if in numbered list
    rank = None
    snippet = None
    if is_mentioned:
        lines = response_text.split("\n")
        for line in lines:
            if brand_lower in line.lower() or brand_simple in re.sub(r"['\-\s]", "", line.lower()):
                match = re.match(r"^\s*(\d+)[\.\)]\s", line)
                if match:
                    rank = int(match.group(1))
                snippet = line.strip()[:200]
                break

    # Simple sentiment
    sentiment = None
    if is_mentioned:
        positive_words = ["best", "top", "excellent", "quality", "premium", "trusted", "popular", "recommended", "great", "love"]
        negative_words = ["cheap", "poor", "bad", "worst", "avoid", "overpriced", "disappointing"]
        if any(w in text_lower for w in positive_words):
            sentiment = "positive"
        elif any(w in text_lower for w in negative_words):
            sentiment = "negative"
        else:
            sentiment = "neutral"

    # Check for citations (URLs containing brand domain)
    has_citation = bool(re.search(r'https?://[^\s]*' + re.escape(brand_lower.replace(" ", "")), text_lower))

    return {
        "mentioned": is_mentioned,
        "rank": rank,
        "sentiment": sentiment,
        "snippet": snippet,
        "has_citation": has_citation,
        "response_text": response_text,
    }


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

@router.post("", response_model=DiagnosisResponse)
async def diagnose_brand(req: DiagnosisRequest):
    """
    Smart brand diagnosis: crawl → profile → generate prompts → evaluate → score.
    Takes ~30-60 seconds depending on prompt count.
    """
    if not req.domain and not req.brand_name:
        raise HTTPException(400, "Provide either domain or brand_name")

    if not settings.GOOGLE_API_KEY:
        raise HTTPException(500, "Gemini API key not configured")

    print(f"[diagnosis] Starting diagnosis: domain={req.domain}, brand={req.brand_name}")

    start_time = time.time()
    domain = req.domain or ""
    brand_name = req.brand_name

    # Step 1: Crawl website (if domain provided)
    site_text = ""
    if domain:
        # Clean domain
        domain = domain.replace("https://", "").replace("http://", "").rstrip("/")
        site_text = await crawl_website(domain)

    print(f"[diagnosis] Step 1 done: crawled {len(site_text)} chars")

    # Step 2: Extract brand profile
    if site_text:
        profile = await extract_brand_profile(domain, brand_name, site_text)
    else:
        # No website — create minimal profile from brand name
        profile_prompt = f"""Create a brief brand profile for "{brand_name}".
Return JSON with keys: name, category, positioning, target_audience, key_products (list).
Return ONLY valid JSON, no markdown fences."""
        text = await gemini_generate(profile_prompt)
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

    # Step 3: Generate smart prompts
    smart_prompts = await generate_smart_prompts(profile)

    print(f"[diagnosis] Step 3 done: generated {len(smart_prompts)} prompts")

    # Step 4: Evaluate each prompt (with rate limiting for Gemini free tier)
    results = []
    cited_count = 0

    for sp in smart_prompts:
        try:
            eval_result = await evaluate_prompt(profile.name, sp["text"])
            results.append(PromptResult(
                prompt=sp["text"],
                intent=sp.get("intent", "discovery"),
                mentioned=eval_result["mentioned"],
                rank=eval_result["rank"],
                sentiment=eval_result["sentiment"],
                snippet=eval_result["snippet"],
            ))
            if eval_result.get("has_citation"):
                cited_count += 1

            # Rate limit: keep under Gemini 15 RPM
            await asyncio.sleep(0.15)
        except Exception as e:
            results.append(PromptResult(
                prompt=sp["text"],
                intent=sp.get("intent", "discovery"),
                mentioned=False,
                snippet=f"Error: {str(e)[:100]}",
            ))

    # Step 5: Calculate scores
    total = len(results)
    mentioned = sum(1 for r in results if r.mentioned)
    intents_with_mention = len(set(r.intent for r in results if r.mentioned))
    total_intents = len(set(r.intent for r in results))

    # Representation: average sentiment score
    sentiment_scores = []
    for r in results:
        if r.mentioned:
            if r.sentiment == "positive":
                sentiment_scores.append(3)
            elif r.sentiment == "neutral":
                sentiment_scores.append(2)
            else:
                sentiment_scores.append(1)
    avg_repr = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0

    visibility = int((mentioned / total) * 100) if total else 0
    citation = int((cited_count / total) * 100) if total else 0
    representation = int((avg_repr / 3) * 100) if avg_repr else 0
    intent = int((intents_with_mention / total_intents) * 100) if total_intents else 0

    composite = int(visibility * 0.35 + citation * 0.25 + representation * 0.25 + intent * 0.15)

    score = DiagnosisScore(
        composite=composite,
        visibility=visibility,
        citation=citation,
        representation=representation,
        intent=intent,
        total_prompts=total,
        mentioned_count=mentioned,
    )

    # Step 6: Generate insights & recommendations
    insights = []
    if visibility >= 70:
        insights.append(f"Strong AI visibility — {profile.name} is mentioned in {mentioned}/{total} prompts")
    elif visibility >= 30:
        insights.append(f"Moderate visibility — mentioned in {mentioned}/{total} AI responses")
    else:
        insights.append(f"Low AI visibility — only mentioned in {mentioned}/{total} relevant prompts")

    if citation == 0:
        insights.append("Zero citations — AI never links to your website in responses")
    if intent >= 80:
        insights.append("Excellent intent coverage across discovery, comparison, purchase, and informational queries")
    elif intent < 50:
        insights.append(f"Limited intent coverage — brand only appears in {intents_with_mention}/{total_intents} intent categories")

    positive_count = sum(1 for r in results if r.sentiment == "positive")
    if mentioned > 0:
        insights.append(f"Sentiment: {int(positive_count/mentioned*100)}% positive when mentioned")

    recommendations = []
    if visibility < 50:
        recommendations.append("Create comprehensive, authoritative content about your brand and products that AI models can reference")
        recommendations.append("Get featured in industry roundups, 'best of' articles, and trusted review sites")
    if citation < 10:
        recommendations.append("Add Schema.org structured data (Product, Organization, FAQ) to improve citation likelihood")
        recommendations.append("Publish detailed buying guides and comparison content with clear sourcing")
    if representation < 50:
        recommendations.append("Strengthen your brand narrative — ensure mission, unique value, and differentiators are clearly stated online")
    if intent < 60:
        recommendations.append("Diversify content to cover all user intents: discovery, comparison, purchase decisions, and education")
    if not recommendations:
        recommendations.append("Maintain high-quality content and monitor AI visibility trends regularly")
        recommendations.append("Consider expanding evaluation to ChatGPT, Claude, and Perplexity for cross-platform insights")

    elapsed = round(time.time() - start_time, 1)

    return DiagnosisResponse(
        id=str(uuid4()),
        brand=profile,
        score=score,
        results=results,
        insights=insights,
        recommendations=recommendations[:5],
        generated_prompts_count=len(smart_prompts),
        evaluation_time_seconds=elapsed,
    )
