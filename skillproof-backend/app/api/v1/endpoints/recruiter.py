"""
Recruiter Endpoints:
- Job posting & listing with taxonomy skills (POST /api/v1/jobs, GET /api/v1/jobs)
- Applicant pipeline ranked by deterministic match percentage (GET /api/v1/jobs/{job_id}/applicants)
- Candidate inspection with proficiency levels & bridge courses (GET /api/v1/recruiter/students/{student_id})
- Application status updates with strict IDOR ownership checks (PATCH /api/v1/applications/{application_id})
- Unified recruiter pipeline feed (GET /api/v1/recruiter/pipeline)
"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, RequireRole
from app.core.constants import UserRole, ApplicationStatus
from app.models.user import User
from app.models.skill import Skill, StudentSkill, Course
from app.models.job import Job, JobSkill, Application
from app.schemas.student import StudentSkillResponse, CourseRecommendation
from app.schemas.recruiter import (
    JobCreate,
    JobResponse,
    SkillSummary,
    ApplicantSummary,
    ApplicantDetail,
    ApplicationStatusUpdate,
)
from app.services.matching import calculate_match_stats

router = APIRouter()

# Guard requiring the recruiter role
recruiter_guard = RequireRole([UserRole.RECRUITER])


def _format_job_response(job: Job) -> JobResponse:
    """Helper to convert Job ORM to JobResponse with required skills list."""
    skills_list: List[SkillSummary] = []
    for js in (job.job_skills or []):
        skills_list.append(
            SkillSummary(
                skill_id=js.skill_id,
                skill_name=js.skill.name if js.skill else js.skill_id,
                category=js.skill.category if js.skill else "General"
            )
        )
    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        description=job.description,
        type=job.type,
        stipend=job.stipend,
        required_skills=skills_list,
        created_at=job.created_at
    )


# ============================================================================
# 1. JOB POSTING & MANAGEMENT
# ============================================================================

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
@router.post("/recruiter/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    current_user: Annotated[User, Depends(recruiter_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> JobResponse:
    """
    Post a new job or internship listing with required taxonomy skills.
    Validates that all specified required_skill_ids exist in the Skill Taxonomy.
    """
    # 1. Fetch valid skills from taxonomy to resolve ID or name
    all_skills_result = await session.execute(select(Skill))
    taxonomy_skills = all_skills_result.scalars().all()

    id_map = {s.id: s for s in taxonomy_skills}
    name_map = {s.name.lower(): s for s in taxonomy_skills}

    # Validate that every requested skill exists in taxonomy
    validated_skills: List[Skill] = []
    for skill_ref in payload.required_skill_ids:
        skill_obj = id_map.get(skill_ref) or name_map.get(skill_ref.lower())
        if not skill_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Required skill '{skill_ref}' not found in fixed Skill Taxonomy."
            )
        if skill_obj not in validated_skills:
            validated_skills.append(skill_obj)

    # 2. Create Job record
    new_job = Job(
        recruiter_id=current_user.id,
        title=payload.title,
        description=payload.description,
        type=payload.type,
        stipend=payload.stipend
    )
    session.add(new_job)
    await session.flush()  # Generate new_job.id

    # 3. Associate required skills
    for skill_obj in validated_skills:
        js = JobSkill(job_id=new_job.id, skill_id=skill_obj.id)
        session.add(js)

    await session.commit()

    # 4. Reload job with eagerly loaded relationships
    stmt = (
        select(Job)
        .where(Job.id == new_job.id)
        .options(selectinload(Job.job_skills).selectinload(JobSkill.skill))
    )
    res = await session.execute(stmt)
    saved_job = res.scalar_one()

    return _format_job_response(saved_job)


@router.get("/jobs", response_model=List[JobResponse])
@router.get("/recruiter/jobs", response_model=List[JobResponse])
async def list_recruiter_jobs(
    current_user: Annotated[User, Depends(recruiter_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> List[JobResponse]:
    """
    Retrieve all job listings created by the logged-in recruiter.
    """
    stmt = (
        select(Job)
        .where(Job.recruiter_id == current_user.id)
        .options(selectinload(Job.job_skills).selectinload(JobSkill.skill))
        .order_by(Job.created_at.desc())
    )
    result = await session.execute(stmt)
    jobs = result.scalars().all()

    return [_format_job_response(j) for j in jobs]


# ============================================================================
# 2. APPLICANT PIPELINE & RANKING
# ============================================================================

@router.get("/jobs/{job_id}/applicants", response_model=List[ApplicantSummary])
async def get_job_applicants(
    job_id: str,
    current_user: Annotated[User, Depends(recruiter_guard)],
    session: Annotated[AsyncSession, Depends(get_db)],
    filter_by: Optional[str] = Query(
        None,
        description="Filter applicants: 'ready_now' (100% matched) or 'in_progress' (<100% matched)"
    )
) -> List[ApplicantSummary]:
    """
    Retrieve applicants for a specific job, compute match % per applicant on the fly,
    rank descending by match %, and support filter_by ('ready_now' vs 'in_progress').
    Includes IDOR ownership verification.
    """
    # 1. Fetch Job and verify ownership
    job_stmt = (
        select(Job)
        .where(Job.id == job_id)
        .options(selectinload(Job.job_skills).selectinload(JobSkill.skill))
    )
    job_res = await session.execute(job_stmt)
    job = job_res.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job listing '{job_id}' not found."
        )

    # IDOR check: Recruiter can only inspect applicants for their own jobs
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view applicants for this job."
        )

    # Job required skill IDs
    job_skill_ids = {js.skill_id for js in (job.job_skills or []) if js.skill_id}

    # 2. Fetch applications for this job with student and student_skills
    app_stmt = (
        select(Application)
        .where(Application.job_id == job_id)
        .options(
            selectinload(Application.student)
            .selectinload(User.student_skills)
            .selectinload(StudentSkill.skill)
        )
    )
    app_res = await session.execute(app_stmt)
    applications = app_res.scalars().all()

    # 3. Compute deterministic match per applicant on the fly
    summaries: List[ApplicantSummary] = []
    for app in applications:
        student = app.student
        student_skill_ids = {
            ss.skill_id for ss in (student.student_skills or []) if ss.skill_id
        }

        match_pct, matched, missing = calculate_match_stats(
            student_skills=student_skill_ids,
            job_skills=job_skill_ids
        )

        missing_count = len(missing)

        # Apply filter_by if specified
        if filter_by == "ready_now" and missing_count > 0:
            continue
        elif filter_by == "in_progress" and missing_count == 0:
            continue

        student_name = student.email.split("@")[0].replace(".", " ").title()

        summaries.append(
            ApplicantSummary(
                application_id=app.id,
                student_id=student.id,
                student_name=student_name,
                student_email=student.email,
                match_percentage=match_pct,
                missing_skills_count=missing_count,
                status=app.status,
                created_at=app.created_at
            )
        )

    # 4. Rank applicants descending by match_percentage, then by application date
    summaries.sort(key=lambda a: (a.match_percentage, a.created_at), reverse=True)

    return summaries


# ============================================================================
# 3. APPLICANT DETAILED DOSSIER INSPECTION
# ============================================================================

@router.get("/recruiter/students/{student_id}", response_model=ApplicantDetail)
async def get_student_detail(
    student_id: str,
    current_user: Annotated[User, Depends(recruiter_guard)],
    session: Annotated[AsyncSession, Depends(get_db)],
    job_id: Optional[str] = Query(None, description="Optional job ID to calculate skill gaps and bridge courses against")
) -> ApplicantDetail:
    """
    View detailed profile of a student applicant, including proficiency levels
    and missing course recommendations if evaluated against a specific job.
    """
    # 1. Fetch student user
    student_stmt = (
        select(User)
        .where(User.id == student_id)
        .options(
            selectinload(User.student_skills).selectinload(StudentSkill.skill)
        )
    )
    student_res = await session.execute(student_stmt)
    student = student_res.scalar_one_or_none()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student applicant '{student_id}' not found."
        )

    # Build current skills response
    current_skills = [
        StudentSkillResponse(
            skill_id=ss.skill_id,
            skill_name=ss.skill.name if ss.skill else ss.skill_id,
            category=ss.skill.category if ss.skill else "General",
            proficiency=ss.proficiency
        )
        for ss in (student.student_skills or [])
    ]

    missing_skills_for_job: List[str] = []
    bridge_courses: List[CourseRecommendation] = []

    # 2. If job_id provided, calculate gap and courses
    if job_id:
        job_stmt = (
            select(Job)
            .where(Job.id == job_id)
            .options(selectinload(Job.job_skills).selectinload(JobSkill.skill))
        )
        job_res = await session.execute(job_stmt)
        job = job_res.scalar_one_or_none()

        if job and job.recruiter_id == current_user.id:
            student_skill_ids = {ss.skill_id for ss in (student.student_skills or []) if ss.skill_id}
            job_skill_ids = {js.skill_id for js in (job.job_skills or []) if js.skill_id}
            missing_ids = job_skill_ids - student_skill_ids

            skill_name_map = {
                js.skill_id: js.skill.name if js.skill else js.skill_id
                for js in (job.job_skills or [])
            }
            missing_skills_for_job = [skill_name_map.get(sid, sid) for sid in sorted(missing_ids)]

            # Fetch courses for missing skills
            if missing_ids:
                courses_stmt = (
                    select(Course)
                    .where(Course.skill_id.in_(missing_ids))
                    .options(selectinload(Course.skill))
                )
                courses_res = await session.execute(courses_stmt)
                for c in courses_res.scalars().all():
                    bridge_courses.append(
                        CourseRecommendation(
                            skill_id=c.skill_id,
                            course_title=c.title,
                            course_url=c.url
                        )
                    )

    student_name = student.email.split("@")[0].replace(".", " ").title()

    return ApplicantDetail(
        student_id=student.id,
        name=student_name,
        email=student.email,
        branch="Computer Science & Engineering",
        year="Class of 2026",
        github_username=student.github_username,
        current_skills=current_skills,
        missing_skills_for_job=missing_skills_for_job,
        bridge_courses=bridge_courses
    )


# ============================================================================
# 4. APPLICATION STATUS PROGRESSION (SHORTLIST / REJECT / PLACE)
# ============================================================================

@router.patch("/applications/{application_id}")
@router.patch("/recruiter/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdate,
    current_user: Annotated[User, Depends(recruiter_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Update applicant status ('shortlisted', 'rejected', 'placed').
    Strict IDOR prevention: verifies that the application belongs to a job posted
    by the currently authenticated recruiter.
    """
    # 1. Fetch application with linked job
    stmt = (
        select(Application)
        .where(Application.id == application_id)
        .options(selectinload(Application.job))
    )
    res = await session.execute(stmt)
    application = res.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found."
        )

    # 2. IDOR Guard: Verify ownership of the job
    if not application.job or application.job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update applications for this job."
        )

    # 3. Validate status
    allowed_statuses = {
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.PLACED,
    }
    if payload.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of {[s.value for s in allowed_statuses]}."
        )

    # 4. Update status
    application.status = payload.status
    session.add(application)
    await session.commit()

    return {
        "message": f"Application status updated to {application.status.value}.",
        "application_id": application.id,
        "job_id": application.job_id,
        "student_id": application.student_id,
        "status": application.status.value
    }


# ============================================================================
# 5. UNIFIED RECRUITER PIPELINE FEED (FRONTEND COMPATIBILITY)
# ============================================================================

@router.get("/recruiter/pipeline")
async def get_recruiter_pipeline(
    current_user: Annotated[User, Depends(recruiter_guard)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Aggregate pipeline feed returning all recruiter jobs and received applications
    formatted for the continuous notebook recruiter dashboard.
    """
    # 1. Fetch recruiter's jobs
    jobs_stmt = (
        select(Job)
        .where(Job.recruiter_id == current_user.id)
        .options(selectinload(Job.job_skills).selectinload(JobSkill.skill))
        .order_by(Job.created_at.desc())
    )
    jobs_res = await session.execute(jobs_stmt)
    jobs = jobs_res.scalars().all()

    job_ids = [j.id for j in jobs]

    # 2. Fetch all applications across recruiter's jobs
    apps_data = []
    if job_ids:
        apps_stmt = (
            select(Application)
            .where(Application.job_id.in_(job_ids))
            .options(
                selectinload(Application.student)
                .selectinload(User.student_skills)
                .selectinload(StudentSkill.skill),
                selectinload(Application.job)
            )
            .order_by(Application.created_at.desc())
        )
        apps_res = await session.execute(apps_stmt)
        applications = apps_res.scalars().all()

        for app in applications:
            student = app.student
            job = app.job
            job_skill_ids = {js.skill_id for js in (job.job_skills or []) if js.skill_id}
            student_skill_ids = {ss.skill_id for ss in (student.student_skills or []) if ss.skill_id}

            match_pct, _, missing = calculate_match_stats(student_skill_ids, job_skill_ids)
            student_name = student.email.split("@")[0].replace(".", " ").title()

            apps_data.append({
                "id": app.id,
                "job_id": app.job_id,
                "job_title": job.title,
                "student_id": student.id,
                "student_name": student_name,
                "student_email": student.email,
                "match_percentage": match_pct,
                "missing_skills_count": len(missing),
                "status": app.status.value,
                "created_at": app.created_at.isoformat() if app.created_at else None
            })

    return {
        "jobs": [_format_job_response(j) for j in jobs],
        "applications": apps_data
    }
