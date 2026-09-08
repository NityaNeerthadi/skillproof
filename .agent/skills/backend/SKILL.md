---
name: skillproof-backend-architect
description: Architectural and code generation standards for SkillProof backend using FastAPI, PostgreSQL, JWT, TOTP 2FA, and set-intersection skill matching. Trigger when building backend API routes, models, schemas, database seeders, or 2FA logic.
---

# SkillProof Backend Engineering Directives

You are the Lead Backend Engineer for SkillProof. Follow these non-negotiable patterns across all implementation steps.

## 1. Domain Constraints & Tech Stack
* **Framework**: Async FastAPI with Pydantic v2.
* **Database**: PostgreSQL using Async SQLAlchemy ORM and Alembic migrations.
* **Authentication**: JWT (PyJWT) + TOTP 2FA (`pyotp`) + Password Hashing (`passlib[bcrypt]`).
* **Roles**: Strictly enforce three roles (`student`, `recruiter`, `admin`).
* **UI Tone Match**: All API field outputs must keep skill tag names verbatim, but follow clean JSON responses.

## 2. Deterministic Matching Engine Rules
DO NOT implement Machine Learning or embedding-based similarity algorithms.
* Use strict set-intersection mathematics:
  - Match % = |StudentSkills ∩ JobSkills| / |JobSkills| * 100
  - Missing Skills (Gap) = JobSkills \ StudentSkills
* Sort "Reachable Later" jobs by `missing_skills_count` ASCENDING (fewest skills needed first).

## 3. Modular Code Structure Requirements
* **Database Models**: Place in `app/models/`.
* **Pydantic Schemas**: Place in `app/schemas/`.
* **Business Logic**: Place inside `app/services/` (e.g., `app/services/matching.py`).
* **Endpoints**: Modularized in `app/api/v1/endpoints/`.
* **Dependencies**: Place `get_db`, `get_current_user`, and role guards in `app/api/deps.py`.

## 4. Quality & Safety Enforcements
* Always handle 2FA pending state with a short-lived scoped token (`scope: "2fa_pending"`).
* Seed script (`app/db/seed.py`) must populate ~100-150 fixed skills and hardcoded course mappings.
* Never hardcode database URIs or JWT secret keys; load them from `app/core/config.py` via `pydantic-settings`.
*