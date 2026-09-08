from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine
from app.db.seed import seed_taxonomy


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Event:
    Automatically ensures all database tables exist and seeds the immutable Skill Taxonomy.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
