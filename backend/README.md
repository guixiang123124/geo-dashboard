# GEO Attribution Dashboard - Backend API

FastAPI backend for tracking brand performance in AI chatbot responses.

## Features

- **Multi-tenant Architecture** - Workspace isolation for different clients
- **Async SQLAlchemy 2.0** - Modern ORM with async support
- **OpenAI Integration** - ChatGPT evaluation with retry logic
- **GEO Scoring** - 4-dimension brand attribution scoring
- **REST API** - Full CRUD for brands, evaluations, and scores
- **Alembic Migrations** - Database schema management

## Setup

### Prerequisites

- Python 3.10+
- pip or conda

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp ../.env.example .env

# Edit .env and add your API keys
# OPENAI_API_KEY=your-key-here
```

### Database Setup

```bash
# Initialize database with Alembic
alembic upgrade head

# Seed initial data (prompts and brands)
python scripts/seed_database.py
```

This will:
- Create all database tables
- Load 56 evaluation prompts from `data/intent_pool.json`
- Load 30 kids fashion brands from `data/brands_database.json`
- Create a demo workspace

### Run API Server

```bash
# Development server with auto-reload
uvicorn src.api.main:app --reload --port 8000

# Production server
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Brands

- `GET /api/v1/brands` - List all brands
- `GET /api/v1/brands/{brand_id}` - Get specific brand
- `POST /api/v1/brands` - Create new brand
- `PATCH /api/v1/brands/{brand_id}` - Update brand
- `DELETE /api/v1/brands/{brand_id}` - Delete brand

### Evaluations

- `GET /api/v1/evaluations` - List evaluation runs
- `GET /api/v1/evaluations/{run_id}` - Get specific run with results
- `POST /api/v1/evaluations` - Create new evaluation run
- `GET /api/v1/evaluations/{run_id}/results` - Get results with filters

### Scores

- `GET /api/v1/scores/brand/{brand_id}` - Get score history for brand
- `GET /api/v1/scores/brand/{brand_id}/latest` - Get latest score
- `GET /api/v1/scores/workspace` - Get all scores for workspace

## Database Models

### Workspace
Multi-tenant isolation for different clients.

### Brand
Kids fashion brands with:
- Name, domain, logo
- Category, positioning, price tier
- Target age range
- Keywords, competitors
- Metadata

### Prompt
Evaluation prompts with:
- Text, intent category
- Weight (1-10)

### EvaluationRun
Tracks evaluation executions with:
- Status (pending, running, completed, failed)
- Progress (0-100%)
- Models used, prompt count

### EvaluationResult
Individual brand-prompt-model results with:
- AI response text, response time
- Visibility metrics (mentioned, rank, context)
- Citation metrics (is_cited, URLs)
- Representation metrics (score 0-3, description, sentiment)
- Intent fit score

### ScoreCard
Aggregated GEO scores with:
- Composite score (weighted average)
- 4 dimension scores (visibility, citation, representation, intent)
- Total mentions, average rank
- Citation rate, intent coverage
- Model breakdown

## GEO Scoring Algorithm

```
Composite = (Visibility × 35%) + (Citation × 25%) + (Representation × 25%) + (Intent × 15%)
```

- **Visibility (35%)**: Mention rate and ranking position
- **Citation (25%)**: Domain citation rate
- **Representation (25%)**: Description quality and sentiment
- **Intent (15%)**: Coverage across intent categories

## Development

### Run Tests

```bash
pytest
```

### Create Migration

```bash
# Auto-generate migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Structure

```
backend/
├── alembic/              # Database migrations
├── scripts/              # Utility scripts
│   └── seed_database.py
├── src/
│   ├── api/
│   │   ├── main.py       # FastAPI app
│   │   └── routes/       # API endpoints
│   ├── core/
│   │   ├── config.py     # Settings
│   │   └── database.py   # DB connection
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   └── services/         # Business logic
│       ├── ai_clients/   # AI integrations
│       ├── scorers.py    # GEO scoring
│       └── evaluation_service.py
└── requirements.txt
```

## Environment Variables

```bash
# Application
DEBUG=False

# Database
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db
# For PostgreSQL: postgresql+asyncpg://user:pass@localhost/geo_dashboard

# AI API Keys
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
ANTHROPIC_API_KEY=...
PERPLEXITY_API_KEY=...

# AI Configuration
OPENAI_MODEL=gpt-4-turbo-preview
AI_REQUEST_TIMEOUT=30
MAX_RETRIES=3

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## Next Steps

1. Add Gemini, Claude, Perplexity clients
2. Implement background task queue for evaluations
3. Add WebSocket for real-time progress updates
4. Implement caching layer
5. Add rate limiting per workspace
6. PostgreSQL migration for production
7. Docker containerization
8. CI/CD pipeline

## License

MIT
