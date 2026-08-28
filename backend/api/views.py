"""
api/views.py
------------
Phase 1: only the health check lives here. Calculator endpoints
(stress-strain, beam, mohr, reynolds, bernoulli, vibration) are Phase 2
and will live in the `calculators` app, wired into api/urls.py.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Simple liveness check confirming the backend is up and reachable."""
    return Response({"status": "ok", "service": "mechlab-backend"})
