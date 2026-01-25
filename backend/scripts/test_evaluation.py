"""
Test script to run a small evaluation with real OpenAI API.
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


async def run_test_evaluation():
    """Run a test evaluation with 2 brands and 5 prompts."""
    print("[TEST] Starting test evaluation...")

    async with AsyncSessionLocal() as db:
        try:
            # Get demo workspace
            workspace_result = await db.execute(
                select(Workspace).where(Workspace.slug == "demo")
            )
            workspace = workspace_result.scalar_one()
            print(f"[OK] Found workspace: {workspace.name} (ID: {workspace.id})")

            # Get 2 brands (Carter's and Primary)
            brands_result = await db.execute(
                select(Brand).where(Brand.workspace_id == workspace.id).limit(2)
            )
            brands = brands_result.scalars().all()
            brand_ids = [b.id for b in brands]
            print(f"[OK] Selected {len(brands)} brands:")
            for b in brands:
                print(f"   - {b.name}")

            # Get 5 prompts from different categories
            prompts_result = await db.execute(select(Prompt).limit(5))
            prompts = prompts_result.scalars().all()
            prompt_ids = [p.id for p in prompts]
            print(f"[OK] Selected {len(prompts)} prompts:")
            for p in prompts:
                print(f"   - [{p.intent_category}] {p.text[:60]}...")

            # Create evaluation run
            run = EvaluationRun(
                id=str(uuid4()),
                workspace_id=workspace.id,
                name="Test Evaluation - OpenAI",
                models_used=["ChatGPT"],
                prompt_count=len(prompts),
                status="pending",
                progress=0,
            )
            db.add(run)
            await db.commit()
            print(f"\n[OK] Created evaluation run: {run.id}")

            # Run evaluation
            print(
                f"\n[TEST] Running evaluation: {len(brands)} brands x {len(prompts)} prompts x 1 model = {len(brands) * len(prompts)} API calls"
            )
            print("[TEST] This will take approximately 1-2 minutes...\n")

            service = EvaluationService(db)
            await service.run_evaluation(
                run_id=run.id,
                brand_ids=brand_ids,
                models=["ChatGPT"],
                prompt_ids=prompt_ids,
            )

            # Refresh run to get updated status
            await db.refresh(run)
            print(f"\n[SUCCESS] Evaluation completed!")
            print(f"   - Status: {run.status}")
            print(f"   - Progress: {run.progress}%")
            print(f"   - Started: {run.started_at}")
            print(f"   - Completed: {run.completed_at}")

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

            print(f"\n[INFO] Results Summary:")
            print(f"   - Total evaluations: {total}")
            print(f"   - Brands mentioned: {mentioned} ({int(mentioned/total*100)}%)")
            print(f"   - Brands cited: {cited} ({int(cited/total*100) if total > 0 else 0}%)")

            # Get score cards
            from src.models.scorecard import ScoreCard

            scores_result = await db.execute(
                select(ScoreCard).where(ScoreCard.evaluation_run_id == run.id)
            )
            scores = scores_result.scalars().all()

            print(f"\n[INFO] GEO Scores:")
            for score in scores:
                brand_result = await db.execute(
                    select(Brand).where(Brand.id == score.brand_id)
                )
                brand = brand_result.scalar_one()
                print(f"\n   {brand.name}:")
                print(f"   - Composite Score: {score.composite_score}/100")
                print(f"   - Visibility: {score.visibility_score}/100")
                print(f"   - Citation: {score.citation_score}/100")
                print(f"   - Representation: {score.representation_score}/100")
                print(f"   - Intent: {score.intent_score}/100")

            print(f"\n[NEXT] View full results:")
            print(f"   - Run ID: {run.id}")
            print(f"   - Check database or start API server to view details")

        except Exception as e:
            print(f"\n[ERROR] Test evaluation failed: {e}")
            import traceback

            traceback.print_exc()
            raise


if __name__ == "__main__":
    asyncio.run(run_test_evaluation())
