"""
config/urls.py
---------------
Root URL configuration. All API routes live under /api/ (see api/urls.py).
Django admin is available at /admin/ for future content management
(learning content, formulas, examples -- later phases).
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
