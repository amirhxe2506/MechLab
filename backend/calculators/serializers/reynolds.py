"""
calculators/serializers/reynolds.py
--------------------------------------
Wraps calculations.fluids.reynolds.calculate_reynolds /
calculations.fluids.reynolds.ReynoldsResult.

Preserves the engine's existing velocity-sign handling exactly: velocity
may be negative (reverse flow) and Re is computed from abs(velocity);
only velocity == 0 is rejected. No sign constraint is added here.
"""
from rest_framework import serializers

from .common import convert_to_si, unit_choices


class ReynoldsInputSerializer(serializers.Serializer):
    velocity = serializers.FloatField(
        help_text="Mean flow velocity v. May be negative (reverse flow) -- "
                   "only v == 0 is rejected, by the engine.",
    )
    velocity_unit = serializers.ChoiceField(choices=unit_choices("velocity"), required=False, default="m/s")

    diameter = serializers.FloatField(help_text="Characteristic length / pipe internal diameter D.")
    diameter_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, default="m")

    # Provide EITHER (density AND dynamic_viscosity) OR kinematic_viscosity.
    # This XOR rule is enforced by the engine (ValidationError, field
    # "viscosity") and is intentionally NOT duplicated here.
    density = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Fluid density rho. Provide together with dynamic_viscosity, "
                   "as an alternative to kinematic_viscosity.",
    )
    density_unit = serializers.ChoiceField(choices=unit_choices("density"), required=False, default="kg/m3")

    dynamic_viscosity = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Dynamic viscosity mu. Provide together with density.",
    )
    dynamic_viscosity_unit = serializers.ChoiceField(
        choices=unit_choices("viscosity_dynamic"), required=False, default="Pa*s",
    )

    # No unit-conversion dimension is registered for kinematic viscosity
    # (m^2/s) in calculations.units. Submit directly in m^2/s.
    kinematic_viscosity = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Kinematic viscosity nu, in m^2/s (SI base unit -- no "
                   "unit-conversion dimension is registered for kinematic "
                   "viscosity). Alternative to density + dynamic_viscosity.",
    )

    def to_engine_kwargs(self) -> dict:
        d = self.validated_data
        return dict(
            velocity=convert_to_si(d["velocity"], d.get("velocity_unit", "m/s"), "velocity", "velocity_unit"),
            diameter=convert_to_si(d["diameter"], d.get("diameter_unit", "m"), "length", "diameter_unit"),
            density=convert_to_si(
                d.get("density"), d.get("density_unit", "kg/m3"), "density", "density_unit",
            ),
            dynamic_viscosity=convert_to_si(
                d.get("dynamic_viscosity"), d.get("dynamic_viscosity_unit", "Pa*s"),
                "viscosity_dynamic", "dynamic_viscosity_unit",
            ),
            kinematic_viscosity=d.get("kinematic_viscosity"),
        )


class ReynoldsResultSerializer(serializers.Serializer):
    """Mirrors calculations.fluids.reynolds.ReynoldsResult exactly."""
    reynolds_number = serializers.FloatField(help_text="Reynolds number Re, dimensionless.")
    regime = serializers.ChoiceField(
        choices=[("laminar", "laminar"), ("transitional", "transitional"), ("turbulent", "turbulent")],
        help_text="Flow regime: Re < 2300 laminar, 2300-4000 transitional, Re > 4000 turbulent.",
    )
