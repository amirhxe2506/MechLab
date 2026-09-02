"""
calculators/serializers/vibration.py
---------------------------------------
Wraps calculations.vibrations.sdof.calculate_sdof /
calculations.vibrations.sdof.SDOFResult.

stiffness, damping, and duration have NO unit-conversion dimension
registered in calculations.units (no "stiffness"/N/m, "damping"/N*s/m,
or "time"/s dimension table exists) -- all three are submitted directly
in SI. See the Phase 2 final report for the complete list of such
fields across all six calculators.
"""
from rest_framework import serializers

from .common import convert_to_si, unit_choices


class VibrationInputSerializer(serializers.Serializer):
    mass = serializers.FloatField(help_text="Mass m.")
    mass_unit = serializers.ChoiceField(choices=unit_choices("mass"), required=False, default="kg")

    # No unit-conversion dimension registered for stiffness (N/m).
    stiffness = serializers.FloatField(
        help_text="Spring stiffness k, in N/m (SI base unit -- no unit-"
                   "conversion dimension is registered for stiffness).",
    )

    # No unit-conversion dimension registered for damping (N*s/m).
    damping = serializers.FloatField(
        help_text="Viscous damping coefficient c, in N*s/m (SI base unit "
                   "-- no unit-conversion dimension is registered for "
                   "damping). Must be >= 0, enforced by the engine.",
    )

    initial_displacement = serializers.FloatField(
        required=False, default=0.0, help_text="Initial displacement x(0).",
    )
    initial_displacement_unit = serializers.ChoiceField(
        choices=unit_choices("length"), required=False, default="m",
    )

    initial_velocity = serializers.FloatField(
        required=False, default=0.0, help_text="Initial velocity x'(0).",
    )
    initial_velocity_unit = serializers.ChoiceField(
        choices=unit_choices("velocity"), required=False, default="m/s",
    )

    # No unit-conversion dimension registered for time (s); also, the
    # engine does not itself validate duration >= 0, so a negative value
    # is silently accepted by the engine and produces a mathematically
    # degenerate (not crashing) result -- not corrected here, since
    # duplicating/adding physics validation the engine doesn't itself
    # perform is out of scope for this phase. See final report.
    duration = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Simulation time window, in s (SI base unit -- no unit-"
                   "conversion dimension is registered for time). If "
                   "omitted, auto-selected by the engine from the system's "
                   "dynamics.",
    )

    # n_points has no engine-side validation at all, and n_points=1
    # triggers a bare ZeroDivisionError inside calculate_sdof (division
    # by n_points - 1). min_value=2 here is a defensive API-boundary
    # guard against that engine edge case, NOT a duplicated physics
    # rule -- the engine has no rule here to duplicate. max_value=5000
    # is a basic payload-size/performance guard.
    n_points = serializers.IntegerField(
        required=False, default=500, min_value=2, max_value=5000,
        help_text="Number of time-history samples to generate.",
    )

    def to_engine_kwargs(self) -> dict:
        d = self.validated_data
        return dict(
            mass=convert_to_si(d["mass"], d.get("mass_unit", "kg"), "mass", "mass_unit"),
            stiffness=d["stiffness"],
            damping=d["damping"],
            initial_displacement=convert_to_si(
                d.get("initial_displacement", 0.0), d.get("initial_displacement_unit", "m"),
                "length", "initial_displacement_unit",
            ),
            initial_velocity=convert_to_si(
                d.get("initial_velocity", 0.0), d.get("initial_velocity_unit", "m/s"),
                "velocity", "initial_velocity_unit",
            ),
            duration=d.get("duration"),
            n_points=d.get("n_points", 500),
        )


class SDOFResultSerializer(serializers.Serializer):
    """Mirrors calculations.vibrations.sdof.SDOFResult exactly."""
    natural_frequency_rad_s = serializers.FloatField(help_text="Undamped natural frequency omega_n, rad/s.")
    natural_frequency_hz = serializers.FloatField(help_text="Undamped natural frequency, Hz.")
    damping_ratio = serializers.FloatField(help_text="Damping ratio zeta, dimensionless.")
    damped_frequency_rad_s = serializers.FloatField(
        allow_null=True,
        help_text="Damped natural frequency omega_d, rad/s. null for critically "
                   "damped/overdamped systems (zeta >= 1).",
    )
    classification = serializers.ChoiceField(
        choices=[
            ("undamped", "undamped"), ("underdamped", "underdamped"),
            ("critically damped", "critically damped"), ("overdamped", "overdamped"),
        ],
        help_text="Damping regime classification.",
    )
    time = serializers.ListField(child=serializers.FloatField(), help_text="Time samples, s.")
    displacement = serializers.ListField(child=serializers.FloatField(), help_text="Displacement x(t) samples, m.")
    warnings = serializers.ListField(
        child=serializers.CharField(),
        help_text="Non-fatal engineering warnings. Currently always empty -- "
                   "the field exists on the engine's dataclass but calculate_sdof "
                   "does not yet populate it.",
    )
