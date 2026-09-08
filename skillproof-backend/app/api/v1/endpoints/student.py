"""
Student Endpoints:
- Skill portfolio retrieval and upsert (GET/POST/PUT /api/v1/student/skills)
- Deterministic job matching engine (GET /api/v1/student/matches)
- GitHub repository skill analysis & verification (POST /api/v1/student/github/verify)
- Student profile & application submission (GET /profile, GET /jobs, POST /apply/{job_id})
"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, RequireRole
from app.core.constants import UserRole, ApplicationStatus
from app.models.user import User
from app.models.skill import Skill, StudentSkill
from app.models.job import Job, JobSkill, Application
from app.schemas.student import (
    StudentSkillUpdate,
    StudentSkillResponse,
    StudentMatchesResponse,
    GitHubSyncRequest,
    GitHubSyncResponse,
    StudentProfileResponse,
    StudentApplyRequest,
)
from app.services.matching import compute_student_matches
from app.services.github_sync import sync_github_repositories

router = APIRouter()

# Guard requiring the student role
student_guard = RequireRole([UserRole.STUDENT])


@router.get("/skills", response_model=List[StudentSkillResponse])
async def get_student_skills(
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> List[StudentSkillResponse]:
    """
    Retrieve current authenticated student's active skill portfolio.
    """
    stmt = (
        select(StudentSkill)
        .where(StudentSkill.student_id == current_user.id)
        .options(selectinload(StudentSkill.skill))
    )
    result = await session.execute(stmt)
    student_skills = result.scalars().all()

    return [
        StudentSkillResponse(
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else ss.skill_id,
            category=ss.skill.category if ss.skill else "General",
            proficiency=ss.proficiency
        )
        for ss in student_skills
    ]


@router.post("/skills", response_model=List[StudentSkillResponse])
@router.put("/skills", response_model=List[StudentSkillResponse])
async def update_student_skills(
    payload: StudentSkillUpdate,
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> List[StudentSkillResponse]:
    """
    Upsert student skill choices and proficiencies.
    Replaces current skills with the submitted set.
    """
    # 1. Fetch valid skills from taxonomy to resolve ID or name
    all_skills_result = await session.execute(select(Skill))
    taxonomy_skills = all_skills_result.scalars().all()

    # Map by ID and by lowercase name for robust client matching
    id_map = {s.id: s for s in taxonomy_skills}
    name_map = {s.name.lower(): s for s in taxonomy_skills}

    # 2. Validate requested skills
    valid_skill_entries = []
    for item in payload.skills:
        skill_obj = id_map.get(item.skill_id) or name_map.get(item.skill_id.lower())
        if not skill_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill with ID or name '{item.skill_id}' not found in Skill Taxonomy."
            )
        valid_skill_entries.append((skill_obj, item.proficiency))

    # 3. Clear existing student skills
    await session.execute(
        delete(StudentSkill).where(StudentSkill.student_id == current_user.id)
    )

    # 4. Insert updated skill records
    for skill_obj, proficiency in valid_skill_entries:
        new_ss = StudentSkill(
            student_id=current_user.id,
            skill_id=skill_obj.id,
            proficiency=proficiency
        )
        session.add(new_ss)

    await session.commit()

    # 5. Return updated list
    stmt = (
        select(StudentSkill)
        .where(StudentSkill.student_id == current_user.id)
        .options(selectinload(StudentSkill.skill))
    )
    result = await session.execute(stmt)
    student_skills = result.scalars().all()

    return [
        StudentSkillResponse(
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else ss.skill_id,
            category=ss.skill.category if ss.skill else "General",
            proficiency=ss.proficiency
        )
        for ss in student_skills
    ]


@router.get("/matches", response_model=StudentMatchesResponse)
async def get_student_matches(
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> StudentMatchesResponse:
    """
    Execute deterministic matching engine for the student:
    - qualifiable_now: 100% matched, sorted by match % DESC.
    - reachable_later: missing_skills_count > 0, sorted by missing count ASC.
    """
    return await compute_student_matches(
        session=session,
        student_id=current_user.id
    )


@router.post("/github/verify", response_model=GitHubSyncResponse)
@router.post("/verify-github", response_model=GitHubSyncResponse)
async def verify_github_account(
    payload: GitHubSyncRequest,
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> GitHubSyncResponse:
    """
    Query GitHub API for public repositories belonging to the username,
    extract language and topic tags, match against database skill taxonomy,
    and link the GitHub username to the student's profile.
    """
    sync_result = await sync_github_repositories(
        username=payload.github_username,
        session=session
    )

    # Link verified GitHub username to user profile
    current_user.github_username = sync_result.github_username
    session.add(current_user)
    await session.commit()

    return sync_result


# ============================================================================
# FRONTEND COMPATIBILITY & LIFECYCLE ENDPOINTS
# ============================================================================

@router.get("/profile", response_model=StudentProfileResponse)
async def get_student_profile(
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> StudentProfileResponse:
    """
    Retrieve student profile with skills, GitHub verification status, and trust score.
    """
    stmt = (
        select(StudentSkill)
        .where(StudentSkill.student_id == current_user.id)
        .options(selectinload(StudentSkill.skill))
    )
    result = await session.execute(stmt)
    student_skills = result.scalars().all()

    skills_data = [
        StudentSkillResponse(
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else ss.skill_id,
            category=ss.skill.category if ss.skill else "General",
            proficiency=ss.proficiency
        )
        for ss in student_skills
    ]

    has_github = bool(current_user.github_username)
    trust_score = 95 if has_github and len(skills_data) >= 3 else (85 if len(skills_data) > 0 else 70)

    return StudentProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        github_username=current_user.github_username,
        skills=skills_data,
        trust_score=trust_score,
        github_verified=has_github
    )


@router.get("/jobs")
async def get_student_jobs_list(
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Retrieve all jobs formatted for the student UI with required skills and match calculations.
    """
    matches = await compute_student_matches(session, current_user.id)
    # Combine qualifiable_now and reachable_later for unified list
    return matches.qualifiable_now + matches.reachable_later


@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def submit_application(
    payload: StudentApplyRequest,
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Accepts job_id in body, checks for duplicate application records,
    and creates entry in applications table.
    """
    job = await session.get(Job, payload.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{payload.job_id}' not found."
        )

    # Check for duplicate application
    existing_stmt = select(Application).where(
        Application.student_id == current_user.id,
        Application.job_id == payload.job_id
    )
    existing_res = await session.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this job."
        )

    application = Application(
        student_id=current_user.id,
        job_id=payload.job_id,
        status=ApplicationStatus.APPLIED
    )
    session.add(application)
    await session.commit()

    return {
        "message": "Application submitted successfully.",
        "application_id": application.id,
        "job_id": payload.job_id,
        "status": application.status.value
    }


@router.post("/apply/{job_id}", status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: str,
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Submit an application for a specific job listing via URL path param.
    """
    # Verify job exists
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )

    # Check for duplicate application
    existing_stmt = select(Application).where(
        Application.student_id == current_user.id,
        Application.job_id == job_id
    )
    existing_res = await session.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this job."
        )

    # Create application
    application = Application(
        student_id=current_user.id,
        job_id=job_id,
        status=ApplicationStatus.APPLIED
    )
    session.add(application)
    await session.commit()

    return {
        "message": "Application submitted successfully.",
        "application_id": application.id,
        "job_id": job_id,
        "status": application.status.value
    }


@router.get("/applications")
async def get_student_applications(
    current_user: Annotated[User, Depends(student_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Retrieve all job applications submitted by the current student.
    """
    stmt = (
        select(Application)
        .where(Application.student_id == current_user.id)
        .options(selectinload(Application.job))
    )
    result = await session.execute(stmt)
    applications = result.scalars().all()

    return [
        {
            "id": app.id,
            "job_id": app.job_id,
            "job_title": app.job.title if app.job else "Unknown",
            "job_type": app.job.type if app.job else "Full-time",
            "status": app.status.value if hasattr(app.status, "value") else str(app.status),
            "created_at": app.created_at.isoformat() if app.created_at else None
        }
        for app in applications
    ]
