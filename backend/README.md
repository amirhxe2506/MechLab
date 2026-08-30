# MechLab Backend

Django + Django REST Framework backend for MechLab. This document covers
Phase 1 (foundation) only: project structure, local setup, running the
server, running tests, and the API documentation endpoints. Calculator
endpoints, authentication, and content models arrive in later phases.

## 1. Project structure

```
backend/
├── calculations/         Framework-agnostic engineering calculation engine.
│                          Single source of truth for all physics. Untouched
│                          by Django -- pure Python, no external deps.
│                          See calculations/README.md.
├── tests/                 The engine's own test suite (35 tests). Kept as
│                          a sibling of calculations/, exactly as in the
│                          original standalone package, so
│                          `pytest tests/ -v` and `python run_tests.py`
│                          both work unchanged.
├── run_tests.py            Original self-contained test runner for the
│                          engine (no pytest required).
├── config/                 Django project package: settings, root urls,
│                          wsgi/asgi entry points.
├── core/                    Shared/cross-cutting app (empty skeleton for now).
├── accounts/                 User accounts & auth (empty skeleton for now).
├── learning/                  Courses/topics/formulas/examples content
│                          (empty skeleton for now).
├── calculators/               Calculator API -- Phase 2 wires this to
│                          calculations/. Empty skeleton for now.
├── workspace/                  Calculation history / projects / bookmarks
│                          (empty skeleton for now).
├── api/                     API composition layer. Owns /api/ routing,
│                          the health check, and the OpenAPI schema
│                          (drf-spectacular). Domain apps plug their
│                          routes in here as they're built.
├── manage.py
├── requirements.txt
├── pytest.ini
├── .env.example
└── README.md               This file.
```

Design rule for this phase: **`calculations/` is never imported by anything
here.** It's proven independently (35 tests, framework-agnostic) and will
only be wired into `calculators/` views in Phase 2. Nothing in this phase
depends on it -- it simply needs to sit on the Python path, importable as
a top-level `calculations` package, which it already is by virtue of being
a sibling of `manage.py`.

## 2. Prerequisites

- Python 3.12
- Docker + Docker Compose (for local PostgreSQL)
- Node.js is NOT required for backend work

## 3. Python environment setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 4. PostgreSQL setup

From the repository root (one level up from `backend/`):

```bash
docker compose up -d db
```

This starts PostgreSQL 16 on `localhost:5432` with default credentials
`mechlab` / `mechlab` / database `mechlab`, matching
`backend/.env.example` out of the box.

Check it's healthy:

```bash
docker compose ps
```

## 5. Environment variables

```bash
cd backend
cp .env.example .env
```

Then edit `.env` if you need non-default values. Variables:

| Variable | Purpose | Default (example) |
|---|---|---|
| `SECRET_KEY` | Django secret key | dev placeholder -- **replace for anything beyond local dev** |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | Full Postgres connection string | `postgresql://mechlab:mechlab@localhost:5432/mechlab` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173` (Vite dev server) |

`.env` is git-ignored and must never be committed.

## 6. Running Django

```bash
cd backend
python manage.py check          # sanity check: no missing config
python manage.py migrate        # applies Django's built-in migrations
                                 # (auth, sessions, admin, ...) --
                                 # no MechLab models exist yet in Phase 1
python manage.py createsuperuser  # optional, for /admin/ access
python manage.py runserver
```

Server runs at `http://localhost:8000/`.

## 7. Running tests

Two independent suites, matching CI:

```bash
cd backend

# 1. Calculation engine (35 tests)
pytest tests/ -v
# or, with zero dependencies installed at all (pure stdlib):
python run_tests.py

# 2. Django app tests (currently: the health endpoint, in api/)
pytest core accounts learning calculators workspace api -v
```

Both together:

```bash
pytest -v
```

**Note on `pytest tests/ -v`:** because `pytest.ini` sets a global
`DJANGO_SETTINGS_MODULE`, pytest-django initializes Django's app registry
for *every* pytest invocation in this project -- including this one. So
running the engine tests through `pytest` still requires
`requirements.txt` to be installed (Django/DRF/corsheaders/drf-spectacular
must be importable), even though none of `tests/test_*.py` touches the
database or Django itself. It does **not** require a live PostgreSQL
connection -- no test here uses `@pytest.mark.django_db`. If you want a
true zero-dependency check of the engine alone, use `python run_tests.py`
instead, which never imports Django at all.

## 8. Health endpoint

```
GET /api/health/
```

```json
{"status": "ok", "service": "mechlab-backend"}
```

## 9. API documentation (drf-spectacular)

| Endpoint | Purpose |
|---|---|
| `GET /api/schema/` | Raw OpenAPI 3 schema (JSON) |
| `GET /api/docs/` | Swagger UI |
| `GET /api/redoc/` | Redoc UI |

With no calculator endpoints yet (Phase 2), the schema will currently
only list `/api/health/`.

## 10. What's deliberately NOT in Phase 1

Per the Phase 1 scope: no calculator endpoints/serializers/views, no
authentication, no course/formula/example models, no history/projects,
no React Query/Hook Form/Zod on the frontend side, no JWT. See the
project's Phase 1 task definition for the full constraint list. These
land in subsequent phases against this same foundation.
