"""
Student Schemas:
Pydantic v2 schemas for student skill portfolios, deterministic matching responses,
course bridge recommendations, and GitHub repository sync requests.
"""
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import ProficiencyLevel


class SkillProficiencyItem(BaseModel):
    skill_id: str = Field(..., description="Unique ID of the taxonomy skill")
    proficiency: ProficiencyLevel = Field(
        default=ProficiencyLevel.BEGINNER,
        description="Self-assessed proficiency level"
    )


class StudentSkillUpdate(BaseModel):
    skills: List[SkillProficiencyItem] = Field(
        ...,
        description="List of skill IDs and corresponding proficiency ratings"
    )


class StudentSkillResponse(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    proficiency: ProficiencyLevel

    model_config = ConfigDict(from_attributes=True)


class CourseRecommendation(BaseModel):
    skill_id: str
    course_title: str
    course_url: str

    model_config = ConfigDict(from_attributes=True)


class JobMatchItem(BaseModel):
    job_id: str
    job_title: str
    type: str
    stipend: Optional[str] = None
    match_percentage: int
    missing_skills_count: int
    missing_skills: List[str] = Field(default_factory=list)
    courses_to_bridge: List[CourseRecommendation] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class StudentMatchesResponse(BaseModel):
    qualifiable_now: List[JobMatchItem] = Field(
        default_factory=list,
        description="Jobs where missing_skills_count == 0 (100% matched), sorted by match % descending"
    )
    reachable_later: List[JobMatchItem] = Field(
        default_factory=list,
        description="Jobs with missing skills, sorted by missing_skills_count ascending (fewest missing skills first)"
    )


class GitHubSyncRequest(BaseModel):
    github_username: str = Field(..., min_length=1, max_length=100, description="GitHub profile username")


class GitHubSyncResponse(BaseModel):
    github_username: str
    suggested_skills: List[str] = Field(
        default_factory=list,
        description="Skills identified in GitHub repositories matching the Skill taxonomy"
    )
    repos_analyzed: int = Field(0, description="Total public repositories analyzed")


class StudentProfileResponse(BaseModel):
    id: str
    email: str
    role: str
    github_username: Optional[str] = None
    skills: List[StudentSkillResponse] = Field(default_factory=list)
    trust_score: int = 85
    github_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class StudentApplyRequest(BaseModel):
    job_id: str = Field(..., description="ID of the job to apply for")

