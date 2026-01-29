"""
AI Models API routes.
"""

from typing import List

from fastapi import APIRouter

from src.core.config import settings


router = APIRouter()


@router.get("/")
async def list_models() -> List[dict]:
    """
    List all configured AI models and their availability status.

    Returns a list of models with:
    - name: Display name
    - id: Model identifier for evaluation
    - available: Whether the API key is configured
    - model: Specific model version
    """
    models = [
        {
            "id": "Gemini",
            "name": "Google Gemini",
            "model": settings.GOOGLE_MODEL,
            "available": bool(settings.GOOGLE_API_KEY),
            "description": "Google's multimodal AI model",
            "icon": "G",
        },
        {
            "id": "ChatGPT",
            "name": "OpenAI ChatGPT",
            "model": settings.OPENAI_MODEL,
            "available": bool(settings.OPENAI_API_KEY),
            "description": "OpenAI's GPT-4 language model",
            "icon": "O",
        },
        {
            "id": "Claude",
            "name": "Anthropic Claude",
            "model": settings.ANTHROPIC_MODEL,
            "available": bool(settings.ANTHROPIC_API_KEY),
            "description": "Anthropic's AI assistant",
            "icon": "A",
        },
        {
            "id": "Perplexity",
            "name": "Perplexity AI",
            "model": "pplx-70b-online",
            "available": bool(settings.PERPLEXITY_API_KEY),
            "description": "Real-time search AI",
            "icon": "P",
        },
    ]
    return models


@router.get("/available")
async def list_available_models() -> List[dict]:
    """List only models that have API keys configured."""
    all_models = await list_models()
    return [m for m in all_models if m["available"]]
