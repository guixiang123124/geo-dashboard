"""
Application configuration using Pydantic Settings.
Loads from environment variables and .env files.
"""

from typing import Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "Luminos API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: Union[str, list[str]] = "*"  # Can be "*", a single URL, or comma-separated URLs

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from string or list."""
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./geo_dashboard.db"
    # For production PostgreSQL: "postgresql+asyncpg://user:password@localhost/geo_dashboard"

    # AI API Keys
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    PERPLEXITY_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None

    # AI Model Configuration
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    GOOGLE_MODEL: str = "gemini-pro"
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"

    # Rate Limiting
    AI_REQUEST_TIMEOUT: int = 30  # seconds
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 2  # seconds

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRICE_PRO: Optional[str] = None  # price_xxx for $49/mo
    STRIPE_PRICE_ENTERPRISE: Optional[str] = None  # price_xxx for $299/mo

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    APPLE_CLIENT_ID: str = ""
    APPLE_CLIENT_SECRET: str = ""
    OAUTH_REDIRECT_BASE: str = ""  # e.g., https://geo-insights-api-production.up.railway.app
    FRONTEND_URL: str = "https://geo-dashboard-sigma-ashen.vercel.app"

    # Evaluation
    DEFAULT_INTENT_POOL_PATH: str = "data/intent_pool.json"
    DEFAULT_BRANDS_PATH: str = "data/brands_database.json"
    MAX_CONCURRENT_EVALUATIONS: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
