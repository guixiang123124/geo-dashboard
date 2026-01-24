"""
Test script to run multi-model evaluation with OpenAI and Gemini.
"""

import asyncio
import sys
from pathlib import Path
from uuid import uuid4

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from src.core.database import AsyncSessionLocal
from src.models.workspace import Workspace
from src.models.brand import Brand
from src.models.prompt import Prompt
from src.models.evaluation import EvaluationRun
from src.services.evaluation_service import EvaluationService


async def run_multimodel_evaluation():
    """Run a test evaluation with both ChatGPT and Gemini."""
    print("[TEST] Starting multi-model evaluation (OpenAI + Gemini)...")

    async with AsyncSessionLocal() as db:
        try:
            # Get demo workspace
            workspace_result = await db.execute(
                select(Workspace).where(Workspace.slug == "demo")
            )
            workspace = workspace_result.scalar_one()
            print(f"[OK] Found workspace: {workspace.name} (ID: {workspace.id})")

            # Get 3 brands for evaluation
            brands_result = await db.execute(
                select(Brand).where(Brand.workspace_id == workspace.id).limit(3)
            )
            brands = brands_result.scalars().all()
            brand_ids = [b.id for b in brands]
            print(f"[OK] Selected {len(brands)} brands:")
            for b in brands:
                print(f"   - {b.name}")

            # Get 10 prompts from different categories (diverse sample)
            prompts_result = await db.execute(
                select(Prompt)
                .order_by(Prompt.intent_category, Prompt.id)
                .limit(10)
            )
            prompts = prompts_result.scalars().all()
            prompt_ids = [p.id for p in prompts]
            print(f"\n[OK] Selected {len(prompts)} prompts from diverse categories:")
            categories = {}
            for p in prompts:
                if p.intent_category not in categories:
                    categories[p.intent_category] = 0
                categories[p.intent_category] += 1
            for cat, count in categories.items():
                print(f"   - {cat}: {count} prompts")

            # Create evaluation run for both models
            run = EvaluationRun(
                id=str(uuid4()),
                workspace_id=workspace.id,
                name="Multi-Model Test - OpenAI + Gemini",
                models_used=["ChatGPT", "Gemini"],
                prompt_count=len(prompts),
                status="pending",
                progress=0,
            )
            db.add(run)
            await db.commit()
            print(f"\n[OK] Created evaluation run: {run.id}")

            # Calculate total API calls
            total_calls = len(brands) * len(prompts) * 2  # 2 models
            print(
                f"\n[TEST] Running evaluation: {len(brands)} brands x {len(prompts)} prompts x 2 models = {total_calls} API calls"
            )
            print("[TEST] This will take approximately 3-5 minutes...")
            print("[TEST] Progress will be shown below:\n")

            # Run evaluation
            service = EvaluationService(db)
            await service.run_evaluation(
                run_id=run.id,
                brand_ids=brand_ids,
                models=["ChatGPT", "Gemini"],
                prompt_ids=prompt_ids,
            )

            # Refresh run to get updated status
            await db.refresh(run)
            print(f"\n[SUCCESS] Multi-model evaluation completed!")
            print(f"   - Status: {run.status}")
            print(f"   - Progress: {run.progress}%")
            print(f"   - Started: {run.started_at}")
            print(f"   - Completed: {run.completed_at}")
            print(
                f"   - Duration: {(run.completed_at - run.started_at).total_seconds():.1f} seconds"
            )

            # Get results summary
            from sqlalchemy import func
            from src.models.evaluation import EvaluationResult

            total_results = await db.execute(
                select(func.count(EvaluationResult.id)).where(
                    EvaluationResult.evaluation_run_id == run.id
                )
            )
            total = total_results.scalar()

            mentioned_results = await db.execute(
                select(func.count(EvaluationResult.id)).where(
                    EvaluationResult.evaluation_run_id == run.id,
                    EvaluationResult.is_mentioned == True,
                )
            )
            mentioned = mentioned_results.scalar()

            cited_results = await db.execute(
                select(func.count(EvaluationResult.id)).where(
                    EvaluationResult.evaluation_run_id == run.id,
                    EvaluationResult.is_cited == True,
                )
            )
            cited = cited_results.scalar()

            print(f"\n[INFO] Overall Results Summary:")
            print(f"   - Total evaluations: {total}")
            print(
                f"   - Brands mentioned: {mentioned} ({int(mentioned/total*100) if total > 0 else 0}%)"
            )
            print(
                f"   - Brands cited: {cited} ({int(cited/total*100) if total > 0 else 0}%)"
            )

            # Get per-model breakdown
            print(f"\n[INFO] Per-Model Breakdown:")
            for model_name in ["ChatGPT", "Gemini"]:
                model_total = await db.execute(
                    select(func.count(EvaluationResult.id)).where(
                        EvaluationResult.evaluation_run_id == run.id,
                        EvaluationResult.model_name == model_name,
                    )
                )
                m_total = model_total.scalar()

                model_mentioned = await db.execute(
                    select(func.count(EvaluationResult.id)).where(
                        EvaluationResult.evaluation_run_id == run.id,
                        EvaluationResult.model_name == model_name,
                        EvaluationResult.is_mentioned == True,
                    )
                )
                m_mentioned = model_mentioned.scalar()

                model_cited = await db.execute(
                    select(func.count(EvaluationResult.id)).where(
                        EvaluationResult.evaluation_run_id == run.id,
                        EvaluationResult.model_name == model_name,
                        EvaluationResult.is_cited == True,
                    )
                )
                m_cited = model_cited.scalar()

                print(f"\n   {model_name}:")
                print(f"   - Total responses: {m_total}")
                print(
                    f"   - Mention rate: {m_mentioned}/{m_total} ({int(m_mentioned/m_total*100) if m_total > 0 else 0}%)"
                )
                print(
                    f"   - Citation rate: {m_cited}/{m_total} ({int(m_cited/m_total*100) if m_total > 0 else 0}%)"
                )

            # Get score cards
            from src.models.scorecard import ScoreCard

            scores_result = await db.execute(
                select(ScoreCard, Brand)
                .join(Brand, ScoreCard.brand_id == Brand.id)
                .where(ScoreCard.evaluation_run_id == run.id)
            )
            scores = scores_result.all()

            print(f"\n[INFO] GEO Scores by Brand:")
            for score, brand in scores:
                print(f"\n   {brand.name}:")
                print(f"   - Composite Score: {score.composite_score}/100")
                print(f"   - Visibility: {score.visibility_score}/100")
                print(f"   - Citation: {score.citation_score}/100")
                print(f"   - Representation: {score.representation_score}/100")
                print(f"   - Intent: {score.intent_score}/100")
                print(f"   - Total Mentions: {score.total_mentions}")
                print(f"   - Model Scores: {score.model_scores}")

            print(f"\n[NEXT] View full results:")
            print(f"   - Run ID: {run.id}")
            print(f"   - Start API server: uvicorn src.api.main:app --reload")
            print(f"   - Visit: http://localhost:8000/docs")
            print(
                f"   - Endpoint: GET /api/v1/evaluations/{run.id}/results"
            )

        except Exception as e:
            print(f"\n[ERROR] Multi-model evaluation failed: {e}")
            import traceback

            traceback.print_exc()
            raise


if __name__ == "__main__":
    asyncio.run(run_multimodel_evaluation())
