"""
GitHub Integration Service:
Asynchronously queries the public GitHub REST API to analyze repository
primary languages and topic tags, matching them against the SkillProof Skill Taxonomy.
"""
import re
from typing import Dict, List, Set
import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.schemas.student import GitHubSyncResponse


def _normalize_tag(tag: str) -> str:
    """Normalize language/topic tag for fuzzy exact matching."""
    if not tag:
        return ""
    # Remove dots, dashes, underscores, spaces and convert to lower
    return re.sub(r"[^a-zA-Z0-9+#]", "", tag).lower()


# Common alias mappings between GitHub tags and SkillProof taxonomy
TAG_ALIASES: Dict[str, str] = {
    "nodejs": "node.js",
    "node": "node.js",
    "js": "javascript",
    "ts": "typescript",
    "golang": "go",
    "cpp": "c++",
    "csharp": "c#",
    "dotnet": ".net core",
    "dotnetcore": ".net core",
    "k8s": "kubernetes",
    "postgres": "postgresql",
    "reactjs": "react",
    "vuejs": "vue.js",
    "vue": "vue.js",
    "next": "next.js",
    "nextjs": "next.js",
    "py": "python",
    "tf": "terraform",
    "aws": "aws",
    "gcp": "google cloud (gcp)",
    "azure": "azure",
    "kafka": "apache kafka",
    "spark": "apache spark",
    "threejs": "webgl / three.js",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "html": "html5 / css3",
    "css": "html5 / css3",
    "redux": "redux toolkit",
    "ai": "data & ai",
}


async def sync_github_repositories(
    username: str,
    session: AsyncSession
) -> GitHubSyncResponse:
    """
    Fetch user repositories from GitHub and match languages and topic tags
    against registered skills in the database.
    """
    cleaned_username = username.strip().lstrip("@")
    if not cleaned_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub username cannot be empty."
        )

    # 1. Fetch repositories via httpx
    url = f"https://api.github.com/users/{cleaned_username}/repos"
    params = {"per_page": 100, "sort": "updated", "type": "owner"}
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillProof-Continuous-Journal-App"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)

            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"GitHub user '{cleaned_username}' not found."
                )
            elif response.status_code == 403:
                # Rate limit exceeded
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="GitHub API rate limit reached. Please try again in a few minutes."
                )
            elif response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"GitHub API returned unexpected status {response.status_code}."
                )

            repos = response.json()
            if not isinstance(repos, list):
                repos = []

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not connect to GitHub API: {str(exc)}"
        )

    # 2. Extract languages and topics
    extracted_tags: Set[str] = set()
    for repo in repos:
        # Primary language
        lang = repo.get("language")
        if lang:
            extracted_tags.add(lang)
            normalized_lang = _normalize_tag(lang)
            if normalized_lang in TAG_ALIASES:
                extracted_tags.add(TAG_ALIASES[normalized_lang])

        # Topics
        topics = repo.get("topics", [])
        if isinstance(topics, list):
            for t in topics:
                if t:
                    extracted_tags.add(t)
                    normalized_t = _normalize_tag(t)
                    if normalized_t in TAG_ALIASES:
                        extracted_tags.add(TAG_ALIASES[normalized_t])

    # 3. Match against Database Skill Taxonomy
    skills_stmt = select(Skill)
    skills_result = await session.execute(skills_stmt)
    db_skills = skills_result.scalars().all()

    # Pre-index database skills by normalized representation
    skill_norm_map: Dict[str, str] = {
        _normalize_tag(s.name): s.name for s in db_skills
    }

    matched_skills: Set[str] = set()

    for tag in extracted_tags:
        norm_tag = _normalize_tag(tag)
        if norm_tag in skill_norm_map:
            matched_skills.add(skill_norm_map[norm_tag])

    return GitHubSyncResponse(
        github_username=cleaned_username,
        suggested_skills=sorted(list(matched_skills)),
        repos_analyzed=len(repos)
    )
