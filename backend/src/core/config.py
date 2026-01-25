"""
Application configuration using Pydantic Settings.
Loads from environment variables and .env files.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "GEO Attribution Dashboard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["*"]  # Allow all origins for development

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./geo_dashboard.db"
    # For production PostgreSQL: "postgresql+asyncpg://user:password@localhost/geo_dashboard"

    # AI API Keys
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    PERPLEXITY_API_KEY: Optional[str] = None

    # AI Model Configuration
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    GOOGLE_MODEL: str = "gemini-pro"
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"

    # Rate Limiting
    AI_REQUEST_TIMEOUT: int = 30  # seconds
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 2  # seconds

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

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
