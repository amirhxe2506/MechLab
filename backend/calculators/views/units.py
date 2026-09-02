"""
calculators/views/units.py
-------------------------------
GET /api/units/               -- all registered dimensions and their units
GET /api/units/<dimension>/   -- units for a single dimension

Both endpoints call calculations.units.available_units() for the actual
unit lists -- that data is NEVER hardcoded here. The one thing that IS
necessarily hardcoded below is the list of *dimension names themselves*
(DIMENSIONS): calculations.units exposes available_units(dimension) and
to_si()/from_si(), but no function to enumerate the dimensions it knows
about, so there is no way to discover "length, force, pressure, ..." from
the module programmatically. See the Phase 2 final report.
"""
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculations.units import available_units

from ..serializers.common import CalculatorValidationErrorSerializer

# Mirrors the dimension names registered in calculations.units._FACTORS.
# If the engine adds/removes a dimension, this list must be updated to
# match -- there is currently no way to derive it from the public
# calculations.units API. (See final report: a suggested future engine
# enhancement is an available_dimensions() function.)
DIMENSIONS = (
    "length",
    "force",
    "pressure",
    "mass",
    "density",
    "velocity",
    "viscosity_dynamic",
    "angle",
)


class UnitsResponseSerializer(serializers.Serializer):
    """
    Documents the shape of GET /api/units/: an object keyed by dimension
    name, each value a list of unit strings from
    calculations.units.available_units(dimension). Declared with
    `extra="allow"`-style dynamic keys via a plain DictField, since the
    dimension names are the keys, not a fixed field.
    """
    length = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'length' dimension.")
    force = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'force' dimension.")
    pressure = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'pressure' dimension.")
    mass = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'mass' dimension.")
    density = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'density' dimension.")
    velocity = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'velocity' dimension.")
    viscosity_dynamic = serializers.ListField(
        child=serializers.CharField(), help_text="Units for the 'viscosity_dynamic' dimension.",
    )
    angle = serializers.ListField(child=serializers.CharField(), help_text="Units for the 'angle' dimension.")


class UnitDimensionResponseSerializer(serializers.Serializer):
    """Documents the shape of GET /api/units/<dimension>/."""
    units = serializers.ListField(
        child=serializers.CharField(),
        help_text="Unit strings registered for the requested dimension.",
    )


class UnitsListView(APIView):
    """All registered unit dimensions, for populating frontend unit dropdowns."""

    @extend_schema(
        tags=["units"],
        summary="List all unit dimensions and their supported units",
        description=(
            "Returns every physical dimension with a unit-conversion table "
            "in calculations.units, each mapped to its list of supported "
            "unit strings (from calculations.units.available_units()). "
            "Several calculator fields (e.g. area, moment_of_inertia, "
            "stiffness, damping, kinematic_viscosity, UDL magnitude, "
            "duration) have NO registered dimension and are submitted "
            "directly in SI -- they do not appear here. See each "
            "calculator endpoint's field descriptions."
        ),
        responses={200: UnitsResponseSerializer},
        examples=[
            OpenApiExample(
                "Result (excerpt)",
                value={
                    "length": ["m", "mm", "cm", "km", "in", "ft"],
                    "force": ["N", "kN", "MN", "lbf", "kip"],
                    "pressure": ["Pa", "kPa", "MPa", "GPa", "psi", "ksi"],
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
    )
    def get(self, request):
        payload = {dim: available_units(dim) for dim in DIMENSIONS}
        return Response(payload, status=status.HTTP_200_OK)


class UnitDimensionView(APIView):
    """Units for a single dimension, for populating one frontend unit dropdown."""

    @extend_schema(
        tags=["units"],
        summary="List units for a single dimension",
        parameters=[
            OpenApiParameter(
                name="dimension", location=OpenApiParameter.PATH, type=str,
                description="One of: " + ", ".join(DIMENSIONS),
            ),
        ],
        responses={200: UnitDimensionResponseSerializer, 404: CalculatorValidationErrorSerializer},
        examples=[
            OpenApiExample(
                "GET /api/units/pressure/",
                value={"units": ["Pa", "kPa", "MPa", "GPa", "psi", "ksi"]},
                response_only=True,
                status_codes=["200"],
            ),
        ],
    )
    def get(self, request, dimension: str):
        if dimension not in DIMENSIONS:
            return Response(
                {"non_field_errors": [
                    f"Unknown dimension '{dimension}'. Supported: {', '.join(DIMENSIONS)}.",
                ]},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"units": available_units(dimension)}, status=status.HTTP_200_OK)
