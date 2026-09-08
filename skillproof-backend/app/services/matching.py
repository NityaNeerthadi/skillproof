"""
Deterministic Matching Engine:
Implements exact set-intersection mathematics for skill matching,
gap analysis, and course bridge recommendations.
"""
from typing import Dict, List, Set, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.job import Job, JobSkill
from app.models.skill import Skill, StudentSkill, Course
from app.schemas.student import (
    JobMatchItem,
    CourseRecommendation,
    StudentMatchesResponse,
)


def calculate_match_stats(
    student_skills: Set[str],
    job_skills: Set[str]
) -> Tuple[int, Set[str], Set[str]]:
    """
    Pure deterministic set-intersection calculation:
    - Match % = (|StudentSkills ∩ JobSkills| / |JobSkills|) * 100
    - Missing Skills = JobSkills \\ StudentSkills

    Returns:
        (match_percentage, matched_skills, missing_skills)
    """
    if not job_skills:
        return 100, set(), set()

    matched = student_skills.intersection(job_skills)
    missing = job_skills - student_skills
    match_percentage = round((len(matched) / len(job_skills)) * 100)

    return match_percentage, matched, missing


def build_job_match_item(
    job: Job,
    student_skill_ids: Set[str],
    courses_by_skill_id: Dict[str, List[CourseRecommendation]],
    courses_by_skill_name: Dict[str, List[CourseRecommendation]]
) -> JobMatchItem:
    """
    Build a JobMatchItem for a single Job against a set of student skill IDs/names.
    """
    job_skills = job.job_skills or []

    # Map job skill IDs and names
    job_skill_ids = set()
    job_skill_names_by_id: Dict[str, str] = {}

    for js in job_skills:
        if js.skill_id:
            job_skill_ids.add(js.skill_id)
            skill_name = js.skill.name if js.skill else js.skill_id
            job_skill_names_by_id[js.skill_id] = skill_name

    # Set difference and intersection
    matched_ids = student_skill_ids.intersection(job_skill_ids)
    missing_ids = job_skill_ids - student_skill_ids

    total_count = len(job_skill_ids)
    if total_count == 0:
        match_percentage = 100
    else:
        match_percentage = round((len(matched_ids) / total_count) * 100)

    missing_names = [
        job_skill_names_by_id.get(sid, sid)
        for sid in sorted(missing_ids)
    ]

    # Populate course bridge recommendations for missing skills
    courses_to_bridge: List[CourseRecommendation] = []
    seen_course_urls = set()

    for sid in sorted(missing_ids):
        # Look up by skill ID first
        courses = courses_by_skill_id.get(sid, [])
        # Fallback to name if not found by ID
        if not courses:
            skill_name = job_skill_names_by_id.get(sid, "")
            courses = courses_by_skill_name.get(skill_name.lower(), [])

        for c in courses:
            if c.course_url not in seen_course_urls:
                seen_course_urls.add(c.course_url)
                courses_to_bridge.append(c)

    return JobMatchItem(
        job_id=job.id,
        job_title=job.title,
        type=job.type,
        stipend=job.stipend,
        match_percentage=match_percentage,
        missing_skills_count=len(missing_ids),
        missing_skills=missing_names,
        courses_to_bridge=courses_to_bridge
    )


async def compute_student_matches(
    session: AsyncSession,
    student_id: str
) -> StudentMatchesResponse:
    """
    Query database, evaluate student skills against all available jobs,
    and partition into 'qualifiable_now' and 'reachable_later'.

    - qualifiable_now: missing_skills_count == 0, sorted by match_percentage DESC.
    - reachable_later: missing_skills_count > 0, sorted by missing_skills_count ASC.
    """
    # 1. Fetch student's skills
    student_skills_stmt = (
        select(StudentSkill)
        .where(StudentSkill.student_id == student_id)
        .options(selectinload(StudentSkill.skill))
    )
    student_skills_result = await session.execute(student_skills_stmt)
    student_skills = student_skills_result.scalars().all()

    student_skill_ids: Set[str] = {ss.skill_id for ss in student_skills if ss.skill_id}
    # Also support name matching in case skill was linked by name
    student_skill_names: Set[str] = {
        ss.skill.name.lower() for ss in student_skills if ss.skill and ss.skill.name
    }

    # 2. Fetch all jobs with skills
    jobs_stmt = (
        select(Job)
        .options(
            selectinload(Job.job_skills).selectinload(JobSkill.skill)
        )
    )
    jobs_result = await session.execute(jobs_stmt)
    jobs = jobs_result.scalars().all()

    # 3. Fetch courses to build bridge dictionary
    courses_stmt = select(Course).options(selectinload(Course.skill))
    courses_result = await session.execute(courses_stmt)
    courses = courses_result.scalars().all()

    courses_by_skill_id: Dict[str, List[CourseRecommendation]] = {}
    courses_by_skill_name: Dict[str, List[CourseRecommendation]] = {}

    for c in courses:
        rec = CourseRecommendation(
            skill_id=c.skill_id,
            course_title=c.title,
            course_url=c.url
        )
        courses_by_skill_id.setdefault(c.skill_id, []).append(rec)
        if c.skill and c.skill.name:
            courses_by_skill_name.setdefault(c.skill.name.lower(), []).append(rec)

    # 4. Evaluate each job
    qualifiable_now: List[JobMatchItem] = []
    reachable_later: List[JobMatchItem] = []

    for job in jobs:
        match_item = build_job_match_item(
            job=job,
            student_skill_ids=student_skill_ids,
            courses_by_skill_id=courses_by_skill_id,
            courses_by_skill_name=courses_by_skill_name
        )

        if match_item.missing_skills_count == 0:
            qualifiable_now.append(match_item)
        else:
            reachable_later.append(match_item)

    # 5. Sorting rules:
    # qualifiable_now: sorted by match_percentage DESC
    qualifiable_now.sort(key=lambda x: x.match_percentage, reverse=True)
    # reachable_later: sorted by missing_skills_count ASC (fewest missing first)
    reachable_later.sort(key=lambda x: (x.missing_skills_count, -x.match_percentage))

    return StudentMatchesResponse(
        qualifiable_now=qualifiable_now,
        reachable_later=reachable_later
    )
