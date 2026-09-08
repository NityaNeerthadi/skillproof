"""
Recruiter Domain & Applicant Management Unit and Integration Test Suite:
- Job posting with taxonomy skill validation
- Recruiter job listings retrieval
- Student job application submission & duplicate prevention
- On-the-fly applicant ranking based on deterministic match %
- Filter by 'ready_now' vs 'in_progress'
- Student applicant detailed dossier inspection with bridge courses
- Application status transitions ('shortlisted', 'rejected', 'placed')
- IDOR security guard verification (preventing cross-recruiter tampering)
"""
import sys
import os
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.models.skill import Skill, StudentSkill, Course
from app.models.job import Job, JobSkill, Application
from app.core.constants import UserRole, ProficiencyLevel, ApplicationStatus
from app.core.security import get_password_hash, create_access_token


recruiter_test_db_url = "sqlite+aiosqlite:///:memory:"
recruiter_test_engine = create_async_engine(recruiter_test_db_url, echo=False)
recruiter_session_factory = async_sessionmaker(recruiter_test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db_recruiter():
    async with recruiter_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest.fixture(autouse=True)
async def setup_recruiter_test_db():
    app.dependency_overrides[get_db] = override_get_db_recruiter
    async with recruiter_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with recruiter_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_create_job_with_skills_success():
    """Verify recruiter can create a job with valid taxonomy skills."""
    async with recruiter_session_factory() as session:
        recruiter = User(
            id="rec_user_1",
            email="tech_recruiter@company.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.RECRUITER
        )
        session.add(recruiter)

        sk1 = Skill(id="sk_python", name="Python", category="Backend")
        sk2 = Skill(id="sk_fastapi", name="FastAPI", category="Backend")
        session.add_all([sk1, sk2])
        await session.commit()

    token = create_access_token(subject="rec_user_1", role=UserRole.RECRUITER.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        job_payload = {
            "title": "Backend Software Engineer",
            "description": "Develop high-throughput REST APIs using Python and FastAPI.",
            "type": "Full-time",
            "stipend": "$6000/mo",
            "required_skill_ids": ["sk_python", "sk_fastapi"]
        }
        res = await client.post("/api/v1/jobs", json=job_payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "Backend Software Engineer"
        assert data["recruiter_id"] == "rec_user_1"
        assert len(data["required_skills"]) == 2
        skill_names = {s["skill_name"] for s in data["required_skills"]}
        assert skill_names == {"Python", "FastAPI"}


@pytest.mark.asyncio
async def test_create_job_invalid_skill_fails():
    """Verify job creation fails with 404 if an invalid skill ID is provided."""
    async with recruiter_session_factory() as session:
        recruiter = User(
            id="rec_user_2",
            email="recruiter2@company.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.RECRUITER
        )
        session.add(recruiter)
        await session.commit()

    token = create_access_token(subject="rec_user_2", role=UserRole.RECRUITER.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        job_payload = {
            "title": "Data Scientist",
            "description": "Analyze complex datasets and build machine learning models.",
            "type": "Full-time",
            "required_skill_ids": ["non_existent_skill_id"]
        }
        res = await client.post("/api/v1/jobs", json=job_payload, headers=headers)
        assert res.status_code == 404
        assert "not found in fixed Skill Taxonomy" in res.json()["detail"]


@pytest.mark.asyncio
async def test_recruiter_view_jobs_list():
    """Verify recruiter can retrieve their posted job listings."""
    async with recruiter_session_factory() as session:
        recruiter = User(
            id="rec_owner",
            email="owner@hiring.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.RECRUITER
        )
        session.add(recruiter)

        job1 = Job(id="job_a", recruiter_id="rec_owner", title="Frontend Engineer", description="React apps", type="Full-time")
        job2 = Job(id="job_b", recruiter_id="rec_owner", title="DevOps Engineer", description="Kubernetes CI/CD", type="Contract")
        session.add_all([job1, job2])
        await session.commit()

    token = create_access_token(subject="rec_owner", role=UserRole.RECRUITER.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/jobs", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 2
        titles = {j["title"] for j in data}
        assert titles == {"Frontend Engineer", "DevOps Engineer"}


@pytest.mark.asyncio
async def test_student_apply_and_duplicate_prevention():
    """Verify student can apply to a job and duplicate applications are rejected."""
    async with recruiter_session_factory() as session:
        student = User(
            id="student_app_user",
            email="applicant@college.edu",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.STUDENT
        )
        recruiter = User(
            id="rec_app_user",
            email="rec@corp.com",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.RECRUITER
        )
        session.add_all([student, recruiter])

        job = Job(id="job_target", recruiter_id="rec_app_user", title="Intern", description="Internship", type="Internship")
        session.add(job)
        await session.commit()

    student_token = create_access_token(subject="student_app_user", role=UserRole.STUDENT.value, scope="full_access")
    headers = {"Authorization": f"Bearer {student_token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. First application succeeds
        res1 = await client.post("/api/v1/student/apply", json={"job_id": "job_target"}, headers=headers)
        assert res1.status_code == 201
        data = res1.json()
        assert data["job_id"] == "job_target"
        assert data["status"] == "applied"

        # 2. Second application rejected as duplicate
        res2 = await client.post("/api/v1/student/apply", json={"job_id": "job_target"}, headers=headers)
        assert res2.status_code == 400
        assert "already submitted an application" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_recruiter_job_applicants_ranking_and_filter():
    """
    Verify applicants are ranked by match percentage descending and can be filtered by:
    - filter_by=ready_now (100% matched)
    - filter_by=in_progress (<100% matched)
    """
    async with recruiter_session_factory() as session:
        recruiter = User(id="rec_ranker", email="ranker@firm.com", password_hash=get_password_hash("Pass123!"), role=UserRole.RECRUITER)
        student_ready = User(id="std_ready", email="ready.student@edu.com", password_hash=get_password_hash("Pass123!"), role=UserRole.STUDENT)
        student_gap = User(id="std_gap", email="gap.student@edu.com", password_hash=get_password_hash("Pass123!"), role=UserRole.STUDENT)
        session.add_all([recruiter, student_ready, student_gap])

        # Skills
        sk_py = Skill(id="sk_p", name="Python", category="Backend")
        sk_fa = Skill(id="sk_f", name="FastAPI", category="Backend")
        sk_dk = Skill(id="sk_d", name="Docker", category="Cloud & DevOps")
        session.add_all([sk_py, sk_fa, sk_dk])

        # Student Ready has all 3 skills (100%)
        ss_r1 = StudentSkill(id="ssr1", student_id="std_ready", skill_id="sk_p")
        ss_r2 = StudentSkill(id="ssr2", student_id="std_ready", skill_id="sk_f")
        ss_r3 = StudentSkill(id="ssr3", student_id="std_ready", skill_id="sk_d")

        # Student Gap has only Python (33%)
        ss_g1 = StudentSkill(id="ssg1", student_id="std_gap", skill_id="sk_p")
        session.add_all([ss_r1, ss_r2, ss_r3, ss_g1])

        # Job requires all 3 skills
        job = Job(id="job_ranked", recruiter_id="rec_ranker", title="Platform Engineer", description="Dev", type="Full-time")
        session.add(job)
        js1 = JobSkill(id="js_r1", job_id="job_ranked", skill_id="sk_p")
        js2 = JobSkill(id="js_r2", job_id="job_ranked", skill_id="sk_f")
        js3 = JobSkill(id="js_r3", job_id="job_ranked", skill_id="sk_d")
        session.add_all([js1, js2, js3])

        # Applications
        app_ready = Application(id="app_100", student_id="std_ready", job_id="job_ranked", status=ApplicationStatus.APPLIED)
        app_gap = Application(id="app_33", student_id="std_gap", job_id="job_ranked", status=ApplicationStatus.APPLIED)
        session.add_all([app_ready, app_gap])
        await session.commit()

    token = create_access_token(subject="rec_ranker", role=UserRole.RECRUITER.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unfiltered: returns both ranked descending
        res = await client.get("/api/v1/jobs/job_ranked/applicants", headers=headers)
        assert res.status_code == 200
        applicants = res.json()
        assert len(applicants) == 2
        assert applicants[0]["student_id"] == "std_ready"
        assert applicants[0]["match_percentage"] == 100
        assert applicants[0]["missing_skills_count"] == 0
        assert applicants[1]["student_id"] == "std_gap"
        assert applicants[1]["match_percentage"] == 33
        assert applicants[1]["missing_skills_count"] == 2

        # 2. Filter ready_now: only 100% matched
        res_ready = await client.get("/api/v1/jobs/job_ranked/applicants?filter_by=ready_now", headers=headers)
        assert res_ready.status_code == 200
        assert len(res_ready.json()) == 1
        assert res_ready.json()[0]["student_id"] == "std_ready"

        # 3. Filter in_progress: only <100% matched
        res_prog = await client.get("/api/v1/jobs/job_ranked/applicants?filter_by=in_progress", headers=headers)
        assert res_prog.status_code == 200
        assert len(res_prog.json()) == 1
        assert res_prog.json()[0]["student_id"] == "std_gap"


@pytest.mark.asyncio
async def test_recruiter_view_student_detail_with_gap_courses():
    """Verify candidate inspection returns skills, missing skills, and bridge courses."""
    async with recruiter_session_factory() as session:
        recruiter = User(id="rec_inspect", email="rec@inspect.com", password_hash=get_password_hash("Pass123!"), role=UserRole.RECRUITER)
        student = User(id="std_inspect", email="jane.doe@uni.edu", password_hash=get_password_hash("Pass123!"), role=UserRole.STUDENT, github_username="janedoe")
        session.add_all([recruiter, student])

        sk_py = Skill(id="sk_py_insp", name="Python", category="Backend")
        sk_redis = Skill(id="sk_rd_insp", name="Redis", category="Databases")
        session.add_all([sk_py, sk_redis])

        # Course for Redis
        course_redis = Course(id="c_rd", skill_id="sk_rd_insp", title="Redis in Action", url="https://redis.com/learn")
        session.add(course_redis)

        # Student has Python
        ss = StudentSkill(id="ss_insp", student_id="std_inspect", skill_id="sk_py_insp", proficiency=ProficiencyLevel.ADVANCED)
        session.add(ss)

        # Job requires Python & Redis
        job = Job(id="job_insp", recruiter_id="rec_inspect", title="Backend Lead", description="Lead", type="Full-time")
        session.add(job)
        js1 = JobSkill(id="js_i1", job_id="job_insp", skill_id="sk_py_insp")
        js2 = JobSkill(id="js_i2", job_id="job_insp", skill_id="sk_rd_insp")
        session.add_all([js1, js2])
        await session.commit()

    token = create_access_token(subject="rec_inspect", role=UserRole.RECRUITER.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/recruiter/students/std_inspect?job_id=job_insp", headers=headers)
        assert res.status_code == 200
        detail = res.json()
        assert detail["student_id"] == "std_inspect"
        assert detail["github_username"] == "janedoe"
        assert len(detail["current_skills"]) == 1
        assert detail["current_skills"][0]["skill_name"] == "Python"
        assert detail["missing_skills_for_job"] == ["Redis"]
        assert len(detail["bridge_courses"]) == 1
        assert detail["bridge_courses"][0]["course_title"] == "Redis in Action"


@pytest.mark.asyncio
async def test_update_application_status():
    """Verify recruiter can progress application status: shortlisted -> placed."""
    async with recruiter_session_factory() as session:
        recruiter = User(id="rec_updater", email="rec@updater.com", password_hash=get_password_hash("Pass123!"), role=UserRole.RECRUITER)
        student = User(id="std_updated", email="student@update.com", password_hash=get_password_hash("Pass123!"), role=UserRole.STUDENT)
        session.add_all([recruiter, student])

        job = Job(id="job_update", recruiter_id="rec_updater", title="Dev", description="Role", type="Full-time")
        session.add(job)

        app_record = Application(id="app_to_update", student_id="std_updated", job_id="job_update", status=ApplicationStatus.APPLIED)
        session.add(app_record)
        await session.commit()

    token = create_access_token(subject="rec_updater", role=UserRole.RECRUITER.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Shortlist
        res1 = await client.patch("/api/v1/applications/app_to_update", json={"status": "shortlisted"}, headers=headers)
        assert res1.status_code == 200
        assert res1.json()["status"] == "shortlisted"

        # 2. Place
        res2 = await client.patch("/api/v1/applications/app_to_update", json={"status": "placed"}, headers=headers)
        assert res2.status_code == 200
        assert res2.json()["status"] == "placed"


@pytest.mark.asyncio
async def test_idor_prevention_on_applicant_management():
    """Verify Recruiter 2 cannot view or update applicants for Recruiter 1's job."""
    async with recruiter_session_factory() as session:
        rec1 = User(id="rec_1", email="rec1@corp.com", password_hash=get_password_hash("Pass123!"), role=UserRole.RECRUITER)
        rec2 = User(id="rec_2", email="rec2@corp.com", password_hash=get_password_hash("Pass123!"), role=UserRole.RECRUITER)
        student = User(id="std_victim", email="student@victim.com", password_hash=get_password_hash("Pass123!"), role=UserRole.STUDENT)
        session.add_all([rec1, rec2, student])

        # Job belongs to Recruiter 1
        job1 = Job(id="job_rec1", recruiter_id="rec_1", title="Secret Job", description="Private", type="Full-time")
        session.add(job1)

        app_rec1 = Application(id="app_rec1", student_id="std_victim", job_id="job_rec1", status=ApplicationStatus.APPLIED)
        session.add(app_rec1)
        await session.commit()

    # Recruiter 2 tries to access Recruiter 1's job
    token_rec2 = create_access_token(subject="rec_2", role=UserRole.RECRUITER.value, scope="full_access")
    headers_rec2 = {"Authorization": f"Bearer {token_rec2}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Cannot view applicants
        res_view = await client.get("/api/v1/jobs/job_rec1/applicants", headers=headers_rec2)
        assert res_view.status_code == 403
        assert "not have permission" in res_view.json()["detail"]

        # Cannot modify application status
        res_patch = await client.patch("/api/v1/applications/app_rec1", json={"status": "shortlisted"}, headers=headers_rec2)
        assert res_patch.status_code == 403
        assert "not authorized" in res_patch.json()["detail"]
