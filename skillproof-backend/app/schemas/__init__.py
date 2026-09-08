"""
Pydantic Schemas Package.
"""
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
)
from app.schemas.student import (
    SkillProficiencyItem,
    StudentSkillUpdate,
    StudentSkillResponse,
    CourseRecommendation,
    JobMatchItem,
    StudentMatchesResponse,
    GitHubSyncRequest,
    GitHubSyncResponse,
    StudentProfileResponse,
    StudentApplyRequest,
)
from app.schemas.recruiter import (
    JobCreate,
    JobResponse,
    SkillSummary,
    ApplicantSummary,
    ApplicantDetail,
    ApplicationStatusUpdate,
)

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TwoFactorSetupResponse",
    "TwoFactorVerifyRequest",
    "SkillProficiencyItem",
    "StudentSkillUpdate",
    "StudentSkillResponse",
    "CourseRecommendation",
    "JobMatchItem",
    "StudentMatchesResponse",
    "GitHubSyncRequest",
    "GitHubSyncResponse",
    "StudentProfileResponse",
    "StudentApplyRequest",
    "JobCreate",
    "JobResponse",
    "SkillSummary",
    "ApplicantSummary",
    "ApplicantDetail",
    "ApplicationStatusUpdate",
]

