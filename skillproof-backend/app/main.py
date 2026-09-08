from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine
from app.db.seed import seed_taxonomy


def _ensure_user_columns(connection):
    from sqlalchemy import inspect, text
    inspector = inspect(connection)
    if "users" in inspector.get_table_names():
        existing_cols = {col["name"] for col in inspector.get_columns("users")}
        col_defs = [
            ("name", "VARCHAR(150)"),
            ("department", "VARCHAR(100) DEFAULT 'Computer Science & Engineering'"),
            ("batch", "VARCHAR(50) DEFAULT '2026'"),
            ("is_verified", "BOOLEAN DEFAULT 0 NOT NULL"),
            ("verification_notes", "VARCHAR(500)"),
            ("verified_at", "TIMESTAMP")
        ]
        for col_name, col_type in col_defs:
            if col_name not in existing_cols:
                try:
                    connection.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                except Exception as e:
                    print(f"Column migration notice ({col_name}): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Event:
    Automatically ensures all database tables exist, evolves schemas, and seeds the immutable Skill Taxonomy.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_ensure_user_columns)
    try:
        await seed_taxonomy()
    except Exception as exc:
        print(f"Taxonomy initialization note: {exc}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Academia-Industry Collaboration & Verified Competence Platform",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": "skills tell stories"
    }
