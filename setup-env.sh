#!/bin/bash

# GEO Attribution Dashboard - Environment Setup Script
# This script helps you set up .env files on a new computer

set -e

echo "=================================================="
echo "GEO Attribution Dashboard - Environment Setup"
echo "=================================================="
echo ""

# Check if .env.template exists
if [ ! -f ".env.template" ]; then
    echo "❌ Error: .env.template not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "This script will help you create local .env files."
echo "You'll need to provide your API keys and configuration."
echo ""

# Ask for confirmation
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "=================================================="
echo "Step 1: Backend Configuration"
echo "=================================================="
echo ""

# Create backend/.env
echo "Creating backend/.env..."

read -p "Enter your OpenAI API Key (sk-proj-...): " OPENAI_KEY
read -p "Enter your Google/Gemini API Key (AIza...): " GOOGLE_KEY
read -p "Enter your Workspace ID (from database): " WORKSPACE_ID

# Generate backend/.env
cat > backend/.env << EOF
# GEO Attribution Dashboard - Backend Configuration

# Application
APP_NAME=GEO Attribution Dashboard API
APP_VERSION=1.0.0
DEBUG=True

# API
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Database
DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db

# AI API Keys
OPENAI_API_KEY=${OPENAI_KEY}
GOOGLE_API_KEY=${GOOGLE_KEY}
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=

# AI Model Configuration
# Options:
# - gpt-4o: \$3.60/600 calls (RECOMMENDED - best quality/price ratio)
# - gpt-3.5-turbo: \$0.60/600 calls (CHEAPEST - good enough for GEO)
# - gpt-4-turbo-preview: \$12/600 calls (EXPENSIVE - not recommended)
OPENAI_MODEL=gpt-4o
GOOGLE_MODEL=gemini-pro
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Rate Limiting
AI_REQUEST_TIMEOUT=30
MAX_RETRIES=3
RETRY_DELAY=2

# Security
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Evaluation
DEFAULT_INTENT_POOL_PATH=data/intent_pool.json
DEFAULT_BRANDS_PATH=data/brands_database.json
MAX_CONCURRENT_EVALUATIONS=5
EOF

echo "✅ Created backend/.env"
echo ""

echo "=================================================="
echo "Step 2: Frontend Configuration"
echo "=================================================="
echo ""

# Create frontend/.env.local
echo "Creating frontend/.env.local..."

cat > frontend/.env.local << EOF
# GEO Insights Frontend - Local Environment

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Default Workspace ID (matches database)
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=${WORKSPACE_ID}

# Feature Flags
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
EOF

echo "✅ Created frontend/.env.local"
echo ""

echo "=================================================="
echo "Step 3: Verification"
echo "=================================================="
echo ""

# Verify files exist
if [ -f "backend/.env" ] && [ -f "frontend/.env.local" ]; then
    echo "✅ Both .env files created successfully!"
    echo ""
    echo "Files created:"
    echo "  - backend/.env"
    echo "  - frontend/.env.local"
    echo ""

    # Verify they're gitignored
    if git status | grep -q "\.env"; then
        echo "⚠️  WARNING: .env files appear in git status!"
        echo "Please check your .gitignore file."
    else
        echo "✅ .env files are properly gitignored"
    fi

    echo ""
    echo "=================================================="
    echo "Setup Complete!"
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the backend:"
    echo "   cd backend"
    echo "   python -m uvicorn src.api.main:app --reload"
    echo ""
    echo "2. Start the frontend (in another terminal):"
    echo "   cd frontend"
    echo "   npm run dev"
    echo ""
    echo "3. Open http://localhost:3001 in your browser"
    echo ""
else
    echo "❌ Error: Failed to create .env files"
    exit 1
fi
EOF

echo "✅ Created setup-env.sh"
