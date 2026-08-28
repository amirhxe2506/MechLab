"""
tests/test_mohr.py
---------------------
Validates calculations.mechanics.mohr against three reference stress
states -- uniaxial along x, uniaxial along y, pure shear (classic
45-degree case) -- plus an independent check using the raw stress
transformation equation.
"""
import math

from calculations.mechanics.mohr import calculate_mohr


def test_uniaxial_along_x():
    r = calculate_mohr(sigma_x=100.0, sigma_y=0.0, tau_xy=0.0)
    assert abs(r.sigma_1 - 100.0) < 1e-9
    assert abs(r.sigma_2 - 0.0) < 1e-9
    assert abs(r.theta_p1_deg - 0.0) < 1e-9


def test_uniaxial_along_y():
    r = calculate_mohr(sigma_x=0.0, sigma_y=100.0, tau_xy=0.0)
    assert abs(r.sigma_1 - 100.0) < 1e-9
    assert abs(r.sigma_2 - 0.0) < 1e-9
    assert abs(r.theta_p1_deg - 90.0) < 1e-9


def test_pure_shear_45_degrees():
    r = calculate_mohr(sigma_x=0.0, sigma_y=0.0, tau_xy=50.0)
    assert abs(r.sigma_1 - 50.0) < 1e-9
    assert abs(r.sigma_2 - (-50.0)) < 1e-9
    assert abs(r.tau_max - 50.0) < 1e-9
    assert abs(r.theta_p1_deg - 45.0) < 1e-9


def test_general_state_matches_direct_formula():
    sx, sy, txy = 100.0, 50.0, 30.0
    r = calculate_mohr(sigma_x=sx, sigma_y=sy, tau_xy=txy)

    avg = (sx + sy) / 2
    R = math.hypot((sx - sy) / 2, txy)
    assert abs(r.sigma_1 - (avg + R)) < 1e-9
    assert abs(r.sigma_2 - (avg - R)) < 1e-9
    assert abs(r.tau_max - R) < 1e-9

    # Independent check: reconstruct sigma_1 via the raw stress-transformation
    # equation at theta_p1 and confirm it matches what calculate_mohr returned.
    theta_rad = math.radians(r.theta_p1_deg)
    sigma_check = avg + (sx - sy) / 2 * math.cos(2 * theta_rad) + txy * math.sin(2 * theta_rad)
    assert abs(sigma_check - r.sigma_1) < 1e-6
