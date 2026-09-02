"""
calculators/tests/test_reynolds.py
---------------------------------------
DRF API tests for POST /api/calculators/reynolds/.

Numeric expectations verified by calling
calculations.fluids.reynolds.calculate_reynolds directly first.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ReynoldsAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("calculator-reynolds")

    # A. Valid SI input, density/viscosity path ---------------------------------
    def test_valid_si_mu_path_turbulent(self):
        payload = {"velocity": 2.0, "diameter": 0.05, "density": 1000.0, "dynamic_viscosity": 0.001}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reynolds_number"], 100000.0, delta=1e-2)
        self.assertEqual(response.data["regime"], "turbulent")

    # A2. Valid SI input, kinematic-viscosity path -------------------------------
    def test_valid_si_nu_path_agrees_with_mu_path(self):
        payload = {"velocity": 2.0, "diameter": 0.05, "kinematic_viscosity": 0.001 / 1000.0}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reynolds_number"], 100000.0, delta=1e-2)

    # B. Valid non-SI input --------------------------------------------------------
    def test_valid_non_si_diameter_unit_matches_si_equivalent(self):
        payload = {
            "velocity": 2.0, "diameter": 50, "diameter_unit": "mm",
            "density": 1000.0, "dynamic_viscosity": 0.001,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reynolds_number"], 100000.0, delta=1e-2)

    # D. Invalid physical values --------------------------------------------------
    def test_zero_velocity_returns_400(self):
        payload = {"velocity": 0, "diameter": 0.05, "density": 1000.0, "dynamic_viscosity": 0.001}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("velocity", response.data)

    def test_negative_velocity_reverse_flow_is_accepted(self):
        """Preserves the engine's existing velocity-sign handling: Re uses abs(velocity)."""
        payload = {"velocity": -2.0, "diameter": 0.05, "density": 1000.0, "dynamic_viscosity": 0.001}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reynolds_number"], 100000.0, delta=1e-2)

    def test_both_viscosity_paths_returns_400(self):
        payload = {
            "velocity": 1.0, "diameter": 0.05, "density": 1000.0,
            "dynamic_viscosity": 0.001, "kinematic_viscosity": 1e-6,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("viscosity", response.data)

    def test_neither_viscosity_path_returns_400(self):
        payload = {"velocity": 1.0, "diameter": 0.05}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("viscosity", response.data)

    # E. Unsupported unit -----------------------------------------------------------
    def test_unsupported_unit_returns_400(self):
        payload = {
            "velocity": 2.0, "diameter": 0.05, "diameter_unit": "furlong",
            "density": 1000.0, "dynamic_viscosity": 0.001,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("diameter_unit", response.data)

    # H. Response shape -------------------------------------------------------------
    def test_response_shape(self):
        payload = {"velocity": 2.0, "diameter": 0.05, "density": 1000.0, "dynamic_viscosity": 0.001}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(set(response.data.keys()), {"reynolds_number", "regime"})
