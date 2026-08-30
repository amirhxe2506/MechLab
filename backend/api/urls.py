"""
api/urls.py
-----------
Root of the /api/ namespace.

  /api/health/        liveness check
  /api/schema/         raw OpenAPI 3 schema (drf-spectacular)
  /api/docs/           Swagger UI
  /api/redoc/          Redoc UI

Calculator routes (/api/calculators/...) are added in Phase 2.
"""
from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from .views import health_check

urlpatterns = [
    path("health/", health_check, name="api-health"),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
