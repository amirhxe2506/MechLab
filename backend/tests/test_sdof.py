"""
tests/test_sdof.py
---------------------
Validates calculations.vibrations.sdof against the closed-form solution
for a classic undamped case, and against the governing ODE itself
(m x'' + c x' + k x = 0) via finite-difference differentiation for a
general underdamped case -- an independent physics check that does not
rely on the closed-form response formula being "right by construction".
"""
import math

from calculations.vibrations.sdof import calculate_sdof
from calculations.exceptions import ValidationError


def test_undamped_matches_simple_harmonic_motion():
    m, k, x0 = 1.0, 100.0, 1.0
    r = calculate_sdof(mass=m, stiffness=k, damping=0.0, initial_displacement=x0, initial_velocity=0.0)
    wn = math.sqrt(k / m)
    assert r.classification == "undamped"
    assert abs(r.natural_frequency_rad_s - wn) < 1e-9

    for ti, xi in zip(r.time, r.displacement):
        assert abs(xi - x0 * math.cos(wn * ti)) < 1e-6


def test_classification_thresholds():
    m, k = 2.0, 200.0
    c_crit = 2 * math.sqrt(k * m)
    assert calculate_sdof(mass=m, stiffness=k, damping=0.5 * c_crit).classification == "underdamped"
    assert calculate_sdof(mass=m, stiffness=k, damping=c_crit).classification == "critically damped"
    assert calculate_sdof(mass=m, stiffness=k, damping=2.0 * c_crit).classification == "overdamped"


def test_satisfies_governing_ode_underdamped():
    # Independent check: numerically differentiate x(t) and verify
    # m x'' + c x' + k x ~= 0 pointwise (central differences, interior points).
    m, k, c = 1.0, 400.0, 4.0
    r = calculate_sdof(
        mass=m, stiffness=k, damping=c,
        initial_displacement=0.02, initial_velocity=0.5, n_points=2000,
    )
    t, x = r.time, r.displacement
    dt = t[1] - t[0]

    max_residual = 0.0
    max_scale = 1e-12
    for i in range(2, len(t) - 2):
        x_dot = (x[i + 1] - x[i - 1]) / (2 * dt)
        x_ddot = (x[i + 1] - 2 * x[i] + x[i - 1]) / (dt ** 2)
        residual = m * x_ddot + c * x_dot + k * x[i]
        max_residual = max(max_residual, abs(residual))
        max_scale = max(max_scale, k * abs(x[i]))

    assert max_residual < 1e-3 * max_scale


def test_rejects_nonpositive_mass_and_stiffness():
    try:
        calculate_sdof(mass=-1.0, stiffness=100.0, damping=0.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass
    try:
        calculate_sdof(mass=1.0, stiffness=0.0, damping=0.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_rejects_negative_damping():
    try:
        calculate_sdof(mass=1.0, stiffness=100.0, damping=-1.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass
