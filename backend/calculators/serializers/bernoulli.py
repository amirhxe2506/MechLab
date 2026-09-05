"""
calculators/serializers/bernoulli.py
---------------------------------------
Wraps calculations.fluids.bernoulli.calculate_bernoulli /
calculations.fluids.bernoulli.BernoulliResult.

Exactly one of p2, v2, z2 must be omitted (the engine solves for it).
That "exactly one unknown" rule is enforced by the engine
(ValidationError, field "p2/v2/z2") and is intentionally NOT duplicated
here -- p2/v2/z2 are simply all optional/nullable and passed straight
through, preserving the engine's own physical validation behavior.
"""
from rest_framework import serializers

from .common import convert_to_si, unit_choices


class BernoulliInputSerializer(serializers.Serializer):
    density = serializers.FloatField(help_text="Fluid density rho.")
    density_unit = serializers.ChoiceField(choices=unit_choices("density"), required=False, default="kg/m3")

    p1 = serializers.FloatField(help_text="Static pressure at point 1.")
    p1_unit = serializers.ChoiceField(choices=unit_choices("pressure"), required=False, default="Pa")
    v1 = serializers.FloatField(help_text="Flow velocity at point 1.")
    v1_unit = serializers.ChoiceField(choices=unit_choices("velocity"), required=False, default="m/s")
    z1 = serializers.FloatField(help_text="Elevation at point 1.")
    z1_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, default="m")

    p2 = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Static pressure at point 2. Leave unset (null) to solve for p2.",
    )
    p2_unit = serializers.ChoiceField(choices=unit_choices("pressure"), required=False, default="Pa")
    v2 = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Flow velocity at point 2. Leave unset (null) to solve for v2.",
    )
    v2_unit = serializers.ChoiceField(choices=unit_choices("velocity"), required=False, default="m/s")
    z2 = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Elevation at point 2. Leave unset (null) to solve for z2.",
    )
    z2_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, default="m")

    def to_engine_kwargs(self) -> dict:
        d = self.validated_data
        return dict(
            density=convert_to_si(d["density"], d.get("density_unit", "kg/m3"), "density", "density_unit"),
            p1=convert_to_si(d["p1"], d.get("p1_unit", "Pa"), "pressure", "p1_unit"),
            v1=convert_to_si(d["v1"], d.get("v1_unit", "m/s"), "velocity", "v1_unit"),
            z1=convert_to_si(d["z1"], d.get("z1_unit", "m"), "length", "z1_unit"),
            p2=convert_to_si(d.get("p2"), d.get("p2_unit", "Pa"), "pressure", "p2_unit"),
            v2=convert_to_si(d.get("v2"), d.get("v2_unit", "m/s"), "velocity", "v2_unit"),
            z2=convert_to_si(d.get("z2"), d.get("z2_unit", "m"), "length", "z2_unit"),
        )


class BernoulliResultSerializer(serializers.Serializer):
    """Mirrors calculations.fluids.bernoulli.BernoulliResult exactly."""
    solved_for = serializers.ChoiceField(
        choices=[("p2", "p2"), ("v2", "v2"), ("z2", "z2")],
        help_text="Which quantity was solved for.",
    )
    value = serializers.FloatField(
        help_text="The solved value, in SI units for its quantity (Pa for p2, "
                   "m/s for v2, m for z2 -- see 'solved_for').",
    )
    head_total_m = serializers.FloatField(help_text="Total Bernoulli head at either station, m.")
