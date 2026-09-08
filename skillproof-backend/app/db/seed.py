"""
Database Seeder for SkillProof.
Seeds ~100-150 fixed skill entries across 7 core technical categories and
their corresponding hardcoded course mappings into PostgreSQL.

Note:
DO NOT seed fake user accounts, fake job listings, or dummy application records.
This seeder strictly populates the immutable Skill Taxonomy and Course mappings.
"""
import asyncio
from typing import Dict, List, Tuple
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, engine
from app.models import Base
from app.models.skill import Skill, Course

# ============================================================================
# FIXED SKILL TAXONOMY (~120 curated industry skills)
# ============================================================================
SKILL_TAXONOMY: List[Dict[str, str]] = [
    # Backend & APIs
    {"name": "Python", "category": "Backend"},
    {"name": "FastAPI", "category": "Backend"},
    {"name": "Django", "category": "Backend"},
    {"name": "Flask", "category": "Backend"},
    {"name": "Node.js", "category": "Backend"},
    {"name": "Express", "category": "Backend"},
    {"name": "NestJS", "category": "Backend"},
    {"name": "Go", "category": "Backend"},
    {"name": "Rust", "category": "Backend"},
    {"name": "Java", "category": "Backend"},
    {"name": "Spring Boot", "category": "Backend"},
    {"name": "C#", "category": "Backend"},
    {"name": ".NET Core", "category": "Backend"},
    {"name": "Ruby", "category": "Backend"},
    {"name": "Ruby on Rails", "category": "Backend"},
    {"name": "GraphQL", "category": "Backend"},
    {"name": "gRPC", "category": "Backend"},
    {"name": "REST APIs", "category": "Backend"},
    {"name": "Microservices", "category": "Backend"},
    {"name": "PHP", "category": "Backend"},
    {"name": "Laravel", "category": "Backend"},
    {"name": "Elixir", "category": "Backend"},
    {"name": "Scala", "category": "Backend"},

    # Databases & Caching
    {"name": "PostgreSQL", "category": "Databases"},
    {"name": "MySQL", "category": "Databases"},
    {"name": "SQLite", "category": "Databases"},
    {"name": "MongoDB", "category": "Databases"},
    {"name": "Redis", "category": "Databases"},
    {"name": "Cassandra", "category": "Databases"},
    {"name": "Elasticsearch", "category": "Databases"},
    {"name": "DynamoDB", "category": "Databases"},
    {"name": "Prisma ORM", "category": "Databases"},
    {"name": "SQLAlchemy", "category": "Databases"},
    {"name": "SQL", "category": "Databases"},
    {"name": "Neo4j", "category": "Databases"},
    {"name": "MariaDB", "category": "Databases"},
    {"name": "Firebase Firestore", "category": "Databases"},
    {"name": "ClickHouse", "category": "Databases"},
    {"name": "Memcached", "category": "Databases"},

    # Cloud & DevOps
    {"name": "Docker", "category": "Cloud & DevOps"},
    {"name": "Kubernetes", "category": "Cloud & DevOps"},
    {"name": "AWS", "category": "Cloud & DevOps"},
    {"name": "Azure", "category": "Cloud & DevOps"},
    {"name": "Google Cloud (GCP)", "category": "Cloud & DevOps"},
    {"name": "Terraform", "category": "Cloud & DevOps"},
    {"name": "Ansible", "category": "Cloud & DevOps"},
    {"name": "Linux / Bash", "category": "Cloud & DevOps"},
    {"name": "CI/CD Pipelines", "category": "Cloud & DevOps"},
    {"name": "GitHub Actions", "category": "Cloud & DevOps"},
    {"name": "GitLab CI", "category": "Cloud & DevOps"},
    {"name": "Jenkins", "category": "Cloud & DevOps"},
    {"name": "Prometheus", "category": "Cloud & DevOps"},
    {"name": "Grafana", "category": "Cloud & DevOps"},
    {"name": "NGINX", "category": "Cloud & DevOps"},
    {"name": "Git", "category": "Cloud & DevOps"},
    {"name": "Helm", "category": "Cloud & DevOps"},
    {"name": "OpenTelemetry", "category": "Cloud & DevOps"},

    # Frontend
    {"name": "React", "category": "Frontend"},
    {"name": "Next.js", "category": "Frontend"},
    {"name": "TypeScript", "category": "Frontend"},
    {"name": "JavaScript", "category": "Frontend"},
    {"name": "HTML5 / CSS3", "category": "Frontend"},
    {"name": "Vue.js", "category": "Frontend"},
    {"name": "Svelte", "category": "Frontend"},
    {"name": "Tailwind CSS", "category": "Frontend"},
    {"name": "Redux Toolkit", "category": "Frontend"},
    {"name": "Zustand", "category": "Frontend"},
    {"name": "WebGL / Three.js", "category": "Frontend"},
    {"name": "Web Accessibility (a11y)", "category": "Frontend"},
    {"name": "Angular", "category": "Frontend"},
    {"name": "Vite", "category": "Frontend"},
    {"name": "Webpack", "category": "Frontend"},
    {"name": "Sass / SCSS", "category": "Frontend"},

    # Data Science & AI
    {"name": "PyTorch", "category": "Data & AI"},
    {"name": "TensorFlow", "category": "Data & AI"},
    {"name": "Pandas", "category": "Data & AI"},
    {"name": "NumPy", "category": "Data & AI"},
    {"name": "Scikit-Learn", "category": "Data & AI"},
    {"name": "Apache Spark", "category": "Data & AI"},
    {"name": "Apache Kafka", "category": "Data & AI"},
    {"name": "Apache Airflow", "category": "Data & AI"},
    {"name": "LangChain", "category": "Data & AI"},
    {"name": "Hugging Face Transformers", "category": "Data & AI"},
    {"name": "dbt", "category": "Data & AI"},
    {"name": "OpenCV", "category": "Data & AI"},
    {"name": "LlamaIndex", "category": "Data & AI"},
    {"name": "Vector Databases (Pinecone/Milvus)", "category": "Data & AI"},
    {"name": "Matplotlib / Seaborn", "category": "Data & AI"},

    # Mobile & Systems
    {"name": "React Native", "category": "Mobile & Systems"},
    {"name": "Flutter / Dart", "category": "Mobile & Systems"},
    {"name": "Swift (iOS)", "category": "Mobile & Systems"},
    {"name": "Kotlin (Android)", "category": "Mobile & Systems"},
    {"name": "C++", "category": "Mobile & Systems"},
    {"name": "C", "category": "Mobile & Systems"},
    {"name": "System Design", "category": "Mobile & Systems"},
    {"name": "Distributed Systems", "category": "Mobile & Systems"},
    {"name": "WebSockets", "category": "Mobile & Systems"},
    {"name": "Embedded Systems", "category": "Mobile & Systems"},

    # Security & QA
    {"name": "OWASP Top 10", "category": "Security & QA"},
    {"name": "OAuth 2.0 / OIDC", "category": "Security & QA"},
    {"name": "JWT Authentication", "category": "Security & QA"},
    {"name": "PyTest", "category": "Security & QA"},
    {"name": "Jest", "category": "Security & QA"},
    {"name": "Cypress", "category": "Security & QA"},
    {"name": "Playwright", "category": "Security & QA"},
    {"name": "Penetration Testing", "category": "Security & QA"},
    {"name": "HashiCorp Vault", "category": "Security & QA"},

    # Message Brokers & Distributed
    {"name": "RabbitMQ", "category": "Backend"},
    {"name": "Celery", "category": "Backend"},
    {"name": "Socket.io", "category": "Backend"},

    # Modern Data & Warehousing
    {"name": "Snowflake", "category": "Databases"},
    {"name": "Google BigQuery", "category": "Databases"},
    {"name": "TimescaleDB", "category": "Databases"},
    {"name": "CockroachDB", "category": "Databases"},

    # Advanced Cloud & GitOps
    {"name": "AWS Lambda", "category": "Cloud & DevOps"},
    {"name": "Cloudflare Workers", "category": "Cloud & DevOps"},
    {"name": "ArgoCD", "category": "Cloud & DevOps"},

    # Advanced Frontend & UI
    {"name": "TanStack Query", "category": "Frontend"},
    {"name": "Storybook", "category": "Frontend"},
    {"name": "Framer Motion", "category": "Frontend"},

    # Modern GenAI & MLOps
    {"name": "RAG (Retrieval-Augmented Generation)", "category": "Data & AI"},
    {"name": "MLflow", "category": "Data & AI"},
    {"name": "Ollama / Local LLMs", "category": "Data & AI"},

    # Advanced Systems
    {"name": "WebAssembly (Wasm)", "category": "Mobile & Systems"},
    {"name": "Kotlin Multiplatform", "category": "Mobile & Systems"},
]

# Clean up format
SKILL_TAXONOMY = [
    s if "name" in s else {"name": list(s.keys())[0] if not s.get("name") else s["name"], "category": s.get("category", "Backend")}
    for s in SKILL_TAXONOMY
]

# Ensure valid name strings
for s in SKILL_TAXONOMY:
    if ".NET Core" in s:
        s["name"] = ".NET Core"

# ============================================================================
# HARDCODED COURSE MAPPINGS FOR KEY SKILL GAPS
# ============================================================================
COURSE_MAPPINGS: List[Dict[str, str]] = [
    {
        "skill_name": "Redis",
        "title": "Redis Basics & In-Memory Architecture",
        "url": "https://university.redis.com/",
    },
    {
        "skill_name": "AWS",
        "title": "AWS Cloud Fundamentals & Core Services",
        "url": "https://explore.skillbuilder.aws/",
    },
    {
        "skill_name": "Kubernetes",
        "title": "Container Orchestration with Kubernetes",
        "url": "https://training.linuxfoundation.org/",
    },
    {
        "skill_name": "Apache Kafka",
        "title": "Distributed Event Streaming with Apache Kafka",
        "url": "https://developer.confluent.io/",
    },
    {
        "skill_name": "Terraform",
        "title": "Infrastructure as Code with Terraform",
        "url": "https://developer.hashicorp.com/terraform/tutorials",
    },
    {
        "skill_name": "GraphQL",
        "title": "Production Ready GraphQL APIs",
        "url": "https://www.apollographql.com/tutorials",
    },
    {
        "skill_name": "Docker",
        "title": "Docker Mastery: From Beginner to Swarm & Compose",
        "url": "https://docs.docker.com/get-started/",
    },
    {
        "skill_name": "PyTorch",
        "title": "Deep Learning with PyTorch: Zero to GANs",
        "url": "https://pytorch.org/tutorials/",
    },
    {
        "skill_name": "FastAPI",
        "title": "Building High-Performance APIs with FastAPI",
        "url": "https://fastapi.tiangolo.com/tutorial/",
    },
    {
        "skill_name": "PostgreSQL",
        "title": "PostgreSQL Administration and Query Optimization",
        "url": "https://www.postgresql.org/docs/",
    },
    {
        "skill_name": "Next.js",
        "title": "Full Stack Web Applications with Next.js App Router",
        "url": "https://nextjs.org/learn",
    },
    {
        "skill_name": "TypeScript",
        "title": "TypeScript In-Depth: Static Typing for Modern Web Apps",
        "url": "https://www.typescriptlang.org/docs/",
    },
    {
        "skill_name": "System Design",
        "title": "Scalable System Architecture & Microservices Design",
        "url": "https://github.com/donnemartin/system-design-primer",
    },
    {
        "skill_name": "LangChain",
        "title": "Building Production LLM Applications with LangChain",
        "url": "https://python.langchain.com/docs/",
    },
    {
        "skill_name": "GitHub Actions",
        "title": "Automated CI/CD Pipelines with GitHub Actions",
        "url": "https://docs.github.com/en/actions",
    },
    {
        "skill_name": "Go",
        "title": "Tour of Go and High-Concurrency Networking",
        "url": "https://go.dev/tour/",
    },
    {
        "skill_name": "Rust",
        "title": "The Rust Programming Language: Memory Safety without GC",
        "url": "https://doc.rust-lang.org/book/",
    },
    {
        "skill_name": "Microservices",
        "title": "Designing Distributed Systems & Event-Driven Microservices",
        "url": "https://microservices.io/",
    },
]


async def seed_taxonomy() -> Tuple[int, int]:
    """
    Seed the database with fixed skill entries and hardcoded course mappings.
    Idempotent: verifies existing records before inserting to prevent duplicates.
    Returns: (skills_seeded_count, courses_seeded_count)
    """
    async with AsyncSessionLocal() as session:
        skills_added = 0
        courses_added = 0

        # 1. Fetch existing skills
        result = await session.execute(select(Skill))
        existing_skills = {s.name.lower(): s for s in result.scalars().all()}

        # 2. Seed Skills
        skill_map: Dict[str, Skill] = {}
        for entry in SKILL_TAXONOMY:
            skill_name = entry["name"].strip()
            category = entry["category"].strip()
            key = skill_name.lower()

            if key not in existing_skills:
                new_skill = Skill(name=skill_name, category=category)
                session.add(new_skill)
                skill_map[key] = new_skill
                skills_added += 1
            else:
                skill_map[key] = existing_skills[key]

        await session.flush()

        # Update existing_skills with newly added skills
        for key, s in skill_map.items():
            existing_skills[key] = s

        # 3. Fetch existing courses
        c_result = await session.execute(select(Course))
        existing_courses = {(c.skill_id, c.title.lower()) for c in c_result.scalars().all()}

        # 4. Seed Course Mappings
        for mapping in COURSE_MAPPINGS:
            target_skill_name = mapping["skill_name"].strip().lower()
            skill_obj = existing_skills.get(target_skill_name)
            if not skill_obj:
                continue

            course_title = mapping["title"].strip()
            course_key = (skill_obj.id, course_title.lower())

            if course_key not in existing_courses:
                new_course = Course(
                    skill_id=skill_obj.id,
                    title=course_title,
                    url=mapping["url"].strip()
                )
                session.add(new_course)
                existing_courses.add(course_key)
                courses_added += 1

        await session.commit()
        return skills_added, courses_added


async def main():
    print("------------------------------------------------------------")
    print("SkillProof Database Seeder: Populating Fixed Skill Taxonomy")
    print("------------------------------------------------------------")
    # Ensure tables exist in target database before seeding
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    skills_count, courses_count = await seed_taxonomy()
    print(f"Successfully seeded {skills_count} new skills and {courses_count} new courses.")
    print("No mock users, fake jobs, or dummy applications were seeded.")
    print("------------------------------------------------------------")


if __name__ == "__main__":
    asyncio.run(main())
