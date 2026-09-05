"""
calculators/views/beam.py
-----------------------------
POST /api/calculators/beam/
"""
import dataclasses

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.mechanics.beam import calculate_beam

from ..serializers.beam import BeamInputSerializer, BeamResultSerializer
from ..serializers.common import CalculatorValidationErrorSerializer


class BeamView(APIView):
    """Statically-determinate beam analysis. Thin wrapper around
    calculations.mechanics.beam.calculate_beam -- no physics here."""

    @extend_schema(
        tags=["calculators"],
        summary="Beam analysis (reactions, shear, moment, deflection)",
        description=(
            "Analyses a statically-determinate simply-supported or "
            "cantilever beam under any combination of point loads and "
            "uniformly distributed loads (UDLs): support reactions, "
            "shear force V(x), bending moment M(x), and -- if both "
            "youngs_modulus and moment_of_inertia are provided -- "
            "transverse deflection y(x).\n\n"
            "Wraps calculations.mechanics.beam.calculate_beam. Uses the "
            "engine's existing loads[] list-of-dicts model directly; each "
            "load is either type='point' (needs magnitude + position) or "
            "type='udl' (needs magnitude + start + end)."
        ),
        request=BeamInputSerializer,
        responses={200: BeamResultSerializer, 400: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "Simply-supported beam, central point load",
                value={
                    "length": 4, "length_unit": "m",
                    "support_type": "simply_supported",
                    "loads": [
                        {"type": "point", "magnitude": 1000, "magnitude_unit": "N", "position": 2, "position_unit": "m"},
                    ],
                    "youngs_modulus": 200, "youngs_modulus_unit": "GPa",
                    "moment_of_inertia": 4.1667e-6,
                    "n_points": 100,
                },
                request_only=True,
            ),
            OpenApiExample(
                "Cantilever with a point load and a partial UDL",
                value={
                    "length": 3, "length_unit": "m",
                    "support_type": "cantilever",
                    "loads": [
                        {"type": "point", "magnitude": 500, "magnitude_unit": "N", "position": 3, "position_unit": "m"},
                        {"type": "udl", "magnitude": 200, "start": 0, "end": 1.5, "start_unit": "m", "end_unit": "m"},
                    ],
                },
                request_only=True,
            ),
            OpenApiExample(
                "Result (excerpt -- reactions/extremes only, x/shear/moment/deflection truncated for brevity)",
                value={
                    "x": ["... 100 station values ..."],
                    "shear": ["... 100 values ..."],
                    "moment": ["... 100 values ..."],
                    "deflection": ["... 100 values ..."],
                    "reactions": {"R1_at_0": 500.0, "R2_at_L": 500.0},
                    "max_moment": 1000.0, "max_moment_location": 2.0,
                    "max_deflection": -0.0015993438108271208, "max_deflection_location": 2.0,
                    "warnings": [],
                },
                response_only=True,
                status_codes=["200"],
            ),
            OpenApiExample(
                "Validation error (point load missing position)",
                value={"loads[0]": ["Point load requires 'magnitude' and 'position'."]},
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        input_serializer = BeamInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = calculate_beam(**input_serializer.to_engine_kwargs())

        output_serializer = BeamResultSerializer(dataclasses.asdict(result))
        return Response(output_serializer.data, status=status.HTTP_200_OK)
