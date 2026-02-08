#!/usr/bin/env python3
"""Seed all brands to Railway via API."""
import json, sqlite3, time, urllib.request, urllib.error

API = "https://geo-insights-api-production.up.railway.app/api/v1"
WS = "ws-demo-001"
conn = sqlite3.connect("geo_dashboard.db")
conn.row_factory = sqlite3.Row
brands = conn.execute("SELECT * FROM brands").fetchall()

print(f"Seeding {len(brands)} brands...")
ok = 0
for i, b in enumerate(brands):
    data = {"name": b["name"], "slug": b["slug"], "domain": b["domain"] or "", "category": b["category"] or "kids_fashion", "positioning": b["positioning"] or "", "price_tier": b["price_tier"] or ""}
    req = urllib.request.Request(f"{API}/brands/?workspace_id={WS}", data=json.dumps(data).encode(), headers={"Content-Type": "application/json"}, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        ok += 1
        print(f"  ✅ [{i+1}] {b['name']}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if e.code == 409 or "duplicate" in body.lower():
            ok += 1
            print(f"  ⏭️ [{i+1}] {b['name']} (exists)")
        else:
            print(f"  ❌ [{i+1}] {b['name']}: {e.code}")
    time.sleep(0.3)

# Verify
resp = urllib.request.urlopen(f"{API}/brands/?workspace_id={WS}&page=1&page_size=5")
total = json.loads(resp.read()).get("total", 0)
print(f"\nDone: {ok}/{len(brands)} brands. Total in DB: {total}")
conn.close()
