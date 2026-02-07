"""
GEO Evaluation v2 — uses new google-genai library (fast, stable).
Reads API key from .env. Paid Tier 1 = 1500 RPM.
"""
import sys, os, sqlite3, time, re, json
from uuid import uuid4
from datetime import datetime, timezone

sys.stdout.reconfigure(line_buffering=True)
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from google import genai

API_KEY = os.environ.get("GOOGLE_API_KEY", "")
if not API_KEY:
    print("❌ No GOOGLE_API_KEY"); sys.exit(1)

client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.0-flash"
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'geo_dashboard.db')
MAX_RETRIES = 3

def call_gemini(prompt_text):
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.models.generate_content(
                model=MODEL,
                contents=f"You are a helpful shopping assistant. Provide accurate, detailed recommendations with specific brand names.\n\n{prompt_text}",
                config={"max_output_tokens": 1024, "temperature": 0.7}
            )
            return resp.text if resp.text else ""
        except Exception as e:
            err = str(e)
            if "429" in err:
                time.sleep(10 * (attempt + 1))
            else:
                print(f"      ⚠️ Retry {attempt+1}: {err[:60]}")
                time.sleep(3)
    return None

def analyze_mention(text, brand_name):
    if not text: return False, None, None
    tl, bl = text.lower(), brand_name.lower()
    parts = [p for p in bl.split() if len(p) > 3]
    found = bl in tl or any(p in tl for p in parts)
    if not found: return False, None, None
    for i, line in enumerate(text.split("\n")):
        if bl in line.lower() or any(p in line.lower() for p in parts):
            m = re.match(r"^\s*[\*\-]?\s*\*?\*?(\d+)[\.\)]", line)
            rank = int(m.group(1)) if m else i + 1
            return True, rank, line.strip()[:300]
    return True, None, text[:200]

def analyze_citations(text, domain):
    if not text or not domain: return False, []
    urls = re.findall(r"https?://[^\s\)\]]+", text)
    d = domain.replace("www.", "").lower()
    cited = [u for u in urls if d in u.lower()]
    return len(cited) > 0, cited

def analyze_representation(text, brand_name):
    if not text: return 0, None, None
    tl, bl = text.lower(), brand_name.lower()
    if bl not in tl: return 0, None, None
    sents = [s.strip() for s in re.split(r'[.!?]', text) if bl in s.lower()]
    if not sents: return 1, None, "neutral"
    s = sents[0]
    pos = ["best","top","excellent","quality","premium","trusted","popular","leading","favorite","loved","recommended","renowned","well-known","iconic","classic","durable","soft","organic","sustainable"]
    neg = ["cheap","poor","bad","worst","avoid","overpriced"]
    sl = s.lower()
    p = sum(1 for w in pos if w in sl)
    n = sum(1 for w in neg if w in sl)
    if p > n: return 3, s[:300], "positive"
    elif n > p: return 1, s[:300], "negative"
    return 2, s[:300], "neutral"

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT id FROM workspaces WHERE slug='demo' LIMIT 1")
    ws = c.fetchone()
    if not ws: print("❌ No demo workspace"); return
    ws_id = ws["id"]

    c.execute("SELECT id, name, domain, positioning FROM brands WHERE workspace_id=?", (ws_id,))
    brands = [dict(r) for r in c.fetchall()]
    c.execute("SELECT id, text, intent_category FROM prompts ORDER BY intent_category, id")
    prompts = [dict(r) for r in c.fetchall()]

    total = len(brands) * len(prompts)
    print(f"🚀 GEO Eval v2 (google-genai): {len(brands)} brands × {len(prompts)} prompts = {total} calls")
    print(f"⏱  Est: ~{total * 2 // 60} min (Tier 1 paid)\n")

    # Clean
    c.execute("DELETE FROM evaluation_results")
    c.execute("DELETE FROM score_cards")
    c.execute("DELETE FROM evaluation_runs")
    conn.commit()

    run_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    c.execute("""INSERT INTO evaluation_runs 
        (id, workspace_id, name, models_used, prompt_count, status, progress, started_at, created_at)
        VALUES (?,?,?,?,?,?,?,?,?)""",
        (run_id, ws_id, "Full Eval - Gemini 2.0 Flash (v2)", json.dumps(["Gemini"]), len(prompts), "running", 0, now, now))
    conn.commit()

    errors = 0
    successes = 0
    start_time = time.time()

    for bi, brand in enumerate(brands):
        brand_results = []
        for pi, prompt in enumerate(prompts):
            resp_text = call_gemini(prompt["text"])
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
                 prompt["text"], prompt["intent_category"], resp_text[:2000], 0,
                 1 if mentioned else 0, rank, context,
                 1 if cited else 0, json.dumps(cited_urls),
                 rep_score, desc, sentiment, datetime.now(timezone.utc).isoformat()))
            brand_results.append({"mentioned": mentioned, "cited": cited, "rep_score": rep_score, "rank": rank, "sentiment": sentiment})

        conn.commit()

        # Score calculation
        t = len(brand_results)
        if t == 0: continue
        ment = [r for r in brand_results if r["mentioned"]]
        cit_list = [r for r in brand_results if r["cited"]]
        mr = len(ment)/t; cr = len(cit_list)/t
        avg_rep = sum(r["rep_score"] for r in brand_results)/t
        intent_cats = set(); mentioned_cats = set()
        for i, r in enumerate(brand_results):
            cat = prompts[i]["intent_category"] if i < len(prompts) else "unknown"
            intent_cats.add(cat)
            if r["mentioned"]: mentioned_cats.add(cat)
        ic = len(mentioned_cats)/len(intent_cats) if intent_cats else 0
        vis = int(mr*100); cit_s = int(cr*100); rep_s = int((avg_rep/3)*100); int_s = int(ic*100)
        comp = int(vis*0.35 + cit_s*0.25 + rep_s*0.25 + int_s*0.15)
        ranks = [r["rank"] for r in ment if r["rank"]]
        avg_rank = sum(ranks)/len(ranks) if ranks else None
        ms = json.dumps({"Gemini": {"score": vis, "mentions": len(ment)}})
        now_str = datetime.now(timezone.utc).isoformat()

        c.execute("""INSERT INTO score_cards
            (id, brand_id, evaluation_run_id, composite_score, visibility_score,
             citation_score, representation_score, intent_score,
             total_mentions, avg_rank, citation_rate, intent_coverage,
             model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (str(uuid4()), brand["id"], run_id, comp, vis, cit_s, rep_s, int_s,
             len(ment), avg_rank, cr, ic, ms, t, now_str, now_str, now_str))
        conn.commit()

        elapsed = time.time() - start_time
        rate = successes / elapsed * 60 if elapsed > 0 else 0
        pct = int((bi+1)/len(brands)*100)
        c.execute("UPDATE evaluation_runs SET progress=? WHERE id=?", (pct, run_id))
        conn.commit()
        print(f"  [{bi+1:>2}/{len(brands)}] {brand['name']:<30s} comp={comp:>3} vis={vis:>3} cit={cit_s:>3} | ✅{successes} ❌{errors} ({rate:.0f}/min)")

    c.execute("UPDATE evaluation_runs SET status='completed', progress=100, completed_at=? WHERE id=?",
              (datetime.now(timezone.utc).isoformat(), run_id))
    conn.commit()

    total_time = time.time() - start_time
    print(f"\n{'='*70}")
    print(f"✅ DONE in {total_time/60:.1f} min | {successes} ok, {errors} err | {successes/total_time*60:.0f} calls/min")
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
