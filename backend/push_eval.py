#!/usr/bin/env python3
"""Push evaluation_results to Railway using copy_from for speed."""
import sqlite3, psycopg2, io, csv, sys

PG_URL = "postgresql://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"

sl = sqlite3.connect("geo_dashboard.db")
sl.row_factory = sqlite3.Row
pg = psycopg2.connect(PG_URL, connect_timeout=10)
cur = pg.cursor()

# Check current count
cur.execute("SELECT COUNT(*) FROM evaluation_results")
existing = cur.fetchone()[0]
print(f"Existing: {existing}")

if existing > 0:
    cur.execute("DELETE FROM evaluation_results")
    pg.commit()
    print("Cleared existing rows")

rows = sl.execute("SELECT * FROM evaluation_results").fetchall()
print(f"Local rows: {len(rows)}")

cols = ['id','evaluation_run_id','brand_id','prompt_id','model_name','prompt_text','intent_category','response_text','response_time_ms','is_mentioned','mention_rank','mention_context','is_cited','citation_urls','representation_score','description_text','sentiment','intent_fit_score','evaluated_at']

# Use StringIO + copy_from for bulk insert
buf = io.StringIO()
writer = csv.writer(buf, delimiter='\t', quoting=csv.QUOTE_NONE, escapechar='\\')

for r in rows:
    vals = []
    for c in cols:
        v = r[c]
        if v is None:
            vals.append('\\N')
        elif isinstance(v, bool) or (c in ('is_mentioned','is_cited') and isinstance(v, int)):
            vals.append('true' if v else 'false')
        else:
            s = str(v).replace('\\', '\\\\').replace('\t', '\\t').replace('\n', '\\n').replace('\r', '\\r')
            vals.append(s)
    buf.write('\t'.join(vals) + '\n')

buf.seek(0)
cur.copy_from(buf, 'evaluation_results', columns=cols, null='\\N')
pg.commit()

cur.execute("SELECT COUNT(*) FROM evaluation_results")
print(f"Final count: {cur.fetchone()[0]}")
pg.close()
print("Done!")
