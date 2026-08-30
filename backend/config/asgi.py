"""
ASGI config for the MechLab backend.

Exposes the ASGI callable as a module-level variable named `application`.
Not actively used in Phase 1 (no websockets / async views yet), but kept
alongside wsgi.py per Django convention so it is ready when needed.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_asgi_application()
