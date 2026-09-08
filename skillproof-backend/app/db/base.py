"""
SQLAlchemy 2.0 Declarative Base Definition.
All database models inherit from this base.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.0 declarative models."""
    pass
