"""
units.py
--------
Lightweight unit conversion utilities for the MechLab calculation engine.

All internal engine calculations are performed in SI base units:

    length      -> m
    force       -> N
    pressure    -> Pa
    mass        -> kg
    velocity    -> m/s
    density     -> kg/m^3
    angle       -> rad

Unit conversion belongs at the Django view / serializer boundary, not
inside the physics functions -- this keeps calculations/ trivially
testable and keeps the "what unit is the user looking at" concern out
of the math.
"""

from .exceptions import UnsupportedUnitError

# factor such that: value_in_SI = value * FACTORS[dimension][unit]
_FACTORS = {
    "length": {
        "m": 1.0,
        "mm": 1e-3,
        "cm": 1e-2,
        "km": 1e3,
        "in": 0.0254,
        "ft": 0.3048,
    },
    "force": {
        "N": 1.0,
        "kN": 1e3,
        "MN": 1e6,
        "lbf": 4.4482216153,
        "kip": 4448.2216153,
    },
    "pressure": {
        "Pa": 1.0,
        "kPa": 1e3,
        "MPa": 1e6,
        "GPa": 1e9,
        "psi": 6894.757293168,
        "ksi": 6894757.293168,
    },
    "mass": {
        "kg": 1.0,
        "g": 1e-3,
        "lb": 0.45359237,
    },
    "area": {
        "m2": 1.0,
        "mm2": 1e-6,
        "cm2": 1e-4,
        "in2": 0.00064516,
    },
    "density": {
        "kg/m3": 1.0,
        "g/cm3": 1e3,
        "lb/ft3": 16.018463374,
    },
    "velocity": {
        "m/s": 1.0,
        "ft/s": 0.3048,
        "km/h": 1 / 3.6,
        "mph": 0.44704,
    },
    "viscosity_dynamic": {
        "Pa*s": 1.0,
        "cP": 1e-3,
    },
    "angle": {
        "rad": 1.0,
        "deg": 3.14159265358979323846 / 180.0,
    },
}


def to_si(value: float, unit: str, dimension: str) -> float:
    """Convert `value`, given in `unit`, to the SI base unit for `dimension`."""
    try:
        factor = _FACTORS[dimension][unit]
    except KeyError:
        raise UnsupportedUnitError(dimension, unit, list(_FACTORS.get(dimension, {})))
    return value * factor


def from_si(value_si: float, unit: str, dimension: str) -> float:
    """Convert a value already in SI base units to `unit`."""
    try:
        factor = _FACTORS[dimension][unit]
    except KeyError:
        raise UnsupportedUnitError(dimension, unit, list(_FACTORS.get(dimension, {})))
    return value_si / factor


def available_units(dimension: str):
    """List the unit strings registered for a given dimension."""
    return list(_FACTORS.get(dimension, {}).keys())
