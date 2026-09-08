"""
API v1 Main Router aggregating all domain endpoints.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, student, recruiter

api_router = APIRouter()

# Register Authentication endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Register Student endpoints
api_router.include_router(student.router, prefix="/student", tags=["Student"])

# Register Recruiter endpoints
api_router.include_router(recruiter.router, tags=["Recruiter"])

