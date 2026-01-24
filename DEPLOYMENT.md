# Deployment Guide

## Quick Start

### 1. Push to GitHub

```bash
# Create a new repository on GitHub (https://github.com/new)
# Then add it as remote:
git remote add origin https://github.com/YOUR_USERNAME/geo-attribution-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Backend Deployment (Railway / Render / Fly.io)

#### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `geo-attribution-dashboard` repository
4. Railway will auto-detect the Python backend
5. Add environment variables:
   ```
   OPENAI_API_KEY=your-openai-key
   GOOGLE_API_KEY=your-gemini-key
   DATABASE_URL=postgresql://... (Railway provides this automatically)
   ```
6. Deploy! Backend will be live at `https://your-app.railway.app`

#### Option B: Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as above)
6. Create a PostgreSQL database and link it

### 3. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import `geo-attribution-dashboard` from GitHub
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
6. Deploy! Frontend will be live at `https://your-app.vercel.app`

## Local Development

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env with your API keys

# Initialize database
alembic upgrade head

# Seed database
python scripts/seed_database.py

# Run server
uvicorn src.api.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)

```bash
# Application
DEBUG=True
APP_NAME=GEO Attribution Dashboard API
APP_VERSION=1.0.0

# API
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000", "https://your-frontend.vercel.app"]

# Database
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db  # Local
# DATABASE_URL=postgresql+asyncpg://user:pass@host/db  # Production

# AI API Keys
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
ANTHROPIC_API_KEY=  # Optional
PERPLEXITY_API_KEY=  # Optional

# AI Model Configuration
OPENAI_MODEL=gpt-4-turbo-preview
GOOGLE_MODEL=gemini-pro
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Rate Limiting
AI_REQUEST_TIMEOUT=30
MAX_RETRIES=3
RETRY_DELAY=2
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # Production
```

## Production Checklist

- [ ] Set `DEBUG=False` in backend
- [ ] Use PostgreSQL for production database
- [ ] Set secure `SECRET_KEY` for JWT
- [ ] Configure CORS origins to match frontend domain
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure rate limiting
- [ ] Set up automated backups for database
- [ ] Add authentication/authorization
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline

## Database Migrations

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Running Evaluations

```bash
# Single model test
python scripts/test_evaluation.py

# Multi-model test (OpenAI + Gemini)
python scripts/test_multimodel_evaluation.py

# View results via API
curl http://localhost:8000/api/v1/evaluations?workspace_id=YOUR_WORKSPACE_ID
```

## Monitoring & Logs

### Backend Logs

```bash
# Railway/Render: View logs in dashboard
# Local: Check console output

# Enable detailed logging
# Set DEBUG=True in .env
```

### Frontend Logs

```bash
# Vercel: View logs in dashboard
# Local: Check browser console

# Check build logs
npm run build
```

## Troubleshooting

### Backend won't start
- Check Python version (requires 3.10+)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check database connection in `.env`
- Verify API keys are valid

### Frontend shows connection error
- Check `NEXT_PUBLIC_API_URL` points to backend
- Verify backend is running and accessible
- Check CORS settings in backend `.env`
- Open browser console for error details

### Database errors
- Run migrations: `alembic upgrade head`
- Check DATABASE_URL format
- Verify database exists and is accessible
- For PostgreSQL, check credentials and host

### AI API errors
- Verify API keys are valid and have credits
- Check rate limits haven't been exceeded
- Review timeout settings in `.env`
- Check `MAX_RETRIES` and `RETRY_DELAY` values

## Support

For issues, please open a GitHub issue or contact the development team.
