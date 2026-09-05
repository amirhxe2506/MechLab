"""
calculators/views/reynolds.py
---------------------------------
POST /api/calculators/reynolds/
"""
import dataclasses

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.fluids.reynolds import calculate_reynolds

from ..serializers.common import CalculatorValidationErrorSerializer
from ..serializers.reynolds import ReynoldsInputSerializer, ReynoldsResultSerializer


class ReynoldsView(APIView):
    """Reynolds number / flow-regime calculator. Thin wrapper around
    calculations.fluids.reynolds.calculate_reynolds -- no physics here."""

    @extend_schema(
        tags=["calculators"],
        summary="Reynolds number calculation",
        description=(
            "Computes the Reynolds number for internal pipe flow and "
            "classifies the flow regime (laminar / transitional / "
            "turbulent). Provide EITHER (density AND dynamic_viscosity) "
            "OR kinematic_viscosity.\n\n"
            "Wraps calculations.fluids.reynolds.calculate_reynolds. "
            "Preserves the engine's existing velocity-sign handling: "
            "negative velocity (reverse flow) is accepted; only "
            "velocity == 0 is rejected."
        ),
        request=ReynoldsInputSerializer,
        responses={200: ReynoldsResultSerializer, 400: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "Water in a pipe, density/viscosity path",
                value={
                    "velocity": 2.0, "velocity_unit": "m/s",
                    "diameter": 50, "diameter_unit": "mm",
                    "density": 1000, "density_unit": "kg/m3",
                    "dynamic_viscosity": 0.001, "dynamic_viscosity_unit": "Pa*s",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Result",
                value={"reynolds_number": 100000.0, "regime": "turbulent"},
                response_only=True,
                status_codes=["200"],
            ),
            OpenApiExample(
                "Validation error (both viscosity paths given)",
                value={"viscosity": ["Provide EITHER (density and dynamic_viscosity) OR "
                                      "kinematic_viscosity, not both/neither."]},
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        input_serializer = ReynoldsInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = calculate_reynolds(**input_serializer.to_engine_kwargs())

        output_serializer = ReynoldsResultSerializer(dataclasses.asdict(result))
        return Response(output_serializer.data, status=status.HTTP_200_OK)
