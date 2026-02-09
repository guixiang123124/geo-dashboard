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

class DiagnosisRequest(BaseModel):
    domain: Optional[str] = None
    brand_name: Optional[str] = None
    custom_prompts: Optional[list[str]] = None


class PromptResult(BaseModel):
    prompt: str
    intent: str
    mentioned: bool
    rank: Optional[int] = None
    sentiment: Optional[str] = None
    snippet: Optional[str] = None
    model_name: Optional[str] = None


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
    """Generate 10 tailored evaluation prompts based on brand profile."""
    prompt = f"""You are an expert in AI visibility (GEO/AEO). Generate 10 search prompts that real consumers would ask AI assistants about this type of brand/product.

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

    text = await gemini_generate(prompt, max_tokens=1024)
    try:
        text = re.sub(r'^```json?\s*', '', text.strip())
        text = re.sub(r'\s*```$', '', text.strip())
        prompts = json.loads(text)
        if isinstance(prompts, list):
            return prompts[:10]
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


async def evaluate_prompt(brand_name: str, prompt_text: str, model_name: str, model_fn) -> dict:
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

    has_citation = bool(re.search(r'https?://[^\s]*' + re.escape(brand_lower.replace(" ", "")), text_lower))

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

    print(f"[diagnosis] Starting diagnosis: domain={req.domain}, brand={req.brand_name}, models={list(available_models.keys())}")

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
                smart_prompts.append({"text": cp.strip(), "intent": "custom"})

    # Cap total at 15
    smart_prompts = smart_prompts[:15]

    print(f"[diagnosis] Step 3 done: {len(smart_prompts)} prompts (incl custom)")

    # Step 4: Evaluate prompts across ALL available models
    results: list[PromptResult] = []
    cited_count = 0
    per_model_results: dict[str, list[dict]] = {m: [] for m in available_models}

    async def eval_one(sp: dict, model_name: str, model_fn) -> tuple:
        try:
            eval_result = await evaluate_prompt(profile.name, sp["text"], model_name, model_fn)
            return (PromptResult(
                prompt=sp["text"],
                intent=sp.get("intent", "discovery"),
                mentioned=eval_result["mentioned"],
                rank=eval_result["rank"],
                sentiment=eval_result["sentiment"],
                snippet=eval_result["snippet"],
                model_name=model_name,
            ), eval_result.get("has_citation", False), model_name)
        except Exception as e:
            return (PromptResult(
                prompt=sp["text"],
                intent=sp.get("intent", "discovery"),
                mentioned=False,
                snippet=f"Error: {str(e)[:100]}",
                model_name=model_name,
            ), False, model_name)

    # Build tasks for all prompts x all models
    tasks = []
    for sp in smart_prompts:
        for model_name, model_fn in available_models.items():
            tasks.append(eval_one(sp, model_name, model_fn))

    all_results = await asyncio.gather(*tasks)
    for pr, has_cite, mn in all_results:
        results.append(pr)
        if has_cite:
            cited_count += 1
        per_model_results[mn].append({"mentioned": pr.mentioned, "sentiment": pr.sentiment})

    # Step 5: Calculate scores
    total = len(results)
    mentioned = sum(1 for r in results if r.mentioned)
    intents_with_mention = len(set(r.intent for r in results if r.mentioned))
    total_intents = len(set(r.intent for r in results))

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
    intent_score = int((intents_with_mention / total_intents) * 100) if total_intents else 0

    composite = int(visibility * 0.35 + citation * 0.25 + representation * 0.25 + intent_score * 0.15)

    # Per-model scores
    per_model_scores = {}
    for mn, mr in per_model_results.items():
        if mr:
            m_mentioned = sum(1 for r in mr if r["mentioned"])
            per_model_scores[mn] = int((m_mentioned / len(mr)) * 100)

    models_used = list(available_models.keys())

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
    if intent_score >= 80:
        insights.append("Excellent intent coverage across discovery, comparison, purchase, and informational queries")
    elif intent_score < 50:
        insights.append(f"Limited intent coverage — brand only appears in {intents_with_mention}/{total_intents} intent categories")

    positive_count = sum(1 for r in results if r.sentiment == "positive")
    if mentioned > 0:
        insights.append(f"Sentiment: {int(positive_count/mentioned*100)}% positive when mentioned")

    if len(models_used) > 1:
        insights.append(f"Evaluated across {len(models_used)} AI platforms: {', '.join(models_used)}")

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
async def get_diagnosis_history(db: AsyncSession = Depends(get_db)):
    """Return the 50 most recent diagnoses."""
    result = await db.execute(
        select(DiagnosisRecord)
        .order_by(DiagnosisRecord.created_at.desc())
        .limit(50)
    )
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "brand_name": r.brand_name,
            "domain": r.domain,
            "category": r.category,
            "composite_score": r.composite_score,
            "models_used": r.models_used,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]


@router.get("/{diagnosis_id}")
async def get_diagnosis(diagnosis_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific diagnosis by ID."""
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
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }
