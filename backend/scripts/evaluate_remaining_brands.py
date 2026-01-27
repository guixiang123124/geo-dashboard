"""
Evaluate the remaining 8 brands that failed due to MissingGreenlet error.
Only evaluates brands that don't have score cards yet.
"""

import asyncio
import sys
from pathlib import Path
from uuid import uuid4

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, func
from src.core.database import AsyncSessionLocal
from src.models.workspace import Workspace
from src.models.brand import Brand
from src.models.prompt import Prompt
from src.models.evaluation import EvaluationRun, EvaluationResult
from src.models.scorecard import ScoreCard
from src.services.evaluation_service import EvaluationService


async def evaluate_remaining():
    """Evaluate brands that don't have score cards yet."""
    print("\n" + "=" * 80)
    print("GEO INSIGHTS - COMPLETE REMAINING EVALUATIONS")
    print("=" * 80 + "\n")

    async with AsyncSessionLocal() as db:
        try:
            # Get workspace
            workspace_result = await db.execute(
                select(Workspace).where(Workspace.slug == "demo")
            )
            workspace = workspace_result.scalar_one()

            # Find brands WITHOUT score cards
            all_brands_result = await db.execute(
                select(Brand).where(Brand.workspace_id == workspace.id)
            )
            all_brands = all_brands_result.scalars().all()

            scored_brand_ids_result = await db.execute(
                select(ScoreCard.brand_id).distinct()
            )
            scored_brand_ids = {
                row[0] for row in scored_brand_ids_result.fetchall()
            }

            remaining_brands = [
                b for b in all_brands if b.id not in scored_brand_ids
            ]
            remaining_ids = [b.id for b in remaining_brands]

            if not remaining_brands:
                print("All brands already have score cards!")
                return

            print(f"Found {len(remaining_brands)} brands without score cards:")
            for i, b in enumerate(remaining_brands, 1):
                print(f"   {i}. {b.name}")

            # Get the same 20 prompts used in original evaluation
            prompts_result = await db.execute(
                select(Prompt)
                .order_by(Prompt.intent_category, Prompt.id)
                .limit(20)
            )
            prompts = prompts_result.scalars().all()
            prompt_ids = [p.id for p in prompts]

            total_calls = len(remaining_brands) * len(prompts) * 1
            print(f"\nPlan: {len(remaining_brands)} brands x {len(prompts)} prompts x 1 model = {total_calls} API calls")
            print(f"Cost: $0 (Gemini free tier)\n")

            # Create a new evaluation run for these remaining brands
            run = EvaluationRun(
                id=str(uuid4()),
                workspace_id=workspace.id,
                name="Remaining Brands - Gemini 2.0 Flash",
                models_used=["Gemini"],
                prompt_count=len(prompts),
                status="pending",
                progress=0,
            )
            db.add(run)
            await db.commit()

            print(f"Evaluation run ID: {run.id}")
            print("Starting evaluation...\n")

            # Run evaluation
            service = EvaluationService(db)
            await service.run_evaluation(
                run_id=run.id,
                brand_ids=remaining_ids,
                models=["Gemini"],
                prompt_ids=prompt_ids,
            )

            # Refresh run
            await db.refresh(run)

            print("\n" + "=" * 80)
            print("REMAINING EVALUATION COMPLETE!")
            print("=" * 80)
            print(f"Status:    {run.status}")
            print(f"Progress:  {run.progress}%")

            if run.completed_at and run.started_at:
                duration = (run.completed_at - run.started_at).total_seconds()
                print(f"Duration:  {duration/60:.1f} minutes")

            # Print new score cards
            new_scores_result = await db.execute(
                select(ScoreCard).where(ScoreCard.evaluation_run_id == run.id)
            )
            new_scores = new_scores_result.scalars().all()

            if new_scores:
                print(f"\nNew GEO Scores ({len(new_scores)} brands):")
                print(f"{'Brand':<35s} {'Composite':>10s} {'Visibility':>11s} {'Citation':>9s} {'Represent':>10s} {'Intent':>7s}")
                print("-" * 85)

                sorted_scores = sorted(
                    new_scores, key=lambda s: s.composite_score, reverse=True
                )
                for score in sorted_scores:
                    brand_result = await db.execute(
                        select(Brand).where(Brand.id == score.brand_id)
                    )
                    brand = brand_result.scalar_one()
                    print(
                        f"  {brand.name:<33s} {score.composite_score:>8.1f} "
                        f"{score.visibility_score:>10.1f} {score.citation_score:>8.1f} "
                        f"{score.representation_score:>9.1f} {score.intent_score:>6.1f}"
                    )

            # Print ALL brand scores (combined)
            print(f"\n{'=' * 85}")
            print("ALL BRAND SCORES (Combined)")
            print(f"{'=' * 85}")

            all_scores_result = await db.execute(select(ScoreCard))
            all_scores = all_scores_result.scalars().all()

            if all_scores:
                print(f"{'Brand':<35s} {'Composite':>10s} {'Visibility':>11s} {'Citation':>9s} {'Represent':>10s} {'Intent':>7s}")
                print("-" * 85)

                sorted_all = sorted(
                    all_scores, key=lambda s: s.composite_score, reverse=True
                )
                for score in sorted_all:
                    brand_result = await db.execute(
                        select(Brand).where(Brand.id == score.brand_id)
                    )
                    brand = brand_result.scalar_one()
                    print(
                        f"  {brand.name:<33s} {score.composite_score:>8.1f} "
                        f"{score.visibility_score:>10.1f} {score.citation_score:>8.1f} "
                        f"{score.representation_score:>9.1f} {score.intent_score:>6.1f}"
                    )

            print(f"\nTotal brands scored: {len(all_scores)}/30")
            print(f"View results at http://localhost:3000/brands\n")

        except Exception as e:
            print(f"\nError: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    print("GEO Insights - Completing Remaining Brand Evaluations")
    print("Model: Gemini 2.0 Flash (free tier)\n")
    asyncio.run(evaluate_remaining())
