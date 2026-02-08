#!/usr/bin/env python3
"""Push all data from local SQLite to Railway PostgreSQL."""
import sqlite3
import psycopg2
import json
import uuid
from datetime import datetime

PG_URL = "postgresql://postgres:dnWTSdArexNbCpgbJROtbPuDkeMMpgcq@ballast.proxy.rlwy.net:48249/railway"
SQLITE_PATH = "geo_dashboard.db"

def get_pg():
    return psycopg2.connect(PG_URL)

def get_sqlite():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables(pg):
    cur = pg.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS brands (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL REFERENCES workspaces(id),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        logo_url VARCHAR(512),
        category VARCHAR(100) NOT NULL,
        positioning TEXT,
        price_tier VARCHAR(50) NOT NULL,
        target_age_range VARCHAR(100),
        target_keywords JSONB NOT NULL DEFAULT '[]',
        competitors JSONB NOT NULL DEFAULT '[]',
        extra_data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS prompts (
        id VARCHAR(36) PRIMARY KEY,
        text TEXT NOT NULL,
        intent_category VARCHAR(100) NOT NULL,
        weight INTEGER NOT NULL DEFAULT 1,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS evaluation_runs (
        id VARCHAR(36) PRIMARY KEY,
        workspace_id VARCHAR(36) NOT NULL REFERENCES workspaces(id),
        name VARCHAR(255) NOT NULL,
        models_used JSONB NOT NULL DEFAULT '[]',
        prompt_count INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        progress INTEGER NOT NULL DEFAULT 100,
        error_message TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS evaluation_results (
        id VARCHAR(36) PRIMARY KEY,
        evaluation_run_id VARCHAR(36) NOT NULL REFERENCES evaluation_runs(id),
        brand_id VARCHAR(36) NOT NULL REFERENCES brands(id),
        prompt_id VARCHAR(36) NOT NULL REFERENCES prompts(id),
        model_name VARCHAR(50) NOT NULL,
        prompt_text TEXT NOT NULL,
        intent_category VARCHAR(100) NOT NULL,
        response_text TEXT NOT NULL,
        response_time_ms INTEGER NOT NULL DEFAULT 0,
        is_mentioned BOOLEAN NOT NULL DEFAULT FALSE,
        mention_rank INTEGER,
        mention_context TEXT,
        is_cited BOOLEAN NOT NULL DEFAULT FALSE,
        citation_urls JSONB NOT NULL DEFAULT '[]',
        representation_score INTEGER NOT NULL DEFAULT 0,
        description_text TEXT,
        sentiment VARCHAR(50),
        intent_fit_score FLOAT,
        evaluated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS score_cards (
        id VARCHAR(36) PRIMARY KEY,
        brand_id VARCHAR(36) NOT NULL REFERENCES brands(id),
        evaluation_run_id VARCHAR(36) REFERENCES evaluation_runs(id),
        composite_score INTEGER NOT NULL DEFAULT 0,
        visibility_score INTEGER NOT NULL DEFAULT 0,
        citation_score INTEGER NOT NULL DEFAULT 0,
        representation_score INTEGER NOT NULL DEFAULT 0,
        intent_score INTEGER NOT NULL DEFAULT 0,
        total_mentions INTEGER NOT NULL DEFAULT 0,
        avg_rank FLOAT,
        citation_rate FLOAT NOT NULL DEFAULT 0,
        intent_coverage FLOAT NOT NULL DEFAULT 0,
        model_scores JSONB NOT NULL DEFAULT '{}',
        evaluation_count INTEGER NOT NULL DEFAULT 0,
        last_evaluation_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    """)
    pg.commit()
    print("Tables created.")

def push_workspaces(pg, sl):
    rows = sl.execute("SELECT * FROM workspaces").fetchall()
    cur = pg.cursor()
    for r in rows:
        cur.execute("""INSERT INTO workspaces (id, name, slug, api_key, is_active, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (id) DO NOTHING""",
            (r['id'], r['name'], r['slug'], r['api_key'], bool(r['is_active']), r['created_at'], r['updated_at']))
    pg.commit()
    print(f"Pushed {len(rows)} workspaces")

def push_brands(pg, sl):
    rows = sl.execute("SELECT * FROM brands").fetchall()
    cur = pg.cursor()
    for r in rows:
        cur.execute("""INSERT INTO brands (id, workspace_id, name, slug, domain, logo_url, category, positioning, price_tier, target_age_range, target_keywords, competitors, extra_data, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (id) DO NOTHING""",
            (r['id'], r['workspace_id'], r['name'], r['slug'], r['domain'], r['logo_url'], r['category'], r['positioning'], r['price_tier'], r['target_age_range'], r['target_keywords'], r['competitors'], r['extra_data'], r['created_at'], r['updated_at']))
    pg.commit()
    print(f"Pushed {len(rows)} brands")

def push_prompts(pg, sl):
    rows = sl.execute("SELECT * FROM prompts").fetchall()
    cur = pg.cursor()
    for r in rows:
        cur.execute("""INSERT INTO prompts (id, text, intent_category, weight, description, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (id) DO NOTHING""",
            (r['id'], r['text'], r['intent_category'], r['weight'], r['description'], r['created_at'], r['updated_at']))
    pg.commit()
    print(f"Pushed {len(rows)} prompts")

def push_eval_runs(pg, sl):
    rows = sl.execute("SELECT * FROM evaluation_runs").fetchall()
    cur = pg.cursor()
    for r in rows:
        cur.execute("""INSERT INTO evaluation_runs (id, workspace_id, name, models_used, prompt_count, status, progress, error_message, started_at, completed_at, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (id) DO NOTHING""",
            (r['id'], r['workspace_id'], r['name'], r['models_used'], r['prompt_count'], r['status'], r['progress'], r['error_message'], r['started_at'], r['completed_at'], r['created_at']))
    pg.commit()
    print(f"Pushed {len(rows)} evaluation_runs")

def push_eval_results(pg, sl):
    rows = sl.execute("SELECT * FROM evaluation_results").fetchall()
    cur = pg.cursor()
    batch = []
    for i, r in enumerate(rows):
        batch.append((r['id'], r['evaluation_run_id'], r['brand_id'], r['prompt_id'], r['model_name'], r['prompt_text'], r['intent_category'], r['response_text'], r['response_time_ms'], bool(r['is_mentioned']), r['mention_rank'], r['mention_context'], bool(r['is_cited']), r['citation_urls'], r['representation_score'], r['description_text'], r['sentiment'], r['intent_fit_score'], r['evaluated_at']))
        if len(batch) >= 100:
            cur.executemany("""INSERT INTO evaluation_results (id, evaluation_run_id, brand_id, prompt_id, model_name, prompt_text, intent_category, response_text, response_time_ms, is_mentioned, mention_rank, mention_context, is_cited, citation_urls, representation_score, description_text, sentiment, intent_fit_score, evaluated_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", batch)
            pg.commit()
            print(f"  Inserted {i+1}/{len(rows)}")
            batch = []
    if batch:
        cur.executemany("""INSERT INTO evaluation_results (id, evaluation_run_id, brand_id, prompt_id, model_name, prompt_text, intent_category, response_text, response_time_ms, is_mentioned, mention_rank, mention_context, is_cited, citation_urls, representation_score, description_text, sentiment, intent_fit_score, evaluated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", batch)
        pg.commit()
    print(f"Pushed {len(rows)} evaluation_results")

def push_score_cards(pg, sl):
    rows = sl.execute("SELECT * FROM score_cards").fetchall()
    if not rows:
        print("No score_cards in local DB, skipping")
        return
    cur = pg.cursor()
    for r in rows:
        cur.execute("""INSERT INTO score_cards (id, brand_id, evaluation_run_id, composite_score, visibility_score, citation_score, representation_score, intent_score, total_mentions, avg_rank, citation_rate, intent_coverage, model_scores, evaluation_count, last_evaluation_date, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (id) DO NOTHING""",
            (r['id'], r['brand_id'], r['evaluation_run_id'], r['composite_score'], r['visibility_score'], r['citation_score'], r['representation_score'], r['intent_score'], r['total_mentions'], r['avg_rank'], r['citation_rate'], r['intent_coverage'], r['model_scores'], r['evaluation_count'], r['last_evaluation_date'], r['created_at'], r['updated_at']))
    pg.commit()
    print(f"Pushed {len(rows)} score_cards")

def verify(pg):
    cur = pg.cursor()
    for t in ['workspaces', 'brands', 'prompts', 'evaluation_runs', 'evaluation_results', 'score_cards']:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        print(f"  {t}: {cur.fetchone()[0]}")

if __name__ == "__main__":
    pg = get_pg()
    sl = get_sqlite()
    
    create_tables(pg, sl) if False else create_tables(pg)
    push_workspaces(pg, sl)
    push_brands(pg, sl)
    push_prompts(pg, sl)
    push_eval_runs(pg, sl)
    push_eval_results(pg, sl)
    push_score_cards(pg, sl)
    
    print("\n=== Final counts ===")
    verify(pg)
    
    pg.close()
    sl.close()
    print("Done!")
