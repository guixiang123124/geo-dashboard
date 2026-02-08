#!/usr/bin/env python3
"""Seed Railway database via REST API using local SQLite data."""
import json
import sqlite3
import time
import urllib.request
import urllib.error

API = "https://geo-insights-api-production.up.railway.app/api/v1"
WS = "ws-demo-001"
DB = "geo_dashboard.db"

def post(path, data):
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "already" in body.lower() or "duplicate" in body.lower() or e.code == 409:
            return {"skipped": True}
        print(f"  ERROR {e.code}: {body[:300]}")
        return None

def get(path):
    with urllib.request.urlopen(f"{API}{path}", timeout=15) as resp:
        return json.loads(resp.read())

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row

# 1. Seed brands
brands = conn.execute("SELECT * FROM brands").fetchall()
print(f"=== Seeding {len(brands)} brands ===")
for i, b in enumerate(brands):
    extra = {}
    try:
        extra = json.loads(b["extra_data"]) if b["extra_data"] else {}
    except: pass
    
    result = post("/brands/", {
        "workspace_id": WS,
        "name": b["name"],
        "slug": b["slug"] or b["name"].lower().replace(" ", "-"),
        "domain": b["domain"] or "",
        "category": b["category"] or "kids_fashion",
        "positioning": b["positioning"] or "",
        "price_tier": b["price_tier"] or "",
        "target_age_range": b["target_age_range"] or "",
        "target_keywords": b["target_keywords"] or "[]",
        "competitors": b["competitors"] or "[]",
        "extra_data": extra,
    })
    status = "✅" if result else "❌"
    print(f"  {status} [{i+1}/{len(brands)}] {b['name']}")
    time.sleep(0.3)

# 2. Seed prompts
prompts = conn.execute("SELECT * FROM prompts").fetchall()
prompt_cols = [desc[0] for desc in conn.execute("PRAGMA table_info(prompts)").fetchall()]
print(f"\nPrompt columns: {[c[1] for c in conn.execute('PRAGMA table_info(prompts)').fetchall()]}")
print(f"\n=== Seeding {len(prompts)} prompts ===")
for i, p in enumerate(prompts):
    pdata = {"workspace_id": WS}
    # Map available columns
    for col in ["text", "category", "intent", "intent_category", "metadata"]:
        try:
            val = p[col]
            if col == "metadata":
                pdata[col] = json.loads(val) if val else {}
            elif val:
                pdata[col] = val
        except (IndexError, KeyError):
            pass
    
    if "text" not in pdata:
        # Try prompt_text
        try: pdata["text"] = p["prompt_text"]
        except: continue
    
    result = post("/prompts/", pdata)
    status = "✅" if result else "❌"
    if i % 10 == 0:
        print(f"  {status} [{i+1}/{len(prompts)}]")
    time.sleep(0.2)

# Verify
brands_result = get(f"/brands/?workspace_id={WS}&page=1&page_size=5")
print(f"\n=== Done ===")
print(f"Brands in Railway DB: {brands_result.get('total', 0)}")
print("🎉")
conn.close()
