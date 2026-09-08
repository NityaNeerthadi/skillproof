"""
Recruiter Schemas:
Pydantic v2 schemas for job posting, applicant ranking pipelines,
candidate detailed inspection, and application status transitions.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import ApplicationStatus
from app.schemas.student import StudentSkillResponse, CourseRecommendation


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Job title / role name")
    description: str = Field(..., min_length=10, description="Detailed job description and responsibilities")
    type: str = Field(default="Full-time", description="Job type (Full-time, Internship, Contract)")
    stipend: Optional[str] = Field(default=None, description="Compensation / stipend info (e.g. $5000/mo)")
    required_skill_ids: List[str] = Field(
        ...,
        min_length=1,
        description="Array of fixed skill taxonomy IDs required for this role"
    )


class SkillSummary(BaseModel):
    skill_id: str
    skill_name: str
    category: str

    model_config = ConfigDict(from_attributes=True)


class JobResponse(BaseModel):
    id: str
    recruiter_id: str
    title: str
    description: str
    type: str
    stipend: Optional[str] = None
    required_skills: List[SkillSummary] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicantSummary(BaseModel):
    application_id: str
    student_id: str
    student_name: str
    student_email: str
    match_percentage: int
    missing_skills_count: int
    status: ApplicationStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicantDetail(BaseModel):
    student_id: str
    name: str
    email: str
    branch: str = "Computer Science & Engineering"
    year: str = "Class of 2026"
    github_username: Optional[str] = None
    current_skills: List[StudentSkillResponse] = Field(default_factory=list)
    missing_skills_for_job: List[str] = Field(default_factory=list)
    bridge_courses: List[CourseRecommendation] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus = Field(
        ...,
        description="Target status for candidate ('shortlisted', 'rejected', or 'placed')"
    )
