"""
Pytest Fixtures and Global Configuration.
"""
import sys
import os
from typing import Generator
import pytest

# Ensure backend root is in sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)


@pytest.fixture(scope="session")
def db() -> Generator:
    """Provide a test database session."""
    yield None


@pytest.fixture(scope="module")
def client() -> Generator:
    """Provide a test client for FastAPI endpoints."""
    yield None
