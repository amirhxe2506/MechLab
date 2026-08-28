"""
tests/test_stress.py
----------------------
Validates calculations.mechanics.stress against a hand-worked example
and confirms input validation rejects non-physical parameters.
"""
from calculations.mechanics.stress import calculate_stress
from calculations.exceptions import ValidationError


def test_basic_axial_case():
    # F = 10 kN, A = 500 mm^2 = 5e-4 m^2, E = 200 GPa, L0 = 1 m
    # sigma = 1e4 / 5e-4 = 2e7 Pa = 20 MPa
    # epsilon = 2e7 / 200e9 = 1e-4
    # delta = 1e-4 * 1 = 1e-4 m = 0.1 mm
    r = calculate_stress(force=10_000, area=5e-4, youngs_modulus=200e9, original_length=1.0)
    assert abs(r.stress - 2e7) < 1e-6 * 2e7
    assert abs(r.strain - 1e-4) < 1e-9
    assert abs(r.deformation - 1e-4) < 1e-9


def test_poisson_lateral_strain():
    r = calculate_stress(
        force=10_000, area=5e-4, youngs_modulus=200e9, original_length=1.0,
        poisson_ratio=0.3,
    )
    assert abs(r.lateral_strain - (-0.3 * r.strain)) < 1e-12


def test_rejects_nonpositive_area():
    try:
        calculate_stress(force=1000, area=0, youngs_modulus=200e9, original_length=1.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_rejects_nonpositive_length():
    try:
        calculate_stress(force=1000, area=1e-4, youngs_modulus=200e9, original_length=-1.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_warns_outside_elastic_range():
    # sigma = 1e6/1e-4 = 1e10 Pa, epsilon = 5% -- well past the linear-elastic range
    r = calculate_stress(force=1e6, area=1e-4, youngs_modulus=200e9, original_length=1.0)
    assert r.warnings, "expected an elastic-range warning for this strain level"
