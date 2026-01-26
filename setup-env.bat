@echo off
REM GEO Attribution Dashboard - Environment Setup Script (Windows)
REM This script helps you set up .env files on a new computer

echo ==================================================
echo GEO Attribution Dashboard - Environment Setup
echo ==================================================
echo.

REM Check if .env.template exists
if not exist ".env.template" (
    echo Error: .env.template not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo This script will help you create local .env files.
echo You'll need to provide your API keys and configuration.
echo.

set /p CONTINUE="Do you want to continue? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo ==================================================
echo Step 1: Backend Configuration
echo ==================================================
echo.

set /p OPENAI_KEY="Enter your OpenAI API Key (sk-proj-...): "
set /p GOOGLE_KEY="Enter your Google/Gemini API Key (AIza...): "
set /p WORKSPACE_ID="Enter your Workspace ID (from database): "

echo Creating backend/.env...

(
echo # GEO Attribution Dashboard - Backend Configuration
echo.
echo # Application
echo APP_NAME=GEO Attribution Dashboard API
echo APP_VERSION=1.0.0
echo DEBUG=True
echo.
echo # API
echo API_V1_PREFIX=/api/v1
echo CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
echo.
echo # Database
echo DATABASE_URL=sqlite+aiosqlite:///./geo_dashboard.db
echo.
echo # AI API Keys
echo OPENAI_API_KEY=%OPENAI_KEY%
echo GOOGLE_API_KEY=%GOOGLE_KEY%
echo ANTHROPIC_API_KEY=
echo PERPLEXITY_API_KEY=
echo.
echo # AI Model Configuration
echo # Options:
echo # - gpt-4o: $3.60/600 calls ^(RECOMMENDED - best quality/price ratio^)
echo # - gpt-3.5-turbo: $0.60/600 calls ^(CHEAPEST - good enough for GEO^)
echo # - gpt-4-turbo-preview: $12/600 calls ^(EXPENSIVE - not recommended^)
echo OPENAI_MODEL=gpt-4o
echo GOOGLE_MODEL=gemini-pro
echo ANTHROPIC_MODEL=claude-3-sonnet-20240229
echo.
echo # Rate Limiting
echo AI_REQUEST_TIMEOUT=30
echo MAX_RETRIES=3
echo RETRY_DELAY=2
echo.
echo # Security
echo SECRET_KEY=dev-secret-key-change-in-production
echo ALGORITHM=HS256
echo ACCESS_TOKEN_EXPIRE_MINUTES=30
echo.
echo # Evaluation
echo DEFAULT_INTENT_POOL_PATH=data/intent_pool.json
echo DEFAULT_BRANDS_PATH=data/brands_database.json
echo MAX_CONCURRENT_EVALUATIONS=5
) > backend\.env

echo Created backend/.env
echo.

echo ==================================================
echo Step 2: Frontend Configuration
echo ==================================================
echo.

echo Creating frontend/.env.local...

(
echo # GEO Insights Frontend - Local Environment
echo.
echo # Backend API URL
echo NEXT_PUBLIC_API_URL=http://localhost:8000
echo.
echo # Default Workspace ID ^(matches database^)
echo NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=%WORKSPACE_ID%
echo.
echo # Feature Flags
echo NEXT_PUBLIC_ENABLE_AUTH=true
echo NEXT_PUBLIC_ENABLE_ANALYTICS=true
echo NEXT_PUBLIC_ENABLE_EXPORT=true
) > frontend\.env.local

echo Created frontend/.env.local
echo.

echo ==================================================
echo Step 3: Verification
echo ==================================================
echo.

if exist "backend\.env" (
    if exist "frontend\.env.local" (
        echo Both .env files created successfully!
        echo.
        echo Files created:
        echo   - backend/.env
        echo   - frontend/.env.local
        echo.

        git status 2>nul | findstr /C:".env" >nul
        if errorlevel 1 (
            echo .env files are properly gitignored
        ) else (
            echo WARNING: .env files appear in git status!
            echo Please check your .gitignore file.
        )

        echo.
        echo ==================================================
        echo Setup Complete!
        echo ==================================================
        echo.
        echo Next steps:
        echo 1. Start the backend:
        echo    cd backend
        echo    python -m uvicorn src.api.main:app --reload
        echo.
        echo 2. Start the frontend ^(in another terminal^):
        echo    cd frontend
        echo    npm run dev
        echo.
        echo 3. Open http://localhost:3001 in your browser
        echo.
    ) else (
        echo Error: Failed to create frontend/.env.local
        pause
        exit /b 1
    )
) else (
    echo Error: Failed to create backend/.env
    pause
    exit /b 1
)

pause
