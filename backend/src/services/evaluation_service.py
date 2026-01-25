"""
Evaluation service for orchestrating AI model evaluations.
"""

import re
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..models.brand import Brand
from ..models.prompt import Prompt
from ..models.evaluation import EvaluationRun, EvaluationResult
from ..models.scorecard import ScoreCard
from ..services.ai_clients import (
    OpenAIClientWithRetry,
    GeminiClientWithRetry,
    AIResponse,
)
from ..schemas.models import GEOScoreCard
from ..services.scorers import GEOScorer


class EvaluationService:
    """Service for running brand evaluations across AI models."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.scorers = {}  # Cache scorers

    async def run_evaluation(
        self,
        run_id: str,
        brand_ids: List[str],
        models: List[str],
        prompt_ids: Optional[List[str]] = None,
    ):
        """
        Run a complete evaluation for multiple brands across multiple models.

        Args:
            run_id: ID of the evaluation run
            brand_ids: List of brand IDs to evaluate
            models: List of AI models to use (e.g., ["ChatGPT", "Gemini"])
            prompt_ids: Optional list of specific prompts to use (default: all)
        """
        # Get evaluation run
        run_result = await self.db.execute(
            select(EvaluationRun).where(EvaluationRun.id == run_id)
        )
        run = run_result.scalar_one()

        try:
            # Update status to running
            run.status = "running"
            run.started_at = datetime.utcnow()
            await self.db.commit()

            # Get brands
            brands_result = await self.db.execute(
                select(Brand).where(Brand.id.in_(brand_ids))
            )
            brands = brands_result.scalars().all()

            # Get prompts
            if prompt_ids:
                prompts_result = await self.db.execute(
                    select(Prompt).where(Prompt.id.in_(prompt_ids))
                )
            else:
                prompts_result = await self.db.execute(select(Prompt))
            prompts = prompts_result.scalars().all()

            # Update run metadata
            run.prompt_count = len(prompts)
            await self.db.commit()

            # Calculate total tasks
            total_tasks = len(brands) * len(prompts) * len(models)
            completed_tasks = 0

            # Process each combination
            for brand in brands:
                for prompt in prompts:
                    for model_name in models:
                        # Run evaluation for this combination
                        await self._evaluate_single(
                            run_id=run_id,
                            brand=brand,
                            prompt=prompt,
                            model_name=model_name,
                        )

                        # Update progress
                        completed_tasks += 1
                        run.progress = int((completed_tasks / total_tasks) * 100)
                        await self.db.commit()

                # Calculate scores for this brand
                await self._calculate_brand_score(run_id, brand.id)

            # Mark as completed
            run.status = "completed"
            run.completed_at = datetime.utcnow()
            run.progress = 100
            await self.db.commit()

        except Exception as e:
            # Mark as failed
            run.status = "failed"
            run.error_message = str(e)
            await self.db.commit()
            raise

    async def _evaluate_single(
        self,
        run_id: str,
        brand: Brand,
        prompt: Prompt,
        model_name: str,
    ):
        """
        Evaluate a single brand-prompt-model combination.
        """
        # Get AI client
        client = await self._get_ai_client(model_name)

        # Make API call
        response = await client.chat(
            prompt=prompt.text,
            system_prompt="You are a helpful assistant. Provide accurate, factual information.",
        )

        # Analyze response for brand mentions
        is_mentioned, mention_rank, mention_context = self._analyze_mention(
            response.text, brand.name
        )

        # Check for citations
        is_cited, citation_urls = self._analyze_citations(response.text, brand.domain)

        # Analyze representation
        representation_score, description, sentiment = self._analyze_representation(
            response.text, brand.name, brand.positioning
        )

        # Save result
        result = EvaluationResult(
            id=str(uuid4()),
            evaluation_run_id=run_id,
            brand_id=brand.id,
            prompt_id=prompt.id,
            model_name=model_name,
            prompt_text=prompt.text,
            intent_category=prompt.intent_category,
            response_text=response.text,
            response_time_ms=response.response_time_ms,
            is_mentioned=is_mentioned,
            mention_rank=mention_rank,
            mention_context=mention_context,
            is_cited=is_cited,
            citation_urls=citation_urls,
            representation_score=representation_score,
            description_text=description,
            sentiment=sentiment,
        )

        self.db.add(result)
        await self.db.flush()

    async def _calculate_brand_score(self, run_id: str, brand_id: str):
        """
        Calculate aggregated GEO score for a brand based on evaluation results.
        """
        # Get all results for this brand in this run
        results_query = select(EvaluationResult).where(
            EvaluationResult.evaluation_run_id == run_id,
            EvaluationResult.brand_id == brand_id,
        )
        results_result = await self.db.execute(results_query)
        results = results_result.scalars().all()

        if not results:
            return

        # Calculate metrics
        total_results = len(results)
        mentioned_results = [r for r in results if r.is_mentioned]
        cited_results = [r for r in results if r.is_cited]

        # Visibility: mention rate and average rank
        mention_rate = len(mentioned_results) / total_results
        avg_rank = (
            sum(r.mention_rank for r in mentioned_results if r.mention_rank)
            / len(mentioned_results)
            if mentioned_results
            else None
        )

        # Citation rate
        citation_rate = len(cited_results) / total_results

        # Representation: average score
        avg_representation = sum(r.representation_score for r in results) / total_results

        # Intent coverage: unique intents where brand was mentioned
        intents_mentioned = set(r.intent_category for r in mentioned_results)
        all_intents = set(r.intent_category for r in results)
        intent_coverage = len(intents_mentioned) / len(all_intents) if all_intents else 0

        # Calculate GEO scores
        visibility_score = int(mention_rate * 100)
        citation_score = int(citation_rate * 100)
        representation_score = int((avg_representation / 3) * 100)  # 0-3 scale to 0-100
        intent_score = int(intent_coverage * 100)

        # Composite score (weighted): Visibility 35%, Citation 25%, Representation 25%, Intent 15%
        composite = int(
            (visibility_score * 0.35) +
            (citation_score * 0.25) +
            (representation_score * 0.25) +
            (intent_score * 0.15)
        )

        # Model breakdown
        model_scores = {}
        for model_name in set(r.model_name for r in results):
            model_results = [r for r in results if r.model_name == model_name]
            model_mentions = [r for r in model_results if r.is_mentioned]
            model_scores[model_name] = {
                "score": int((len(model_mentions) / len(model_results)) * 100),
                "mentions": len(model_mentions),
            }

        # Create score card
        score_card = ScoreCard(
            id=str(uuid4()),
            brand_id=brand_id,
            evaluation_run_id=run_id,
            composite_score=composite,
            visibility_score=visibility_score,
            citation_score=citation_score,
            representation_score=representation_score,
            intent_score=intent_score,
            total_mentions=len(mentioned_results),
            avg_rank=avg_rank,
            citation_rate=citation_rate,
            intent_coverage=intent_coverage,
            model_scores=model_scores,
            evaluation_count=total_results,
            last_evaluation_date=datetime.utcnow(),
        )

        self.db.add(score_card)
        await self.db.flush()

    async def _get_ai_client(self, model_name: str):
        """Get AI client for the specified model."""
        if model_name == "ChatGPT":
            return OpenAIClientWithRetry(
                api_key=settings.OPENAI_API_KEY,
                model_name=settings.OPENAI_MODEL,
                timeout=settings.AI_REQUEST_TIMEOUT,
                max_retries=settings.MAX_RETRIES,
                retry_delay=settings.RETRY_DELAY,
            )
        elif model_name == "Gemini":
            return GeminiClientWithRetry(
                api_key=settings.GOOGLE_API_KEY,
                model_name=settings.GOOGLE_MODEL,
                timeout=settings.AI_REQUEST_TIMEOUT,
                max_retries=settings.MAX_RETRIES,
                retry_delay=settings.RETRY_DELAY,
            )
        # TODO: Add other models (Claude, Perplexity)
        else:
            raise ValueError(f"Unsupported model: {model_name}")

    def _analyze_mention(self, text: str, brand_name: str) -> tuple:
        """
        Analyze if and where the brand is mentioned in the response.

        Returns: (is_mentioned, mention_rank, mention_context)
        """
        # Simple case-insensitive search
        text_lower = text.lower()
        brand_lower = brand_name.lower()

        if brand_lower not in text_lower:
            return False, None, None

        # Find position/rank in list if present
        # Look for numbered lists (1., 2., etc.)
        lines = text.split("\n")
        for i, line in enumerate(lines):
            if brand_lower in line.lower():
                # Try to extract rank from numbered list
                match = re.match(r"^\s*(\d+)\.", line)
                if match:
                    rank = int(match.group(1))
                    return True, rank, line.strip()
                else:
                    return True, i + 1, line.strip()

        # If not in a list, just mentioned
        return True, None, text[:200]  # First 200 chars as context

    def _analyze_citations(self, text: str, domain: Optional[str]) -> tuple:
        """
        Analyze if the brand's domain is cited in the response.

        Returns: (is_cited, citation_urls)
        """
        if not domain:
            return False, []

        # Find URLs in text
        url_pattern = r"https?://(?:www\.)?([^\s]+)"
        urls = re.findall(url_pattern, text)

        # Check if any URL contains the brand domain
        cited_urls = [url for url in urls if domain.replace("www.", "") in url]

        return len(cited_urls) > 0, cited_urls

    def _analyze_representation(
        self, text: str, brand_name: str, positioning: Optional[str]
    ) -> tuple:
        """
        Analyze how the brand is represented in the response.

        Returns: (representation_score, description_text, sentiment)
        """
        # Simple heuristic for now
        # In production, would use NLP/LLM to analyze
        text_lower = text.lower()
        brand_lower = brand_name.lower()

        if brand_lower not in text_lower:
            return 0, None, None

        # Extract sentence containing brand
        sentences = text.split(".")
        brand_sentence = next(
            (s for s in sentences if brand_lower in s.lower()), None
        )

        if not brand_sentence:
            return 1, None, "neutral"

        # Simple sentiment analysis
        positive_words = ["best", "top", "excellent", "quality", "premium", "trusted"]
        negative_words = ["cheap", "poor", "bad", "worst", "avoid"]

        sentence_lower = brand_sentence.lower()
        has_positive = any(word in sentence_lower for word in positive_words)
        has_negative = any(word in sentence_lower for word in negative_words)

        if has_positive and not has_negative:
            return 3, brand_sentence.strip(), "positive"
        elif has_negative:
            return 1, brand_sentence.strip(), "negative"
        else:
            return 2, brand_sentence.strip(), "neutral"
