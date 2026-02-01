"""
Main FastAPI application for GEO Attribution Dashboard.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..core.config import settings
from ..core.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    print("Database initialized")

    yield

    # Shutdown
    print("Shutting down...")
    await close_db()
    print("Database connections closed")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for tracking brand performance in AI chatbot responses",
    lifespan=lifespan,
)

# Configure CORS
# In production, set CORS_ORIGINS env var to specific domains
# e.g., CORS_ORIGINS="https://geo.yourdomain.com,https://app.yourdomain.com"
cors_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS != ["*"] else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if cors_origins != ["*"] else False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "GEO Attribution Dashboard API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Import and include routers
from .routes import auth, brands, evaluations, scores, prompts, models

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(brands.router, prefix=f"{settings.API_V1_PREFIX}/brands", tags=["brands"])
app.include_router(evaluations.router, prefix=f"{settings.API_V1_PREFIX}/evaluations", tags=["evaluations"])
app.include_router(scores.router, prefix=f"{settings.API_V1_PREFIX}/scores", tags=["scores"])
app.include_router(prompts.router, prefix=f"{settings.API_V1_PREFIX}/prompts", tags=["prompts"])
app.include_router(models.router, prefix=f"{settings.API_V1_PREFIX}/models", tags=["models"])
