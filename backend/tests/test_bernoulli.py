"""
tests/test_bernoulli.py
--------------------------
Validates calculations.fluids.bernoulli by round-tripping: solve for an
unknown, then re-substitute to confirm the energy balance holds.
"""
from calculations.fluids.bernoulli import calculate_bernoulli
from calculations.exceptions import ValidationError

RHO = 1000.0
G = 9.80665


def _energy(p, v, z):
    return p + 0.5 * RHO * v ** 2 + RHO * G * z


def test_solve_for_p2_round_trip():
    p1, v1, z1 = 200_000.0, 2.0, 0.0
    v2, z2 = 4.0, 3.0
    r = calculate_bernoulli(density=RHO, p1=p1, v1=v1, z1=z1, p2=None, v2=v2, z2=z2)
    e1 = _energy(p1, v1, z1)
    e2 = _energy(r.value, v2, z2)
    assert abs(e1 - e2) / abs(e1) < 1e-9


def test_solve_for_v2_round_trip():
    p1, v1, z1 = 200_000.0, 2.0, 0.0
    p2, z2 = 150_000.0, 1.0
    r = calculate_bernoulli(density=RHO, p1=p1, v1=v1, z1=z1, p2=p2, v2=None, z2=z2)
    e1 = _energy(p1, v1, z1)
    e2 = _energy(p2, r.value, z2)
    assert abs(e1 - e2) / abs(e1) < 1e-9


def test_solve_for_z2_round_trip():
    p1, v1, z1 = 200_000.0, 2.0, 5.0
    p2, v2 = 180_000.0, 3.0
    r = calculate_bernoulli(density=RHO, p1=p1, v1=v1, z1=z1, p2=p2, v2=v2, z2=None)
    e1 = _energy(p1, v1, z1)
    e2 = _energy(p2, v2, r.value)
    assert abs(e1 - e2) / abs(e1) < 1e-9


def test_rejects_more_than_one_unknown():
    try:
        calculate_bernoulli(density=RHO, p1=1e5, v1=1.0, z1=0.0, p2=None, v2=None, z2=1.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_rejects_zero_unknowns():
    try:
        calculate_bernoulli(density=RHO, p1=1e5, v1=1.0, z1=0.0, p2=1e5, v2=1.0, z2=1.0)
        assert False, "expected ValidationError"
    except ValidationError:
        pass
