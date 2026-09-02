"""
calculators/tests/test_units.py
------------------------------------
DRF API tests for GET /api/units/ and GET /api/units/<dimension>/.

Cross-checks response payloads directly against
calculations.units.available_units() rather than hardcoding expected
unit lists, so these tests can't silently drift from the engine's own
unit tables.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from calculations.units import available_units
from calculators.views.units import DIMENSIONS


class UnitsAPITests(APITestCase):
    def test_list_all_dimensions(self):
        url = reverse("units-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(set(response.data.keys()), set(DIMENSIONS))
        for dim in DIMENSIONS:
            self.assertEqual(response.data[dim], available_units(dim))

    def test_single_dimension_detail(self):
        url = reverse("units-detail", kwargs={"dimension": "pressure"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["units"], available_units("pressure"))
        self.assertIn("Pa", response.data["units"])
        self.assertIn("MPa", response.data["units"])

    def test_invalid_dimension_returns_404(self):
        url = reverse("units-detail", kwargs={"dimension": "not_a_real_dimension"})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
