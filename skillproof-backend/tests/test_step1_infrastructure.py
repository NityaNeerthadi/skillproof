"""
Verification Test Suite for Step 1: Core Foundation & Database Infrastructure.
Tests:
1. Environment Configuration loading via Pydantic Settings.
2. Async Engine and Base initialization.
3. Creation of all 7 database tables.
4. Execution of async Skill Taxonomy & Course Seeder.
5. Verification of Idempotency (running seeder a 2nd time adds 0 entries).
6. Verification that Recruiter querying Job can directly navigate to applicant
   profile data (applications, student_skills, proficiency) via ORM foreign keys.
"""
import asyncio
import os
import sys

# Ensure backend root is always in sys.path regardless of execution method
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.constants import UserRole, ProficiencyLevel, ApplicationStatus
from app.models import Base, User, Skill, StudentSkill, Course, Job, JobSkill, Application
from app.db.seed import seed_taxonomy, SKILL_TAXONOMY, COURSE_MAPPINGS


@pytest.mark.asyncio
async def test_step1_database_infrastructure():
    print("\n--- Starting Verification for Step 1 ---")

    # 1. Verify Configuration
    print("1. Testing Pydantic Settings...")
    assert settings.PROJECT_NAME is not None
    assert settings.DATABASE_URL is not None
    assert settings.ALGORITHM == "HS256"
    assert settings.JWT_SECRET is not None
    print("   [PASS] Settings loaded correctly.")

    # 2. Test In-Memory / File SQLite Async Database for verification
    test_db_url = "sqlite+aiosqlite:///./test_verify_step1.db"
    test_engine = create_async_engine(test_db_url, echo=False)
    test_sessionmaker = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    print("2. Testing Table Creation from Base.metadata...")
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print(f"   [PASS] Created tables: {list(Base.metadata.tables.keys())}")
    assert set(Base.metadata.tables.keys()) == {
        "users", "skills", "student_skills", "courses", "jobs", "job_skills", "applications"
    }

    # 3. Test Seeder with the session
    print("3. Testing Async Skill Taxonomy Seeder...")
    # Monkey-patch AsyncSessionLocal in app.db.seed to use test_sessionmaker
    import app.db.seed as seed_module
    original_sessionmaker = seed_module.AsyncSessionLocal
    seed_module.AsyncSessionLocal = test_sessionmaker

    try:
        skills_added, courses_added = await seed_taxonomy()
        print(f"   [PASS] Seeded {skills_added} skills and {courses_added} courses.")
        assert skills_added == len(SKILL_TAXONOMY)
        assert courses_added == len(COURSE_MAPPINGS)

        # 4. Test Idempotency
        print("4. Testing Seeder Idempotency on 2nd Run...")
        second_skills, second_courses = await seed_taxonomy()
        print(f"   [PASS] 2nd run added: {second_skills} skills, {second_courses} courses.")
        assert second_skills == 0
        assert second_courses == 0

        # 5. Verify Recruiter Querying Job -> Applicant Profile Data via Foreign Keys
        print("5. Testing Recruiter -> Job -> Applicants -> Profile Data traversal...")
        async with test_sessionmaker() as session:
            # Create a recruiter user
            recruiter = User(
                email="recruiter@techcorp.com",
                password_hash="hashed_pw_recruiter",
                role=UserRole.RECRUITER,
                is_2fa_enabled=False
            )
            # Create a student user
            student = User(
                email="alice.student@university.edu",
                password_hash="hashed_pw_student",
                role=UserRole.STUDENT,
                github_username="alicestudent",
                is_2fa_enabled=True,
                totp_secret="JBSWY3DPEHPK3PXP"
            )
            session.add_all([recruiter, student])
            await session.flush()

            # Find skills for Python and FastAPI
            py_res = await session.execute(select(Skill).where(Skill.name == "Python"))
            python_skill = py_res.scalar_one()

            fastapi_res = await session.execute(select(Skill).where(Skill.name == "FastAPI"))
            fastapi_skill = fastapi_res.scalar_one()

            # Assign student skills
            s_skill1 = StudentSkill(
                student_id=student.id,
                skill_id=python_skill.id,
                proficiency=ProficiencyLevel.ADVANCED
            )
            s_skill2 = StudentSkill(
                student_id=student.id,
                skill_id=fastapi_skill.id,
                proficiency=ProficiencyLevel.INTERMEDIATE
            )
            session.add_all([s_skill1, s_skill2])

            # Create a job posted by recruiter
            job = Job(
                recruiter_id=recruiter.id,
                title="Junior Backend Engineer",
                description="Looking for Python and FastAPI skills",
                type="Full-time",
                stipend="$80,000/year"
            )
            session.add(job)
            await session.flush()

            # Associate Job with skills
            job_skill1 = JobSkill(job_id=job.id, skill_id=python_skill.id)
            job_skill2 = JobSkill(job_id=job.id, skill_id=fastapi_skill.id)
            session.add_all([job_skill1, job_skill2])

            # Student applies for job
            application = Application(
                student_id=student.id,
                job_id=job.id,
                status=ApplicationStatus.APPLIED
            )
            session.add(application)
            await session.commit()

            # Now test recruiter query: query the Job and access applicant profile data
            job_stmt = (
                select(Job)
                .where(Job.id == job.id)
                .options(
                    selectinload(Job.applications).selectinload(Application.student).selectinload(User.student_skills)
                )
            )
            query_res = await session.execute(job_stmt)
            queried_job = query_res.scalar_one()

            assert len(queried_job.applications) == 1
            app_record = queried_job.applications[0]
            assert app_record.status == ApplicationStatus.APPLIED

            applicant_user = app_record.student
            assert applicant_user.email == "alice.student@university.edu"
            assert applicant_user.github_username == "alicestudent"
            assert len(applicant_user.student_skills) == 2

            proficiencies = {sk.skill.name: sk.proficiency for sk in applicant_user.student_skills}
            assert proficiencies["Python"] == ProficiencyLevel.ADVANCED
            assert proficiencies["FastAPI"] == ProficiencyLevel.INTERMEDIATE
            print(f"   [PASS] Recruiter successfully accessed applicant '{applicant_user.email}' with proficiencies: {proficiencies}")

            # Also verify direct job.applicants relationship
            applicants_list = queried_job.applicants
            assert len(applicants_list) == 1
            assert applicants_list[0].id == student.id
            print(f"   [PASS] Direct job.applicants relationship verified: {applicants_list[0].email}")

    finally:
        seed_module.AsyncSessionLocal = original_sessionmaker
        await test_engine.dispose()
        # Give Windows a brief moment to release the file handle
        await asyncio.sleep(0.1)
        for _ in range(5):
            try:
                if os.path.exists("test_verify_step1.db"):
                    os.remove("test_verify_step1.db")
                break
            except PermissionError:
                await asyncio.sleep(0.1)

    print("\n--- ALL STEP 1 INFRASTRUCTURE TESTS PASSED! ---")


if __name__ == "__main__":
    asyncio.run(test_step1_database_infrastructure())
