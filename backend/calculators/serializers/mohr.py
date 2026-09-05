"""
calculators/serializers/mohr.py
----------------------------------
Wraps calculations.mechanics.mohr.calculate_mohr /
calculations.mechanics.mohr.MohrResult.

Note: calculate_mohr performs NO input validation at all -- any real
(sigma_x, sigma_y, tau_xy) triple is a mathematically valid 2D stress
state, so there is no engine ValidationError case to preserve here
beyond DRF's own structural checks (required fields, numeric type,
unsupported units).
"""
from rest_framework import serializers

from .common import convert_to_si, unit_choices


class MohrInputSerializer(serializers.Serializer):
    sigma_x = serializers.FloatField(help_text="Normal stress on the x-face, sigma_x.")
    sigma_x_unit = serializers.ChoiceField(choices=unit_choices("pressure"), required=False, default="Pa")

    sigma_y = serializers.FloatField(help_text="Normal stress on the y-face, sigma_y.")
    sigma_y_unit = serializers.ChoiceField(choices=unit_choices("pressure"), required=False, default="Pa")

    tau_xy = serializers.FloatField(help_text="Shear stress, tau_xy.")
    tau_xy_unit = serializers.ChoiceField(choices=unit_choices("pressure"), required=False, default="Pa")

    def to_engine_kwargs(self) -> dict:
        d = self.validated_data
        return dict(
            sigma_x=convert_to_si(d["sigma_x"], d.get("sigma_x_unit", "Pa"), "pressure", "sigma_x_unit"),
            sigma_y=convert_to_si(d["sigma_y"], d.get("sigma_y_unit", "Pa"), "pressure", "sigma_y_unit"),
            tau_xy=convert_to_si(d["tau_xy"], d.get("tau_xy_unit", "Pa"), "pressure", "tau_xy_unit"),
        )


class MohrResultSerializer(serializers.Serializer):
    """Mirrors calculations.mechanics.mohr.MohrResult exactly."""
    sigma_avg = serializers.FloatField(help_text="Average (center) stress, Pa.")
    radius = serializers.FloatField(help_text="Mohr's circle radius, Pa.")
    sigma_1 = serializers.FloatField(help_text="Maximum principal stress, Pa.")
    sigma_2 = serializers.FloatField(help_text="Minimum principal stress, Pa.")
    tau_max = serializers.FloatField(help_text="Maximum in-plane shear stress, Pa.")
    theta_p1_deg = serializers.FloatField(help_text="Orientation of sigma_1, degrees CCW from +x, in (-90, 90].")
    theta_p2_deg = serializers.FloatField(help_text="Orientation of sigma_2 (theta_p1 +/- 90 deg), degrees.")
    theta_s_deg = serializers.FloatField(help_text="Orientation of the tau_max plane, degrees.")
