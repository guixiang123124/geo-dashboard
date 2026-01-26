"""
Evaluate all 30 brands in the database with ChatGPT and Gemini.
This will generate scores for all brands.
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


async def evaluate_all_brands():
    """Evaluate ALL 30 brands with both ChatGPT and Gemini."""
    print("\n" + "=" * 80)
    print("FULL EVALUATION - ALL 30 BRANDS")
    print("=" * 80 + "\n")

    async with AsyncSessionLocal() as db:
        try:
            # Get workspace
            workspace_result = await db.execute(
                select(Workspace).where(Workspace.slug == "demo")
            )
            workspace = workspace_result.scalar_one()
            print(f"✓ Workspace: {workspace.name}")
            print(f"  ID: {workspace.id}\n")

            # Get ALL brands
            brands_result = await db.execute(
                select(Brand).where(Brand.workspace_id == workspace.id)
            )
            brands = brands_result.scalars().all()
            brand_ids = [b.id for b in brands]

            print(f"✓ Found {len(brands)} brands:")
            for i, b in enumerate(brands, 1):
                print(f"   {i:2d}. {b.name:<40s} ({b.category[:50]})")

            # Get prompts (use a representative sample, not all 100+)
            prompts_result = await db.execute(
                select(Prompt)
                .order_by(Prompt.intent_category, Prompt.id)
                .limit(20)  # 20 diverse prompts is enough for good scoring
            )
            prompts = prompts_result.scalars().all()
            prompt_ids = [p.id for p in prompts]

            print(f"\n✓ Selected {len(prompts)} prompts across categories:")
            categories = {}
            for p in prompts:
                if p.intent_category not in categories:
                    categories[p.intent_category] = 0
                categories[p.intent_category] += 1
            for cat, count in categories.items():
                print(f"   - {cat}: {count} prompts")

            # Create evaluation run
            run = EvaluationRun(
                id=str(uuid4()),
                workspace_id=workspace.id,
                name="Full Evaluation - All 30 Brands (ChatGPT + Gemini)",
                models_used=["ChatGPT", "Gemini"],
                prompt_count=len(prompts),
                status="pending",
                progress=0,
            )
            db.add(run)
            await db.commit()

            print(f"\n✓ Created evaluation run ID: {run.id}")

            # Calculate total API calls
            total_calls = len(brands) * len(prompts) * 2  # 2 models
            estimated_minutes = total_calls * 2 / 60  # ~2 seconds per call

            print("\n" + "-" * 80)
            print("EVALUATION PARAMETERS:")
            print(f"  Brands:       {len(brands)}")
            print(f"  Prompts:      {len(prompts)}")
            print(f"  Models:       2 (ChatGPT, Gemini)")
            print(f"  Total calls:  {total_calls}")
            print(f"  Estimated:    ~{estimated_minutes:.1f} minutes")
            print("-" * 80 + "\n")

            # Ask for confirmation
            response = input("Start evaluation? This will use API credits. (yes/no): ")
            if response.lower() != 'yes':
                print("\nEvaluation cancelled.")
                return

            print("\n🚀 Starting evaluation...\n")

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

            print("\n" + "=" * 80)
            print("✅ EVALUATION COMPLETE!")
            print("=" * 80)
            print(f"Status:     {run.status}")
            print(f"Progress:   {run.progress}%")
            print(f"Started:    {run.started_at}")
            print(f"Completed:  {run.completed_at}")

            if run.completed_at and run.started_at:
                duration = (run.completed_at - run.started_at).total_seconds()
                print(f"Duration:   {duration/60:.1f} minutes")

            print("\n✓ Scores have been generated for all 30 brands")
            print("✓ Visit http://localhost:3001/brands to see results\n")

        except Exception as e:
            print(f"\n❌ Error during evaluation: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    print("\nGEO Insights - Full Brand Evaluation Script")
    print("This will evaluate all 30 brands with ChatGPT and Gemini\n")

    asyncio.run(evaluate_all_brands())
