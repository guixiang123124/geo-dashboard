# GEO Attribution Dashboard - Architecture Guide

**Version:** 1.0 (Phase 1 Complete)
**Date:** January 23, 2026
**Type:** Multi-Tenant SaaS Application

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Flow](#data-flow)
6. [GEO Attribution Pipeline](#geo-attribution-pipeline)
7. [Multi-Tenancy Design](#multi-tenancy-design)
8. [Technology Stack](#technology-stack)
9. [API Design](#api-design)
10. [Database Schema](#database-schema)

---

## Overview

The GEO Attribution Dashboard is a SaaS platform that measures how AI chatbots (ChatGPT, Gemini, Claude, Perplexity) mention, cite, and frame brands in their responses. It's specifically focused on the **kids fashion industry** but designed to be extensible to other verticals.

### Core Value Proposition

**Traditional SEO measures:**
- Where you rank in search results
- Click-through rates
- Organic traffic

**GEO measures:**
- Does AI recall your brand? (Visibility)
- Why does AI trust your brand? (Citation)
- How does AI describe your brand? (Representation)
- In which contexts does AI recommend you? (Intent Coverage)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (Next.js 16 Frontend)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Dashboard  │  │    Brands    │  │ Evaluations  │         │
│  │    Home      │  │  Management  │  │   Results    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│                   (FastAPI Backend)                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Brands    │  │ Evaluations  │  │    Scores    │         │
│  │   Endpoints  │  │  Endpoints   │  │  Endpoints   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Evaluation Orchestrator                      │  │
│  │  - Batch prompt execution                                 │  │
│  │  - Progress tracking                                      │  │
│  │  - Result aggregation                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↕                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              GEO Scoring Engine                           │  │
│  │  - Visibility calculation (35%)                           │  │
│  │  - Citation analysis (25%)                                │  │
│  │  - Representation scoring (25%)                           │  │
│  │  - Intent coverage (15%)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                     AI API CLIENTS                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  OpenAI  │  │  Gemini  │  │  Claude  │  │Perplexity│       │
│  │ (ChatGPT)│  │ (Google) │  │(Anthropic)│  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                  (PostgreSQL Database)                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Workspaces  │  │    Brands    │  │   Prompts    │         │
│  │    Users     │  │  Evaluation  │  │    Scores    │         │
│  │              │  │   Results    │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI primitives (headless components)
- **Charts:** Recharts (for data visualization)
- **Language:** TypeScript (strict mode)

### Directory Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout (fonts, metadata)
│   │   ├── page.tsx                 # Home page (brand grid)
│   │   ├── (auth)/                  # Auth routes group (Phase 3)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/             # Protected dashboard routes (Phase 3)
│   │   │   ├── brands/
│   │   │   │   ├── page.tsx         # Brand list
│   │   │   │   └── [id]/page.tsx    # Brand detail
│   │   │   ├── evaluations/
│   │   │   │   ├── page.tsx         # Evaluation runs
│   │   │   │   └── [id]/page.tsx    # Evaluation results
│   │   │   └── settings/
│   │   └── api/                     # Next.js API routes (optional)
│   │
│   ├── components/
│   │   ├── geo/                     # GEO-specific components
│   │   │   ├── ScoreCard.tsx        # ✅ 4-dimension brand score card
│   │   │   ├── AttributionFunnel.tsx # (Phase 3) Funnel visualization
│   │   │   ├── RadarChart.tsx       # (Phase 3) 4-dimension radar
│   │   │   └── CrossModelComparison.tsx # (Phase 3) Model comparison
│   │   ├── brands/                  # Brand management components
│   │   │   ├── BrandForm.tsx        # (Phase 3) Add/edit brand
│   │   │   └── BrandList.tsx        # (Phase 3) Brand table
│   │   ├── evaluations/             # Evaluation components
│   │   │   ├── RunProgress.tsx      # (Phase 3) Progress tracker
│   │   │   └── ResultsViewer.tsx    # (Phase 3) AI response viewer
│   │   └── ui/                      # Reusable UI components
│   │       ├── badge.tsx            # ✅ Status badges
│   │       ├── button.tsx           # ✅ Buttons
│   │       └── card.tsx             # ✅ Card container
│   │
│   └── lib/
│       ├── api.ts                   # (Phase 3) API client
│       ├── data.ts                  # ✅ Mock data & types
│       └── utils.ts                 # ✅ Utility functions (cn)
│
├── public/                          # Static assets
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

### Current Dashboard UI (Phase 1)

**Home Page (http://localhost:3000):**

```
┌────────────────────────────────────────────────────────────────┐
│  GEO Attribution Dashboard                            [User ▾]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐            │
│  │ TinyThreads         │  │ EcoKids             │            │
│  │ Sustainable Kids    │  │ Organic Children's  │            │
│  │                     │  │                     │            │
│  │ GEO Score: 78       │  │ GEO Score: 82       │            │
│  │ ●●●●●●●●○○          │  │ ●●●●●●●●○○          │            │
│  │                     │  │                     │            │
│  │ ┌──────┬──────┐    │  │ ┌──────┬──────┐    │            │
│  │ │ Vis  │ Cite │    │  │ │ Vis  │ Cite │    │            │
│  │ │  72  │  85  │    │  │ │  88  │  80  │    │            │
│  │ ├──────┼──────┤    │  │ ├──────┼──────┤    │            │
│  │ │ Rep  │Intent│    │  │ │ Rep  │Intent│    │            │
│  │ │  75  │  82  │    │  │ │  78  │  85  │    │            │
│  │ └──────┴──────┘    │  │ └──────┴──────┘    │            │
│  └─────────────────────┘  └─────────────────────┘            │
│                                                                 │
│  ┌─────────────────────┐                                       │
│  │ LuxeMini            │                                       │
│  │ Premium Kids        │                                       │
│  │                     │                                       │
│  │ GEO Score: 65       │                                       │
│  │ ●●●●●●●○○○          │                                       │
│  │                     │                                       │
│  │ ┌──────┬──────┐    │                                       │
│  │ │ Vis  │ Cite │    │                                       │
│  │ │  68  │  70  │    │                                       │
│  │ ├──────┼──────┤    │                                       │
│  │ │ Rep  │Intent│    │                                       │
│  │ │  60  │  62  │    │                                       │
│  │ └──────┴──────┘    │                                       │
│  └─────────────────────┘                                       │
│                                                                 │
│  Latest Attribution Insights                                    │
│  ─────────────────────────────────────────────────────────     │
│  • Brands with "organic" keywords see 35% higher citation      │
│  • "Affordable" positioning improves visibility by 28%         │
│  • Intent coverage varies significantly across models          │
│                                                                 │
│  [Subscribe for Updates]                                        │
└────────────────────────────────────────────────────────────────┘
```

**Key UI Components:**

1. **ScoreCard Component:**
   - Shows brand name and category
   - Composite GEO score (0-100) with color coding:
     - Green (≥80): Excellent
     - Yellow (50-79): Good
     - Red (<50): Needs improvement
   - 4-cell grid showing individual dimension scores:
     - Visibility (top-left)
     - Citation (top-right)
     - Representation (bottom-left)
     - Intent (bottom-right)

2. **Color Coding System:**
   ```typescript
   const getScoreColor = (score: number) => {
     if (score >= 80) return "text-green-600"   // Excellent
     if (score >= 50) return "text-yellow-600"  // Good
     return "text-red-600"                       // Needs work
   }
   ```

3. **Responsive Grid:**
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

---

## Backend Architecture

### Technology Stack

- **Framework:** FastAPI (async Python web framework)
- **Database:** PostgreSQL 15 + SQLAlchemy ORM
- **Migrations:** Alembic
- **Validation:** Pydantic v2 (data models)
- **AI Clients:** OpenAI SDK, Google Generative AI, Anthropic SDK
- **Authentication:** JWT tokens (Phase 2)
- **Testing:** Pytest + pytest-asyncio

### Directory Structure

```
backend/
├── src/
│   ├── api/                         # FastAPI application
│   │   ├── main.py                  # (Phase 2) FastAPI app instance
│   │   ├── dependencies.py          # (Phase 2) Dependency injection
│   │   └── routes/
│   │       ├── brands.py            # (Phase 2) Brand CRUD
│   │       ├── evaluations.py       # (Phase 2) Evaluation endpoints
│   │       ├── scores.py            # (Phase 2) Score endpoints
│   │       └── auth.py              # (Phase 2) Authentication
│   │
│   ├── core/                        # Core configuration
│   │   ├── config.py                # (Phase 2) Settings (Pydantic)
│   │   ├── database.py              # (Phase 2) DB connection
│   │   └── security.py              # (Phase 2) Auth utilities
│   │
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── workspace.py             # (Phase 2) Workspace model
│   │   ├── user.py                  # (Phase 2) User model
│   │   ├── brand.py                 # (Phase 2) Brand model
│   │   ├── prompt.py                # (Phase 2) Prompt model
│   │   ├── evaluation.py            # (Phase 2) Evaluation models
│   │   └── score.py                 # (Phase 2) Score card model
│   │
│   ├── schemas/                     # Pydantic schemas (API contracts)
│   │   └── models.py                # ✅ Data models
│   │       ├── AIModel (enum)       # chatgpt, gemini, claude, perplexity
│   │       ├── IntentCategory       # general, price, sustainability, etc.
│   │       ├── Brand                # Brand metadata
│   │       ├── Prompt               # Evaluation prompt
│   │       ├── EvaluationResult     # Raw AI response
│   │       └── GEOScoreCard         # Aggregated scores
│   │
│   ├── services/                    # Business logic
│   │   ├── scorers.py               # ✅ GEO scoring engine
│   │   ├── evaluation_service.py    # (Phase 2) Eval orchestration
│   │   └── ai_clients/              # AI API wrappers
│   │       ├── base.py              # (Phase 2) Abstract client
│   │       ├── openai_client.py     # (Phase 2) ChatGPT
│   │       ├── gemini_client.py     # (Phase 3) Gemini
│   │       ├── claude_client.py     # (Phase 3) Claude
│   │       └── perplexity_client.py # (Phase 3) Perplexity
│   │
│   └── tests/                       # Test utilities
│
├── tests/                           # Test suite
│   └── test_scorers.py              # ✅ Scorer unit tests
│
├── alembic/                         # Database migrations
│   ├── env.py                       # (Phase 2) Migration config
│   └── versions/                    # Migration scripts
│
└── requirements.txt                 # ✅ Python dependencies
```

### GEO Scoring Engine (Current Implementation)

**File:** `backend/src/services/scorers.py`

```python
class GEOScorer:
    def calculate_score(self, brand: Brand, results: List[EvaluationResult]) -> GEOScoreCard:
        # 1. Visibility (35%)
        mentions = [r for r in results if r.is_mentioned]
        mention_rate = len(mentions) / len(results)

        # Rank scoring: Rank 1 = 100 pts, Rank 5 = 20 pts
        rank_points = sum((6 - m.rank_position) * 20
                         for m in mentions
                         if m.rank_position and m.rank_position <= 5)
        avg_rank_score = (rank_points / len(mentions)) if mentions else 0

        visibility_score = (mention_rate * 70) + (avg_rank_score * 0.3)

        # 2. Citation (25%)
        citations = [m for m in mentions if m.citation_link]
        citation_score = (len(citations) / len(mentions) * 100) if mentions else 0

        # 3. Representation (25%)
        acc_scores = [m.description_accuracy_score
                     for m in mentions
                     if m.description_accuracy_score is not None]
        avg_acc = sum(acc_scores) / len(acc_scores) if acc_scores else 0
        representation_score = (avg_acc / 3) * 100  # Normalize 0-3 to 0-100

        # 4. Intent Coverage (15%)
        # Placeholder: will implement proper intent tracking in Phase 2
        intent_score = 50.0

        # Composite Score
        composite = (visibility_score * 0.35 +
                    citation_score * 0.25 +
                    representation_score * 0.25 +
                    intent_score * 0.15)

        return GEOScoreCard(...)
```

---

## Data Flow

### Complete Evaluation Flow (Phase 2+)

```
User Action: "Run Evaluation for Brand X"
    ↓
┌───────────────────────────────────────────────────────┐
│ 1. Frontend: Trigger Evaluation                      │
│    POST /api/evaluations                             │
│    { brand_id, model_selection, prompt_ids }         │
└───────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────┐
│ 2. Backend: Create Evaluation Run                    │
│    - Generate run_id                                  │
│    - Set status = "running"                           │
│    - Store in database                                │
└───────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────┐
│ 3. Evaluation Service: Orchestrate                   │
│    For each (prompt, model) pair:                    │
│      - Call AI API client                            │
│      - Parse response                                 │
│      - Extract: is_mentioned, rank, citation, etc.   │
│      - Store EvaluationResult                        │
└───────────────────────────────────────────────────────┘
    ↓ (async, parallel calls)
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   OpenAI    │  │   Gemini    │  │   Claude    │
│  API Call   │  │  API Call   │  │  API Call   │
└─────────────┘  └─────────────┘  └─────────────┘
    ↓                 ↓                 ↓
┌───────────────────────────────────────────────────────┐
│ 4. Response Parsing                                   │
│    - Extract brand mentions                           │
│    - Identify ranking position                        │
│    - Find citation links                              │
│    - Score description accuracy (0-3)                 │
│    - Match keywords                                   │
└───────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────┐
│ 5. GEO Scorer: Calculate Scores                      │
│    - Aggregate all EvaluationResults                  │
│    - Calculate 4 dimension scores                     │
│    - Compute composite score                          │
│    - Store GEOScoreCard                               │
└───────────────────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────────────────┐
│ 6. Frontend: Display Results                         │
│    - Update ScoreCard                                 │
│    - Show score history chart                         │
│    - Display AI responses                             │
│    - Provide optimization recommendations             │
└───────────────────────────────────────────────────────┘
```

### Data Transformation Pipeline

```
Raw AI Response (Text)
    ↓
Parsed EvaluationResult (Structured Data)
    {
      model: "chatgpt",
      prompt_text: "Best kids clothing brands",
      response_text: "1. Carter's - trusted...\n2. OshKosh...",
      is_mentioned: true,
      rank_position: 1,
      citation_link: "https://carters.com",
      description_accuracy_score: 3,
      matched_keywords: ["trusted", "affordable"]
    }
    ↓
Aggregated Metrics (Per Brand)
    {
      total_prompts: 50,
      mentions: 38,
      mention_rate: 0.76,
      avg_rank: 2.1,
      citations: 30,
      citation_rate: 0.79,
      avg_accuracy: 2.7
    }
    ↓
GEO Scores (Final Output)
    {
      brand_name: "Carter's",
      visibility_score: 82.5,
      citation_score: 79.0,
      representation_score: 90.0,
      intent_score: 75.0,
      composite_score: 82.1
    }
```

---

## GEO Attribution Pipeline

### The 4-Dimension Attribution Funnel

```
┌─────────────────────────────────────────────────────────────┐
│                  USER INTENT                                 │
│   Parent searches for: "best organic baby clothes"          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│               AI PROMPT (Standardized)                       │
│   "What are the best organic cotton kids clothing brands    │
│    for babies with sensitive skin?"                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│          A. VISIBILITY & RECALL (35%)                        │
│   ┌─────────────────────────────────────────────────┐       │
│   │ Question: Does AI mention your brand at all?    │       │
│   │                                                  │       │
│   │ Metrics:                                         │       │
│   │ • Mention Rate: % of prompts where brand appears│       │
│   │ • Ranking Position: Where in the list (1-5)?    │       │
│   │ • Cross-Model Coverage: How many AI models?     │       │
│   │                                                  │       │
│   │ Example: "Carter's appears in 38 of 50 prompts, │       │
│   │          ranks #2 on average"                    │       │
│   └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│          B. SOURCE SELECTION / CITATION (25%)                │
│   ┌─────────────────────────────────────────────────┐       │
│   │ Question: Why does AI choose your brand?        │       │
│   │                                                  │       │
│   │ Metrics:                                         │       │
│   │ • Citation Rate: How often AI links to you      │       │
│   │ • Authority Preference: Brand site vs. review   │       │
│   │ • Citation Type: Product page vs. content       │       │
│   │                                                  │       │
│   │ Example: "ChatGPT cites carters.com in 30 of   │       │
│   │          38 mentions (79%)"                      │       │
│   └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│         C. BRAND FRAMING / REPRESENTATION (25%)              │
│   ┌─────────────────────────────────────────────────┐       │
│   │ Question: How does AI describe your brand?      │       │
│   │                                                  │       │
│   │ Metrics:                                         │       │
│   │ • Description Accuracy: Correct facts? (0-3)    │       │
│   │ • Message Alignment: Matches brand positioning? │       │
│   │ • Sentiment: Positive/Neutral/Negative          │       │
│   │ • Keyword Matching: Target keywords present?    │       │
│   │                                                  │       │
│   │ Example: "Carter's described as 'trusted' (goal)│       │
│   │          but also 'cheap' (not goal)"            │       │
│   └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│          D. INTENT FIT & COVERAGE (15%)                      │
│   ┌─────────────────────────────────────────────────┐       │
│   │ Question: In which contexts does AI recall you? │       │
│   │                                                  │       │
│   │ Metrics:                                         │       │
│   │ • Intent Coverage: % of intent categories       │       │
│   │ • Intent-Specific Ranking: Performance by need  │       │
│   │                                                  │       │
│   │ Example: "Carter's appears in:                  │       │
│   │   ✓ Baby/toddler queries (88%)                  │       │
│   │   ✓ Affordable queries (92%)                    │       │
│   │   ✗ Premium queries (12%)                       │       │
│   │   ✗ Teen queries (5%)"                          │       │
│   └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                 USER PERCEPTION                              │
│   User sees: "Carter's - America's #1 baby brand,           │
│              trusted for quality and value"                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    CONVERSION                                │
│   User clicks citation link → Visits carters.com            │
└─────────────────────────────────────────────────────────────┘
```

### Why This Attribution Model Works

**Traditional SEO Attribution:**
```
User searches → Sees your result → Clicks → Conversion
      (Direct, trackable path)
```

**GEO Attribution:**
```
User asks AI → AI recalls from training → AI frames response → User trusts AI → Conversion
      (Indirect, AI-mediated path)
```

**The 4 dimensions capture the complete AI decision process:**

1. **Visibility** = Did AI's training include your brand?
2. **Citation** = Does AI trust your domain as authoritative?
3. **Representation** = Does AI frame you positively and accurately?
4. **Intent** = Does AI match you to the right user needs?

---

## Multi-Tenancy Design

### Workspace-Based Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    Workspace 1                               │
│                 (Kids Fashion Brand A)                       │
│                                                              │
│  Users: user1@brandA.com, user2@brandA.com                  │
│  Brands: Brand A + 5 competitors                            │
│  Evaluations: 10 evaluation runs                            │
│  Scores: 50 score cards                                     │
│  API Quota: 1000 evaluations/month                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Workspace 2                               │
│                 (Kids Fashion Brand B)                       │
│                                                              │
│  Users: user1@brandB.com                                     │
│  Brands: Brand B + 8 competitors                            │
│  Evaluations: 5 evaluation runs                             │
│  Scores: 25 score cards                                     │
│  API Quota: 500 evaluations/month                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Isolation Strategy

**Every table has `workspace_id` foreign key:**

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Workspace isolation constraint
    UNIQUE(workspace_id, domain)
);

-- All queries MUST filter by workspace_id
SELECT * FROM brands WHERE workspace_id = :current_workspace_id;
```

**Middleware enforces workspace context:**

```python
@app.middleware("http")
async def add_workspace_context(request: Request, call_next):
    # Extract workspace from JWT token or API key
    workspace_id = extract_workspace_from_auth(request)

    # Add to request state
    request.state.workspace_id = workspace_id

    # All subsequent DB queries use this workspace_id
    response = await call_next(request)
    return response
```

---

## Technology Stack

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.4 | React framework with SSR/SSG |
| **Runtime** | React | 19.2.3 | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Components** | Radix UI | Latest | Headless accessible components |
| **Charts** | Recharts | 3.7.0 | Data visualization |
| **HTTP** | Fetch API | Native | API calls |
| **Build Tool** | Turbopack | Built-in | Fast bundler |

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.109.0 | Async Python web framework |
| **Server** | Uvicorn | 0.27.0 | ASGI server |
| **Database** | PostgreSQL | 15 | Primary data store |
| **ORM** | SQLAlchemy | 2.0.25 | Database ORM |
| **Migrations** | Alembic | 1.13.1 | Schema migrations |
| **Validation** | Pydantic | 2.5.3 | Data validation |
| **AI - OpenAI** | openai | 1.10.0 | ChatGPT integration |
| **AI - Gemini** | google-generativeai | 0.3.2 | Gemini integration |
| **AI - Claude** | anthropic | 0.8.1 | Claude integration |
| **Auth** | python-jose | 3.3.0 | JWT tokens |
| **Testing** | pytest | 7.4.4 | Test framework |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend Hosting** | Vercel | Next.js deployment (free tier) |
| **Backend Hosting** | Railway/Render | Python + PostgreSQL ($7-20/mo) |
| **Database** | PostgreSQL | Included with Railway/Render |
| **Container** | Docker | Local development |
| **CI/CD** | GitHub Actions | Automated testing (Phase 5) |

---

## API Design (Phase 2)

### REST API Endpoints

```
Authentication
POST   /api/auth/login              # Login
POST   /api/auth/signup             # Register (future)
POST   /api/auth/refresh            # Refresh token

Workspaces
GET    /api/workspaces/:id          # Get workspace
PATCH  /api/workspaces/:id          # Update workspace

Brands
GET    /api/brands                  # List brands (workspace-scoped)
POST   /api/brands                  # Create brand
GET    /api/brands/:id              # Get brand details
PATCH  /api/brands/:id              # Update brand
DELETE /api/brands/:id              # Delete brand

Prompts
GET    /api/prompts                 # List prompts
POST   /api/prompts                 # Create custom prompt
GET    /api/prompts/:id             # Get prompt
PATCH  /api/prompts/:id             # Update prompt

Evaluations
GET    /api/evaluations             # List evaluation runs
POST   /api/evaluations             # Start new evaluation
GET    /api/evaluations/:id         # Get evaluation status
GET    /api/evaluations/:id/results # Get evaluation results

Scores
GET    /api/scores                  # List score cards
GET    /api/scores/:brand_id        # Get brand scores
GET    /api/scores/:brand_id/history # Score history over time
```

### Example API Response

```json
GET /api/brands/carter-kids

{
  "id": "uuid-123",
  "workspace_id": "workspace-456",
  "name": "Carter's",
  "domain": "carters.com",
  "positioning": "America's #1 trusted brand for baby and kids clothing",
  "price_tier": "mid-range",
  "target_age_range": ["baby", "toddler", "kids"],
  "keywords": ["trusted", "affordable", "baby", "everyday", "reliable"],
  "competitors": ["oshkosh", "childrens-place", "gap-kids"],
  "latest_score": {
    "composite_score": 82.1,
    "visibility_score": 85.0,
    "citation_score": 79.0,
    "representation_score": 90.0,
    "intent_score": 75.0,
    "generated_at": "2026-01-23T10:30:00Z"
  },
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-01-23T10:30:00Z"
}
```

---

## Database Schema (Phase 2)

```sql
-- Workspaces (Multi-tenancy)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',  -- free, pro, enterprise
    api_quota INT DEFAULT 1000,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',  -- admin, member
    created_at TIMESTAMP DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    positioning TEXT,
    price_tier VARCHAR(50),  -- budget, mid-range, premium, luxury
    target_age_range TEXT[],
    keywords TEXT[],
    competitors TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(workspace_id, domain)
);

-- Prompts
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    text TEXT NOT NULL,
    intent_category VARCHAR(50),
    weight FLOAT DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation Runs
CREATE TABLE evaluation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    brand_id UUID REFERENCES brands(id),
    status VARCHAR(50),  -- queued, running, completed, failed
    models_selected TEXT[],
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Evaluation Results (raw AI responses)
CREATE TABLE evaluation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_run_id UUID REFERENCES evaluation_runs(id),
    prompt_id UUID REFERENCES prompts(id),
    ai_model VARCHAR(50),
    prompt_text TEXT,
    response_text TEXT,
    is_mentioned BOOLEAN DEFAULT false,
    rank_position INT,
    citation_link TEXT,
    description_accuracy_score INT,  -- 0-3
    matched_keywords TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- GEO Score Cards (aggregated scores)
CREATE TABLE score_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    evaluation_run_id UUID REFERENCES evaluation_runs(id),
    visibility_score FLOAT,
    citation_score FLOAT,
    representation_score FLOAT,
    intent_score FLOAT,
    composite_score FLOAT,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_brands_workspace ON brands(workspace_id);
CREATE INDEX idx_evaluations_workspace ON evaluation_runs(workspace_id);
CREATE INDEX idx_evaluations_brand ON evaluation_runs(brand_id);
CREATE INDEX idx_results_run ON evaluation_results(evaluation_run_id);
CREATE INDEX idx_scores_brand ON score_cards(brand_id);
```

---

## Summary

This architecture provides:

✅ **Scalable Multi-Tenancy** - Workspace-based isolation
✅ **Clean Separation** - Frontend, backend, data layers decoupled
✅ **Extensible AI Integration** - Abstract client pattern for multiple AI providers
✅ **Measurable Attribution** - 4-dimension GEO scoring with clear formulas
✅ **Production-Ready** - Modern stack, async operations, proper security
✅ **Kids Fashion Focused** - 20 brands, 50+ prompts (Phase 4), intent-based evaluation

**Next Phase:** Backend API implementation with OpenAI integration.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-23
**Status:** Phase 1 Complete, Ready for Phase 2
