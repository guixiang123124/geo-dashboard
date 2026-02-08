#!/usr/bin/env python3
"""Push local SQLite data to Railway PostgreSQL."""
import sqlite3, json, time, uuid, sys, requests, psycopg2, psycopg2.extras

def log(msg, **kw):
    print(msg, flush=True)

DB_PATH = "/Users/xianggui/.openclaw/workspace/geo-dashboard/backend/geo_dashboard.db"
PG_URL = "postgresql://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"
API = "https://geo-insights-api-production.up.railway.app/api/v1"
WS_ID = "ws-demo-001"

def get_sqlite():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def step1_create_workspace():
    log("=== Step 1: Create workspace ===")
    pg = psycopg2.connect(PG_URL)
    cur = pg.cursor()
    cur.execute("""
        INSERT INTO workspaces (id, name, slug, api_key, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
    """, (WS_ID, 'Demo Workspace', 'demo', 'demo-key-001'))
    pg.commit()
    cur.close()
    pg.close()
    log("Workspace created/exists.")

def step2_seed_brands():
    log("=== Step 2: Seed brands ===")
    sq = get_sqlite()
    brands = [dict(r) for r in sq.execute("SELECT * FROM brands").fetchall()]
    sq.close()
    
    for i in range(0, len(brands), 5):
        batch = brands[i:i+5]
        for b in batch:
            payload = {
                "name": b["name"], "slug": b["slug"], "domain": b["domain"],
                "category": b["category"], "positioning": b["positioning"],
                "price_tier": b["price_tier"],
                "target_age_range": b.get("target_age_range"),
                "target_keywords": json.loads(b["target_keywords"]) if b.get("target_keywords") else [],
                "competitors": json.loads(b["competitors"]) if b.get("competitors") else [],
            }
            r = requests.post(f"{API}/brands?workspace_id={WS_ID}", json=payload)
            if r.status_code in (200, 201):
                log(f"  ✓ {b['name']}")
            else:
                log(f"  ✗ {b['name']}: {r.status_code} {r.text[:200]}")
        if i + 5 < len(brands):
            time.sleep(1)
    log(f"Done seeding {len(brands)} brands.")

def step3_seed_prompts():
    log("=== Step 3: Seed prompts ===")
    sq = get_sqlite()
    prompts = [dict(r) for r in sq.execute("SELECT * FROM prompts").fetchall()]
    sq.close()
    
    for i in range(0, len(prompts), 10):
        batch = prompts[i:i+10]
        for p in batch:
            payload = {
                "text": p["text"],
                "intent_category": p["intent_category"],
                "weight": p["weight"],
            }
            r = requests.post(f"{API}/prompts", json=payload)
            if r.status_code in (200, 201):
                log(f"  ✓ prompt {i}")
            else:
                log(f"  ✗ prompt: {r.status_code} {r.text[:200]}")
        if i + 10 < len(prompts):
            time.sleep(1)
    log(f"Done seeding {len(prompts)} prompts.")

def step4_build_mappings():
    log("=== Step 4: Build ID mappings ===")
    # Get brands from API
    r = requests.get(f"{API}/brands?workspace_id={WS_ID}&limit=100")
    data = r.json()
    api_brands = data.get("brands", data.get("items", data)) if isinstance(data, dict) else data
    brand_map = {}  # old_name -> new_id
    for b in api_brands:
        brand_map[b["name"]] = b["id"]
    log(f"  Mapped {len(brand_map)} brands")
    
    # Get prompts from API
    # Paginate prompts
    prompt_map = {}
    offset = 0
    while True:
        r = requests.get(f"{API}/prompts?limit=50&offset={offset}")
        data2 = r.json()
        api_prompts = data2.get("prompts", data2.get("items", data2)) if isinstance(data2, dict) else data2
        if not api_prompts:
            break
        for p in api_prompts:
            prompt_map[p["text"]] = p["id"]
        offset += len(api_prompts)
        if len(api_prompts) < 50:
            break
    log(f"  Mapped {len(prompt_map)} prompts")
    
    # Also build old_id -> new_id maps
    sq = get_sqlite()
    old_brands = {dict(r)["id"]: dict(r)["name"] for r in sq.execute("SELECT id, name FROM brands").fetchall()}
    old_prompts = {dict(r)["id"]: dict(r)["text"] for r in sq.execute("SELECT id, text FROM prompts").fetchall()}
    sq.close()
    
    brand_id_map = {old_id: brand_map[name] for old_id, name in old_brands.items() if name in brand_map}
    prompt_id_map = {old_id: prompt_map[text] for old_id, text in old_prompts.items() if text in prompt_map}
    
    log(f"  Brand ID map: {len(brand_id_map)}, Prompt ID map: {len(prompt_id_map)}")
    return brand_id_map, prompt_id_map

def step5_push_eval_data(brand_id_map, prompt_id_map):
    log("=== Step 5: Push evaluation data via psycopg2 ===")
    sq = get_sqlite()
    pg = psycopg2.connect(PG_URL)
    cur = pg.cursor()
    
    # Eval run
    run = dict(sq.execute("SELECT * FROM evaluation_runs LIMIT 1").fetchone())
    new_run_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO evaluation_runs (id, workspace_id, name, models_used, prompt_count, status, progress, error_message, started_at, completed_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (new_run_id, WS_ID, run["name"], run["models_used"], run["prompt_count"],
          run["status"], run["progress"], run["error_message"], run["started_at"], run["completed_at"], run["created_at"]))
    log(f"  ✓ evaluation_run: {new_run_id}")
    
    # Eval results - batch insert
    results = [dict(r) for r in sq.execute("SELECT * FROM evaluation_results").fetchall()]
    rows = []
    for r in results:
        new_brand = brand_id_map.get(r["brand_id"])
        new_prompt = prompt_id_map.get(r["prompt_id"])
        if not new_brand or not new_prompt:
            continue
        rows.append((str(uuid.uuid4()), new_run_id, new_brand, new_prompt, r["model_name"], r["prompt_text"],
              r["intent_category"], r["response_text"], r["response_time_ms"], bool(r["is_mentioned"]),
              r["mention_rank"], r["mention_context"], bool(r["is_cited"]), r["citation_urls"],
              r["representation_score"], r["description_text"], r["sentiment"], r["intent_fit_score"],
              r["evaluated_at"]))
    # Insert in batches of 100
    for i in range(0, len(rows), 100):
        batch = rows[i:i+100]
        psycopg2.extras.execute_batch(cur, """
            INSERT INTO evaluation_results (id, evaluation_run_id, brand_id, prompt_id, model_name, prompt_text,
                intent_category, response_text, response_time_ms, is_mentioned, mention_rank, mention_context,
                is_cited, citation_urls, representation_score, description_text, sentiment, intent_fit_score, evaluated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, batch)
        log(f"  ... inserted {min(i+100, len(rows))}/{len(rows)} results")
    log(f"  ✓ evaluation_results: {len(rows)}")
    
    # Score cards
    scores = [dict(r) for r in sq.execute("SELECT * FROM score_cards").fetchall()]
    sc_count = 0
    for s in scores:
        new_brand = brand_id_map.get(s["brand_id"])
        if not new_brand:
            continue
        cur.execute("""
            INSERT INTO score_cards (id, brand_id, evaluation_run_id, composite_score, visibility_score,
                citation_score, representation_score, intent_score, total_mentions, avg_rank, citation_rate,
                intent_coverage, model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (str(uuid.uuid4()), new_brand, new_run_id, s["composite_score"], s["visibility_score"],
              s["citation_score"], s["representation_score"], s["intent_score"], s["total_mentions"],
              s["avg_rank"], s["citation_rate"], s["intent_coverage"], s["model_scores"],
              s["evaluation_count"], s["last_evaluation_date"], s["created_at"], s["updated_at"]))
        sc_count += 1
    log(f"  ✓ score_cards: {sc_count}")
    
    pg.commit()
    cur.close()
    pg.close()
    sq.close()
    return new_run_id

def step6_verify():
    log("=== Step 6: Verify ===")
    r = requests.get(f"{API}/brands?workspace_id={WS_ID}&limit=100")
    data = r.json()
    brands = data.get("brands", data.get("items", data)) if isinstance(data, dict) else data
    log(f"  Brands count: {len(brands)}")
    
    if brands:
        bid = brands[0]["id"]
        r2 = requests.get(f"{API}/scores/brand/{bid}/latest?workspace_id={WS_ID}")
        log(f"  Score for {brands[0]['name']}: {r2.status_code} {r2.text[:300]}")

if __name__ == "__main__":
    #step1_create_workspace()
    #step2_seed_brands()
    #step3_seed_prompts()
    brand_id_map, prompt_id_map = step4_build_mappings()
    step5_push_eval_data(brand_id_map, prompt_id_map)
    step6_verify()
    log("\n✅ All done!")
