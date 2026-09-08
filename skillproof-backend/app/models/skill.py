"""
Skill, StudentSkill, and Course Models.
Manages the fixed skill taxonomy, student skill proficiencies, and course gap recommendations.
"""
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.core.constants import ProficiencyLevel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.job import JobSkill


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False
    )

    # Relationships
    student_skills: Mapped[List["StudentSkill"]] = relationship(
        "StudentSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    job_skills: Mapped[List["JobSkill"]] = relationship(
        "JobSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Skill id={self.id} name={self.name} category={self.category}>"


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    proficiency: Mapped[ProficiencyLevel] = mapped_column(
        Enum(ProficiencyLevel, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ProficiencyLevel.BEGINNER
    )

    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_student_skill"),
    )

    # Relationships
    student: Mapped["User"] = relationship(
        "User",
        back_populates="student_skills"
    )
    skill: Mapped["Skill"] = relationship(
        "Skill",
        back_populates="student_skills",
        lazy="joined"
    )

    def __repr__(self) -> str:
        return f"<StudentSkill student_id={self.student_id} skill_id={self.skill_id} proficiency={self.proficiency}>"


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    url: Mapped[str] = mapped_column(
        String(512),
        nullable=False
    )

    # Relationships
    skill: Mapped["Skill"] = relationship(
        "Skill",
        back_populates="courses",
        lazy="joined"
    )

    def __repr__(self) -> str:
        return f"<Course id={self.id} skill_id={self.skill_id} title={self.title}>"
