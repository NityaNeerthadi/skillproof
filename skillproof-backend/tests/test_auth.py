"""
Unit & Integration Test Suite for Step 2: Authentication System & 2FA Workflows.
"""
import sys
import os
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import pytest
import pyotp
from fastapi import Depends
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.constants import UserRole
from app.api.deps import require_recruiter


# Setup test database
auth_db_url = "sqlite+aiosqlite:///:memory:"
auth_engine = create_async_engine(auth_db_url, echo=False)
auth_session_factory = async_sessionmaker(auth_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with auth_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


# Helper test route to verify role guards
@app.get("/api/v1/mock-recruiter-only", tags=["Test"])
async def mock_recruiter_endpoint(_=Depends(require_recruiter)):
    return {"message": "Welcome recruiter"}


@pytest.fixture(autouse=True)
async def setup_test_db():
    async with auth_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with auth_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_signup_success():
    """Verify new user registration issues full-access JWT."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "student1@university.edu",
                "password": "SecurePassword123!",
                "role": "student",
                "github_username": "studentone"
            }
        )
        assert res.status_code == 201
        data = res.json()
        assert data["token_type"] == "bearer"
        assert data["scope"] == "full_access"
        assert data["access_token"] is not None
        assert data["user"]["email"] == "student1@university.edu"
        assert data["user"]["role"] == "student"
        assert data["user"]["is_2fa_enabled"] is False


@pytest.mark.asyncio
async def test_signup_duplicate_email():
    """Verify registration fails if email already exists."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First signup
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "student1@university.edu",
                "password": "Password123!",
                "role": "student"
            }
        )
        # Duplicate signup
        res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "student1@university.edu",
                "password": "AnotherPassword123!",
                "role": "student"
            }
        )
        assert res.status_code == 400
        assert "already exists" in res.json()["detail"]


@pytest.mark.asyncio
async def test_signup_short_password():
    """Verify password length constraint enforcement (< 8 chars)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "student2@university.edu",
                "password": "short",
                "role": "student"
            }
        )
        assert res.status_code == 422


@pytest.mark.asyncio
async def test_login_success_no_2fa():
    """Verify standard login with correct credentials returns full_access token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "student_login@university.edu",
                "password": "SecurePassword123!",
                "role": "student"
            }
        )
        res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "student_login@university.edu",
                "password": "SecurePassword123!"
            }
        )
        assert res.status_code == 200
        data = res.json()
        assert data["scope"] == "full_access"
        assert data["user"]["is_2fa_enabled"] is False


@pytest.mark.asyncio
async def test_login_invalid_password():
    """Verify login rejection with incorrect password."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "student_pw@university.edu",
                "password": "CorrectPassword123!",
                "role": "student"
            }
        )
        res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "student_pw@university.edu",
                "password": "WrongPassword999"
            }
        )
        assert res.status_code == 401
        assert "Invalid email or password" in res.json()["detail"]


@pytest.mark.asyncio
async def test_2fa_workflow_full_lifecycle():
    """
    Test complete 2FA lifecycle:
    1. Register user (Alice).
    2. Initiate 2FA setup -> receive secret and otpauth URL.
    3. Attempt verify with invalid code -> rejected.
    4. Verify with valid TOTP code -> 2FA enabled, full_access token returned.
    5. Log in -> receives scope='2fa_pending'.
    6. Protected endpoint rejects 2fa_pending with 403.
    7. Submit valid TOTP code with 2fa_pending token -> receives full_access token.
    8. Protected endpoint succeeds with full_access token.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Signup Alice
        alice_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "alice@security.org",
                "password": "PasswordSecurity2026!",
                "role": "student"
            }
        )
        assert alice_res.status_code == 201
        alice_token = alice_res.json()["access_token"]

        # 2. Setup 2FA
        setup_res = await client.post(
            "/api/v1/auth/2fa/setup",
            headers={"Authorization": f"Bearer {alice_token}"}
        )
        assert setup_res.status_code == 200
        setup_data = setup_res.json()
        totp_secret = setup_data["secret"]
        assert "otpauth://" in setup_data["otpauth_url"]

        # 3. Verify with invalid code
        invalid_res = await client.post(
            "/api/v1/auth/2fa/verify",
            headers={"Authorization": f"Bearer {alice_token}"},
            json={"totp_code": "000000"}
        )
        assert invalid_res.status_code == 400
        assert "Invalid two-factor authentication code" in invalid_res.json()["detail"]

        # 4. Verify with valid code
        valid_code = pyotp.TOTP(totp_secret).now()
        verify_res = await client.post(
            "/api/v1/auth/2fa/verify",
            headers={"Authorization": f"Bearer {alice_token}"},
            json={"totp_code": valid_code}
        )
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["scope"] == "full_access"
        assert verify_data["user"]["is_2fa_enabled"] is True

        # 5. Login now yields 2fa_pending
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "alice@security.org",
                "password": "PasswordSecurity2026!"
            }
        )
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["scope"] == "2fa_pending"
        pending_token = login_data["access_token"]

        # 6. Protected endpoint (/me) rejects 2fa_pending with 403
        me_rejected_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {pending_token}"}
        )
        assert me_rejected_res.status_code == 403
        assert "Two-factor authentication pending" in me_rejected_res.json()["detail"]

        # 7. Complete 2FA login verification
        current_code = pyotp.TOTP(totp_secret).now()
        login_verify_res = await client.post(
            "/api/v1/auth/2fa/verify",
            headers={"Authorization": f"Bearer {pending_token}"},
            json={"totp_code": current_code}
        )
        assert login_verify_res.status_code == 200
        full_token = login_verify_res.json()["access_token"]
        assert login_verify_res.json()["scope"] == "full_access"

        # 8. Protected endpoint (/me) succeeds with full_access token
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {full_token}"}
        )
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "alice@security.org"
        assert me_res.json()["is_2fa_enabled"] is True


@pytest.mark.asyncio
async def test_role_guard_enforcement():
    """Verify role guard rejects unauthorized role and allows authorized role."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create recruiter
        recruiter_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "bob.recruiter@company.com",
                "password": "RecruiterPass2026!",
                "role": "recruiter"
            }
        )
        assert recruiter_res.status_code == 201
        recruiter_token = recruiter_res.json()["access_token"]

        # Create student
        student_res = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "charlie.student@college.edu",
                "password": "StudentPass2026!",
                "role": "student"
            }
        )
        assert student_res.status_code == 201
        student_token = student_res.json()["access_token"]

        # Student accesses recruiter endpoint -> 403 Forbidden
        student_try = await client.get(
            "/api/v1/mock-recruiter-only",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert student_try.status_code == 403
        assert "Requires role" in student_try.json()["detail"]

        # Recruiter accesses recruiter endpoint -> 200 OK
        recruiter_try = await client.get(
            "/api/v1/mock-recruiter-only",
            headers={"Authorization": f"Bearer {recruiter_token}"}
        )
        assert recruiter_try.status_code == 200
        assert recruiter_try.json()["message"] == "Welcome recruiter"
