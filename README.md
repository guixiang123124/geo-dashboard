# GEO Insights - AI Brand Optimization Platform

> 🇨🇳 [中文文档](./README_CN.md) | 🇺🇸 English

A modern SaaS platform for **Generative Engine Optimization (GEO)** — tracking how AI chatbots (ChatGPT, Gemini, Claude, Perplexity) mention, cite, and represent your brand in their responses.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)

## What is GEO?

**GEO (Generative Engine Optimization)** measures brand visibility and representation in AI-generated responses. Unlike traditional SEO which focuses on search engine rankings, GEO tracks:

| Question | Dimension |
|----------|-----------|
| Does AI recall your brand? | **Visibility** (35%) |
| Does AI cite your sources? | **Citation** (25%) |
| How does AI describe your brand? | **Representation** (25%) |
| In which contexts does AI recommend you? | **Intent Coverage** (15%) |

## Features

### Core Functionality
- **Multi-Model AI Evaluation** - Test across ChatGPT, Gemini, Claude, and Perplexity
- **4-Dimension GEO Scoring** - Visibility, Citation, Representation, Intent Coverage
- **Real-time Analytics Dashboard** - Interactive charts and visualizations
- **Brand Management** - Track multiple brands with detailed profiles
- **Data Export** - CSV, PDF, and PNG export capabilities

### Technical Features
- **JWT Authentication** - Secure user login and registration
- **Multi-tenant Architecture** - Workspace isolation for organizations
- **REST API** - Full-featured FastAPI backend with OpenAPI docs
- **Modern UI** - Gradient design with glass morphism effects

## Project Structure

```
geo-dashboard/
├── frontend/                 # Next.js 16 + React 19 dashboard
│   ├── src/
│   │   ├── app/             # Pages (Home, Analytics, Brands, Evaluations)
│   │   ├── components/      # UI components (charts, filters, layout)
│   │   ├── hooks/           # React hooks (useBrands, useFilters)
│   │   └── lib/             # API client, types, utilities
│   ├── vercel.json          # Vercel deployment config
│   └── package.json
│
├── backend/                  # FastAPI + SQLAlchemy
│   ├── src/
│   │   ├── api/             # Routes (auth, brands, evaluations, scores)
│   │   ├── core/            # Config, database
│   │   ├── models/          # SQLAlchemy models (User, Brand, Evaluation...)
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic, AI clients
│   ├── Dockerfile           # Production Docker build
│   ├── railway.json         # Railway deployment config
│   └── requirements.txt
│
├── data/                     # Sample data
│   ├── intent_pool.json     # 100 evaluation prompts
│   └── brands_database.json # 30 kids fashion brands
│
├── render.yaml              # Render.com blueprint
└── docker-compose.yml       # Local development
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (or use SQLite for development)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guixiang123124/geo-dashboard.git
   cd geo-dashboard
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # Configure environment
   cp ../.env.example .env
   # Edit .env with your API keys
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install

   # Configure environment
   cp .env.example .env.local
   ```

4. **Start Development Servers:**
   ```bash
   # Option 1: Use the start script
   ./start-servers.sh

   # Option 2: Manual start
   # Terminal 1 - Backend
   cd backend && uvicorn src.api.main:app --reload

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/auth/change-password` | Change password |

### Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/brands` | List all brands |
| POST | `/api/v1/brands` | Create new brand |
| GET | `/api/v1/brands/{id}` | Get brand details |
| PATCH | `/api/v1/brands/{id}` | Update brand |
| DELETE | `/api/v1/brands/{id}` | Delete brand |

### Evaluations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/evaluations` | List evaluation runs |
| POST | `/api/v1/evaluations` | Start new evaluation |
| GET | `/api/v1/evaluations/{id}` | Get evaluation details |
| GET | `/api/v1/evaluations/{id}/results` | Get evaluation results |

### Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/scores/brand/{id}` | Get brand score history |
| GET | `/api/v1/scores/brand/{id}/latest` | Get latest brand score |
| GET | `/api/v1/scores/workspace` | Get all workspace scores |

## Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy from the `/backend` directory

```bash
# Required environment variables
DATABASE_URL=postgresql://...
SECRET_KEY=your-secure-secret
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the `render.yaml` blueprint or configure manually

### Frontend (Vercel)
1. Import project to Vercel
2. Set root directory to `/frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

## GEO Score Calculation

### The Four Dimensions

| Dimension | Weight | Calculation |
|-----------|--------|-------------|
| **Visibility** | 35% | `mention_rate × 0.7 + rank_score × 0.3` |
| **Citation** | 25% | `citation_rate × 100` |
| **Representation** | 25% | `(accuracy_score / 3) × 100` |
| **Intent Coverage** | 15% | `unique_intents / total_intents × 100` |

### Composite Score
```
GEO Score = (Visibility × 0.35) + (Citation × 0.25) +
            (Representation × 0.25) + (Intent Coverage × 0.15)
```

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4 + Radix UI
- **Charts:** Recharts
- **State:** Zustand
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL + SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** JWT (python-jose + passlib)
- **AI:** OpenAI SDK, Google Generative AI, Anthropic SDK
- **Validation:** Pydantic 2.0

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI API Keys
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
ANTHROPIC_API_KEY=...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture details
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[docs/METRICS.md](./docs/METRICS.md)** - GEO metric definitions
- **[docs/PLAYBOOK.md](./docs/PLAYBOOK.md)** - Optimization strategies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built with:** Next.js, FastAPI, PostgreSQL, OpenAI
**Focus:** Kids Fashion Industry GEO Measurement
**Version:** 2.0.0 (GEO Insights)
