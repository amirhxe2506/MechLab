"""
calculators/tests/test_bernoulli.py
----------------------------------------
DRF API tests for POST /api/calculators/bernoulli/.

Numeric expectations verified by calling
calculations.fluids.bernoulli.calculate_bernoulli directly first
(density=1000, p1=200000 Pa, v1=1.0 m/s, z1=10 m, p2=150000 Pa, z2=0
-> solved_for="v2", value=17.237546229089567, head_total_m=30.445310070207462).
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class BernoulliAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("calculator-bernoulli")

    # A. Valid SI input, solving for v2 -----------------------------------------
    def test_valid_si_solve_for_v2(self):
        payload = {
            "density": 1000, "p1": 200000, "v1": 1.0, "z1": 10,
            "p2": 150000, "z2": 0,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["solved_for"], "v2")
        self.assertAlmostEqual(response.data["value"], 17.237546229089567, delta=1e-6)
        self.assertAlmostEqual(response.data["head_total_m"], 30.445310070207462, delta=1e-6)

    # B. Valid non-SI input -------------------------------------------------------
    def test_valid_non_si_input_matches_si_equivalent(self):
        payload = {
            "density": 1000, "p1": 200, "p1_unit": "kPa", "v1": 1.0, "z1": 10,
            "p2": 150, "p2_unit": "kPa", "z2": 0,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["solved_for"], "v2")
        self.assertAlmostEqual(response.data["value"], 17.237546229089567, delta=1e-6)

    # D. Invalid physical values ----------------------------------------------------
    def test_all_three_of_p2_v2_z2_given_returns_400(self):
        payload = {
            "density": 1000, "p1": 200000, "v1": 1.0, "z1": 10,
            "p2": 150000, "v2": 5.0, "z2": 0,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("p2/v2/z2", response.data)

    def test_two_of_p2_v2_z2_missing_returns_400(self):
        payload = {"density": 1000, "p1": 200000, "v1": 1.0, "z1": 10, "z2": 0}  # p2, v2 both missing
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("p2/v2/z2", response.data)

    def test_no_real_solution_for_v2_returns_400(self):
        """z2 far above z1 with p2 == p1 and small v1 has no real v2 root."""
        payload = {
            "density": 1000, "p1": 100000, "v1": 0.1, "z1": 0,
            "p2": 100000, "z2": 1000,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("v2", response.data)

    # E. Unsupported unit -------------------------------------------------------------
    def test_unsupported_unit_returns_400(self):
        payload = {
            "density": 1000, "p1": 200000, "p1_unit": "bar",
            "v1": 1.0, "z1": 10, "p2": 150000, "z2": 0,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("p1_unit", response.data)

    # H. Response shape -----------------------------------------------------------------
    def test_response_shape(self):
        payload = {"density": 1000, "p1": 200000, "v1": 1.0, "z1": 10, "p2": 150000, "z2": 0}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(set(response.data.keys()), {"solved_for", "value", "head_total_m"})
