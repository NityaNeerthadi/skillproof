"""
Institution Admin Domain Unit & Integration Test Suite:
- RBAC role enforcement (401 Unauthorized for unauthenticated, 403 Forbidden for students & recruiters, 200 OK for admin)
- Aggregate skill gap heatmap query math and ordering
- Heatmap filtering by department and graduating batch year
- Application placement funnel conversion metrics (applied -> shortlisted -> placed)
- Student profile academic verification and revocation
- Verification security guards (404 on non-existent or non-student users)
- Curriculum course recommendations (nudges) for top aggregate skill gaps
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
from app.models.job import Job, Application
from app.core.constants import UserRole, ProficiencyLevel, ApplicationStatus
from app.core.security import get_password_hash, create_access_token


admin_test_db_url = "sqlite+aiosqlite:///:memory:"
admin_test_engine = create_async_engine(admin_test_db_url, echo=False)
admin_session_factory = async_sessionmaker(admin_test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db_admin():
    async with admin_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest.fixture(autouse=True)
async def setup_admin_test_db():
    app.dependency_overrides[get_db] = override_get_db_admin
    async with admin_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with admin_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_admin_rbac_security_enforcement():
    """Verify that admin endpoints strictly require UserRole.ADMIN."""
    async with admin_session_factory() as session:
        # Create student, recruiter, and admin
        student = User(
            email="student_sec@univ.edu",
            password_hash=get_password_hash("StudentPass123"),
            role=UserRole.STUDENT,
            department="Computer Science & Engineering",
            batch="2026"
        )
        recruiter = User(
            email="recruiter_sec@company.com",
            password_hash=get_password_hash("RecruiterPass123"),
            role=UserRole.RECRUITER
        )
        admin = User(
            email="dean@univ.edu",
            password_hash=get_password_hash("DeanPass123"),
            role=UserRole.ADMIN
        )
        session.add_all([student, recruiter, admin])
        await session.commit()
        await session.refresh(student)
        await session.refresh(recruiter)
        await session.refresh(admin)

        student_token = create_access_token(subject=student.id, role=UserRole.STUDENT.value, scope="full_access")
        recruiter_token = create_access_token(subject=recruiter.id, role=UserRole.RECRUITER.value, scope="full_access")
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated -> 401
        res_unauth = await client.get("/api/v1/admin/heatmap")
        assert res_unauth.status_code == 401

        # 2. Student -> 403 Forbidden
        res_student = await client.get(
            "/api/v1/admin/heatmap",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert res_student.status_code == 403
        assert "Operation not permitted" in res_student.json()["detail"]

        # 3. Recruiter -> 403 Forbidden
        res_recruiter = await client.get(
            "/api/v1/admin/heatmap",
            headers={"Authorization": f"Bearer {recruiter_token}"}
        )
        assert res_recruiter.status_code == 403

        # 4. Admin -> 200 OK
        res_admin = await client.get(
            "/api/v1/admin/heatmap",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_admin.status_code == 200


@pytest.mark.asyncio
async def test_admin_heatmap_empty_cohort():
    """Verify heatmap handles empty cohorts gracefully with zeroed statistics."""
    async with admin_session_factory() as session:
        admin = User(
            email="admin_empty@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/api/v1/admin/heatmap?department=Mechanical+Engineering",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total_students"] == 0
        assert data["heatmap_data"] == []


@pytest.mark.asyncio
async def test_admin_heatmap_skill_gap_math():
    """
    Verify exact aggregate math:
    Cohort of 10 students:
    - 10 have Python (0 lacking -> 0.0%)
    - 4 have Docker (6 lacking -> 60.0%)
    - 0 have Kubernetes (10 lacking -> 100.0%)
    Sorted descending by percentage_lacking.
    """
    async with admin_session_factory() as session:
        admin = User(
            email="dean_math@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        session.add(admin)

        skill_py = Skill(id="sk-py", name="Python", category="Backend")
        skill_doc = Skill(id="sk-doc", name="Docker", category="DevOps")
        skill_k8s = Skill(id="sk-k8s", name="Kubernetes", category="DevOps")
        session.add_all([skill_py, skill_doc, skill_k8s])

        # Create 10 students
        students = []
        for i in range(10):
            st = User(
                email=f"student_math_{i}@univ.edu",
                password_hash=get_password_hash("Pass123"),
                role=UserRole.STUDENT,
                department="Computer Science & Engineering",
                batch="2026"
            )
            students.append(st)
        session.add_all(students)
        await session.commit()

        for st in students:
            await session.refresh(st)

        # 10 have Python
        for st in students:
            session.add(StudentSkill(student_id=st.id, skill_id="sk-py", proficiency=ProficiencyLevel.ADVANCED))

        # 4 have Docker
        for st in students[:4]:
            session.add(StudentSkill(student_id=st.id, skill_id="sk-doc", proficiency=ProficiencyLevel.INTERMEDIATE))

        # 0 have Kubernetes
        await session.commit()
        await session.refresh(admin)
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/api/v1/admin/heatmap",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total_students"] == 10

        items = data["heatmap_data"]
        # Must contain all 3 skills
        k8s_item = next(it for it in items if it["skill_id"] == "sk-k8s")
        assert k8s_item["total_students_lacking"] == 10
        assert k8s_item["percentage_lacking"] == 100.0

        doc_item = next(it for it in items if it["skill_id"] == "sk-doc")
        assert doc_item["total_students_lacking"] == 6
        assert doc_item["percentage_lacking"] == 60.0

        py_item = next(it for it in items if it["skill_id"] == "sk-py")
        assert py_item["total_students_lacking"] == 0
        assert py_item["percentage_lacking"] == 0.0

        # Verified sorted: k8s first, then doc, then py
        assert items[0]["skill_id"] == "sk-k8s"
        assert items[1]["skill_id"] == "sk-doc"
        assert items[2]["skill_id"] == "sk-py"


@pytest.mark.asyncio
async def test_admin_heatmap_department_and_batch_filters():
    """Verify heatmap accurately respects department and batch year slicing."""
    async with admin_session_factory() as session:
        admin = User(
            email="admin_filter@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        session.add(admin)

        skill_go = Skill(id="sk-go", name="Go", category="Backend")
        session.add(skill_go)

        # 2 CS students (batch 2026)
        cs_st1 = User(email="cs1@univ.edu", password_hash=get_password_hash("P"), role=UserRole.STUDENT, department="CS", batch="2026")
        cs_st2 = User(email="cs2@univ.edu", password_hash=get_password_hash("P"), role=UserRole.STUDENT, department="CS", batch="2026")

        # 1 IT student (batch 2025)
        it_st = User(email="it1@univ.edu", password_hash=get_password_hash("P"), role=UserRole.STUDENT, department="IT", batch="2025")

        session.add_all([cs_st1, cs_st2, it_st])
        await session.commit()
        await session.refresh(cs_st1)
        await session.refresh(admin)

        # Only cs_st1 has Go
        session.add(StudentSkill(student_id=cs_st1.id, skill_id="sk-go", proficiency=ProficiencyLevel.INTERMEDIATE))
        await session.commit()
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Filter for CS batch 2026: 2 total students, 1 has Go -> 1 lacking (50.0%)
        res_cs = await client.get(
            "/api/v1/admin/heatmap?department=CS&batch=2026",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_cs.status_code == 200
        data_cs = res_cs.json()
        assert data_cs["total_students"] == 2
        go_cs = next(it for it in data_cs["heatmap_data"] if it["skill_id"] == "sk-go")
        assert go_cs["total_students_lacking"] == 1
        assert go_cs["percentage_lacking"] == 50.0

        # Filter for IT batch 2025: 1 total student, 0 has Go -> 1 lacking (100.0%)
        res_it = await client.get(
            "/api/v1/admin/heatmap?department=IT&batch=2025",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_it.status_code == 200
        data_it = res_it.json()
        assert data_it["total_students"] == 1
        go_it = next(it for it in data_it["heatmap_data"] if it["skill_id"] == "sk-go")
        assert go_it["total_students_lacking"] == 1
        assert go_it["percentage_lacking"] == 100.0


@pytest.mark.asyncio
async def test_admin_placement_funnel_metrics():
    """Verify application conversion pipeline metrics (applied -> shortlisted -> placed)."""
    async with admin_session_factory() as session:
        admin = User(
            email="admin_funnel@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        recruiter = User(
            email="rec_funnel@corp.com",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.RECRUITER
        )
        session.add_all([admin, recruiter])

        # 4 students in cohort
        students = [
            User(email=f"st_f_{i}@univ.edu", password_hash=get_password_hash("P"), role=UserRole.STUDENT, department="CS", batch="2026")
            for i in range(4)
        ]
        session.add_all(students)
        await session.commit()
        await session.refresh(recruiter)
        for s in students:
            await session.refresh(s)

        job = Job(recruiter_id=recruiter.id, title="Backend Intern", description="FastAPI microservices")
        session.add(job)
        await session.commit()
        await session.refresh(job)

        # Student 0: APPLIED
        # Student 1: SHORTLISTED
        # Student 2: PLACED
        # Student 3: did not apply
        app0 = Application(student_id=students[0].id, job_id=job.id, status=ApplicationStatus.APPLIED)
        app1 = Application(student_id=students[1].id, job_id=job.id, status=ApplicationStatus.SHORTLISTED)
        app2 = Application(student_id=students[2].id, job_id=job.id, status=ApplicationStatus.PLACED)
        session.add_all([app0, app1, app2])
        await session.commit()

        await session.refresh(admin)
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/api/v1/admin/funnel?department=CS&batch=2026",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total_students"] == 4
        metrics = {m["status_stage"]: m for m in data["metrics"]}

        # Applied: 3 students (app0, app1, app2) -> 3/4 = 75.0%
        assert metrics["applied"]["student_count"] == 3
        assert metrics["applied"]["percentage_of_total"] == 75.0

        # Shortlisted: 2 students (app1, app2) -> 2/4 = 50.0%
        assert metrics["shortlisted"]["student_count"] == 2
        assert metrics["shortlisted"]["percentage_of_total"] == 50.0

        # Placed: 1 student (app2) -> 1/4 = 25.0%
        assert metrics["placed"]["student_count"] == 1
        assert metrics["placed"]["percentage_of_total"] == 25.0


@pytest.mark.asyncio
async def test_admin_verify_student_success_and_revoke():
    """Verify administrator can verify a student's profile and subsequently revoke verification."""
    async with admin_session_factory() as session:
        admin = User(
            email="admin_verify@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        student = User(
            email="scholar_aarav@univ.edu",
            name="Aarav Sharma",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.STUDENT,
            department="Computer Science & Engineering",
            batch="2026",
            is_verified=False
        )
        session.add_all([admin, student])
        await session.commit()
        await session.refresh(admin)
        await session.refresh(student)
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")
        student_id = student.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Approve & Verify
        verify_payload = {
            "is_verified": True,
            "notes": "Dean accredited academic record. Codebase and grade ledger audited."
        }
        res_verify = await client.patch(
            f"/api/v1/admin/verify/student/{student_id}",
            json=verify_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_verify.status_code == 200
        v_data = res_verify.json()
        assert v_data["student_id"] == student_id
        assert v_data["is_verified"] is True
        assert v_data["verification_notes"] == verify_payload["notes"]
        assert v_data["verified_at"] is not None

        # 2. Revoke Verification
        revoke_payload = {
            "is_verified": False,
            "notes": "Academic record pending periodic review."
        }
        res_revoke = await client.patch(
            f"/api/v1/admin/verify/student/{student_id}",
            json=revoke_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_revoke.status_code == 200
        r_data = res_revoke.json()
        assert r_data["is_verified"] is False
        assert r_data["verified_at"] is None


@pytest.mark.asyncio
async def test_admin_verify_student_nonexistent_or_invalid_role():
    """Verify 404 is returned when attempting to verify non-existent ID or non-student user."""
    async with admin_session_factory() as session:
        admin = User(
            email="admin_invalid@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        recruiter = User(
            email="rec_target@corp.com",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.RECRUITER
        )
        session.add_all([admin, recruiter])
        await session.commit()
        await session.refresh(admin)
        await session.refresh(recruiter)
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")
        recruiter_id = recruiter.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Non-existent UUID -> 404
        res_missing = await client.patch(
            "/api/v1/admin/verify/student/00000000-0000-0000-0000-000000000000",
            json={"is_verified": True},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_missing.status_code == 404

        # Target user is a recruiter, not a student -> 404
        res_rec = await client.patch(
            f"/api/v1/admin/verify/student/{recruiter_id}",
            json={"is_verified": True},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_rec.status_code == 404


@pytest.mark.asyncio
async def test_admin_nudges_course_recommendations():
    """Verify that curriculum nudges surface courses for top missing aggregate skills."""
    async with admin_session_factory() as session:
        admin = User(
            email="admin_nudge@univ.edu",
            password_hash=get_password_hash("Pass123"),
            role=UserRole.ADMIN
        )
        session.add(admin)

        skill_redis = Skill(id="sk-redis", name="Redis", category="Databases")
        skill_fastapi = Skill(id="sk-fa", name="FastAPI", category="Backend")
        session.add_all([skill_redis, skill_fastapi])

        # Add course bridge for Redis
        course_redis = Course(
            id="c-redis",
            skill_id="sk-redis",
            title="Distributed Caching with Redis & FastAPI",
            url="https://coursera.org/redis-caching"
        )
        session.add(course_redis)

        # 2 students, both lack Redis, 1 has FastAPI
        st1 = User(email="st_n1@univ.edu", password_hash=get_password_hash("P"), role=UserRole.STUDENT, department="CS")
        st2 = User(email="st_n2@univ.edu", password_hash=get_password_hash("P"), role=UserRole.STUDENT, department="CS")
        session.add_all([st1, st2])
        await session.commit()
        await session.refresh(st1)
        await session.refresh(admin)

        session.add(StudentSkill(student_id=st1.id, skill_id="sk-fa", proficiency=ProficiencyLevel.INTERMEDIATE))
        await session.commit()
        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/api/v1/admin/nudges?top_k=5",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total_students"] == 2
        nudges = data["nudges"]
        assert len(nudges) > 0

        # Redis is lacking by 2/2 students (100.0%) -> top nudge
        redis_nudge = next(n for n in nudges if n["skill_id"] == "sk-redis")
        assert redis_nudge["students_lacking"] == 2
        assert redis_nudge["percentage_lacking"] == 100.0
        assert len(redis_nudge["course_recommendations"]) == 1
        assert redis_nudge["course_recommendations"][0]["course_title"] == "Distributed Caching with Redis & FastAPI"


@pytest.mark.asyncio
async def test_admin_monitored_students_roster():
    """Verify GET /api/v1/admin/students returns student cohort roster with skills and status."""
    async with admin_session_factory() as session:
        admin = User(email="admin_mon@univ.edu", password_hash=get_password_hash("P"), role=UserRole.ADMIN)
        s1 = User(
            email="mon_stud1@univ.edu",
            name="Rohan Mehta",
            password_hash=get_password_hash("P"),
            role=UserRole.STUDENT,
            department="Computer Science & Engineering",
            batch="2026",
            github_username="rohanm",
            is_verified=True
        )
        s2 = User(
            email="mon_stud2@univ.edu",
            name="Priya Iyer",
            password_hash=get_password_hash("P"),
            role=UserRole.STUDENT,
            department="Information Technology",
            batch="2026",
            is_verified=False
        )
        session.add_all([admin, s1, s2])
        await session.commit()
        await session.refresh(admin)
        await session.refresh(s1)

        sk = Skill(id="sk_mon_py", name="Python", category="Backend")
        session.add(sk)
        await session.commit()

        session.add(StudentSkill(student_id=s1.id, skill_id="sk_mon_py", proficiency=ProficiencyLevel.ADVANCED))
        await session.commit()

        admin_token = create_access_token(subject=admin.id, role=UserRole.ADMIN.value, scope="full_access")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(
            "/api/v1/admin/students",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total_count"] >= 2
        students = data["students"]
        rohan = next(s for s in students if s["email"] == "mon_stud1@univ.edu")
        assert rohan["name"] == "Rohan Mehta"
        assert rohan["github_verified"] is True
        assert rohan["is_verified"] is True
        assert "sk_mon_py" in rohan["skills"]
        assert rohan["trust_score"] > 70

