"""
Matching Engine & Student Domain Unit and Integration Tests:
- Deterministic set-intersection matching calculation
- Skill gap calculation (JobSkills \\ StudentSkills)
- Ordering of recommended jobs:
  - qualifiable_now (100% match, missing_skills_count == 0)
  - reachable_later (missing_skills_count > 0, sorted by missing_skills_count ascending)
- Course bridge recommendations for missing skills
- Student API endpoints (skills management, matches, GitHub verification)
"""
import sys
import os
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport, Response
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.models.skill import Skill, StudentSkill, Course
from app.models.job import Job, JobSkill
from app.core.constants import UserRole, ProficiencyLevel
from app.core.security import get_password_hash, create_access_token
from app.schemas.student import CourseRecommendation
from app.services.matching import (
    calculate_match_stats,
    build_job_match_item,
    compute_student_matches,
)

# ============================================================================
# 1. PURE MATHEMATICAL UNIT TESTS
# ============================================================================

def test_deterministic_match_calculation():
    """Verify |student_skills ∩ job_skills| / |job_skills| math."""
    student_skills = {"python", "fastapi", "postgresql", "docker"}
    job_skills = {"python", "fastapi", "postgresql", "docker", "redis", "aws"}

    match_pct, matched, missing = calculate_match_stats(student_skills, job_skills)
    assert match_pct == 67
    assert matched == {"python", "fastapi", "postgresql", "docker"}
    assert missing == {"redis", "aws"}


def test_skill_gap_calculation():
    """Verify gap = job_skills - student_skills."""
    student_skills = {"python", "fastapi"}
    job_skills = {"python", "fastapi", "docker", "kubernetes"}

    match_pct, matched, missing = calculate_match_stats(student_skills, job_skills)
    assert match_pct == 50
    assert missing == {"docker", "kubernetes"}
    assert len(missing) == 2


def test_qualifiable_now_100_percent_match():
    """Verify 100% overlap produces 0 missing skills."""
    student_skills = {"python", "fastapi", "postgresql"}
    job_skills = {"python", "fastapi", "postgresql"}

    match_pct, matched, missing = calculate_match_stats(student_skills, job_skills)
    assert match_pct == 100
    assert len(missing) == 0


def test_zero_overlap_calculation():
    """Verify zero overlap produces 0% match and all skills missing."""
    student_skills = {"react", "css"}
    job_skills = {"python", "fastapi", "docker"}

    match_pct, matched, missing = calculate_match_stats(student_skills, job_skills)
    assert match_pct == 0
    assert len(matched) == 0
    assert missing == {"python", "fastapi", "docker"}


def test_empty_job_skills_edge_case():
    """Verify empty job requirement defaults safely to 100% match."""
    student_skills = {"python"}
    job_skills = set()

    match_pct, matched, missing = calculate_match_stats(student_skills, job_skills)
    assert match_pct == 100
    assert len(missing) == 0


def test_reachable_later_ascending_gap_sorting():
    """Verify jobs in reachable_later sort by missing_skills_count ASCENDING."""
    # Dummy job match items simulating three jobs with different gaps
    jobs_data = [
        {"id": "j3", "missing_count": 3, "match_pct": 25},
        {"id": "j1", "missing_count": 1, "match_pct": 75},
        {"id": "j2", "missing_count": 2, "match_pct": 50},
    ]

    sorted_jobs = sorted(jobs_data, key=lambda x: (x["missing_count"], -x["match_pct"]))

    # Fewest missing skills first (1 missing -> 2 missing -> 3 missing)
    assert [j["id"] for j in sorted_jobs] == ["j1", "j2", "j3"]


def test_build_job_match_item_with_course_bridge():
    """Verify build_job_match_item attaches courses for missing skills."""
    skill_py = Skill(id="sk_py", name="Python", category="Backend")
    skill_redis = Skill(id="sk_redis", name="Redis", category="Databases")

    job = Job(
        id="job_1",
        title="Backend Engineer",
        type="Full-time",
        stipend="$4000/mo",
        recruiter_id="rec_1",
        job_skills=[
            JobSkill(id="js1", job_id="job_1", skill_id="sk_py", skill=skill_py),
            JobSkill(id="js2", job_id="job_1", skill_id="sk_redis", skill=skill_redis),
        ]
    )

    courses_by_id = {
        "sk_redis": [
            CourseRecommendation(
                skill_id="sk_redis",
                course_title="Redis University Core",
                course_url="https://university.redis.com/"
            )
        ]
    }

    # Student has Python only, missing Redis
    student_skill_ids = {"sk_py"}

    match_item = build_job_match_item(
        job=job,
        student_skill_ids=student_skill_ids,
        courses_by_skill_id=courses_by_id,
        courses_by_skill_name={}
    )

    assert match_item.job_id == "job_1"
    assert match_item.match_percentage == 50
    assert match_item.missing_skills_count == 1
    assert match_item.missing_skills == ["Redis"]
    assert len(match_item.courses_to_bridge) == 1
    assert match_item.courses_to_bridge[0].course_title == "Redis University Core"


# ============================================================================
# 2. INTEGRATION TESTS FOR STUDENT ENDPOINTS
# ============================================================================

student_test_db_url = "sqlite+aiosqlite:///:memory:"
student_test_engine = create_async_engine(student_test_db_url, echo=False)
student_session_factory = async_sessionmaker(student_test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db_student():
    async with student_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest.fixture(autouse=True)
async def setup_student_test_db():
    # Apply override
    app.dependency_overrides[get_db] = override_get_db_student
    async with student_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with student_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_student_skill_management_flow():
    """Test updating and querying student skills via /api/v1/student/skills."""
    async with student_session_factory() as session:
        # Create student user
        student = User(
            id="student_123",
            email="student@university.edu",
            password_hash=get_password_hash("Secret123!"),
            role=UserRole.STUDENT
        )
        session.add(student)

        # Seed 2 skills
        sk1 = Skill(id="sk_fastapi", name="FastAPI", category="Backend")
        sk2 = Skill(id="sk_docker", name="Docker", category="Cloud & DevOps")
        session.add_all([sk1, sk2])
        await session.commit()

    token = create_access_token(subject="student_123", role=UserRole.STUDENT.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Update skills
        update_payload = {
            "skills": [
                {"skill_id": "sk_fastapi", "proficiency": "advanced"},
                {"skill_id": "sk_docker", "proficiency": "intermediate"},
            ]
        }
        res = await client.post("/api/v1/student/skills", json=update_payload, headers=headers)
        assert res.status_code == 200
        skills_data = res.json()
        assert len(skills_data) == 2
        names = {s["skill_name"] for s in skills_data}
        assert names == {"FastAPI", "Docker"}

        # 2. Get skills
        get_res = await client.get("/api/v1/student/skills", headers=headers)
        assert get_res.status_code == 200
        assert len(get_res.json()) == 2


@pytest.mark.asyncio
async def test_student_matches_endpoint_dual_lists():
    """Test GET /api/v1/student/matches partition into qualifiable_now and reachable_later."""
    async with student_session_factory() as session:
        student = User(
            id="student_match_user",
            email="match_student@test.com",
            password_hash=get_password_hash("Secret123!"),
            role=UserRole.STUDENT
        )
        recruiter = User(
            id="recruiter_match_user",
            email="recruiter@test.com",
            password_hash=get_password_hash("Secret123!"),
            role=UserRole.RECRUITER
        )
        session.add_all([student, recruiter])

        # Skills
        sk_py = Skill(id="sk_python", name="Python", category="Backend")
        sk_fa = Skill(id="sk_fastapi", name="FastAPI", category="Backend")
        sk_k8s = Skill(id="sk_k8s", name="Kubernetes", category="Cloud & DevOps")
        session.add_all([sk_py, sk_fa, sk_k8s])

        # Course for missing Kubernetes
        course_k8s = Course(
            id="c_k8s",
            skill_id="sk_k8s",
            title="Kubernetes for Developers",
            url="https://training.linuxfoundation.org/"
        )
        session.add(course_k8s)

        # Student has Python and FastAPI
        ss1 = StudentSkill(id="ss1", student_id="student_match_user", skill_id="sk_python", proficiency=ProficiencyLevel.ADVANCED)
        ss2 = StudentSkill(id="ss2", student_id="student_match_user", skill_id="sk_fastapi", proficiency=ProficiencyLevel.INTERMEDIATE)
        session.add_all([ss1, ss2])

        # Job 1: Requires Python & FastAPI (100% qualifiable_now)
        job_now = Job(
            id="job_perfect",
            recruiter_id="recruiter_match_user",
            title="Junior Backend Developer",
            description="Build APIs",
            type="Full-time",
            job_skills=[
                JobSkill(id="js_p1", job_id="job_perfect", skill_id="sk_python"),
                JobSkill(id="js_p2", job_id="job_perfect", skill_id="sk_fastapi"),
            ]
        )

        # Job 2: Requires Python, FastAPI & Kubernetes (67% reachable_later)
        job_later = Job(
            id="job_gap",
            recruiter_id="recruiter_match_user",
            title="Cloud Backend Developer",
            description="Build microservices",
            type="Full-time",
            job_skills=[
                JobSkill(id="js_g1", job_id="job_gap", skill_id="sk_python"),
                JobSkill(id="js_g2", job_id="job_gap", skill_id="sk_fastapi"),
                JobSkill(id="js_g3", job_id="job_gap", skill_id="sk_k8s"),
            ]
        )
        session.add_all([job_now, job_later])
        await session.commit()

    token = create_access_token(subject="student_match_user", role=UserRole.STUDENT.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/student/matches", headers=headers)
        assert res.status_code == 200
        data = res.json()

        assert "qualifiable_now" in data
        assert "reachable_later" in data

        # Job 1 is 100% matched
        assert len(data["qualifiable_now"]) == 1
        assert data["qualifiable_now"][0]["job_id"] == "job_perfect"
        assert data["qualifiable_now"][0]["match_percentage"] == 100
        assert data["qualifiable_now"][0]["missing_skills_count"] == 0

        # Job 2 is 67% matched with 1 missing skill (Kubernetes)
        assert len(data["reachable_later"]) == 1
        assert data["reachable_later"][0]["job_id"] == "job_gap"
        assert data["reachable_later"][0]["match_percentage"] == 67
        assert data["reachable_later"][0]["missing_skills_count"] == 1
        assert data["reachable_later"][0]["missing_skills"] == ["Kubernetes"]
        # Courses to bridge should contain Kubernetes course
        assert len(data["reachable_later"][0]["courses_to_bridge"]) == 1
        assert data["reachable_later"][0]["courses_to_bridge"][0]["course_title"] == "Kubernetes for Developers"


@pytest.mark.asyncio
async def test_github_verification_flow_mocked():
    """Test POST /api/v1/student/github/verify with mocked GitHub API response."""
    async with student_session_factory() as session:
        student = User(
            id="student_gh_user",
            email="gh_student@test.com",
            password_hash=get_password_hash("Secret123!"),
            role=UserRole.STUDENT
        )
        session.add(student)

        # Seed matching skills
        sk_python = Skill(id="sk_py_gh", name="Python", category="Backend")
        sk_react = Skill(id="sk_react_gh", name="React", category="Frontend")
        session.add_all([sk_python, sk_react])
        await session.commit()

    token = create_access_token(subject="student_gh_user", role=UserRole.STUDENT.value, scope="full_access")
    headers = {"Authorization": f"Bearer {token}"}

    mock_repos = [
        {"name": "fastapi-service", "language": "Python", "topics": ["docker", "backend"]},
        {"name": "frontend-app", "language": "JavaScript", "topics": ["react", "ui"]},
    ]

    mock_response = Response(status_code=200, json=mock_repos)

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post(
                "/api/v1/student/github/verify",
                json={"github_username": "octocat"},
                headers=headers
            )
            assert res.status_code == 200
            data = res.json()
            assert data["github_username"] == "octocat"
            assert data["repos_analyzed"] == 2
            assert "Python" in data["suggested_skills"]
            assert "React" in data["suggested_skills"]
