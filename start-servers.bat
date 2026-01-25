@echo off
REM GEO Attribution Dashboard - Server Startup Script (Windows)

echo 🚀 Starting GEO Attribution Dashboard...
echo.

REM Start Backend
echo 📦 Starting Backend API...
cd backend
start /B python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🎨 Starting Frontend...
cd frontend
start /B npm run dev > frontend.log 2>&1
cd ..

REM Wait for services to initialize
echo ⏳ Waiting for services to start...
timeout /t 5 /nobreak >nul

echo.
echo 📊 GEO Attribution Dashboard is starting!
echo.
echo Access points:
echo   • Dashboard:  http://localhost:3000
echo   • Analytics:  http://localhost:3000/analytics
echo   • Brands:     http://localhost:3000/brands
echo   • API Docs:   http://localhost:8000/docs
echo.
echo Logs:
echo   • Backend:  type backend\backend.log
echo   • Frontend: type frontend\frontend.log
echo.
echo Press Ctrl+C to stop watching...
pause
