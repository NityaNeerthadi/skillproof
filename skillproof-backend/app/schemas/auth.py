"""
Authentication and User Validation Schemas using Pydantic v2.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.core.constants import UserRole


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    github_username: Optional[str] = Field(None, max_length=100)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    role: UserRole = UserRole.STUDENT
    github_username: Optional[str] = Field(None, max_length=100)

    model_config = ConfigDict(extra="ignore")

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, v):
        if isinstance(v, str):
            v_lower = v.lower()
            if v_lower in ("institution", "admin"):
                return UserRole.ADMIN
            if v_lower == "recruiter":
                return UserRole.RECRUITER
            if v_lower == "student":
                return UserRole.STUDENT
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(extra="ignore")


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: UserRole
    is_2fa_enabled: bool
    github_username: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    scope: str = Field(..., description="'full_access' or '2fa_pending'")
    user: Optional[UserResponse] = None


class TwoFactorSetupResponse(BaseModel):
    secret: str
    otpauth_url: str


class TwoFactorVerifyRequest(BaseModel):
    totp_code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
        description="6-digit TOTP verification code"
    )
