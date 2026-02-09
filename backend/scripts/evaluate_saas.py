#!/usr/bin/env python3
"""
Evaluate 30 SaaS & Technology brands across 120 prompts using Gemini 2.0 Flash.
Standalone script — seeds brands/prompts, then runs evaluations.

Usage:
    python backend/scripts/evaluate_saas.py              # seed + evaluate
    python backend/scripts/evaluate_saas.py --seed-only  # seed brands & prompts only
"""

import json, time, uuid, sys, os, re
from pathlib import Path
from datetime import datetime

import psycopg2
import psycopg2.extras

# ── Config ──────────────────────────────────────────────────────────────────
PG_URL = "postgresql://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"
GOOGLE_API_KEY = "AIzaSyAOXXFdMN7GfEwMS8qJEPnnk8JcGB8OkKg"
MODEL = "gemini-2.0-flash"
WORKSPACE_ID = "ws-demo-001"
CATEGORY = "SaaS & Technology"
DELAY_BETWEEN_CALLS = 0.3  # seconds (15 RPM safe)
MAX_RETRIES = 5

SCRIPT_DIR = Path(__file__).parent
BRANDS_FILE = SCRIPT_DIR / "saas_brands.json"
PROMPTS_FILE = SCRIPT_DIR / "saas_prompts.json"


# ── Helpers ─────────────────────────────────────────────────────────────────
def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def load_json(path):
    with open(path) as f:
        return json.load(f)


def connect_db():
    pg = psycopg2.connect(PG_URL)
    pg.autocommit = False
    return pg


# ── Seed brands & prompts ──────────────────────────────────────────────────
def seed_brands_and_prompts(cur):
    """Insert SaaS brands and prompts if not already present."""
    brands = load_json(BRANDS_FILE)
    prompts = load_json(PROMPTS_FILE)

    # Check existing SaaS brands
    cur.execute("SELECT name FROM brands WHERE category = %s", (CATEGORY,))
    existing_brands = {r[0] for r in cur.fetchall()}

    inserted_brands = 0
    brand_ids = {}
    for b in brands:
        if b["name"] in existing_brands:
            cur.execute("SELECT id FROM brands WHERE name = %s AND category = %s", (b["name"], CATEGORY))
            brand_ids[b["name"]] = cur.fetchone()[0]
            continue
        bid = str(uuid.uuid4())
        brand_ids[b["name"]] = bid
        cur.execute("""
            INSERT INTO brands (id, workspace_id, name, slug, domain, category, positioning, price_tier, target_age_range, target_keywords, competitors, extra_data, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (bid, WORKSPACE_ID, b["name"], slugify(b["name"]), b["domain"], CATEGORY,
              b["description"], "mid", "25-55", "[]", "[]", json.dumps({"sub_category": b["sub_category"]})))
        inserted_brands += 1

    # Check existing prompts by matching text
    cur.execute("SELECT text FROM prompts")
    existing_prompts = {r[0] for r in cur.fetchall()}

    inserted_prompts = 0
    prompt_ids = {}
    for p in prompts:
        if p["text"] in existing_prompts:
            cur.execute("SELECT id FROM prompts WHERE text = %s", (p["text"],))
            prompt_ids[p["text"]] = cur.fetchone()[0]
            continue
        pid = str(uuid.uuid4())
        prompt_ids[p["text"]] = pid
        cur.execute("""
            INSERT INTO prompts (id, text, intent_category, weight, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
        """, (pid, p["text"], p["intent_category"], p.get("weight", 1)))
        inserted_prompts += 1

    print(f"Seeded {inserted_brands} new brands, {inserted_prompts} new prompts (category: {CATEGORY})")
    return brands, prompts, brand_ids, prompt_ids


# ── Gemini evaluation ──────────────────────────────────────────────────────
def call_gemini(prompt_text: str, brand_name: str) -> dict:
    """Call Gemini and return parsed evaluation result."""
    from google import genai

    client = genai.Client(api_key=GOOGLE_API_KEY)

    system_prompt = f"""You are evaluating how well the AI-generated response represents the brand "{brand_name}".
Given the user prompt below, provide a natural response as if you were an AI assistant answering the question.
After your response, on a new line, provide a JSON evaluation block with these fields:
- is_mentioned: boolean (was {brand_name} mentioned?)
- rank_position: integer or null (position if mentioned in a list, null otherwise)
- sentiment: "positive", "neutral", or "negative" (sentiment toward {brand_name} if mentioned)
- description_accuracy_score: integer 1-10 (how accurately {brand_name} is described, 0 if not mentioned)

Format the evaluation block as: EVAL_JSON: {{...}}"""

    full_prompt = f"{system_prompt}\n\nUser question: {prompt_text}"

    for attempt in range(MAX_RETRIES):
        try:
            t0 = time.time()
            response = client.models.generate_content(model=MODEL, contents=full_prompt)
            elapsed_ms = int((time.time() - t0) * 1000)
            text = response.text or ""

            # Parse EVAL_JSON
            is_mentioned = brand_name.lower() in text.lower()
            rank_position = None
            sentiment = "neutral"
            accuracy = 0

            eval_match = re.search(r"EVAL_JSON:\s*(\{.*?\})", text, re.DOTALL)
            if eval_match:
                try:
                    ev = json.loads(eval_match.group(1))
                    is_mentioned = ev.get("is_mentioned", is_mentioned)
                    rank_position = ev.get("rank_position")
                    sentiment = ev.get("sentiment", "neutral")
                    accuracy = ev.get("description_accuracy_score", 0)
                except json.JSONDecodeError:
                    pass

            return {
                "response_text": text[:2000],
                "response_time_ms": elapsed_ms,
                "is_mentioned": is_mentioned,
                "rank_position": rank_position,
                "sentiment": sentiment,
                "description_accuracy_score": accuracy,
            }
        except Exception as e:
            wait = 2 ** attempt * 4
            print(f"    Gemini error (attempt {attempt+1}): {e}. Retrying in {wait}s...")
            time.sleep(wait)

    # All retries failed
    return {
        "response_text": "ERROR: All retries failed",
        "response_time_ms": 0,
        "is_mentioned": False,
        "rank_position": None,
        "sentiment": "neutral",
        "description_accuracy_score": 0,
    }


# ── Run evaluation ─────────────────────────────────────────────────────────
def run_evaluation(cur, brands, prompts, brand_ids, prompt_ids):
    """Evaluate all brand×prompt pairs and save results."""
    run_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO evaluation_runs (id, workspace_id, name, models_used, prompt_count, status, progress, started_at, created_at)
        VALUES (%s, %s, %s, %s, %s, 'running', 0, NOW(), NOW())
    """, (run_id, WORKSPACE_ID, f"SaaS & Tech Evaluation - Gemini Flash", json.dumps([MODEL]), len(prompts)))

    total = len(brands) * len(prompts)
    count = 0
    results_batch = []

    print(f"\nStarting evaluation: {len(brands)} brands × {len(prompts)} prompts = {total} calls")
    print(f"Estimated time: ~{total * DELAY_BETWEEN_CALLS / 60:.0f} minutes\n")

    for brand in brands:
        bname = brand["name"]
        bid = brand_ids[bname]
        for prompt in prompts:
            ptext = prompt["text"]
            pid = prompt_ids[ptext]
            count += 1

            result = call_gemini(ptext, bname)
            time.sleep(DELAY_BETWEEN_CALLS)

            results_batch.append((
                str(uuid.uuid4()), run_id, bid, pid,
                MODEL, ptext, prompt["intent_category"],
                result["response_text"], result["response_time_ms"],
                result["is_mentioned"], result["rank_position"],
                None,  # mention_context
                False,  # is_cited
                "[]",   # citation_urls
                result["description_accuracy_score"],
                None,  # description_text
                result["sentiment"],
                None,  # intent_fit_score
                datetime.utcnow().isoformat(),
            ))

            if count % 10 == 0:
                print(f"  [{count}/{total}] {bname} × {ptext[:50]}...")

            # Batch insert every 50
            if len(results_batch) >= 50:
                _insert_results(cur, results_batch)
                results_batch = []
                progress = int(count / total * 100)
                cur.execute("UPDATE evaluation_runs SET progress = %s WHERE id = %s", (progress, run_id))

    # Final batch
    if results_batch:
        _insert_results(cur, results_batch)

    cur.execute("UPDATE evaluation_runs SET status = 'completed', progress = 100, completed_at = NOW() WHERE id = %s", (run_id,))
    print(f"\n✅ Evaluation complete: {count} results saved. Run ID: {run_id}")
    return run_id


def _insert_results(cur, batch):
    psycopg2.extras.execute_batch(cur, """
        INSERT INTO evaluation_results
        (id, evaluation_run_id, brand_id, prompt_id, model_name, prompt_text,
         intent_category, response_text, response_time_ms, is_mentioned, mention_rank,
         mention_context, is_cited, citation_urls, representation_score, description_text,
         sentiment, intent_fit_score, evaluated_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, batch)


# ── Score cards ─────────────────────────────────────────────────────────────
def compute_score_cards(cur, run_id, brand_ids):
    """Compute composite score cards from evaluation results."""
    print("\nComputing score cards...")

    for bname, bid in brand_ids.items():
        cur.execute("""
            SELECT COUNT(*), 
                   SUM(CASE WHEN is_mentioned THEN 1 ELSE 0 END),
                   AVG(CASE WHEN mention_rank IS NOT NULL THEN mention_rank END),
                   SUM(CASE WHEN is_cited THEN 1 ELSE 0 END),
                   AVG(representation_score),
                   COUNT(DISTINCT intent_category)
            FROM evaluation_results
            WHERE brand_id = %s AND evaluation_run_id = %s
        """, (bid, run_id))
        row = cur.fetchone()
        if not row or row[0] == 0:
            continue

        total, mentions, avg_rank, citations, avg_repr, intent_cats = row
        mentions = mentions or 0
        citations = citations or 0
        avg_repr = avg_repr or 0
        avg_rank = avg_rank or 0

        visibility = min(100, int(mentions / total * 100)) if total > 0 else 0
        citation_rate = citations / total if total > 0 else 0
        citation_score = min(100, int(citation_rate * 100))
        repr_score = min(100, int(avg_repr * 10))
        intent_coverage = intent_cats / 10.0  # 10 intent categories
        intent_score = min(100, int(intent_coverage * 100))

        composite = int(visibility * 0.35 + citation_score * 0.2 + repr_score * 0.25 + intent_score * 0.2)

        cur.execute("""
            INSERT INTO score_cards
            (id, brand_id, evaluation_run_id, composite_score, visibility_score, citation_score,
             representation_score, intent_score, total_mentions, avg_rank, citation_rate,
             intent_coverage, model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW(),NOW())
        """, (str(uuid.uuid4()), bid, run_id, composite, visibility, citation_score,
              repr_score, intent_score, mentions, avg_rank, citation_rate,
              intent_coverage, json.dumps({MODEL: composite}), total))

    print(f"✅ Score cards created for {len(brand_ids)} brands")


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    seed_only = "--seed-only" in sys.argv

    pg = connect_db()
    cur = pg.cursor()

    brands, prompts, brand_ids, prompt_ids = seed_brands_and_prompts(cur)
    pg.commit()
    print(f"✅ Brands and prompts seeded to Railway DB")

    if seed_only:
        # Verify
        cur.execute("SELECT COUNT(*) FROM brands WHERE category = %s", (CATEGORY,))
        print(f"   Total SaaS brands in DB: {cur.fetchone()[0]}")
        cur.execute("SELECT COUNT(*) FROM prompts")
        print(f"   Total prompts in DB: {cur.fetchone()[0]}")
        pg.close()
        return

    # Run evaluation
    run_id = run_evaluation(cur, brands, prompts, brand_ids, prompt_ids)
    pg.commit()

    # Compute score cards
    compute_score_cards(cur, run_id, brand_ids)
    pg.commit()

    # Summary
    cur.execute("""
        SELECT b.name, sc.composite_score, sc.visibility_score
        FROM score_cards sc JOIN brands b ON sc.brand_id = b.id
        WHERE sc.evaluation_run_id = %s
        ORDER BY sc.composite_score DESC LIMIT 10
    """, (run_id,))
    print("\nTop 10 SaaS brands by composite score:")
    for r in cur.fetchall():
        print(f"  {r[0]}: composite={r[1]}, visibility={r[2]}")

    pg.close()
    print("\n🎉 Done!")


if __name__ == "__main__":
    main()
