"""
Script to seed the database with initial data from JSON files.
"""

import asyncio
import json
import sys
from pathlib import Path
from uuid import uuid4

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.core.database import AsyncSessionLocal, init_db
from src.models.workspace import Workspace
from src.models.brand import Brand
from src.models.prompt import Prompt


async def load_json(filepath: str) -> dict:
    """Load JSON file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


async def create_demo_workspace(db) -> str:
    """Create a demo workspace."""
    # Use fixed ID that matches frontend DEFAULT_WORKSPACE_ID
    workspace = Workspace(
        id="ws-demo-001",
        name="Demo Workspace",
        slug="demo",
        api_key=f"demo-{uuid4()}",
        is_active=True,
    )
    db.add(workspace)
    await db.flush()
    print(f"[OK] Created workspace: {workspace.name} (ID: {workspace.id})")
    return workspace.id


async def seed_prompts(db) -> None:
    """Seed prompts from intent_pool.json."""
    data_dir = Path(__file__).parent.parent.parent / "data"
    intent_pool = await load_json(data_dir / "intent_pool.json")

    prompt_count = 0
    for intent_category in intent_pool["intents"]:
        category = intent_category["category"]
        weight = intent_category.get("weight", 5)

        for prompt_text in intent_category["prompts"]:
            prompt = Prompt(
                id=str(uuid4()),
                text=prompt_text,
                intent_category=category,
                weight=weight,
            )
            db.add(prompt)
            prompt_count += 1

    await db.flush()
    print(f"[OK] Created {prompt_count} prompts across {len(intent_pool['intents'])} categories")


async def seed_brands(db, workspace_id: str) -> None:
    """Seed brands from brands_database.json."""
    data_dir = Path(__file__).parent.parent.parent / "data"
    brands_db = await load_json(data_dir / "brands_database.json")

    brand_count = 0
    for brand_data in brands_db["brands"]:
        brand = Brand(
            id=str(uuid4()),
            workspace_id=workspace_id,
            name=brand_data["name"],
            slug=brand_data["id"],
            domain=brand_data.get("domain"),
            category=brand_data.get("positioning", "Kids Fashion"),
            positioning=brand_data.get("positioning"),
            price_tier=brand_data.get("price_tier", "mid-range"),
            target_age_range=", ".join(brand_data.get("target_age_range", [])),
            target_keywords=brand_data.get("keywords", []),
            competitors=brand_data.get("competitors", []),
            extra_data={"attributes": brand_data.get("attributes", [])},
        )
        db.add(brand)
        brand_count += 1

    await db.flush()
    print(f"[OK] Created {brand_count} brands")


async def seed_database():
    """Main seed function."""
    print("[SEED] Starting database seed...")

    # Initialize database (create tables if they don't exist)
    print("[SEED] Initializing database tables...")
    await init_db()
    print("[OK] Database tables created")

    async with AsyncSessionLocal() as db:
        try:
            # Create demo workspace
            workspace_id = await create_demo_workspace(db)

            # Seed prompts (global, not workspace-specific)
            await seed_prompts(db)

            # Seed brands (workspace-specific)
            await seed_brands(db, workspace_id)

            # Commit all changes
            await db.commit()

            print("\n[SUCCESS] Database seeded successfully!")
            print(f"\n[INFO] Demo Workspace Details:")
            print(f"   - Workspace ID: {workspace_id}")
            print(f"   - Use this ID for API requests")
            print(f"\n[NEXT] You can now run the API server:")
            print(f"   uvicorn src.api.main:app --reload")

        except Exception as e:
            await db.rollback()
            print(f"\n[ERROR] Error seeding database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
