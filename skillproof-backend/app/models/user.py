"""
User Model Definition.
Represents students, recruiters, and institution admins with 2FA and authentication attributes.
"""
import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.core.constants import UserRole

if TYPE_CHECKING:
    from app.models.skill import StudentSkill
    from app.models.job import Job, Application


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.STUDENT,
        index=True
    )
    is_2fa_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    totp_secret: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True
    )
    github_username: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )
    name: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True
    )
    department: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        default="Computer Science & Engineering"
    )
    batch: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        default="2026"
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    verification_notes: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    # If student: student's claimed skills and proficiencies
    student_skills: Mapped[List["StudentSkill"]] = relationship(
        "StudentSkill",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # If student: student's job applications
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="student",
        cascade="all, delete-orphan",
        foreign_keys="[Application.student_id]",
        lazy="selectin"
    )

    # If recruiter: jobs posted by this recruiter
    jobs: Mapped[List["Job"]] = relationship(
        "Job",
        back_populates="recruiter",
        cascade="all, delete-orphan",
        foreign_keys="[Job.recruiter_id]",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
