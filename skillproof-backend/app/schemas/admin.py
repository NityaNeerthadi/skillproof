"""
Institution Admin Domain Schemas.
Pydantic v2 schemas for cohort skill gap heatmaps, placement funnel pipelines,
credential verification actions, and course recommendations.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.student import CourseRecommendation


class SkillGapHeatmapItem(BaseModel):
    skill_id: str = Field(..., description="Unique ID of the skill in taxonomy")
    skill_name: str = Field(..., description="Name of the technical skill")
    category: str = Field(..., description="Skill category domain")
    total_students_lacking: int = Field(..., description="Count of students in cohort lacking this skill")
    percentage_lacking: float = Field(..., description="Percentage of students in cohort lacking this skill (0.0 - 100.0)")

    model_config = ConfigDict(from_attributes=True)


class HeatmapResponse(BaseModel):
    department_filter: Optional[str] = Field(None, description="Department applied to filter cohort, or None if all")
    batch_filter: Optional[str] = Field(None, description="Graduating class year filter, or None if all")
    total_students: int = Field(..., description="Total student cohort count under applied filters")
    heatmap_data: List[SkillGapHeatmapItem] = Field(default_factory=list, description="Ranked skill gap items (most lacking first)")

    model_config = ConfigDict(from_attributes=True)


class PlacementFunnelItem(BaseModel):
    status_stage: str = Field(..., description="Stage in placement funnel: 'applied', 'shortlisted', or 'placed'")
    student_count: int = Field(..., description="Distinct students reaching this stage")
    percentage_of_total: float = Field(..., description="Conversion percentage relative to total students")

    model_config = ConfigDict(from_attributes=True)


class PlacementFunnelResponse(BaseModel):
    department: Optional[str] = Field(None, description="Department filter applied, if any")
    batch: Optional[str] = Field(None, description="Batch year filter applied, if any")
    total_students: int = Field(..., description="Total student cohort base")
    metrics: List[PlacementFunnelItem] = Field(default_factory=list, description="Ordered funnel stages")

    model_config = ConfigDict(from_attributes=True)


class VerificationAction(BaseModel):
    is_verified: bool = Field(..., description="True to approve and verify student profile/credentials, False to revoke")
    notes: Optional[str] = Field(None, max_length=500, description="Optional administrative notes or accreditation stamp details")


class StudentVerificationResponse(BaseModel):
    student_id: str
    email: str
    name: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    is_verified: bool
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminNudgeItem(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    students_lacking: int
    percentage_lacking: float
    course_recommendations: List[CourseRecommendation] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AdminNudgesResponse(BaseModel):
    department_filter: Optional[str] = None
    batch_filter: Optional[str] = None
    total_students: int
    nudges: List[AdminNudgeItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class AdminStudentMonitorItem(BaseModel):
    student_id: str
    name: str
    email: str
    department: Optional[str] = None
    batch: Optional[str] = None
    github_username: Optional[str] = None
    github_verified: bool = False
    trust_score: int = 85
    verified_skills_count: int = 0
    skills: List[str] = Field(default_factory=list)
    applications_count: int = 0
    placement_status: str = "seeking"  # "placed", "shortlisted", "applied", "seeking"
    is_verified: bool = False
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminStudentsResponse(BaseModel):
    total_count: int
    students: List[AdminStudentMonitorItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

