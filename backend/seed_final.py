#!/usr/bin/env python3
"""Final seed: push evaluation_results + score_cards using correct Railway brand/prompt IDs."""
import sqlite3, json, uuid, sys
import psycopg2, psycopg2.extras

PG_URL = "postgresql://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"
LOCAL_DB = "geo_dashboard.db"

def main():
    # Connect
    pg = psycopg2.connect(PG_URL)
    pg.autocommit = False
    cur = pg.cursor()
    
    sq = sqlite3.connect(LOCAL_DB)
    sq.row_factory = sqlite3.Row
    
    # Check what's already in Railway
    cur.execute("SELECT COUNT(*) FROM brands")
    brand_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM prompts")
    prompt_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM evaluation_results")
    er_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM score_cards")
    sc_count = cur.fetchone()[0]
    print(f"Railway DB: {brand_count} brands, {prompt_count} prompts, {er_count} eval_results, {sc_count} score_cards")
    
    if brand_count == 0:
        print("ERROR: No brands in Railway. Run push_to_railway.py first for workspace+brands+prompts.")
        sys.exit(1)
    
    if er_count >= 3600:
        print("Already have 3600+ eval results. Checking score_cards...")
        if sc_count >= 30:
            print("Already complete! Nothing to do.")
            sys.exit(0)
    
    # Build name→ID mappings from Railway
    cur.execute("SELECT id, name FROM brands")
    railway_brands = {r[1]: r[0] for r in cur.fetchall()}
    
    cur.execute("SELECT id, text FROM prompts")
    railway_prompts = {r[1]: r[0] for r in cur.fetchall()}
    
    # Build local name→ID mappings
    local_brands = {r["name"]: r["id"] for r in sq.execute("SELECT id, name FROM brands").fetchall()}
    local_prompts = {r["text"]: r["id"] for r in sq.execute("SELECT id, text FROM prompts").fetchall()}
    
    # Brand ID mapping: local_id → railway_id
    brand_map = {}
    for name, local_id in local_brands.items():
        if name in railway_brands:
            brand_map[local_id] = railway_brands[name]
    
    # Prompt ID mapping: local_id → railway_id
    prompt_map = {}
    for text, local_id in local_prompts.items():
        if text in railway_prompts:
            prompt_map[local_id] = railway_prompts[text]
    
    print(f"Mapped {len(brand_map)}/{len(local_brands)} brands, {len(prompt_map)}/{len(local_prompts)} prompts")
    
    # Create evaluation_run if needed
    cur.execute("SELECT COUNT(*) FROM evaluation_runs")
    if cur.fetchone()[0] == 0:
        run_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO evaluation_runs (id, workspace_id, name, models_used, prompt_count, status, progress, started_at, completed_at, created_at)
            VALUES (%s, 'ws-demo-001', 'Gemini Flash Evaluation', '["gemini-2.0-flash"]', 120, 'completed', 100, NOW(), NOW(), NOW())
        """, (run_id,))
        print(f"Created evaluation_run: {run_id}")
    else:
        cur.execute("SELECT id FROM evaluation_runs LIMIT 1")
        run_id = cur.fetchone()[0]
        print(f"Using existing evaluation_run: {run_id}")
    
    # Push evaluation_results if needed
    if er_count < 3600:
        # Clear existing
        cur.execute("DELETE FROM evaluation_results")
        print("Cleared old eval results")
        
        results = sq.execute("SELECT * FROM evaluation_results").fetchall()
        rows = []
        skipped = 0
        for r in results:
            r = dict(r)
            new_brand = brand_map.get(r["brand_id"])
            new_prompt = prompt_map.get(r["prompt_id"])
            if not new_brand or not new_prompt:
                skipped += 1
                continue
            # Handle citation_urls - ensure it's valid JSON string
            citation_urls = r.get("citation_urls", "[]")
            if isinstance(citation_urls, str):
                try:
                    json.loads(citation_urls)
                except:
                    citation_urls = "[]"
            else:
                citation_urls = json.dumps(citation_urls) if citation_urls else "[]"
            
            rows.append((
                str(uuid.uuid4()), run_id, new_brand, new_prompt,
                r["model_name"], r["prompt_text"], r["intent_category"],
                r["response_text"], r["response_time_ms"],
                bool(r["is_mentioned"]), r.get("mention_rank"),
                r.get("mention_context"), bool(r["is_cited"]),
                citation_urls, r["representation_score"],
                r.get("description_text"), r.get("sentiment"),
                r.get("intent_fit_score"), r["evaluated_at"]
            ))
        
        print(f"Inserting {len(rows)} eval results (skipped {skipped})...")
        
        # Batch insert
        for i in range(0, len(rows), 200):
            batch = rows[i:i+200]
            psycopg2.extras.execute_batch(cur, """
                INSERT INTO evaluation_results 
                (id, evaluation_run_id, brand_id, prompt_id, model_name, prompt_text,
                 intent_category, response_text, response_time_ms, is_mentioned, mention_rank,
                 mention_context, is_cited, citation_urls, representation_score, description_text,
                 sentiment, intent_fit_score, evaluated_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, batch)
            print(f"  ... {min(i+200, len(rows))}/{len(rows)}")
        
        pg.commit()
        print(f"✅ Inserted {len(rows)} evaluation_results")
    
    # Push score_cards if needed
    if sc_count < 30:
        cur.execute("DELETE FROM score_cards")
        
        scores = sq.execute("SELECT * FROM score_cards").fetchall()
        rows = []
        for s in scores:
            s = dict(s)
            new_brand = brand_map.get(s["brand_id"])
            if not new_brand:
                continue
            model_scores = s.get("model_scores", "{}")
            if isinstance(model_scores, str):
                try:
                    json.loads(model_scores)
                except:
                    model_scores = "{}"
            else:
                model_scores = json.dumps(model_scores) if model_scores else "{}"
            
            rows.append((
                str(uuid.uuid4()), new_brand, run_id,
                s["composite_score"], s["visibility_score"], s["citation_score"],
                s["representation_score"], s["intent_score"], s["total_mentions"],
                s.get("avg_rank"), s["citation_rate"], s["intent_coverage"],
                model_scores, s["evaluation_count"],
                s.get("last_evaluation_date"), s["created_at"], s["updated_at"]
            ))
        
        psycopg2.extras.execute_batch(cur, """
            INSERT INTO score_cards
            (id, brand_id, evaluation_run_id, composite_score, visibility_score, citation_score,
             representation_score, intent_score, total_mentions, avg_rank, citation_rate,
             intent_coverage, model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, rows)
        
        pg.commit()
        print(f"✅ Inserted {len(rows)} score_cards")
    
    # Verify
    cur.execute("SELECT COUNT(*) FROM evaluation_results")
    print(f"Final: {cur.fetchone()[0]} eval_results")
    cur.execute("SELECT COUNT(*) FROM score_cards")
    print(f"Final: {cur.fetchone()[0]} score_cards")
    
    # Quick check: get a brand score via the same query the API uses
    cur.execute("""
        SELECT b.name, sc.composite_score, sc.visibility_score 
        FROM score_cards sc JOIN brands b ON sc.brand_id = b.id 
        ORDER BY sc.composite_score DESC LIMIT 5
    """)
    print("\nTop 5 brands by composite score:")
    for r in cur.fetchall():
        print(f"  {r[0]}: composite={r[1]}, visibility={r[2]}")
    
    pg.close()
    sq.close()
    print("\n🎉 Done!")

if __name__ == "__main__":
    main()
