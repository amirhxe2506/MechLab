"""
api/tests.py
------------
Phase 1 test coverage: just the health endpoint. As calculator endpoints
land in Phase 2, their tests belong in `calculators/tests.py`, not here.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class HealthEndpointTests(APITestCase):
    def test_health_check_returns_200_ok_status(self):
        url = reverse("api-health")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_check_response_body(self):
        url = reverse("api-health")
        response = self.client.get(url)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(response.data["service"], "mechlab-backend")
