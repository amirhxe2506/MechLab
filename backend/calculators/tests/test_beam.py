"""
calculators/tests/test_beam.py
------------------------------------
DRF API tests for POST /api/calculators/beam/.

Numeric expectations verified by calling
calculations.mechanics.beam.calculate_beam directly first:

  Simply supported, central point load (L=4, P=1000 N at x=2,
  E=200e9 Pa, I=rectangular_I(0.05, 0.10)=4.166666666666668e-06 m^4):
    reactions={'R1_at_0': 500.0, 'R2_at_L': 500.0}
    max_moment=1000.0 at x=2.0
    max_deflection=-0.0015993438108271208 at x=2.0

  Cantilever, end point load (L=2, P=500 N at x=2, same E/I):
    reactions={'R_at_0': 500.0, 'M_at_0': 1000.0}
    max_moment=-1000.0 at x=0.0
    max_deflection=-0.0015998334027488542 at x=2.0

Also verified directly against the engine: omitting 'position' for a
point load (rather than sending position=null) is required for the API
layer to surface the engine's own
"Point load requires 'magnitude' and 'position'." ValidationError as a
clean 400 -- sending position=null instead hits a bare TypeError deep in
the engine (see BeamInputSerializer / _build_load_dict for the
omission-based design this test exercises).
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

MOMENT_OF_INERTIA_50x100MM = 4.166666666666668e-06  # rectangular_I(0.05, 0.10), m^4


class BeamAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("calculator-beam")

    # A. Valid SI input, simply supported, central point load -------------------
    def test_valid_si_simply_supported_central_point_load(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0, "position": 2.0}],
            "youngs_modulus": 200e9, "moment_of_inertia": MOMENT_OF_INERTIA_50x100MM,
            "n_points": 50,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reactions"]["R1_at_0"], 500.0, delta=1e-6)
        self.assertAlmostEqual(response.data["reactions"]["R2_at_L"], 500.0, delta=1e-6)
        self.assertAlmostEqual(response.data["max_moment"], 1000.0, delta=1e-3)
        self.assertAlmostEqual(response.data["max_moment_location"], 2.0, delta=1e-6)
        self.assertAlmostEqual(response.data["max_deflection"], -0.0015993438108271208, delta=1e-6)
        self.assertEqual(len(response.data["x"]), len(response.data["shear"]))
        self.assertEqual(len(response.data["x"]), len(response.data["moment"]))

    # B. Valid non-SI input --------------------------------------------------------
    def test_valid_non_si_input_matches_si_equivalent(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{
                "type": "point", "magnitude": 1, "magnitude_unit": "kN",
                "position": 200, "position_unit": "cm",
            }],
            "youngs_modulus": 200, "youngs_modulus_unit": "GPa",
            "moment_of_inertia": MOMENT_OF_INERTIA_50x100MM,
            "n_points": 50,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["max_moment"], 1000.0, delta=1e-3)

    # A2. Cantilever, end point load, no deflection requested -------------------
    def test_valid_si_cantilever_end_point_load(self):
        payload = {
            "length": 2.0, "support_type": "cantilever",
            "loads": [{"type": "point", "magnitude": 500.0, "position": 2.0}],
            "youngs_modulus": 200e9, "moment_of_inertia": MOMENT_OF_INERTIA_50x100MM,
            "n_points": 50,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reactions"]["R_at_0"], 500.0, delta=1e-6)
        self.assertAlmostEqual(response.data["reactions"]["M_at_0"], 1000.0, delta=1e-6)
        self.assertAlmostEqual(response.data["max_moment"], -1000.0, delta=1e-3)
        self.assertAlmostEqual(response.data["max_deflection"], -0.0015998334027488542, delta=1e-6)

    # A3. No youngs_modulus/moment_of_inertia -> deflection is null -------------
    def test_no_deflection_requested_returns_null_deflection(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0, "position": 2.0}],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["deflection"])
        self.assertIsNone(response.data["max_deflection"])
        self.assertIsNone(response.data["max_deflection_location"])

    # UDL case ------------------------------------------------------------------------
    def test_valid_udl_load(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "udl", "magnitude": 500.0, "start": 0.0, "end": 4.0}],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data["reactions"]["R1_at_0"], 1000.0, delta=1e-6)
        self.assertAlmostEqual(response.data["max_moment"], 1000.0, delta=1e-2)  # w*L^2/8 = 500*16/8

    # C. Missing type-specific required field ------------------------------------------
    # (exercises the omission-based dict-building design, verified directly
    # against the engine -- see module docstring)
    def test_point_load_missing_position_returns_engine_validation_error(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0}],  # no 'position'
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data, {"loads[0]": ["Point load requires 'magnitude' and 'position'."]},
        )

    def test_udl_missing_start_end_returns_engine_validation_error(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "udl", "magnitude": 500.0}],  # no 'start'/'end'
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("loads[0]", response.data)

    # D. Invalid physical values --------------------------------------------------------
    def test_no_loads_returns_400(self):
        payload = {"length": 4.0, "support_type": "simply_supported", "loads": []}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("loads", response.data)

    def test_load_position_outside_span_returns_400(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 100.0, "position": 5.0}],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("loads[0].position", response.data)

    def test_zero_length_returns_400(self):
        payload = {
            "length": 0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 100.0, "position": 0}],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("length", response.data)

    def test_only_one_of_youngs_modulus_or_moment_of_inertia_returns_400(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0, "position": 2.0}],
            "youngs_modulus": 200e9,  # moment_of_inertia omitted
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("youngs_modulus/moment_of_inertia", response.data)

    # E. Unsupported unit -----------------------------------------------------------------
    def test_unsupported_unit_returns_400(self):
        payload = {
            "length": 4.0, "length_unit": "furlong", "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0, "position": 2.0}],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("length_unit", response.data)

    # n_points=1 defensive guard (matches the SDOF calculator's identical issue) ---------
    def test_n_points_one_rejected_before_reaching_engine(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0, "position": 2.0}],
            "n_points": 1,
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("n_points", response.data)

    # H. Response shape ---------------------------------------------------------------------
    def test_response_shape(self):
        payload = {
            "length": 4.0, "support_type": "simply_supported",
            "loads": [{"type": "point", "magnitude": 1000.0, "position": 2.0}],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(
            set(response.data.keys()),
            {"x", "shear", "moment", "deflection", "reactions", "max_moment",
             "max_moment_location", "max_deflection", "max_deflection_location", "warnings"},
        )
