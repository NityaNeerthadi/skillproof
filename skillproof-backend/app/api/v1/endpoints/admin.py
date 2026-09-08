"""
Institution Admin Domain Endpoints.
Provides cohort skill gap heatmaps, placement funnel conversion metrics,
student academic credential verification actions, and curriculum course gap nudges.
"""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, RequireRole
from app.core.constants import UserRole, ApplicationStatus
from app.models.user import User
from app.models.skill import Skill, StudentSkill, Course
from app.models.job import Application
from app.schemas.student import CourseRecommendation
from app.schemas.admin import (
    SkillGapHeatmapItem,
    HeatmapResponse,
    PlacementFunnelItem,
    PlacementFunnelResponse,
    VerificationAction,
    StudentVerificationResponse,
    AdminNudgeItem,
    AdminNudgesResponse,
    AdminStudentMonitorItem,
    AdminStudentsResponse,
)

router = APIRouter()


@router.get(
    "/heatmap",
    response_model=HeatmapResponse,
    summary="Cohort Skill Gap Heatmap",
    description="Compute aggregate skill gaps across the student body with optional department and batch filters."
)
async def get_skill_gap_heatmap(
    department: Optional[str] = Query(None, description="Filter cohort by department"),
    batch: Optional[str] = Query(None, description="Filter cohort by graduating class batch (e.g. 2026)"),
    category: Optional[str] = Query(None, description="Filter by skill category domain"),
    limit: int = Query(100, ge=1, le=500, description="Max skills to return in heatmap"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(RequireRole("admin"))
) -> HeatmapResponse:
    # 1. Determine student cohort base
    student_filters = [User.role == UserRole.STUDENT]
    if department:
        student_filters.append(User.department == department)
    if batch:
        student_filters.append(User.batch == batch)

    total_students_stmt = select(func.count(User.id)).where(*student_filters)
    total_students = (await db.execute(total_students_stmt)).scalar() or 0

    if total_students == 0:
        return HeatmapResponse(
            department_filter=department,
            batch_filter=batch,
            total_students=0,
            heatmap_data=[]
        )

    cohort_subquery = select(User.id).where(*student_filters)

    # 2. Count distinct students who HAVE each skill
    student_having_subq = (
        select(
            StudentSkill.skill_id,
            func.count(distinct(StudentSkill.student_id)).label("students_having")
        )
        .where(StudentSkill.student_id.in_(cohort_subquery))
        .group_by(StudentSkill.skill_id)
        .subquery()
    )

    # 3. Outer join with Skill taxonomy
    skills_stmt = (
        select(
            Skill.id,
            Skill.name,
            Skill.category,
            func.coalesce(student_having_subq.c.students_having, 0).label("students_having")
        )
        .outerjoin(student_having_subq, Skill.id == student_having_subq.c.skill_id)
    )
    if category:
        skills_stmt = skills_stmt.where(Skill.category == category)

    results = (await db.execute(skills_stmt)).all()

    heatmap_items: List[SkillGapHeatmapItem] = []
    for row in results:
        having = row.students_having
        lacking = max(0, total_students - having)
        pct_lacking = round((lacking / total_students) * 100, 1)
        heatmap_items.append(
            SkillGapHeatmapItem(
                skill_id=row.id,
                skill_name=row.name,
                category=row.category,
                total_students_lacking=lacking,
                percentage_lacking=pct_lacking
            )
        )

    # 4. Sort by percentage lacking descending (biggest skill gap first)
    heatmap_items.sort(key=lambda x: (x.percentage_lacking, x.total_students_lacking), reverse=True)
    if limit:
        heatmap_items = heatmap_items[:limit]

    return HeatmapResponse(
        department_filter=department,
        batch_filter=batch,
        total_students=total_students,
        heatmap_data=heatmap_items
    )


@router.get(
    "/funnel",
    response_model=PlacementFunnelResponse,
    summary="Placement Funnel Conversion Pipeline",
    description="Query application conversion metrics (applied -> shortlisted -> placed) grouped by department and batch."
)
async def get_placement_funnel(
    department: Optional[str] = Query(None, description="Filter cohort by department"),
    batch: Optional[str] = Query(None, description="Filter cohort by graduating class batch (e.g. 2026)"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(RequireRole("admin"))
) -> PlacementFunnelResponse:
    # 1. Base cohort filter
    student_filters = [User.role == UserRole.STUDENT]
    if department:
        student_filters.append(User.department == department)
    if batch:
        student_filters.append(User.batch == batch)

    total_students_stmt = select(func.count(User.id)).where(*student_filters)
    total_students = (await db.execute(total_students_stmt)).scalar() or 0

    cohort_subquery = select(User.id).where(*student_filters)

    # Stage 1: Applied (students with at least one application in APPLIED, SHORTLISTED, or PLACED)
    applied_stmt = (
        select(func.count(distinct(Application.student_id)))
        .where(
            Application.student_id.in_(cohort_subquery),
            Application.status.in_([
                ApplicationStatus.APPLIED,
                ApplicationStatus.SHORTLISTED,
                ApplicationStatus.PLACED
            ])
        )
    )
    applied_count = (await db.execute(applied_stmt)).scalar() or 0

    # Stage 2: Shortlisted (students with at least one application in SHORTLISTED or PLACED)
    shortlisted_stmt = (
        select(func.count(distinct(Application.student_id)))
        .where(
            Application.student_id.in_(cohort_subquery),
            Application.status.in_([
                ApplicationStatus.SHORTLISTED,
                ApplicationStatus.PLACED
            ])
        )
    )
    shortlisted_count = (await db.execute(shortlisted_stmt)).scalar() or 0

    # Stage 3: Placed (students with at least one application in PLACED)
    placed_stmt = (
        select(func.count(distinct(Application.student_id)))
        .where(
            Application.student_id.in_(cohort_subquery),
            Application.status == ApplicationStatus.PLACED
        )
    )
    placed_count = (await db.execute(placed_stmt)).scalar() or 0

    pct_applied = round((applied_count / total_students * 100), 1) if total_students > 0 else 0.0
    pct_shortlisted = round((shortlisted_count / total_students * 100), 1) if total_students > 0 else 0.0
    pct_placed = round((placed_count / total_students * 100), 1) if total_students > 0 else 0.0

    metrics = [
        PlacementFunnelItem(
            status_stage="applied",
            student_count=applied_count,
            percentage_of_total=pct_applied
        ),
        PlacementFunnelItem(
            status_stage="shortlisted",
            student_count=shortlisted_count,
            percentage_of_total=pct_shortlisted
        ),
        PlacementFunnelItem(
            status_stage="placed",
            student_count=placed_count,
            percentage_of_total=pct_placed
        ),
    ]

    return PlacementFunnelResponse(
        department=department,
        batch=batch,
        total_students=total_students,
        metrics=metrics
    )


@router.patch(
    "/verify/student/{student_id}",
    response_model=StudentVerificationResponse,
    summary="Verify / Approve Student Profile",
    description="Verify/approve student profiles or institution-tagged credentials with administrative stamp."
)
async def verify_student_profile(
    student_id: str,
    payload: VerificationAction,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(RequireRole("admin"))
) -> StudentVerificationResponse:
    student = await db.get(User, student_id)
    if not student or student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile with ID '{student_id}' not found"
        )

    student.is_verified = payload.is_verified
    student.verification_notes = payload.notes
    student.verified_at = datetime.now(timezone.utc) if payload.is_verified else None

    await db.commit()
    await db.refresh(student)

    return StudentVerificationResponse(
        student_id=student.id,
        email=student.email,
        name=student.name,
        department=student.department,
        batch=student.batch,
        is_verified=student.is_verified,
        verification_notes=student.verification_notes,
        verified_at=student.verified_at
    )


@router.get(
    "/nudges",
    response_model=AdminNudgesResponse,
    summary="Curriculum Course Nudges for Top Aggregate Skill Gaps",
    description="Surface course recommendations mapped to top aggregate skill gaps across the institution."
)
async def get_curriculum_nudges(
    department: Optional[str] = Query(None, description="Filter cohort by department"),
    batch: Optional[str] = Query(None, description="Filter cohort by graduating class batch (e.g. 2026)"),
    top_k: int = Query(10, ge=1, le=50, description="Top K lacking skills to recommend courses for"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(RequireRole("admin"))
) -> AdminNudgesResponse:
    # 1. Base cohort filter
    student_filters = [User.role == UserRole.STUDENT]
    if department:
        student_filters.append(User.department == department)
    if batch:
        student_filters.append(User.batch == batch)

    total_students_stmt = select(func.count(User.id)).where(*student_filters)
    total_students = (await db.execute(total_students_stmt)).scalar() or 0

    if total_students == 0:
        return AdminNudgesResponse(
            department_filter=department,
            batch_filter=batch,
            total_students=0,
            nudges=[]
        )

    cohort_subquery = select(User.id).where(*student_filters)

    # 2. Count students having each skill
    student_having_subq = (
        select(
            StudentSkill.skill_id,
            func.count(distinct(StudentSkill.student_id)).label("students_having")
        )
        .where(StudentSkill.student_id.in_(cohort_subquery))
        .group_by(StudentSkill.skill_id)
        .subquery()
    )

    # 3. Join with skills
    skills_stmt = (
        select(
            Skill.id,
            Skill.name,
            Skill.category,
            func.coalesce(student_having_subq.c.students_having, 0).label("students_having")
        )
        .outerjoin(student_having_subq, Skill.id == student_having_subq.c.skill_id)
    )

    results = (await db.execute(skills_stmt)).all()

    # Calculate gaps and take top_k
    gap_skills = []
    for row in results:
        lacking = max(0, total_students - row.students_having)
        pct_lacking = round((lacking / total_students) * 100, 1)
        if lacking > 0:
            gap_skills.append({
                "skill_id": row.id,
                "skill_name": row.name,
                "category": row.category,
                "students_lacking": lacking,
                "percentage_lacking": pct_lacking
            })

    gap_skills.sort(key=lambda x: (x["percentage_lacking"], x["students_lacking"]), reverse=True)
    top_gaps = gap_skills[:top_k]

    if not top_gaps:
        return AdminNudgesResponse(
            department_filter=department,
            batch_filter=batch,
            total_students=total_students,
            nudges=[]
        )

    # Fetch courses for the top gap skills
    top_skill_ids = [g["skill_id"] for g in top_gaps]
    courses_stmt = select(Course).where(Course.skill_id.in_(top_skill_ids))
    courses = (await db.execute(courses_stmt)).scalars().all()

    course_dict = {}
    for c in courses:
        course_dict.setdefault(c.skill_id, []).append(
            CourseRecommendation(
                skill_id=c.skill_id,
                course_title=c.title,
                course_url=c.url
            )
        )

    nudges: List[AdminNudgeItem] = []
    for g in top_gaps:
        nudges.append(
            AdminNudgeItem(
                skill_id=g["skill_id"],
                skill_name=g["skill_name"],
                category=g["category"],
                students_lacking=g["students_lacking"],
                percentage_lacking=g["percentage_lacking"],
                course_recommendations=course_dict.get(g["skill_id"], [])
            )
        )

    return AdminNudgesResponse(
        department_filter=department,
        batch_filter=batch,
        total_students=total_students,
        nudges=nudges
    )


@router.get(
    "/students",
    response_model=AdminStudentsResponse,
    summary="Admin Student Monitoring Roster",
    description="Query and monitor students in the academic cohort with trust scores, verified skills, and placement statuses."
)
async def get_monitored_students(
    department: Optional[str] = Query(None, description="Filter by department"),
    batch: Optional[str] = Query(None, description="Filter by batch"),
    status: Optional[str] = Query(None, description="Filter by placement status: placed, shortlisted, applied, seeking, needs_verification"),
    search: Optional[str] = Query(None, description="Search term for student name or email"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(RequireRole("admin"))
) -> AdminStudentsResponse:
    stmt = (
        select(User)
        .where(User.role == UserRole.STUDENT)
        .order_by(User.name.asc())
    )
    if department:
        stmt = stmt.where(User.department == department)
    if batch:
        stmt = stmt.where(User.batch == batch)
    if search:
        search_pattern = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            func.lower(User.name).like(search_pattern) | 
            func.lower(User.email).like(search_pattern)
        )

    result = await db.execute(stmt)
    students = result.scalars().all()

    items: List[AdminStudentMonitorItem] = []
    for s in students:
        skills_stmt = select(StudentSkill.skill_id).where(StudentSkill.student_id == s.id)
        skills_res = await db.execute(skills_stmt)
        skill_ids = [row[0] for row in skills_res.all()]

        apps_stmt = select(Application.status).where(Application.student_id == s.id)
        apps_res = await db.execute(apps_stmt)
        app_statuses = [row[0] for row in apps_res.all()]

        if ApplicationStatus.PLACED in app_statuses:
            p_status = "placed"
        elif ApplicationStatus.SHORTLISTED in app_statuses:
            p_status = "shortlisted"
        elif len(app_statuses) > 0:
            p_status = "applied"
        else:
            p_status = "seeking"

        if status:
            if status == "needs_verification" and s.is_verified:
                continue
            elif status in ["placed", "shortlisted", "applied", "seeking"] and p_status != status:
                continue

        trust = 70 + min(len(skill_ids) * 5, 20) + (10 if s.github_username else 0)

        items.append(
            AdminStudentMonitorItem(
                student_id=s.id,
                name=s.name or "Student Scholar",
                email=s.email,
                department=s.department or "Computer Science & Engineering",
                batch=s.batch or "2026",
                github_username=s.github_username,
                github_verified=bool(s.github_username),
                trust_score=trust,
                verified_skills_count=len(skill_ids),
                skills=skill_ids,
                applications_count=len(app_statuses),
                placement_status=p_status,
                is_verified=bool(s.is_verified),
                verification_notes=s.verification_notes,
                verified_at=s.verified_at
            )
        )

    return AdminStudentsResponse(total_count=len(items), students=items)

