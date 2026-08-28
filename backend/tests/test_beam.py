"""
tests/test_beam.py
---------------------
Validates calculations.mechanics.beam against closed-form textbook
solutions for four canonical load cases:
    1. Simply supported beam, central point load
    2. Simply supported beam, full-span UDL
    3. Cantilever, point load at the free end
    4. Cantilever, full-span UDL
"""
from calculations.mechanics.beam import calculate_beam, rectangular_I
from calculations.exceptions import ValidationError

E = 200e9  # steel, Pa
I = rectangular_I(width=0.05, height=0.10)  # 50 x 100 mm rectangular section


def _interp(xs, ys, x_target):
    """Linear interpolation helper for reading a value off the discretised arrays."""
    for i in range(len(xs) - 1):
        if xs[i] <= x_target <= xs[i + 1]:
            t = (x_target - xs[i]) / (xs[i + 1] - xs[i])
            return ys[i] + t * (ys[i + 1] - ys[i])
    return ys[-1]


def test_simply_supported_central_point_load():
    L, P = 4.0, 1000.0
    r = calculate_beam(
        length=L, support_type="simply_supported",
        loads=[{"type": "point", "magnitude": P, "position": L / 2}],
        youngs_modulus=E, moment_of_inertia=I,
    )
    assert abs(r.reactions["R1_at_0"] - P / 2) < 1e-6
    assert abs(r.reactions["R2_at_L"] - P / 2) < 1e-6

    m_expected = P * L / 4  # PL/4
    assert abs(r.max_moment - m_expected) / m_expected < 1e-3

    defl_expected = -P * L ** 3 / (48 * E * I)
    m_mid = _interp(r.x, r.deflection, L / 2)
    assert abs(m_mid - defl_expected) / abs(defl_expected) < 1e-2


def test_simply_supported_full_udl():
    L, w = 4.0, 500.0
    r = calculate_beam(
        length=L, support_type="simply_supported",
        loads=[{"type": "udl", "magnitude": w, "start": 0.0, "end": L}],
        youngs_modulus=E, moment_of_inertia=I,
    )
    assert abs(r.reactions["R1_at_0"] - w * L / 2) < 1e-6
    assert abs(r.reactions["R2_at_L"] - w * L / 2) < 1e-6

    m_expected = w * L ** 2 / 8
    assert abs(r.max_moment - m_expected) / m_expected < 1e-3

    defl_expected = -5 * w * L ** 4 / (384 * E * I)
    m_mid = _interp(r.x, r.deflection, L / 2)
    assert abs(m_mid - defl_expected) / abs(defl_expected) < 1e-2


def test_cantilever_end_point_load():
    L, P = 2.0, 500.0
    r = calculate_beam(
        length=L, support_type="cantilever",
        loads=[{"type": "point", "magnitude": P, "position": L}],
        youngs_modulus=E, moment_of_inertia=I,
    )
    assert abs(r.reactions["R_at_0"] - P) < 1e-6
    assert abs(r.reactions["M_at_0"] - P * L) < 1e-6

    assert abs(r.max_moment - (-P * L)) / (P * L) < 1e-3

    defl_expected = -P * L ** 3 / (3 * E * I)
    tip_defl = _interp(r.x, r.deflection, L)
    assert abs(tip_defl - defl_expected) / abs(defl_expected) < 1e-2


def test_cantilever_full_udl():
    L, w = 2.0, 300.0
    r = calculate_beam(
        length=L, support_type="cantilever",
        loads=[{"type": "udl", "magnitude": w, "start": 0.0, "end": L}],
        youngs_modulus=E, moment_of_inertia=I,
    )
    assert abs(r.reactions["R_at_0"] - w * L) < 1e-6
    assert abs(r.reactions["M_at_0"] - w * L ** 2 / 2) < 1e-6

    assert abs(r.max_moment - (-w * L ** 2 / 2)) / (w * L ** 2 / 2) < 1e-3

    defl_expected = -w * L ** 4 / (8 * E * I)
    tip_defl = _interp(r.x, r.deflection, L)
    assert abs(tip_defl - defl_expected) / abs(defl_expected) < 1e-2


def test_rejects_zero_length():
    try:
        calculate_beam(length=0, support_type="simply_supported",
                        loads=[{"type": "point", "magnitude": 100, "position": 0}])
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_rejects_load_outside_span():
    try:
        calculate_beam(length=4, support_type="simply_supported",
                        loads=[{"type": "point", "magnitude": 100, "position": 5}])
        assert False, "expected ValidationError"
    except ValidationError:
        pass


def test_rejects_no_loads():
    try:
        calculate_beam(length=4, support_type="simply_supported", loads=[])
        assert False, "expected ValidationError"
    except ValidationError:
        pass
