"""
calculators/views/vibration.py
-----------------------------------
POST /api/calculators/vibration/
"""
import dataclasses

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.vibrations.sdof import calculate_sdof

from ..serializers.common import CalculatorValidationErrorSerializer
from ..serializers.vibration import VibrationInputSerializer, SDOFResultSerializer


class VibrationView(APIView):
    """SDOF free-vibration calculator. Thin wrapper around
    calculations.vibrations.sdof.calculate_sdof -- no physics here."""

    @extend_schema(
        tags=["calculators"],
        summary="Single-degree-of-freedom (SDOF) free-vibration calculation",
        description=(
            "Computes the free-vibration response x(t) of a SDOF mass-"
            "spring-damper system (m x'' + c x' + k x = 0), including "
            "natural frequency, damping ratio, and damping classification "
            "(undamped / underdamped / critically damped / overdamped).\n\n"
            "Wraps calculations.vibrations.sdof.calculate_sdof. Preserves "
            "all existing damping classification thresholds and result "
            "fields exactly."
        ),
        request=VibrationInputSerializer,
        responses={200: SDOFResultSerializer, 400: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "Underdamped system",
                value={
                    "mass": 10, "mass_unit": "kg",
                    "stiffness": 4000, "damping": 20,
                    "initial_displacement": 0.05, "initial_displacement_unit": "m",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Validation error (negative stiffness)",
                value={"stiffness": ["Stiffness must be > 0."]},
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        input_serializer = VibrationInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = calculate_sdof(**input_serializer.to_engine_kwargs())

        output_serializer = SDOFResultSerializer(dataclasses.asdict(result))
        return Response(output_serializer.data, status=status.HTTP_200_OK)
