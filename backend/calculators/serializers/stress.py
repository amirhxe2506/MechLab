"""
calculators/serializers/stress.py
------------------------------------
Wraps calculations.mechanics.stress.calculate_stress /
calculations.mechanics.stress.StressResult.
"""
from rest_framework import serializers

from .common import convert_to_si, unit_choices


class StressInputSerializer(serializers.Serializer):
    force = serializers.FloatField(
        help_text="Applied axial force F. Positive = tension, negative = compression.",
    )
    force_unit = serializers.ChoiceField(
        choices=unit_choices("force"), required=False, default="N",
    )

    # No unit-conversion dimension is registered for area (m^2) in
    # calculations.units -- there is no "area" dimension table, only
    # "length" (m). Submit directly in m^2; do not invent an ad-hoc
    # conversion factor here.
    area = serializers.FloatField(
        help_text="Cross-sectional area A, in m^2 (SI base unit -- no "
                   "unit-conversion dimension is registered for area).",
    )

    youngs_modulus = serializers.FloatField(help_text="Young's modulus E.")
    youngs_modulus_unit = serializers.ChoiceField(
        choices=unit_choices("pressure"), required=False, default="Pa",
    )

    original_length = serializers.FloatField(help_text="Original (undeformed) length L0.")
    original_length_unit = serializers.ChoiceField(
        choices=unit_choices("length"), required=False, default="m",
    )

    poisson_ratio = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Poisson's ratio (dimensionless), optional. Must lie in "
                   "(-1, 0.5) for an isotropic material -- enforced by the "
                   "engine, not duplicated here.",
    )

    def to_engine_kwargs(self) -> dict:
        d = self.validated_data
        return dict(
            force=convert_to_si(d["force"], d.get("force_unit", "N"), "force", "force_unit"),
            area=d["area"],
            youngs_modulus=convert_to_si(
                d["youngs_modulus"], d.get("youngs_modulus_unit", "Pa"), "pressure",
                "youngs_modulus_unit",
            ),
            original_length=convert_to_si(
                d["original_length"], d.get("original_length_unit", "m"), "length",
                "original_length_unit",
            ),
            poisson_ratio=d.get("poisson_ratio"),
        )


class StressResultSerializer(serializers.Serializer):
    """Mirrors calculations.mechanics.stress.StressResult exactly."""
    stress = serializers.FloatField(help_text="Normal stress sigma, Pa.")
    strain = serializers.FloatField(help_text="Axial strain epsilon, dimensionless.")
    deformation = serializers.FloatField(help_text="Axial deformation delta, m.")
    lateral_strain = serializers.FloatField(
        allow_null=True,
        help_text="Lateral strain from the Poisson effect, dimensionless. "
                   "null if poisson_ratio was not provided.",
    )
    warnings = serializers.ListField(
        child=serializers.CharField(),
        help_text="Non-fatal engineering warnings, e.g. strain outside the "
                   "typical linear-elastic range.",
    )
