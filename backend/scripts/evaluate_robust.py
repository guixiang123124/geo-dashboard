"""
Robust Gemini evaluation with retry logic and batch processing.
Reads API key from .env, never hardcoded.
"""
import sys, os, sqlite3, time, re, json, random
from uuid import uuid4
from datetime import datetime, timezone

sys.stdout.reconfigure(line_buffering=True)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

import google.generativeai as genai

API_KEY = os.environ.get("GOOGLE_API_KEY", "")
if not API_KEY:
    print("❌ No GOOGLE_API_KEY in .env"); sys.exit(1)

MODEL = "gemini-2.0-flash"
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'geo_dashboard.db')
RPM_LIMIT = 30  # Tier 1 paid plan supports 1500 RPM, we use 30 conservatively
MAX_RETRIES = 5
RETRY_DELAY = 5

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel(MODEL)

def call_gemini(prompt_text, retries=MAX_RETRIES):
    """Call Gemini with retry logic."""
    for attempt in range(retries):
        try:
            resp = model.generate_content(
                f"You are a helpful shopping assistant. Provide accurate, detailed recommendations.\n\n{prompt_text}",
                generation_config={"max_output_tokens": 1024, "temperature": 0.7},
                request_options={"timeout": 60}
            )
            return resp.text if hasattr(resp, 'text') else ""
        except Exception as e:
            err = str(e)
            if "429" in err:
                wait = 30 * (attempt + 1)
                print(f"      ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif "504" in err or "Deadline" in err:
                wait = RETRY_DELAY * (attempt + 1)
                print(f"      ⏳ Timeout, retry {attempt+1}/{retries} in {wait}s...")
                time.sleep(wait)
            else:
                print(f"      ❌ {err[:80]}")
                time.sleep(5)
    return None

def analyze_mention(text, brand_name):
    if not text: return False, None, None
    text_lower, brand_lower = text.lower(), brand_name.lower()
    # Also check common variations
    brand_parts = brand_lower.split()
    found = brand_lower in text_lower
    if not found and len(brand_parts) > 1:
        found = any(p in text_lower for p in brand_parts if len(p) > 3)
    if not found: return False, None, None
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if brand_lower in line.lower() or any(p in line.lower() for p in brand_parts if len(p) > 3):
            m = re.match(r"^\s*[\*\-]?\s*\*?\*?(\d+)\.", line)
            if m: return True, int(m.group(1)), line.strip()[:300]
            return True, i + 1, line.strip()[:300]
    return True, None, text[:200]

def analyze_citations(text, domain):
    if not text or not domain: return False, []
    urls = re.findall(r"https?://[^\s\)\]]+", text)
    d = domain.replace("www.", "").lower()
    cited = [u for u in urls if d in u.lower()]
    return len(cited) > 0, cited

def analyze_representation(text, brand_name):
    if not text: return 0, None, None
    text_lower, brand_lower = text.lower(), brand_name.lower()
    if brand_lower not in text_lower: return 0, None, None
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if brand_lower in s.lower()]
    if not sentences: return 1, None, "neutral"
    s = sentences[0]
    positive = ["best","top","excellent","quality","premium","trusted","popular","leading","favorite","loved","recommended","renowned","well-known","iconic","classic"]
    negative = ["cheap","poor","bad","worst","avoid","overpriced","controversial"]
    sl = s.lower()
    pos = sum(1 for w in positive if w in sl)
    neg = sum(1 for w in negative if w in sl)
    if pos > neg: return 3, s[:300], "positive"
    elif neg > pos: return 1, s[:300], "negative"
    return 2, s[:300], "neutral"

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT id FROM workspaces WHERE slug='demo' LIMIT 1")
    ws = c.fetchone()
    if not ws: print("ERROR: No demo workspace"); return
    ws_id = ws["id"]

    c.execute("SELECT id, name, domain, positioning FROM brands WHERE workspace_id=?", (ws_id,))
    brands = [dict(r) for r in c.fetchall()]
    
    c.execute("SELECT id, text, intent_category FROM prompts ORDER BY intent_category, id LIMIT 20")
    prompts = [dict(r) for r in c.fetchall()]

    print(f"🚀 Robust evaluation: {len(brands)} brands × {len(prompts)} prompts = {len(brands)*len(prompts)} calls")
    print(f"⏱  Estimated: ~{len(brands)*len(prompts)*5//60} min\n")

    # Clean old data
    c.execute("DELETE FROM evaluation_results")
    c.execute("DELETE FROM score_cards") 
    c.execute("DELETE FROM evaluation_runs")
    conn.commit()

    run_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    c.execute("""INSERT INTO evaluation_runs 
        (id, workspace_id, name, models_used, prompt_count, status, progress, started_at, created_at)
        VALUES (?,?,?,?,?,?,?,?,?)""",
        (run_id, ws_id, "Full Eval - Gemini 2.0 Flash", json.dumps(["Gemini"]), len(prompts), "running", 0, now, now))
    conn.commit()

    call_times = []
    errors = 0
    successes = 0

    for bi, brand in enumerate(brands):
        brand_results = []
        for pi, prompt in enumerate(prompts):
            # Rate limiting
            now_ts = time.time()
            call_times = [t for t in call_times if now_ts - t < 60]
            if len(call_times) >= RPM_LIMIT:
                wait = 60 - (now_ts - call_times[0]) + 1
                if wait > 0:
                    print(f"   ⏳ Rate limit pause {wait:.0f}s...")
                    time.sleep(wait)

            call_times.append(time.time())
            start = time.time()
            resp_text = call_gemini(prompt["text"])
            resp_time = int((time.time() - start) * 1000)

            if resp_text is None:
                errors += 1
                brand_results.append({"mentioned": False, "cited": False, "rep_score": 0, "rank": None, "sentiment": None})
                continue

            successes += 1
            mentioned, rank, context = analyze_mention(resp_text, brand["name"])
            cited, cited_urls = analyze_citations(resp_text, brand.get("domain"))
            rep_score, desc, sentiment = analyze_representation(resp_text, brand["name"])

            c.execute("""INSERT INTO evaluation_results
                (id, evaluation_run_id, brand_id, prompt_id, model_name,
                 prompt_text, intent_category, response_text, response_time_ms,
                 is_mentioned, mention_rank, mention_context,
                 is_cited, citation_urls,
                 representation_score, description_text, sentiment, evaluated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (str(uuid4()), run_id, brand["id"], prompt["id"], "Gemini",
                 prompt["text"], prompt["intent_category"], resp_text[:2000], resp_time,
                 1 if mentioned else 0, rank, context,
                 1 if cited else 0, json.dumps(cited_urls),
                 rep_score, desc, sentiment, datetime.now(timezone.utc).isoformat()))
            
            brand_results.append({"mentioned": mentioned, "cited": cited, "rep_score": rep_score, "rank": rank, "sentiment": sentiment})

        conn.commit()

        # Score
        total = len(brand_results)
        if total == 0: continue
        ment = [r for r in brand_results if r["mentioned"]]
        cit = [r for r in brand_results if r["cited"]]
        
        mr = len(ment)/total
        cr = len(cit)/total
        avg_rep = sum(r["rep_score"] for r in brand_results)/total
        
        # Intent coverage from actual prompts
        intent_cats = set()
        mentioned_cats = set()
        for i, r in enumerate(brand_results):
            cat = prompts[i]["intent_category"] if i < len(prompts) else "unknown"
            intent_cats.add(cat)
            if r["mentioned"]: mentioned_cats.add(cat)
        ic = len(mentioned_cats)/len(intent_cats) if intent_cats else 0

        vis = int(mr*100)
        cit_s = int(cr*100)
        rep_s = int((avg_rep/3)*100)
        int_s = int(ic*100)
        comp = int(vis*0.35 + cit_s*0.25 + rep_s*0.25 + int_s*0.15)

        avg_rank = None
        ranks = [r["rank"] for r in ment if r["rank"]]
        if ranks: avg_rank = sum(ranks)/len(ranks)

        ms = json.dumps({"Gemini": {"score": vis, "mentions": len(ment)}})
        now_str = datetime.now(timezone.utc).isoformat()

        c.execute("""INSERT INTO score_cards
            (id, brand_id, evaluation_run_id, composite_score, visibility_score,
             citation_score, representation_score, intent_score,
             total_mentions, avg_rank, citation_rate, intent_coverage,
             model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (str(uuid4()), brand["id"], run_id, comp, vis, cit_s, rep_s, int_s,
             len(ment), avg_rank, cr, ic, ms, total, now_str, now_str, now_str))
        conn.commit()

        pct = int((bi+1)/len(brands)*100)
        c.execute("UPDATE evaluation_runs SET progress=? WHERE id=?", (pct, run_id))
        conn.commit()
        print(f"  [{bi+1:>2}/{len(brands)}] {brand['name']:<30s} comp={comp:>3} vis={vis:>3} cit={cit_s:>3} rep={rep_s:>3} int={int_s:>3} | ✅{successes} ❌{errors}")

    c.execute("UPDATE evaluation_runs SET status='completed', progress=100, completed_at=? WHERE id=?",
              (datetime.now(timezone.utc).isoformat(), run_id))
    conn.commit()

    print(f"\n{'='*70}")
    print(f"✅ DONE! {successes} successes, {errors} errors")
    print(f"{'='*70}")
    
    c.execute("""SELECT b.name, s.composite_score, s.visibility_score, s.citation_score,
        s.representation_score, s.intent_score, s.total_mentions
        FROM score_cards s JOIN brands b ON b.id=s.brand_id
        WHERE s.evaluation_run_id=? ORDER BY s.composite_score DESC""", (run_id,))
    
    print(f"\n{'Brand':<30s} {'Comp':>5} {'Vis':>5} {'Cit':>5} {'Rep':>5} {'Int':>5} {'Ment':>5}")
    print("-"*65)
    for r in c.fetchall():
        print(f"  {r[0]:<28s} {r[1]:>4} {r[2]:>4} {r[3]:>4} {r[4]:>4} {r[5]:>4} {r[6]:>4}")

    conn.close()
    print(f"\n🎉 View at http://localhost:3000")

if __name__ == "__main__":
    main()
