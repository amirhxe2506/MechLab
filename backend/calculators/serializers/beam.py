"""
calculators/serializers/beam.py
-----------------------------------
Wraps calculations.mechanics.beam.calculate_beam /
calculations.mechanics.beam.BeamResult.

The engine's `loads` parameter is a plain List[dict], where each dict is
EITHER:
    {"type": "point", "magnitude": P, "position": a}
EITHER:
    {"type": "udl",   "magnitude": w, "start": x1, "end": x2}

LoadInputSerializer models both shapes as one serializer with all
type-specific fields optional, discriminated by `type`. Field presence
is intentionally NOT cross-validated here (e.g. "position required for
point loads") -- see `_build_load_dict()` below for why: the engine's
own `_validate_loads()` already enforces this via Python dict *key
presence* (`"position" not in ld`), and it is preserved as the single
source of truth for that rule by omitting keys the client didn't
supply, rather than passing them through as `None` (which would make
the engine's `"position" not in ld` check pass, and then crash with a
raw TypeError instead of raising a clean ValidationError).
"""
from rest_framework import serializers

from calculations.mechanics.beam import SUPPORTED_TYPES

from .common import convert_to_si, unit_choices

# calculate_beam's `loads[i]["type"]` only ever checks for the literal
# strings "point" and "udl" (see _validate_loads' if/elif chain) -- the
# engine does not export these as a named constant the way it does
# SUPPORTED_TYPES for support_type, so, unlike support_type below, this
# one small pair of literals cannot be imported and is reproduced here.
LOAD_TYPE_CHOICES = (("point", "point"), ("udl", "udl"))


class LoadInputSerializer(serializers.Serializer):
    type = serializers.ChoiceField(
        choices=LOAD_TYPE_CHOICES,
        help_text="'point' (concentrated force) or 'udl' (uniformly distributed load).",
    )

    # point: force, [N]. udl: force-per-length, [N/m] -- no unit-
    # conversion dimension is registered for N/m, so magnitude_unit only
    # applies to point loads; udl magnitude is SI-only. See help_text.
    magnitude = serializers.FloatField(
        help_text="Load magnitude, downward-positive. For 'point' loads: force, "
                   "consumed together with magnitude_unit. For 'udl' loads: "
                   "force-per-length in N/m (SI base unit -- no unit-conversion "
                   "dimension is registered for N/m; magnitude_unit is ignored).",
    )
    magnitude_unit = serializers.ChoiceField(
        choices=unit_choices("force"), required=False, allow_null=True, default=None,
        help_text="Unit for 'magnitude'. Applies to 'point' loads only.",
    )

    # point loads only.
    position = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Position along the beam. Required for 'point' loads.",
    )
    position_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, allow_null=True, default=None)

    # udl loads only.
    start = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Start position of the UDL span. Required for 'udl' loads.",
    )
    start_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, allow_null=True, default=None)
    end = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="End position of the UDL span. Required for 'udl' loads.",
    )
    end_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, allow_null=True, default=None)


def _build_load_dict(item: dict, index: int) -> dict:
    """
    Convert one validated LoadInputSerializer item into the plain
    {"type", ...} dict calculate_beam expects, in SI units. Keys for
    fields the client did not supply are omitted entirely (not set to
    None) so the engine's own presence-based validation
    ("Point load requires 'magnitude' and 'position'.", etc.) fires
    correctly instead of hitting a bare TypeError on a None comparison.
    """
    kind = item["type"]
    load = {"type": kind}

    if kind == "point":
        load["magnitude"] = convert_to_si(
            item["magnitude"], item.get("magnitude_unit") or "N", "force",
            f"loads[{index}].magnitude_unit",
        )
        if item.get("position") is not None:
            load["position"] = convert_to_si(
                item["position"], item.get("position_unit") or "m", "length",
                f"loads[{index}].position_unit",
            )
    else:  # "udl" -- guaranteed by LoadInputSerializer's ChoiceField
        # No unit-conversion dimension registered for N/m; SI-only.
        load["magnitude"] = item["magnitude"]
        if item.get("start") is not None:
            load["start"] = convert_to_si(
                item["start"], item.get("start_unit") or "m", "length",
                f"loads[{index}].start_unit",
            )
        if item.get("end") is not None:
            load["end"] = convert_to_si(
                item["end"], item.get("end_unit") or "m", "length",
                f"loads[{index}].end_unit",
            )

    return load


class BeamInputSerializer(serializers.Serializer):
    length = serializers.FloatField(help_text="Beam span L.")
    length_unit = serializers.ChoiceField(choices=unit_choices("length"), required=False, default="m")

    support_type = serializers.ChoiceField(
        choices=[(t, t) for t in SUPPORTED_TYPES],
        help_text="'simply_supported' (pin at x=0, roller at x=L) or "
                   "'cantilever' (fixed at x=0, free at x=L).",
    )

    loads = LoadInputSerializer(many=True, help_text="One or more point and/or UDL loads.")

    youngs_modulus = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Young's modulus E. Provide together with moment_of_inertia "
                   "to also compute deflection.",
    )
    youngs_modulus_unit = serializers.ChoiceField(choices=unit_choices("pressure"), required=False, default="Pa")

    # No unit-conversion dimension registered for m^4; SI-only.
    moment_of_inertia = serializers.FloatField(
        required=False, allow_null=True, default=None,
        help_text="Second moment of area I, in m^4 (SI base unit -- no unit-"
                   "conversion dimension is registered for moment_of_inertia). "
                   "Provide together with youngs_modulus to also compute deflection.",
    )

    # calculate_beam does not itself bound n_points, and n_points=1
    # triggers a bare ZeroDivisionError (division by n_points - 1).
    # min_value=2 is a defensive API-boundary guard against that engine
    # edge case; max_value=5000 is a basic payload-size guard.
    n_points = serializers.IntegerField(
        required=False, default=500, min_value=2, max_value=5000,
        help_text="Number of stations used to discretise shear/moment/deflection.",
    )

    def to_engine_kwargs(self) -> dict:
        d = self.validated_data
        loads_si = [_build_load_dict(item, i) for i, item in enumerate(d["loads"])]
        return dict(
            length=convert_to_si(d["length"], d.get("length_unit", "m"), "length", "length_unit"),
            support_type=d["support_type"],
            loads=loads_si,
            youngs_modulus=convert_to_si(
                d.get("youngs_modulus"), d.get("youngs_modulus_unit", "Pa"), "pressure",
                "youngs_modulus_unit",
            ),
            moment_of_inertia=d.get("moment_of_inertia"),
            n_points=d.get("n_points", 500),
        )


class BeamResultSerializer(serializers.Serializer):
    """Mirrors calculations.mechanics.beam.BeamResult exactly."""
    x = serializers.ListField(child=serializers.FloatField(), help_text="Station positions along the beam, m.")
    shear = serializers.ListField(child=serializers.FloatField(), help_text="Shear force V(x) at each station, N.")
    moment = serializers.ListField(child=serializers.FloatField(), help_text="Bending moment M(x) at each station, N*m.")
    deflection = serializers.ListField(
        child=serializers.FloatField(), allow_null=True,
        help_text="Transverse deflection y(x) at each station, m (positive "
                   "upward). null unless both youngs_modulus and "
                   "moment_of_inertia were provided.",
    )
    reactions = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Support reactions. Keys depend on support_type: "
                   "{'R1_at_0', 'R2_at_L'} for simply_supported, or "
                   "{'R_at_0', 'M_at_0'} for cantilever.",
    )
    max_moment = serializers.FloatField(help_text="Signed extreme bending moment, N*m.")
    max_moment_location = serializers.FloatField(help_text="Station of max_moment, m.")
    max_deflection = serializers.FloatField(allow_null=True, help_text="Signed extreme deflection, m.")
    max_deflection_location = serializers.FloatField(allow_null=True, help_text="Station of max_deflection, m.")
    warnings = serializers.ListField(child=serializers.CharField(), help_text="Non-fatal engineering warnings.")
