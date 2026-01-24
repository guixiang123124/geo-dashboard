# GEO Attribution & Measurement Dashboard

> 🇨🇳 [中文文档](./README_CN.md) | 🇺🇸 English

A SaaS platform for measuring **Generative Engine Optimization (GEO)** — tracking how AI chatbots (ChatGPT, Gemini, Claude, Perplexity) mention, cite, and frame brands in their responses.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)

## What is GEO?

GEO (Generative Engine Optimization) measures brand visibility and representation in AI-generated responses. Unlike traditional SEO which focuses on search engine rankings, GEO tracks:

- **Does AI recall your brand?** (Visibility)
- **Why does AI trust your brand?** (Citation & Authority)
- **How does AI describe your brand?** (Representation & Framing)
- **In which contexts does AI recommend your brand?** (Intent Coverage)

## The GEO Attribution Funnel

```
User Intent → AI Prompt
    ↓
A. Visibility & Recall (35% weight)
    ↓
B. Source Selection / Citation (25% weight)
    ↓
C. Brand Framing / Representation (25% weight)
    ↓
D. Intent Fit & Coverage (15% weight)
    ↓
User Perception → Conversion
```

## Project Structure

```
geo-attribution-dashboard/
├── frontend/              # Next.js 16 + React 19 dashboard
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities and API client
│   └── package.json
│
├── backend/              # Python FastAPI + scoring engine
│   ├── src/
│   │   ├── api/         # FastAPI routes
│   │   ├── core/        # Config, database, auth
│   │   ├── models/      # SQLAlchemy database models
│   │   ├── schemas/     # Pydantic schemas (models.py)
│   │   ├── services/    # Business logic (scorers.py, AI clients)
│   │   └── tests/       # Pytest test suite
│   ├── alembic/         # Database migrations
│   └── requirements.txt
│
├── data/                # Shared data files
│   ├── intent_pool.json        # Evaluation prompts
│   └── brands_database.json    # Kids fashion brands dataset
│
└── docs/                # Documentation
    ├── METRICS.md       # Metric definitions
    ├── PLAYBOOK.md      # Optimization tactics
    └── API.md           # API documentation
```

## Current Implementation Status

### ✅ Completed (MVP Foundation)
- Frontend dashboard with 4-dimension score visualization
- GEO scoring algorithm (35/25/25/15 weighted formula)
- Pydantic data models for brands, prompts, evaluations
- Intent pool for kids fashion (10 prompts across 4 categories)
- 20 kids fashion brands database
- Documentation (metrics, playbook)
- Test suite

### 🚧 In Progress (Phase 1)
- Project consolidation into unified structure
- Docker development environment
- Environment configuration

### 📋 Next Steps
- **Phase 2:** FastAPI backend with OpenAI integration
- **Phase 3:** Frontend API integration and enhanced visualizations
- **Phase 4:** Expand to 50+ prompts and 30 brands
- **Phase 5:** Production deployment (Vercel + Railway/Render)

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- PostgreSQL 14+ (via Docker or cloud)
- OpenAI API key (for ChatGPT evaluations)

### Development Setup

1. **Clone and navigate:**
   ```bash
   cd geo-attribution-dashboard
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

5. **Start Development:**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn src.api.main:app --reload

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

6. **Access Dashboard:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## GEO Score Calculation

### The Four Dimensions

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Visibility** | 35% | Mention rate, ranking position, cross-model coverage |
| **Citation** | 25% | Citation rate, source authority preference |
| **Representation** | 25% | Description accuracy (0-3), message alignment, sentiment |
| **Intent Coverage** | 15% | Intent coverage rate, intent-specific ranking |

### Composite Score Formula

```
GEO Score = (Visibility × 0.35) + (Citation × 0.25) +
            (Representation × 0.25) + (Intent × 0.15)
```

Each dimension scored 0-100, resulting in composite score 0-100.

## Kids Fashion Focus

This MVP focuses on the **kids fashion industry** with:

- **20+ major brands** across all price tiers (premium, mid-range, budget)
- **Market segments:** Premium, sustainable, fast fashion, value, D2C
- **10+ intent categories:** Age-specific, safety, quality, trend, occasion
- **50+ evaluation prompts** covering parent decision-making scenarios

### Brand Segments

1. **Premium/Luxury:** Janie and Jack, Mini Boden, Tea Collection, Hanna Andersson
2. **Mid-Range:** Carter's, OshKosh B'gosh, Gap Kids, The Children's Place
3. **Budget:** Old Navy Kids, Target Cat & Jack, H&M Kids, PatPat
4. **Sustainable:** Pact, Primary, Monica + Andy
5. **Fast Fashion:** Zara Kids, Uniqlo Kids, Abercrombie Kids

## Multi-Tenant SaaS Architecture

### Workspace Isolation
- Each client gets a dedicated workspace with unique `workspace_id`
- All data (brands, evaluations, scores) scoped to workspace
- Database queries automatically filter by workspace context
- Simple API key authentication (MVP), OAuth for future

### Cost Management
- Evaluation costs: (# brands) × (# prompts) × (# AI models) × (API price)
- Example: 10 brands × 50 prompts × 2 models = 1,000 API calls
- Caching strategy to avoid redundant evaluations
- Model selection per workspace

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI primitives
- **Charts:** Recharts
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL + SQLAlchemy
- **Migrations:** Alembic
- **AI Clients:** OpenAI SDK, Google Generative AI, Anthropic SDK
- **Testing:** Pytest
- **Validation:** Pydantic

### Deployment
- **Frontend:** Vercel (free tier)
- **Backend:** Railway or Render ($7-20/month)
- **Database:** PostgreSQL (included with backend platform)

## Documentation

- **[METRICS.md](./docs/METRICS.md)** - Complete metric definitions and formulas
- **[PLAYBOOK.md](./docs/PLAYBOOK.md)** - GEO optimization tactics mapped to metrics
- **[API.md](./docs/API.md)** - Backend API documentation (coming soon)

## Optimization Strategies

Each GEO dimension maps to specific content and technical optimizations:

| Dimension | Optimization Tactics |
|-----------|---------------------|
| **Visibility** | Clear category definitions, listicle formatting, co-occurrence optimization |
| **Citation** | Factual density, semantic URLs, static HTML content |
| **Representation** | One-liner brand positioning, consistency audit, disambiguation |
| **Intent Coverage** | Contextual hubs, FAQ sections, long-tail keywords |

See [PLAYBOOK.md](./docs/PLAYBOOK.md) for detailed tactics.

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests (when added)
cd frontend
npm test
```

## Contributing

This is an MVP in active development. Core team only for now.

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact the development team.

---

**Built with:** Next.js, FastAPI, PostgreSQL, OpenAI API
**Focus:** Kids Fashion GEO Measurement
**Architecture:** Multi-tenant SaaS
