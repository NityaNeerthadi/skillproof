"""
Security Utilities: Password hashing, JWT token handling, and TOTP 2FA.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import jwt
import pyotp
from passlib.context import CryptContext

from app.core.config import settings

import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    password_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    """Generate secure bcrypt password hash."""
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def create_access_token(
    subject: Union[str, Any],
    role: str,
    scope: str = "full_access",
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generate signed JWT access token with parameterizable expiration and scope.
    - scope="full_access": Regular authenticated session.
    - scope="2fa_pending": Intermediate token for 2FA TOTP submission.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    elif scope == "2fa_pending":
        expire = now + timedelta(minutes=settings.TWO_FACTOR_TOKEN_EXPIRE_MINUTES)
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": str(role),
        "scope": scope,
        "exp": expire,
        "iat": now,
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises jwt.PyJWTError on invalid or expired token.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.ALGORITHM]
    )


def generate_totp_secret() -> str:
    """Generate Base32 encoded random secret key for TOTP 2FA."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, account_name: str, issuer_name: str = "SkillProof") -> str:
    """Generate otpauth:// URI for QR code integration."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=account_name, issuer_name=issuer_name)


def verify_totp_code(secret: str, code: str) -> bool:
    """
    Verify 6-digit TOTP code against secret key.
    Includes valid_window=1 (±30s) tolerance for clock drift.
    """
    if not secret or not code:
        return False
    totp = pyotp.TOTP(secret)
    return totp.verify(code.strip(), valid_window=1)
