"""
Django settings for the MechLab backend (config project package).

Environment-driven configuration: every value that differs between local
development, CI, and production is read from the environment (via a
`.env` file locally, or real environment variables in CI/production).
See `.env.example` for the full list of variables and their defaults.

This file intentionally contains NO calculator-specific, auth, or
content-model configuration yet -- those arrive in later phases. Phase 1
only needs Django + DRF + CORS + drf-spectacular to boot cleanly against
PostgreSQL.
"""
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load backend/.env if present. In CI/production, real environment
# variables are provided directly and this is a harmless no-op.
load_dotenv(BASE_DIR / ".env")


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def _env_list(name: str, default: str) -> list[str]:
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- Core -------------------------------------------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "insecure-dev-key-change-me")
DEBUG = _env_bool("DEBUG", True)
ALLOWED_HOSTS = _env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")

# --- Applications -------------------------------------------------------
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
]

LOCAL_APPS = [
    "core.apps.CoreConfig",
    "accounts.apps.AccountsConfig",
    "learning.apps.LearningConfig",
    "calculators.apps.CalculatorsConfig",
    "workspace.apps.WorkspaceConfig",
    "api.apps.ApiConfig",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# --- Database -------------------------------------------------------------
# Local dev / CI: DATABASE_URL, e.g.
#   postgresql://mechlab:mechlab@localhost:5432/mechlab
# matches the default credentials in docker-compose.yml + .env.example.
DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL",
            "postgresql://mechlab:mechlab@localhost:5432/mechlab",
        ),
        conn_max_age=600,
    )
}

# --- Password validation -----------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Internationalization ------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --- Static files ----------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CORS -------------------------------------------------------------
# The React/Vite dev server runs on :5173 by default, and figma-make on :8443.
CORS_ALLOWED_ORIGINS = _env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8443,http://127.0.0.1:8443")
# In development, allow all origins to avoid port mismatch headaches.
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

# --- Django REST Framework ----------------------------------------------
# Session-based auth for the initial web app (per the approved
# architecture). No default permission restriction yet -- there are no
# endpoints to protect at this phase besides the open health check and
# the (also open, per Phase 2 scope) calculator endpoints.
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Translates calculations.exceptions.* into structured 400 responses.
    # See calculators/exceptions.py.
    "EXCEPTION_HANDLER": "calculators.exceptions.custom_exception_handler",
}

# --- drf-spectacular (OpenAPI schema / Swagger / Redoc) -------------------
SPECTACULAR_SETTINGS = {
    "TITLE": "MechLab API",
    "DESCRIPTION": (
        "REST API for MechLab -- a Mechanical Engineering learning, "
        "calculation, and analysis platform. Exposes the six engineering "
        "calculators (stress-strain, beam, Mohr's circle, Reynolds "
        "number, Bernoulli, SDOF vibration) as a thin REST layer over "
        "the framework-agnostic calculations/ engine, plus a unit "
        "metadata endpoint for frontend dropdowns. Authentication, "
        "history/projects, and learning content arrive in later phases."
    ),
    "VERSION": "0.2.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
