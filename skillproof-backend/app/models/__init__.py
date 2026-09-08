"""
SQLAlchemy Database Models Package.
Exports all models so that Alembic and SQLAlchemy metadata can discover all tables.
"""
from app.db.base import Base
from app.models.user import User
from app.models.skill import Skill, StudentSkill, Course
from app.models.job import Job, JobSkill, Application

__all__ = [
    "Base",
    "User",
    "Skill",
    "StudentSkill",
    "Course",
    "Job",
    "JobSkill",
    "Application",
]
