#!/bin/bash
# GEO Attribution Dashboard - Server Startup Script

echo "🚀 Starting GEO Attribution Dashboard..."

# Start Backend
echo "📦 Starting Backend API..."
cd backend
nohup python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
cd ..

# Wait for services to initialize
echo "⏳ Waiting for services to start..."
sleep 5

# Check services
echo ""
echo "🔍 Checking services..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API: http://localhost:8000 (HEALTHY)"
else
    echo "❌ Backend API: Failed to start"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: http://localhost:3000 (RUNNING)"
else
    echo "⏳ Frontend: Still starting..."
fi

echo ""
echo "📊 GEO Attribution Dashboard is ready!"
echo ""
echo "Access points:"
echo "  • Dashboard:  http://localhost:3000"
echo "  • Analytics:  http://localhost:3000/analytics"
echo "  • Brands:     http://localhost:3000/brands"
echo "  • API Docs:   http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  • Backend:  tail -f backend/backend.log"
echo "  • Frontend: tail -f frontend/frontend.log"
echo ""
echo "To stop servers:"
echo "  • kill $BACKEND_PID $FRONTEND_PID"
echo ""
