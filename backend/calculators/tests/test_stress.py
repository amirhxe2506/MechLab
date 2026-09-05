"""
calculators/tests/test_stress.py
------------------------------------
DRF API tests for POST /api/calculators/stress-strain/.

All numeric expectations were verified by calling
calculations.mechanics.stress.calculate_stress directly before being
embedded here (see the Phase 2 final report).
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class StressStrainAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("calculator-stress-strain")

    def test_valid_si_input(self):
        payload = {"force": 10000, "area": 5e-4, "youngs_modulus": 200e9, "original_length": 1.0, "output_unit_system": "SI"}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Note: default SI output for stress is MPa, and mm for deformation
        self.assertAlmostEqual(response.data["stress"], 20.0, delta=1e-3)
        self.assertAlmostEqual(response.data["strain"], 1e-4, delta=1e-9)
        self.assertAlmostEqual(response.data["deformation"], 0.1, delta=1e-9)
        self.assertIsNone(response.data["lateral_strain"])
        self.assertEqual(response.data["units"]["stress"], "MPa")
        self.assertEqual(response.data["units"]["deformation"], "mm")
        self.assertEqual(response.data["values_si"]["stress"], 2e7)
        self.assertEqual(response.data["warnings"], [])

    # B. Valid non-SI / common engineering units -----------------------------
    def test_valid_non_si_input_matches_si_equivalent(self):
        payload = {
            "force": 10, "force_unit": "kN",
            "area": 500, "area_unit": "mm2",
            "youngs_modulus": 200, "youngs_modulus_unit": "GPa",
            "original_length": 1000, "original_length_unit": "mm",
            "output_unit_system": "Imperial"
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["values_si"]["stress"], 2e7, delta=1e-3)
        self.assertAlmostEqual(response.data["strain"], 1e-4, delta=1e-9)
        self.assertEqual(response.data["units"]["stress"], "psi")

    # C. Invalid / missing required fields -----------------------------------
    def test_missing_required_field_returns_400(self):
        payload = {"area": 5e-4, "youngs_modulus": 200e9, "original_length": 1.0}  # no force
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("force", response.data)

    # D. Invalid physical values (engine ValidationError) ---------------------
    def test_non_positive_area_returns_engine_validation_error(self):
        payload = {"force": 10000, "area": 0, "youngs_modulus": 200e9, "original_length": 1.0}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"area": ["Cross-sectional area must be > 0."]})

    def test_poisson_ratio_out_of_range_returns_engine_validation_error(self):
        payload = {
            "force": 10000, "area": 5e-4, "youngs_modulus": 200e9,
            "original_length": 1.0, "poisson_ratio": 0.6,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("poisson_ratio", response.data)

    # E. Unsupported unit ------------------------------------------------------
    def test_unsupported_force_unit_returns_400(self):
        payload = {
            "force": 10000, "force_unit": "lightyear",
            "area": 5e-4, "youngs_modulus": 200e9, "original_length": 1.0,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("force_unit", response.data)

    # G. Representative result-value check (strain warning) --------------------
    def test_high_strain_produces_warning(self):
        payload = {"force": 1e6, "area": 1e-4, "youngs_modulus": 200e9, "original_length": 1.0}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["strain"], 0.05, delta=1e-9)
        self.assertEqual(len(response.data["warnings"]), 1)
        self.assertIn("outside the typical linear-elastic range", response.data["warnings"][0])

    # H. Response shape ----------------------------------------------------------
    def test_response_shape(self):
        payload = {"force": 10000, "area": 5e-4, "youngs_modulus": 200e9, "original_length": 1.0}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(
            set(response.data.keys()),
            {"stress", "strain", "deformation", "lateral_strain", "units", "values_si", "warnings"},
        )
