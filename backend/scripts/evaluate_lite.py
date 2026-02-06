"""
Lightweight Gemini-only evaluation script.
Bypasses heavy ORM logging, uses direct sqlite3 + google.generativeai.
"""

import sys
import sqlite3
import time
import re
import json
from uuid import uuid4
from datetime import datetime, timezone

import google.generativeai as genai

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

# ── Config ──────────────────────────────────────────────────────────────
API_KEY = "AIzaSyCfPf5sSpWUUni9UJXhO4t_RLbJTE5qW50"
MODEL = "gemini-2.0-flash"
DB_PATH = "geo_dashboard.db"
RPM_LIMIT = 14  # stay under 15 RPM
PROMPTS_PER_BRAND = 20  # use 20 prompts

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel(MODEL)

# ── Helpers ─────────────────────────────────────────────────────────────

def analyze_mention(text: str, brand_name: str):
    text_lower = text.lower()
    brand_lower = brand_name.lower()
    if brand_lower not in text_lower:
        return False, None, None
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if brand_lower in line.lower():
            m = re.match(r"^\s*(\d+)\.", line)
            if m:
                return True, int(m.group(1)), line.strip()[:300]
            return True, i + 1, line.strip()[:300]
    return True, None, text[:200]


def analyze_citations(text: str, domain: str | None):
    if not domain:
        return False, []
    urls = re.findall(r"https?://(?:www\.)?([^\s\)]+)", text)
    cited = [u for u in urls if domain.replace("www.", "") in u]
    return len(cited) > 0, cited


def analyze_representation(text: str, brand_name: str, positioning: str | None):
    text_lower = text.lower()
    brand_lower = brand_name.lower()
    if brand_lower not in text_lower:
        return 0, None, None
    sentences = text.split(".")
    brand_sentence = next((s for s in sentences if brand_lower in s.lower()), None)
    if not brand_sentence:
        return 1, None, "neutral"
    positive = ["best", "top", "excellent", "quality", "premium", "trusted",
                "popular", "renowned", "leading", "favorite", "loved", "recommended"]
    negative = ["cheap", "poor", "bad", "worst", "avoid", "overpriced"]
    sl = brand_sentence.lower()
    has_pos = any(w in sl for w in positive)
    has_neg = any(w in sl for w in negative)
    if has_pos and not has_neg:
        return 3, brand_sentence.strip()[:300], "positive"
    elif has_neg:
        return 1, brand_sentence.strip()[:300], "negative"
    return 2, brand_sentence.strip()[:300], "neutral"


# ── Main ────────────────────────────────────────────────────────────────

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Get workspace
    c.execute("SELECT id FROM workspaces WHERE slug='demo' LIMIT 1")
    ws = c.fetchone()
    if not ws:
        print("ERROR: No demo workspace found")
        return
    ws_id = ws["id"]

    # Get brands
    c.execute("SELECT id, name, domain, positioning FROM brands WHERE workspace_id=?", (ws_id,))
    brands = [dict(r) for r in c.fetchall()]
    print(f"Found {len(brands)} brands")

    # Get prompts (first 20)
    c.execute("SELECT id, text, intent_category FROM prompts ORDER BY intent_category, id LIMIT ?",
              (PROMPTS_PER_BRAND,))
    prompts = [dict(r) for r in c.fetchall()]
    print(f"Using {len(prompts)} prompts")

    total_calls = len(brands) * len(prompts)
    print(f"Total API calls: {total_calls}")
    print(f"Estimated time: ~{total_calls * 5 // 60} minutes\n")

    # Create evaluation run
    run_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    c.execute("""INSERT INTO evaluation_runs 
        (id, workspace_id, name, models_used, prompt_count, status, progress, started_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (run_id, ws_id, "Full Eval - Gemini 2.0 Flash (lite)",
         json.dumps(["Gemini"]), len(prompts), "running", 0, now, now))
    conn.commit()
    print(f"Run ID: {run_id}\n")

    completed = 0
    call_times = []  # track timing for rate limiting
    errors = 0

    for bi, brand in enumerate(brands):
        brand_start = time.time()
        for pi, prompt in enumerate(prompts):
            # Rate limiting: ensure we don't exceed RPM
            now_ts = time.time()
            call_times = [t for t in call_times if now_ts - t < 60]
            if len(call_times) >= RPM_LIMIT:
                wait = 60 - (now_ts - call_times[0]) + 0.5
                if wait > 0:
                    print(f"   ⏳ Rate limit, waiting {wait:.0f}s...")
                    time.sleep(wait)

            # API call
            try:
                call_times.append(time.time())
                start = time.time()
                response = model.generate_content(
                    f"You are a helpful assistant. Provide accurate, factual information.\n\n{prompt['text']}"
                )
                resp_text = response.text if hasattr(response, 'text') else ""
                resp_time = int((time.time() - start) * 1000)
            except Exception as e:
                errors += 1
                resp_text = ""
                resp_time = 0
                print(f"   ❌ Error: {str(e)[:80]}")
                time.sleep(5)  # back off on error
                continue

            # Analyze
            is_mentioned, rank, context = analyze_mention(resp_text, brand["name"])
            is_cited, cited_urls = analyze_citations(resp_text, brand.get("domain"))
            rep_score, desc, sentiment = analyze_representation(
                resp_text, brand["name"], brand.get("positioning"))

            # Insert result
            c.execute("""INSERT INTO evaluation_results
                (id, evaluation_run_id, brand_id, prompt_id, model_name,
                 prompt_text, intent_category, response_text, response_time_ms,
                 is_mentioned, mention_rank, mention_context,
                 is_cited, citation_urls,
                 representation_score, description_text, sentiment,
                 evaluated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (str(uuid4()), run_id, brand["id"], prompt["id"], "Gemini",
                 prompt["text"], prompt["intent_category"], resp_text, resp_time,
                 1 if is_mentioned else 0, rank, context,
                 1 if is_cited else 0, json.dumps(cited_urls),
                 rep_score, desc, sentiment,
                 datetime.now(timezone.utc).isoformat()))

            completed += 1

        # Commit after each brand
        conn.commit()

        # Calculate brand score
        c.execute("""SELECT * FROM evaluation_results 
            WHERE evaluation_run_id=? AND brand_id=?""", (run_id, brand["id"]))
        results = [dict(r) for r in c.fetchall()]
        
        if results:
            total = len(results)
            mentioned = [r for r in results if r["is_mentioned"]]
            cited = [r for r in results if r["is_cited"]]
            
            mention_rate = len(mentioned) / total
            citation_rate = len(cited) / total
            avg_rep = sum(r["representation_score"] for r in results) / total
            
            intents_mentioned = set(r["intent_category"] for r in mentioned)
            all_intents = set(r["intent_category"] for r in results)
            intent_coverage = len(intents_mentioned) / len(all_intents) if all_intents else 0
            
            vis = int(mention_rate * 100)
            cit = int(citation_rate * 100)
            rep = int((avg_rep / 3) * 100)
            intent = int(intent_coverage * 100)
            composite = int(vis * 0.35 + cit * 0.25 + rep * 0.25 + intent * 0.15)
            
            avg_rank = None
            if mentioned:
                ranks = [r["mention_rank"] for r in mentioned if r["mention_rank"]]
                avg_rank = sum(ranks) / len(ranks) if ranks else None
            
            model_scores = json.dumps({"Gemini": {"score": vis, "mentions": len(mentioned)}})
            
            now_str = datetime.now(timezone.utc).isoformat()
            c.execute("""INSERT INTO score_cards
                (id, brand_id, evaluation_run_id, composite_score, visibility_score,
                 citation_score, representation_score, intent_score,
                 total_mentions, avg_rank, citation_rate, intent_coverage,
                 model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (str(uuid4()), brand["id"], run_id, composite, vis, cit, rep, intent,
                 len(mentioned), avg_rank, citation_rate, intent_coverage,
                 model_scores, total, now_str, now_str, now_str))
            conn.commit()

        elapsed = time.time() - brand_start
        pct = int((bi + 1) / len(brands) * 100)
        mention_pct = int(mention_rate * 100) if results else 0
        print(f"  [{bi+1}/{len(brands)}] {brand['name']:<30s} "
              f"vis={mention_pct}% cit={int(citation_rate*100)}% "
              f"composite={composite} ({elapsed:.0f}s)")

        # Update progress
        c.execute("UPDATE evaluation_runs SET progress=? WHERE id=?", (pct, run_id))
        conn.commit()

    # Complete
    c.execute("""UPDATE evaluation_runs SET status='completed', progress=100, 
        completed_at=? WHERE id=?""", (datetime.now(timezone.utc).isoformat(), run_id))
    conn.commit()

    # Print final summary
    print("\n" + "=" * 80)
    print("✅ EVALUATION COMPLETE!")
    print("=" * 80)
    print(f"Errors: {errors}")
    
    c.execute("""SELECT b.name, s.composite_score, s.visibility_score, s.citation_score,
        s.representation_score, s.intent_score
        FROM score_cards s JOIN brands b ON b.id = s.brand_id
        WHERE s.evaluation_run_id = ?
        ORDER BY s.composite_score DESC""", (run_id,))
    
    print(f"\n{'Brand':<35s} {'Comp':>5s} {'Vis':>5s} {'Cit':>5s} {'Rep':>5s} {'Int':>5s}")
    print("-" * 60)
    for row in c.fetchall():
        print(f"  {row[0]:<33s} {row[1]:>4d} {row[2]:>4d} {row[3]:>4d} {row[4]:>4d} {row[5]:>4d}")

    conn.close()
    print(f"\n🎉 View results at http://localhost:3000")


if __name__ == "__main__":
    main()
