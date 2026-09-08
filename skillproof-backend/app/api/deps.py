"""
Common API Dependencies:
- Database session provider (get_db)
- Authenticated user extractor (get_current_user / current_user)
- 2FA pending user extractor (get_current_user_2fa_pending)
- Role-based authorization guard (RequireRole / role_guard)
"""
import os
import sys
from typing import Annotated, Optional, Sequence, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

# Ensure backend root is always in sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.core.constants import UserRole
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

# OAuth2 password bearer token scheme
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True
)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """
    Extract and validate JWT token to return the current active user.
    Requires token to have scope='full_access'.
    Rejects '2fa_pending' tokens with HTTP 403 Forbidden.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: Optional[str] = payload.get("sub")
        scope: Optional[str] = payload.get("scope")

        if not user_id:
            raise credentials_exception

        if scope == "2fa_pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Two-factor authentication pending. Complete verification to access this resource.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if scope != "full_access":
            raise credentials_exception

    except (jwt.PyJWTError, ValidationError):
        raise credentials_exception

    user = await session.get(User, str(user_id))
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_2fa_pending(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """
    Extract and validate JWT token for 2FA verification.
    Accepts both '2fa_pending' (during login) and 'full_access' (during setup) tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token for 2FA verification",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: Optional[str] = payload.get("sub")
        scope: Optional[str] = payload.get("scope")

        if not user_id or scope not in ("2fa_pending", "full_access"):
            raise credentials_exception

    except (jwt.PyJWTError, ValidationError):
        raise credentials_exception

    user = await session.get(User, str(user_id))
    if user is None:
        raise credentials_exception
    return user


class RequireRole:
    """
    Role-based authorization dependency.
    Validates that current user possesses at least one of the allowed roles.
    Supports single role or list of roles.
    """
    def __init__(self, allowed_roles: Union[Sequence[Union[UserRole, str]], UserRole, str]):
        if isinstance(allowed_roles, (UserRole, str)):
            roles_list = [allowed_roles]
        else:
            roles_list = list(allowed_roles)

        self.allowed_roles = [
            r.value if isinstance(r, UserRole) else str(r) for r in roles_list
        ]

    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires role in {self.allowed_roles}",
            )
        return current_user


def role_guard(allowed_roles: Union[Sequence[Union[UserRole, str]], UserRole, str]) -> RequireRole:
    """Factory alias for role-based authorization guard."""
    return RequireRole(allowed_roles)


# Exported dependency aliases
current_user = get_current_user
require_student = RequireRole([UserRole.STUDENT])
require_recruiter = RequireRole([UserRole.RECRUITER])
require_admin = RequireRole([UserRole.ADMIN])
