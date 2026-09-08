"""
Job, JobSkill, and Application Models.
Configured so recruiters querying a Job can directly access applicant profile data,
student skills, proficiency, and application statuses.
"""
import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, Enum, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.core.constants import ApplicationStatus, JobType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.skill import Skill


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    recruiter_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=JobType.FULL_TIME.value
    )
    stipend: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    recruiter: Mapped["User"] = relationship(
        "User",
        back_populates="jobs",
        foreign_keys=[recruiter_id]
    )
    job_skills: Mapped[List["JobSkill"]] = relationship(
        "JobSkill",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Direct relationship to applicant User objects via applications table
    applicants: Mapped[List["User"]] = relationship(
        "User",
        secondary="applications",
        primaryjoin="Job.id == Application.job_id",
        secondaryjoin="User.id == Application.student_id",
        viewonly=True,
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title} recruiter_id={self.recruiter_id}>"


class JobSkill(Base):
    __tablename__ = "job_skills"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    job_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    __table_args__ = (
        UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),
    )

    # Relationships
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="job_skills"
    )
    skill: Mapped["Skill"] = relationship(
        "Skill",
        back_populates="job_skills",
        lazy="joined"
    )

    def __repr__(self) -> str:
        return f"<JobSkill job_id={self.job_id} skill_id={self.skill_id}>"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    job_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ApplicationStatus.APPLIED,
        index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("student_id", "job_id", name="uq_student_job_application"),
    )

    # Relationships
    student: Mapped["User"] = relationship(
        "User",
        back_populates="applications",
        foreign_keys=[student_id],
        lazy="joined"
    )
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="applications",
        foreign_keys=[job_id]
    )

    def __repr__(self) -> str:
        return f"<Application id={self.id} student_id={self.student_id} job_id={self.job_id} status={self.status}>"
