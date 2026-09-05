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

    # Now "area" has a registered dimension in calculations.units.
    area = serializers.FloatField(
        help_text="Cross-sectional area A.",
    )
    area_unit = serializers.ChoiceField(
        choices=unit_choices("area"), required=False, default="m2",
    )

    output_unit_system = serializers.ChoiceField(
        choices=[("SI", "SI"), ("Imperial", "Imperial")],
        required=False,
        default="SI",
        help_text="Requested unit system for the output values.",
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
            area=convert_to_si(d["area"], d.get("area_unit", "m2"), "area", "area_unit"),
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


class StressResultUnitsSerializer(serializers.Serializer):
    stress = serializers.CharField()
    strain = serializers.CharField()
    deformation = serializers.CharField()
    lateral_strain = serializers.CharField()

class StressResultValuesSISerializer(serializers.Serializer):
    stress = serializers.FloatField()
    deformation = serializers.FloatField()

class StressResultSerializer(serializers.Serializer):
    """Enriched result matching calculations.mechanics.stress.StressResult."""
    stress = serializers.FloatField(help_text="Normal stress in requested output units.")
    strain = serializers.FloatField(help_text="Axial strain epsilon, dimensionless.")
    deformation = serializers.FloatField(help_text="Axial deformation delta in requested output units.")
    lateral_strain = serializers.FloatField(
        allow_null=True,
        help_text="Lateral strain from the Poisson effect, dimensionless. "
                   "null if poisson_ratio was not provided.",
    )
    units = StressResultUnitsSerializer(help_text="Display units for the response values.")
    values_si = StressResultValuesSISerializer(help_text="Raw SI values (useful for visual scaling).")
    warnings = serializers.ListField(
        child=serializers.CharField(),
        help_text="Non-fatal engineering warnings, e.g. strain outside the "
                   "typical linear-elastic range.",
    )
