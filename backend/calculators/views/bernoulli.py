"""
calculators/views/bernoulli.py
-----------------------------------
POST /api/calculators/bernoulli/
"""
import dataclasses

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.fluids.bernoulli import calculate_bernoulli

from ..serializers.bernoulli import BernoulliInputSerializer, BernoulliResultSerializer
from ..serializers.common import CalculatorValidationErrorSerializer


class BernoulliView(APIView):
    """Bernoulli's equation calculator. Thin wrapper around
    calculations.fluids.bernoulli.calculate_bernoulli -- no physics here."""

    @extend_schema(
        tags=["calculators"],
        summary="Bernoulli equation calculation",
        description=(
            "Solves Bernoulli's equation for steady, incompressible, "
            "inviscid flow along a streamline between two points. Provide "
            "the full state at point 1 (p1, v1, z1) and exactly two of "
            "three quantities at point 2 (p2, v2, z2) -- leave the third "
            "one unset (or null) to solve for it.\n\n"
            "Wraps calculations.fluids.bernoulli.calculate_bernoulli. "
            "Preserves the engine's physical validation, including "
            "rejecting v2 solutions with no real square root."
        ),
        request=BernoulliInputSerializer,
        responses={200: BernoulliResultSerializer, 400: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "Solve for v2 (z2 and p2 given)",
                value={
                    "density": 1000, "density_unit": "kg/m3",
                    "p1": 200, "p1_unit": "kPa", "v1": 1.0, "z1": 10, "z1_unit": "m",
                    "p2": 150, "p2_unit": "kPa", "z2": 0,
                },
                request_only=True,
            ),
            OpenApiExample(
                "Result",
                value={"solved_for": "v2", "value": 17.24, "head_total_m": 30.45},
                response_only=True,
                status_codes=["200"],
            ),
            OpenApiExample(
                "Validation error (no real solution for v2)",
                value={"v2": ["No physically real solution for v2 with these inputs "
                              "(negative value under the square root). Check p2, z2, and z1/v1/p1."]},
                response_only=True,
                status_codes=["400"],
            ),
        ],
    )
    def post(self, request):
        input_serializer = BernoulliInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = calculate_bernoulli(**input_serializer.to_engine_kwargs())

        output_serializer = BernoulliResultSerializer(dataclasses.asdict(result))
        return Response(output_serializer.data, status=status.HTTP_200_OK)
