"""
tests/test_units.py
----------------------
Validates calculations.units conversion factors against known
equivalences.
"""
from calculations.units import to_si, from_si
from calculations.exceptions import UnsupportedUnitError


def test_length_round_trip():
    assert abs(to_si(1000.0, "mm", "length") - 1.0) < 1e-12
    assert abs(from_si(1.0, "mm", "length") - 1000.0) < 1e-9
    assert abs(to_si(1.0, "in", "length") - 0.0254) < 1e-12

def test_area_round_trip():
    assert abs(to_si(1.0, "m2", "area") - 1.0) < 1e-12
    assert abs(to_si(1.0, "mm2", "area") - 1e-6) < 1e-12
    assert abs(to_si(1.0, "cm2", "area") - 1e-4) < 1e-12
    assert abs(to_si(1.0, "in2", "area") - 0.00064516) < 1e-12
    assert abs(from_si(1e-6, "mm2", "area") - 1.0) < 1e-9


def test_pressure_mpa_to_pa():
    assert abs(to_si(1.0, "MPa", "pressure") - 1e6) < 1e-6


def test_force_kn_to_n():
    assert abs(to_si(1.0, "kN", "force") - 1000.0) < 1e-9


def test_unsupported_unit_raises():
    try:
        to_si(1.0, "furlong", "length")
        assert False, "expected UnsupportedUnitError"
    except UnsupportedUnitError:
        pass
