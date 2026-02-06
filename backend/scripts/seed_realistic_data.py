"""
Seed realistic evaluation data into the GEO Dashboard database.
Uses carefully crafted mock data that mirrors real AI brand mention patterns.
No API calls needed — pure data generation based on industry knowledge.
"""

import sqlite3
import json
import random
from uuid import uuid4
from datetime import datetime, timezone, timedelta

DB_PATH = "geo_dashboard.db"

# ── Realistic brand profiles ────────────────────────────────────────────
# Based on actual kids fashion brand AI visibility patterns
BRAND_PROFILES = {
    "Carter's": {"visibility": 0.85, "citation": 0.35, "reputation": 2.8, "intent": 0.90, "type": "Top Pick"},
    "Primary": {"visibility": 0.55, "citation": 0.45, "reputation": 2.7, "intent": 0.70, "type": "Premium Pick"},
    "Hanna Andersson": {"visibility": 0.60, "citation": 0.40, "reputation": 2.9, "intent": 0.65, "type": "Quality Pick"},
    "Tea Collection": {"visibility": 0.45, "citation": 0.30, "reputation": 2.6, "intent": 0.55, "type": "Niche Favorite"},
    "H&M Kids": {"visibility": 0.75, "citation": 0.25, "reputation": 2.3, "intent": 0.80, "type": "Popular Choice"},
    "Cat & Jack": {"visibility": 0.70, "citation": 0.20, "reputation": 2.4, "intent": 0.85, "type": "Best Value"},
    "Janie and Jack": {"visibility": 0.40, "citation": 0.35, "reputation": 2.8, "intent": 0.45, "type": "Luxury Pick"},
    "OshKosh B'Gosh": {"visibility": 0.65, "citation": 0.30, "reputation": 2.5, "intent": 0.75, "type": "Classic Choice"},
    "PatPat": {"visibility": 0.50, "citation": 0.15, "reputation": 2.0, "intent": 0.60, "type": "Budget Pick"},
    "Boden Mini": {"visibility": 0.35, "citation": 0.40, "reputation": 2.7, "intent": 0.40, "type": "Premium"},
    "Zara Kids": {"visibility": 0.55, "citation": 0.10, "reputation": 2.2, "intent": 0.65, "type": "Trendy Pick"},
    "Gap Kids": {"visibility": 0.60, "citation": 0.20, "reputation": 2.3, "intent": 0.70, "type": "Popular Choice"},
    "Old Navy Kids": {"visibility": 0.50, "citation": 0.15, "reputation": 2.1, "intent": 0.75, "type": "Budget Choice"},
    "Nike Kids": {"visibility": 0.45, "citation": 0.30, "reputation": 2.6, "intent": 0.50, "type": "Athletic Pick"},
    "Gymboree": {"visibility": 0.25, "citation": 0.10, "reputation": 2.0, "intent": 0.30, "type": "Comeback"},
    "The Children's Place": {"visibility": 0.55, "citation": 0.15, "reputation": 2.2, "intent": 0.65, "type": "Value Pick"},
    "Petit Bateau": {"visibility": 0.20, "citation": 0.25, "reputation": 2.8, "intent": 0.25, "type": "European Luxury"},
    "Maisonette": {"visibility": 0.30, "citation": 0.35, "reputation": 2.7, "intent": 0.35, "type": "Curated Selection"},
    "MORI": {"visibility": 0.15, "citation": 0.20, "reputation": 2.5, "intent": 0.20, "type": "Organic Premium"},
    "Pact": {"visibility": 0.35, "citation": 0.30, "reputation": 2.6, "intent": 0.45, "type": "Sustainable"},
    "Patagonia Kids": {"visibility": 0.30, "citation": 0.40, "reputation": 2.9, "intent": 0.35, "type": "Outdoor Premium"},
    "Mini Boden": {"visibility": 0.25, "citation": 0.30, "reputation": 2.6, "intent": 0.30, "type": "British Classic"},
    "Hatley": {"visibility": 0.15, "citation": 0.15, "reputation": 2.3, "intent": 0.20, "type": "Playful"},
    "Rockets of Awesome": {"visibility": 0.10, "citation": 0.10, "reputation": 2.1, "intent": 0.15, "type": "Subscription"},
    "Primary Clothing": {"visibility": 0.10, "citation": 0.05, "reputation": 1.8, "intent": 0.10, "type": "Basics"},
    "Colored Organics": {"visibility": 0.08, "citation": 0.15, "reputation": 2.4, "intent": 0.10, "type": "Organic Niche"},
    "Monica + Andy": {"visibility": 0.12, "citation": 0.20, "reputation": 2.5, "intent": 0.15, "type": "Organic Baby"},
    "Magnetic Me": {"visibility": 0.10, "citation": 0.10, "reputation": 2.2, "intent": 0.12, "type": "Innovative"},
    "Little Sleepies": {"visibility": 0.20, "citation": 0.15, "reputation": 2.4, "intent": 0.25, "type": "Sleep Specialist"},
    "KicKee Pants": {"visibility": 0.15, "citation": 0.15, "reputation": 2.5, "intent": 0.18, "type": "Bamboo Premium"},
}

POSITIVE_WORDS = ["best", "top", "excellent", "quality", "trusted", "popular", "leading", "recommended", "favorite", "premium"]
NEUTRAL_WORDS = ["offers", "provides", "features", "includes", "available"]
NEGATIVE_WORDS = ["expensive", "limited", "basic"]

INTENT_CATEGORIES = [
    "general_discovery", "brand_comparison", "price_value", "sustainability",
    "age_specific", "safety_quality", "style_trend", "occasion_specific",
    "sizing_fit", "specialty_needs", "material_quality", "use_case_activity"
]


def generate_response(brand_name, profile, prompt_text, intent):
    """Generate a realistic AI-like response snippet."""
    vis = profile["visibility"]
    mentioned = random.random() < vis
    
    if not mentioned:
        # Generate response that doesn't mention this brand
        other_brands = random.sample([b for b in BRAND_PROFILES if b != brand_name], min(3, len(BRAND_PROFILES)-1))
        return {
            "text": f"For {intent.replace('_', ' ')}, I'd recommend checking out {', '.join(other_brands[:2])} and {other_brands[2] if len(other_brands) > 2 else 'similar brands'}. They offer great options for kids clothing.",
            "mentioned": False,
            "rank": None,
            "context": None,
            "cited": False,
            "rep_score": 0,
            "sentiment": None,
        }
    
    # Brand is mentioned
    rank = random.choices([1, 2, 3, 4, 5, 6], weights=[20, 25, 20, 15, 12, 8])[0]
    if vis > 0.7:
        rank = min(rank, random.choice([1, 2, 3]))
    
    cited = random.random() < profile["citation"]
    
    rep = profile["reputation"]
    rep_score = max(0, min(3, int(rep + random.gauss(0, 0.3))))
    
    sentiment_map = {3: "positive", 2: "neutral", 1: "negative", 0: "neutral"}
    sentiment = sentiment_map.get(rep_score, "neutral")
    
    descriptor = random.choice(POSITIVE_WORDS) if rep_score >= 2 else random.choice(NEUTRAL_WORDS)
    context = f"{rank}. {brand_name} - A {descriptor} choice for kids clothing, known for {random.choice(['quality fabrics', 'affordable prices', 'trendy designs', 'organic materials', 'durability', 'comfort'])}."
    
    return {
        "text": f"Here are some {intent.replace('_', ' ')} recommendations:\n{context}\n...",
        "mentioned": True,
        "rank": rank,
        "context": context,
        "cited": cited,
        "rep_score": rep_score,
        "sentiment": sentiment,
    }


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

    # Get prompts
    c.execute("SELECT id, text, intent_category FROM prompts ORDER BY intent_category, id")
    prompts = [dict(r) for r in c.fetchall()]
    print(f"Found {len(prompts)} prompts")

    # Clean old evaluation data
    c.execute("DELETE FROM evaluation_results")
    c.execute("DELETE FROM score_cards")
    c.execute("DELETE FROM evaluation_runs")
    conn.commit()
    print("Cleaned old data")

    # Create evaluation run
    run_id = str(uuid4())
    now = datetime.now(timezone.utc)
    c.execute("""INSERT INTO evaluation_runs 
        (id, workspace_id, name, models_used, prompt_count, status, progress, started_at, completed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (run_id, ws_id, "Full Evaluation - Gemini 2.0 Flash",
         json.dumps(["Gemini"]), len(prompts), "completed", 100,
         (now - timedelta(hours=1)).isoformat(), now.isoformat(), now.isoformat()))
    conn.commit()

    total_results = 0

    for brand in brands:
        profile = BRAND_PROFILES.get(brand["name"])
        if not profile:
            # Generate a default low-visibility profile for unknown brands
            profile = {"visibility": random.uniform(0.05, 0.25), "citation": random.uniform(0.05, 0.15),
                       "reputation": random.uniform(1.5, 2.3), "intent": random.uniform(0.1, 0.3), "type": "Unknown"}

        results = []
        for prompt in prompts:
            result = generate_response(brand["name"], profile, prompt["text"], prompt["intent_category"])
            
            c.execute("""INSERT INTO evaluation_results
                (id, evaluation_run_id, brand_id, prompt_id, model_name,
                 prompt_text, intent_category, response_text, response_time_ms,
                 is_mentioned, mention_rank, mention_context,
                 is_cited, citation_urls,
                 representation_score, description_text, sentiment,
                 evaluated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (str(uuid4()), run_id, brand["id"], prompt["id"], "Gemini",
                 prompt["text"], prompt["intent_category"], result["text"],
                 random.randint(800, 3500),
                 1 if result["mentioned"] else 0, result["rank"], result["context"],
                 1 if result["cited"] else 0, json.dumps([]),
                 result["rep_score"], result["context"], result["sentiment"],
                 now.isoformat()))
            results.append(result)
            total_results += 1

        # Calculate scores
        total = len(results)
        mentioned = [r for r in results if r["mentioned"]]
        cited = [r for r in results if r["cited"]]
        
        mention_rate = len(mentioned) / total if total else 0
        citation_rate = len(cited) / total if total else 0
        avg_rep = sum(r["rep_score"] for r in results) / total if total else 0
        
        intents_mentioned = set()
        all_intents = set()
        for i, r in enumerate(results):
            cat = prompts[i]["intent_category"]
            all_intents.add(cat)
            if r["mentioned"]:
                intents_mentioned.add(cat)
        intent_coverage = len(intents_mentioned) / len(all_intents) if all_intents else 0
        
        vis = int(mention_rate * 100)
        cit = int(citation_rate * 100)
        rep = int((avg_rep / 3) * 100)
        intent_score = int(intent_coverage * 100)
        composite = int(vis * 0.35 + cit * 0.25 + rep * 0.25 + intent_score * 0.15)
        
        avg_rank = None
        if mentioned:
            ranks = [r["rank"] for r in mentioned if r["rank"]]
            avg_rank = sum(ranks) / len(ranks) if ranks else None
        
        model_scores = json.dumps({"Gemini": {"score": vis, "mentions": len(mentioned)}})
        
        c.execute("""INSERT INTO score_cards
            (id, brand_id, evaluation_run_id, composite_score, visibility_score,
             citation_score, representation_score, intent_score,
             total_mentions, avg_rank, citation_rate, intent_coverage,
             model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (str(uuid4()), brand["id"], run_id, composite, vis, cit, rep, intent_score,
             len(mentioned), avg_rank, citation_rate, intent_coverage,
             model_scores, total, now.isoformat(), now.isoformat(), now.isoformat()))
        
        conn.commit()
        print(f"  {brand['name']:<35s} composite={composite:>3d} vis={vis:>3d} cit={cit:>3d} rep={rep:>3d} int={intent_score:>3d}")

    print(f"\n✅ Seeded {total_results} evaluation results for {len(brands)} brands")
    print(f"🎉 View at http://localhost:3000")
    conn.close()


if __name__ == "__main__":
    main()
