"""
Evaluate all 30 brands using Gemini only.
Gemini 2.0 Flash - free tier (1,500 RPD, 15 RPM).
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


async def evaluate_all_brands_gemini():
    """Evaluate ALL brands with Gemini only."""
    print("\n" + "=" * 80)
    print("GEO INSIGHTS - GEMINI-ONLY EVALUATION")
    print("=" * 80 + "\n")

    async with AsyncSessionLocal() as db:
        try:
            # Get workspace
            workspace_result = await db.execute(
                select(Workspace).where(Workspace.slug == "demo")
            )
            workspace = workspace_result.scalar_one()
            print(f"Workspace: {workspace.name} (ID: {workspace.id})\n")

            # Get ALL brands
            brands_result = await db.execute(
                select(Brand).where(Brand.workspace_id == workspace.id)
            )
            brands = brands_result.scalars().all()
            brand_ids = [b.id for b in brands]

            print(f"Found {len(brands)} brands:")
            for i, b in enumerate(brands, 1):
                print(f"   {i:2d}. {b.name}")

            # Get prompts - use 20 representative prompts across categories
            prompts_result = await db.execute(
                select(Prompt)
                .order_by(Prompt.intent_category, Prompt.id)
                .limit(20)
            )
            prompts = prompts_result.scalars().all()
            prompt_ids = [p.id for p in prompts]

            print(f"\nSelected {len(prompts)} prompts across categories:")
            categories = {}
            for p in prompts:
                if p.intent_category not in categories:
                    categories[p.intent_category] = []
                categories[p.intent_category].append(p.text[:60])
            for cat, texts in categories.items():
                print(f"   [{cat}] ({len(texts)} prompts)")
                for t in texts:
                    print(f"      - {t}...")

            # Calculate costs
            num_models = 1
            total_calls = len(brands) * len(prompts) * num_models
            avg_tokens_per_call = 800  # ~200 input + ~600 output
            total_tokens = total_calls * avg_tokens_per_call

            print("\n" + "-" * 80)
            print("EVALUATION PLAN:")
            print(f"  Brands:           {len(brands)}")
            print(f"  Prompts:          {len(prompts)}")
            print(f"  Models:           1 (Gemini 2.0 Flash)")
            print(f"  Total API calls:  {total_calls}")
            print(f"  Est. tokens:      ~{total_tokens:,}")
            print(f"  Gemini free tier: 1,500 RPD / 15 RPM")
            print(f"  Cost:             $0 (within free tier)")
            print(f"  Rate limit:       15 RPM -> ~{total_calls // 15 + 1} min minimum")
            print("-" * 80 + "\n")

            # Create evaluation run
            run = EvaluationRun(
                id=str(uuid4()),
                workspace_id=workspace.id,
                name="Full Evaluation - All Brands (Gemini 2.0 Flash)",
                models_used=["Gemini"],
                prompt_count=len(prompts),
                status="pending",
                progress=0,
            )
            db.add(run)
            await db.commit()

            print(f"Evaluation run ID: {run.id}")
            print("\nStarting evaluation...\n")

            # Run evaluation - Gemini only
            service = EvaluationService(db)
            await service.run_evaluation(
                run_id=run.id,
                brand_ids=brand_ids,
                models=["Gemini"],
                prompt_ids=prompt_ids,
            )

            # Refresh run to get updated status
            await db.refresh(run)

            print("\n" + "=" * 80)
            print("EVALUATION COMPLETE!")
            print("=" * 80)
            print(f"Status:     {run.status}")
            print(f"Progress:   {run.progress}%")
            print(f"Started:    {run.started_at}")
            print(f"Completed:  {run.completed_at}")

            if run.completed_at and run.started_at:
                duration = (run.completed_at - run.started_at).total_seconds()
                print(f"Duration:   {duration/60:.1f} minutes")

            # Print results summary
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

            print(f"\nResults Summary:")
            print(f"  Total evaluations: {total}")
            if total > 0:
                print(f"  Brands mentioned:  {mentioned} ({int(mentioned/total*100)}%)")
                print(f"  Brands cited:      {cited} ({int(cited/total*100)}%)")

            # Print score cards
            scores_result = await db.execute(
                select(ScoreCard).where(ScoreCard.evaluation_run_id == run.id)
            )
            scores = scores_result.scalars().all()

            if scores:
                print(f"\nGEO Scores ({len(scores)} brands):")
                print(f"{'Brand':<35s} {'Composite':>10s} {'Visibility':>11s} {'Citation':>9s} {'Represent':>10s} {'Intent':>7s}")
                print("-" * 85)

                sorted_scores = sorted(scores, key=lambda s: s.composite_score, reverse=True)
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

            print(f"\nView results at http://localhost:3000/brands\n")

        except Exception as e:
            print(f"\nError during evaluation: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    print("\nGEO Insights - Gemini-Only Brand Evaluation")
    print("Model: Gemini 2.0 Flash (free tier)\n")

    asyncio.run(evaluate_all_brands_gemini())
