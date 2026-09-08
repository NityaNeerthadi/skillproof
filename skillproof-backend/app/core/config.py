"""
SkillProof Application Settings and Environment Configuration.
Built with Pydantic v2 and pydantic-settings.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillProof Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security & Auth
    JWT_SECRET: str = "skillproof-development-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    TWO_FACTOR_TOKEN_EXPIRE_MINUTES: int = 5    # 5 minutes for 2FA pending step

    # Database
    # Default is async PostgreSQL driver (postgresql+asyncpg://...)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/skillproof_db"

    # Redis Cache & Session
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # External GitHub Integration (Optional)
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
