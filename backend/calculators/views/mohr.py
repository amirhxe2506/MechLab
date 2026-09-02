"""
calculators/views/mohr.py
----------------------------
POST /api/calculators/mohr/
"""
import dataclasses

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.mechanics.mohr import calculate_mohr

from ..serializers.common import CalculatorValidationErrorSerializer
from ..serializers.mohr import MohrInputSerializer, MohrResultSerializer


class MohrView(APIView):
    """Mohr's circle (2D stress transformation) calculator. Thin wrapper
    around calculations.mechanics.mohr.calculate_mohr -- no physics here."""

    @extend_schema(
        tags=["calculators"],
        summary="Mohr's circle / principal stress calculation",
        description=(
            "Computes principal stresses, maximum in-plane shear stress, and "
            "their orientations from a 2D stress state (sigma_x, sigma_y, "
            "tau_xy) via Mohr's circle.\n\n"
            "Wraps calculations.mechanics.mohr.calculate_mohr. This "
            "calculation has no invalid-input case -- any real stress state "
            "is mathematically valid, so the only 400 sources are DRF's own "
            "structural checks (missing/non-numeric fields) and unsupported "
            "pressure units."
        ),
        request=MohrInputSerializer,
        responses={200: MohrResultSerializer, 400: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "Pure shear",
                value={"sigma_x": 0, "sigma_y": 0, "tau_xy": 50, "tau_xy_unit": "MPa"},
                request_only=True,
            ),
            OpenApiExample(
                "Result",
                value={
                    "sigma_avg": 0.0, "radius": 5e7, "sigma_1": 5e7, "sigma_2": -5e7,
                    "tau_max": 5e7, "theta_p1_deg": 45.0, "theta_p2_deg": -45.0, "theta_s_deg": 0.0,
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
    )
    def post(self, request):
        input_serializer = MohrInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = calculate_mohr(**input_serializer.to_engine_kwargs())

        output_serializer = MohrResultSerializer(dataclasses.asdict(result))
        return Response(output_serializer.data, status=status.HTTP_200_OK)
