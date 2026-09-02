"""
calculators/tests/test_vibration.py
----------------------------------------
DRF API tests for POST /api/calculators/vibration/.

Numeric expectations verified by calling
calculations.vibrations.sdof.calculate_sdof directly first
(mass=10, stiffness=4000, damping=20 -> wn=20.0 rad/s,
natural_frequency_hz=3.183098861837907, zeta=0.05, underdamped,
wd=19.974984355438178).
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class VibrationAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("calculator-vibration")

    # A. Valid SI input, underdamped ------------------------------------------
    def test_valid_si_underdamped(self):
        payload = {
            "mass": 10, "stiffness": 4000, "damping": 20,
            "initial_displacement": 0.05, "n_points": 50,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["natural_frequency_rad_s"], 20.0, delta=1e-6)
        self.assertAlmostEqual(response.data["natural_frequency_hz"], 3.183098861837907, delta=1e-6)
        self.assertAlmostEqual(response.data["damping_ratio"], 0.05, delta=1e-9)
        self.assertEqual(response.data["classification"], "underdamped")
        self.assertAlmostEqual(response.data["damped_frequency_rad_s"], 19.974984355438178, delta=1e-6)
        self.assertEqual(len(response.data["time"]), 50)
        self.assertEqual(len(response.data["displacement"]), 50)

    # B. Valid non-SI input (mass unit; stiffness/damping are SI-only) -----------
    def test_valid_non_si_mass_unit_matches_si_equivalent(self):
        payload = {
            "mass": 10000, "mass_unit": "g",  # 10000 g = 10 kg
            "stiffness": 4000, "damping": 20, "n_points": 50,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["natural_frequency_rad_s"], 20.0, delta=1e-6)

    # D. Invalid physical values --------------------------------------------------
    def test_non_positive_mass_returns_400(self):
        payload = {"mass": 0, "stiffness": 4000, "damping": 20}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"mass": ["Mass must be > 0."]})

    def test_negative_damping_returns_400(self):
        payload = {"mass": 10, "stiffness": 4000, "damping": -1}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("damping", response.data)

    # n_points=1 would divide by zero inside the engine (n_points - 1); this
    # is caught defensively at the API boundary (serializer min_value=2)
    # before it ever reaches calculate_sdof.
    def test_n_points_one_rejected_before_reaching_engine(self):
        payload = {"mass": 10, "stiffness": 4000, "damping": 20, "n_points": 1}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("n_points", response.data)

    # E. Unsupported unit -----------------------------------------------------------
    def test_unsupported_unit_returns_400(self):
        payload = {"mass": 10, "mass_unit": "stone", "stiffness": 4000, "damping": 20}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mass_unit", response.data)

    # H. Response shape -------------------------------------------------------------
    def test_response_shape(self):
        payload = {"mass": 10, "stiffness": 4000, "damping": 20, "n_points": 50}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(
            set(response.data.keys()),
            {"natural_frequency_rad_s", "natural_frequency_hz", "damping_ratio",
             "damped_frequency_rad_s", "classification", "time", "displacement", "warnings"},
        )
