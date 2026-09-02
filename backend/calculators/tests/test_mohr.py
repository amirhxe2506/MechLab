"""
calculators/tests/test_mohr.py
-----------------------------------
DRF API tests for POST /api/calculators/mohr/.

Numeric expectations verified by calling
calculations.mechanics.mohr.calculate_mohr directly first.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class MohrAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("calculator-mohr")

    # A. Valid SI input -----------------------------------------------------
    def test_valid_si_pure_shear(self):
        payload = {"sigma_x": 0, "sigma_y": 0, "tau_xy": 5e7}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["sigma_avg"], 0.0, delta=1e-6)
        self.assertAlmostEqual(response.data["radius"], 5e7, delta=1.0)
        self.assertAlmostEqual(response.data["sigma_1"], 5e7, delta=1.0)
        self.assertAlmostEqual(response.data["sigma_2"], -5e7, delta=1.0)
        self.assertAlmostEqual(response.data["tau_max"], 5e7, delta=1.0)
        self.assertAlmostEqual(response.data["theta_p1_deg"], 45.0, delta=1e-6)
        self.assertAlmostEqual(response.data["theta_p2_deg"], -45.0, delta=1e-6)
        self.assertAlmostEqual(response.data["theta_s_deg"], 0.0, delta=1e-6)

    # B. Valid non-SI input ---------------------------------------------------
    def test_valid_non_si_input_matches_si_equivalent(self):
        payload = {"sigma_x": 0, "sigma_y": 0, "tau_xy": 50, "tau_xy_unit": "MPa"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["sigma_1"], 5e7, delta=1.0)

    # C. Missing required field ------------------------------------------------
    def test_missing_required_field_returns_400(self):
        payload = {"sigma_x": 0, "tau_xy": 5e7}  # no sigma_y
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("sigma_y", response.data)

    # E. Unsupported unit -------------------------------------------------------
    def test_unsupported_unit_returns_400(self):
        payload = {"sigma_x": 0, "sigma_y": 0, "tau_xy": 50, "tau_xy_unit": "furlong"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tau_xy_unit", response.data)

    # H. Response shape -----------------------------------------------------------
    def test_response_shape(self):
        payload = {"sigma_x": 0, "sigma_y": 0, "tau_xy": 5e7}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(
            set(response.data.keys()),
            {"sigma_avg", "radius", "sigma_1", "sigma_2", "tau_max",
             "theta_p1_deg", "theta_p2_deg", "theta_s_deg"},
        )
