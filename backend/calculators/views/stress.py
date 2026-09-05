"""
calculators/views/stress.py
------------------------------
POST /api/calculators/stress-strain/
"""
import dataclasses

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.mechanics.stress import calculate_stress

from ..serializers.common import CalculatorValidationErrorSerializer
from ..serializers.stress import StressInputSerializer, StressResultSerializer


class StressStrainView(APIView):
    """Axial stress-strain calculator. Thin wrapper around
    calculations.mechanics.stress.calculate_stress -- no physics here."""

    @extend_schema(
        tags=["calculators"],
        summary="Axial stress-strain calculation",
        description=(
            "Computes normal stress, axial strain, axial deformation, and "
            "(optionally, if poisson_ratio is given) lateral strain for a "
            "prismatic bar under axial load, per Hooke's law.\n\n"
            "Wraps calculations.mechanics.stress.calculate_stress."
        ),
        request=StressInputSerializer,
        responses={200: StressResultSerializer, 400: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "Steel bar, 10 kN tension",
                value={
                    "force": 10, "force_unit": "kN",
                    "area": 500, "area_unit": "mm2",
                    "youngs_modulus": 200, "youngs_modulus_unit": "GPa",
                    "original_length": 1.0, "original_length_unit": "m",
                    "output_unit_system": "SI"
                },
                request_only=True,
            ),
            OpenApiExample(
                "Result",
                value={
                    "stress": 20.0, "strain": 1e-4, "deformation": 0.1,
                    "lateral_strain": None,
                    "units": {
                        "stress": "MPa",
                        "strain": "—",
                        "deformation": "mm",
                        "lateral_strain": "—"
                    },
                    "values_si": {
                        "stress": 2e7,
                        "deformation": 1e-4
                    },
                    "warnings": [],
                },
                response_only=True,
                status_codes=["200"],
            ),
            OpenApiExample(
                "Validation error (area <= 0)",
                value={"area": ["Cross-sectional area must be > 0."]},
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        input_serializer = StressInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = calculate_stress(**input_serializer.to_engine_kwargs())

        output_sys = input_serializer.validated_data.get("output_unit_system", "SI")

        from calculations.units import from_si

        if output_sys == "Imperial":
            stress_val = from_si(result.stress, "psi", "pressure")
            stress_unit = "psi"
            def_val = from_si(result.deformation, "in", "length")
            def_unit = "in"
        else:
            stress_val = from_si(result.stress, "MPa", "pressure")
            stress_unit = "MPa"
            def_val = from_si(result.deformation, "mm", "length")
            def_unit = "mm"

        enriched_result = {
            "stress": stress_val,
            "strain": result.strain,
            "deformation": def_val,
            "lateral_strain": result.lateral_strain,
            "units": {
                "stress": stress_unit,
                "strain": "—",
                "deformation": def_unit,
                "lateral_strain": "—",
            },
            "values_si": {
                "stress": result.stress,
                "deformation": result.deformation,
            },
            "warnings": result.warnings,
        }

        output_serializer = StressResultSerializer(enriched_result)
        return Response(output_serializer.data, status=status.HTTP_200_OK)
