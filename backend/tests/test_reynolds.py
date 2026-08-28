"""
tests/test_reynolds.py
-------------------------
Validates calculations.fluids.reynolds against hand-computed values for
water flow in a pipe, and confirms the mu/rho and nu input paths agree.
"""
from calculations.fluids.reynolds import calculate_reynolds
from calculations.exceptions import ValidationError


def test_turbulent_water_flow():
    # Re = rho v D / mu = 1000 * 2 * 0.05 / 0.001 = 100000
    r = calculate_reynolds(velocity=2.0, diameter=0.05, density=1000.0, dynamic_viscosity=0.001)
    assert abs(r.reynolds_number - 100_000) < 1e-3
    assert r.regime == "turbulent"


def test_laminar_water_flow():
    # Re = 1000 * 0.01 * 0.05 / 0.001 = 500
    r = calculate_reynolds(velocity=0.01, diameter=0.05, density=1000.0, dynamic_viscosity=0.001)
    assert abs(r.reynolds_number - 500) < 1e-6
    assert r.regime == "laminar"


def test_kinematic_viscosity_path_agrees_with_dynamic_path():
    r_mu = calculate_reynolds(velocity=2.0, diameter=0.05, density=1000.0, dynamic_viscosity=0.001)
    r_nu = calculate_reynolds(velocity=2.0, diameter=0.05, kinematic_viscosity=0.001 / 1000.0)
    assert abs(r_mu.reynolds_number - r_nu.reynolds_number) < 1e-6


def test_rejects_both_viscosity_paths():
    try:
        calculate_reynolds(
            velocity=1.0, diameter=0.05, density=1000.0,
            dynamic_viscosity=0.001, kinematic_viscosity=1e-6,
        )
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_rejects_neither_viscosity_path():
    try:
        calculate_reynolds(velocity=1.0, diameter=0.05)
        assert False, "expected ValidationError"
    except ValidationError:
        pass
