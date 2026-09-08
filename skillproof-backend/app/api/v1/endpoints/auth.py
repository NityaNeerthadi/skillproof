"""
Authentication Endpoints:
- POST /signup: Register new student, recruiter, or admin
- POST /login: Authenticate credentials, handle 2FA pending state
- POST /2fa/setup: Initiate TOTP 2FA setup and get provisioning URI
- POST /2fa/verify: Verify 6-digit TOTP code and issue full-access JWT
- GET /me: Retrieve current authenticated user profile
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_2fa_pending, get_db
from app.core.security import (
    create_access_token,
    generate_totp_secret,
    get_password_hash,
    get_totp_uri,
    verify_password,
    verify_totp_code,
)
from app.models.user import User
from app.schemas.auth import (
    Token,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter()


@router.post(
    "/signup",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def signup(
    user_in: UserCreate,
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Register a new user account with hashed password.
    Enforces unique email check and issues initial full_access JWT token.
    """
    # 1. Check for existing email
    stmt = select(User).where(User.email == user_in.email)
    result = await session.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # 2. Create user with hashed password
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        github_username=user_in.github_username,
        is_2fa_enabled=False,
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    # 3. Issue full-access JWT
    access_token = create_access_token(
        subject=new_user.id,
        role=new_user.role.value if hasattr(new_user.role, "value") else str(new_user.role),
        scope="full_access"
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        scope="full_access",
        user=UserResponse.model_validate(new_user)
    )


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and receive JWT token"
)
async def login(
    login_data: UserLogin,
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Authenticate user credentials.
    - If 2FA is enabled: Returns a short-lived token with scope='2fa_pending'.
    - If 2FA is disabled: Returns standard token with scope='full_access'.
    """
    stmt = select(User).where(User.email == login_data.email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_role_str = user.role.value if hasattr(user.role, "value") else str(user.role)

    # If 2FA is active on user account, issue scoped 2fa_pending token
    if user.is_2fa_enabled:
        token_scope = "2fa_pending"
    else:
        token_scope = "full_access"

    access_token = create_access_token(
        subject=user.id,
        role=user_role_str,
        scope=token_scope
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        scope=token_scope,
        user=UserResponse.model_validate(user)
    )


@router.post(
    "/2fa/setup",
    response_model=TwoFactorSetupResponse,
    summary="Initiate 2FA TOTP setup"
)
async def setup_2fa(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Generate Base32 TOTP secret and provisioning URI for Google Authenticator / Authy.
    Saves secret to user record awaiting verification.
    """
    secret = generate_totp_secret()
    current_user.totp_secret = secret
    session.add(current_user)
    await session.commit()

    otpauth_url = get_totp_uri(secret, current_user.email, issuer_name="SkillProof")
    return TwoFactorSetupResponse(
        secret=secret,
        otpauth_url=otpauth_url
    )


@router.post(
    "/2fa/verify",
    response_model=Token,
    summary="Verify TOTP code and grant full access"
)
async def verify_2fa(
    payload: TwoFactorVerifyRequest,
    current_user: Annotated[User, Depends(get_current_user_2fa_pending)],
    session: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Verify 6-digit TOTP code.
    Enables 2FA on account if first time setup, and returns full_access JWT token.
    """
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication has not been initiated for this account."
        )

    is_valid = verify_totp_code(current_user.totp_secret, payload.totp_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid two-factor authentication code. Please check your authenticator app."
        )

    # Mark 2FA as permanently enabled on the user
    current_user.is_2fa_enabled = True
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)

    user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    full_token = create_access_token(
        subject=current_user.id,
        role=user_role_str,
        scope="full_access"
    )

    return Token(
        access_token=full_token,
        token_type="bearer",
        scope="full_access",
        user=UserResponse.model_validate(current_user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile"
)
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Return profile data of current authenticated user."""
    return UserResponse.model_validate(current_user)
