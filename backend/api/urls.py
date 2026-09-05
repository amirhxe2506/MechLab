"""
api/urls.py
-----------
Root of the /api/ namespace.

  /api/health/                            liveness check
  /api/schema/                             raw OpenAPI 3 schema (drf-spectacular)
  /api/docs/                               Swagger UI
  /api/redoc/                              Redoc UI
  /api/calculators/...                      six engineering calculators (Phase 2)
  /api/units/, /api/units/<dimension>/        unit metadata (Phase 2)

Calculator and unit routes are defined in calculators/urls.py and
included here with no extra prefix (that module's own paths already
start with "calculators/" and "units/").
"""
from django.urls import include, path
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
    path("", include("calculators.urls")),
]
