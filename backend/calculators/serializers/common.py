"""
calculators/serializers/common.py
----------------------------------
Reusable helpers shared by every calculator's input serializer. This is
the ONLY place that talks to `calculations.units` -- every calculator
serializer calls `convert_to_si()` and `unit_choices()` from here rather
than touching `calculations.units` or unit-conversion factors directly.

Also defines the generic 400 response shape used across all calculator
endpoints, for drf-spectacular documentation.
"""
from rest_framework import serializers

from calculations.exceptions import ValidationError as EngineValidationError
from calculations.exceptions import UnsupportedUnitError
from calculations.units import available_units, to_si

# Dimensions actually registered in calculations.units, i.e. the
# dimension names that HAVE a unit-conversion table. This list is used
# only to build ChoiceField dropdowns (unit_choices()); the unit values
# themselves always come from available_units(), never hardcoded here.
#
# IMPORTANT: several engine parameters have NO registered dimension at
# all (area [m^2], moment_of_inertia [m^4], UDL magnitude [N/m],
# kinematic_viscosity [m^2/s], stiffness [N/m], damping [N*s/m],
# duration [s]). Per the "no ad-hoc conversion factors" rule, those
# fields do NOT get a unit_choices()-based `_unit` companion field here
# -- they are documented as SI-only directly on the relevant serializer
# field's help_text. See the Phase 2 final report for the full list.
REGISTERED_DIMENSIONS = (
    "length",
    "area",
    "force",
    "pressure",
    "mass",
    "density",
    "velocity",
    "viscosity_dynamic",
    "angle",
)


def unit_choices(dimension: str):
    """
    Build a DRF ChoiceField `choices` list from the engine's registered
    units for `dimension`, via calculations.units.available_units().
    Never hardcodes the unit list itself.
    """
    return [(u, u) for u in available_units(dimension)]


def convert_to_si(value, unit: str, dimension: str, field_name: str):
    """
    Convert `value` from `unit` to the engine's SI base unit for
    `dimension`, via calculations.units.to_si().

    - Passes `None` straight through (many engine parameters are
      optional with a real `None` default; multiplying None by a
      conversion factor would raise a bare TypeError deep inside the
      engine instead of a clean validation error).
    - Re-raises UnsupportedUnitError as the engine's own ValidationError,
      tagged with `field_name` (the actual request field, e.g.
      "area_unit"), so it flows through the same 400 response path as
      every other engine validation error.
    """
    if value is None:
        return None
    try:
        return to_si(value, unit, dimension)
    except UnsupportedUnitError as exc:
        raise EngineValidationError(field_name, str(exc)) from exc


class CalculatorValidationErrorSerializer(serializers.Serializer):
    """
    Documents the shape of a 400 response from any calculator endpoint,
    for drf-spectacular.

    The real shape is dynamic -- {"<field_name>": ["<message>"], ...},
    where <field_name> mirrors whatever request field failed (either a
    DRF structural error, e.g. "This field is required.", or an engine
    physics/unit error via calculators.exceptions.custom_exception_handler)
    -- so it cannot be statically typed field-by-field the way a 200
    response can. `non_field_errors` is the one key name that's always
    the same: engine errors with no specific request field (e.g.
    calculations.exceptions.EngineeringError) land there. See each
    endpoint's `@extend_schema` examples for concrete 400 payloads.
    """
    non_field_errors = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Non-field-specific engine errors. Field-specific errors "
                   "appear under that field's own name instead, e.g. "
                   '{"area": ["Cross-sectional area must be > 0."]}.',
    )
