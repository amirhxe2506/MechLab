"""
mechanics/beam.py
------------------
Statically-determinate beam analysis: support reactions, shear force V(x),
bending moment M(x), and (optionally) transverse deflection y(x), for a
simply-supported or cantilever beam under any combination of point loads
and uniformly distributed loads (UDLs).

Sign convention
----------------
    x       measured from the left end (x=0) to the right end (x=L).
    Loads   positive magnitude = downward (gravity direction).
    M(x)    sagging-positive (concave-up bending, tension on the bottom
            fibre).
    y(x)    transverse deflection, positive UPWARD. A beam sagging under
            downward load therefore has y(x) < 0 across its span.

Governing relations (Euler-Bernoulli beam theory)
--------------------------------------------------
    dV/dx = -w(x)
    dM/dx =  V(x)
    EI * d^2y/dx^2 = M(x)

Reactions come from static equilibrium. V(x) and M(x) are evaluated in
closed form via Macaulay-bracket superposition (exact, no discretisation
error). y(x) is obtained by numerically integrating curvature twice and
enforcing the support boundary conditions:
    simply supported : y(0) = 0, y(L) = 0
    cantilever        : y(0) = 0, y'(0) = 0   (fixed at x=0)
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional

from ..exceptions import ValidationError

SUPPORTED_TYPES = ("simply_supported", "cantilever")


@dataclass
class BeamResult:
    x: List[float]
    shear: List[float]
    moment: List[float]
    deflection: Optional[List[float]]
    reactions: Dict[str, float]
    max_moment: float
    max_moment_location: float
    max_deflection: Optional[float]
    max_deflection_location: Optional[float]
    warnings: list = field(default_factory=list)


def _mac(x: float, a: float, n: int) -> float:
    """Macaulay bracket <x-a>^n: zero for x < a, else (x-a)^n."""
    if x < a - 1e-12:
        return 0.0
    return (x - a) ** n


def _validate_loads(loads: List[dict], length: float):
    if not loads:
        raise ValidationError("loads", "At least one load must be specified.")
    for i, ld in enumerate(loads):
        kind = ld.get("type")
        if kind == "point":
            if "magnitude" not in ld or "position" not in ld:
                raise ValidationError(f"loads[{i}]", "Point load requires 'magnitude' and 'position'.")
            a = ld["position"]
            if not (0.0 <= a <= length):
                raise ValidationError(
                    f"loads[{i}].position",
                    f"Point load position {a} m must lie within [0, {length}] m.",
                )
        elif kind == "udl":
            if "magnitude" not in ld or "start" not in ld or "end" not in ld:
                raise ValidationError(f"loads[{i}]", "UDL requires 'magnitude', 'start' and 'end'.")
            x1, x2 = ld["start"], ld["end"]
            if not (0.0 <= x1 < x2 <= length):
                raise ValidationError(
                    f"loads[{i}]",
                    f"UDL span [{x1}, {x2}] m must satisfy 0 <= start < end <= {length} m.",
                )
        else:
            raise ValidationError(f"loads[{i}].type", f"Unknown load type {kind!r}. Expected 'point' or 'udl'.")


def calculate_beam(
    length: float,
    support_type: str,
    loads: List[dict],
    youngs_modulus: Optional[float] = None,
    moment_of_inertia: Optional[float] = None,
    n_points: int = 500,
) -> BeamResult:
    """
    Analyse a statically-determinate beam.

    Parameters
    ----------
    length : float
        Beam span, L [m].
    support_type : {"simply_supported", "cantilever"}
        "simply_supported": pin at x=0, roller at x=L.
        "cantilever": fixed at x=0, free at x=L.
    loads : list of dict
        Each entry is either
            {"type": "point", "magnitude": P, "position": a}
        or
            {"type": "udl", "magnitude": w, "start": x1, "end": x2}
        Magnitudes are downward-positive, [N] or [N/m].
    youngs_modulus : float, optional
        E [Pa]. Required (with moment_of_inertia) to compute deflection.
    moment_of_inertia : float, optional
        Second moment of area, I [m^4].
    n_points : int
        Number of stations used to discretise shear/moment/deflection.
    """
    if length <= 0:
        raise ValidationError("length", "Beam length must be > 0.")
    if support_type not in SUPPORTED_TYPES:
        raise ValidationError("support_type", f"Must be one of {SUPPORTED_TYPES}.")
    _validate_loads(loads, length)

    want_deflection = youngs_modulus is not None or moment_of_inertia is not None
    if want_deflection:
        if youngs_modulus is None or moment_of_inertia is None:
            raise ValidationError(
                "youngs_modulus/moment_of_inertia",
                "Both youngs_modulus and moment_of_inertia are required to compute deflection.",
            )
        if youngs_modulus <= 0:
            raise ValidationError("youngs_modulus", "Young's modulus must be > 0.")
        if moment_of_inertia <= 0:
            raise ValidationError("moment_of_inertia", "Moment of inertia must be > 0.")

    # --- total load & its moment about x=0 (needed for both support types) ---
    total_load = 0.0
    moment_about_origin = 0.0
    for ld in loads:
        if ld["type"] == "point":
            P, a = ld["magnitude"], ld["position"]
            total_load += P
            moment_about_origin += P * a
        else:  # udl
            w, x1, x2 = ld["magnitude"], ld["start"], ld["end"]
            F = w * (x2 - x1)
            centroid = (x1 + x2) / 2.0
            total_load += F
            moment_about_origin += F * centroid

    # --- reactions ---
    if support_type == "simply_supported":
        R2 = moment_about_origin / length          # reaction at x = L
        R1 = total_load - R2                        # reaction at x = 0
        reactions = {"R1_at_0": R1, "R2_at_L": R2}
        R_left, M0 = R1, 0.0
    else:  # cantilever, fixed at x = 0
        R_left = total_load                          # vertical reaction at wall
        M0 = moment_about_origin                      # fixing moment at wall
        reactions = {"R_at_0": R_left, "M_at_0": M0}

    # --- shear & moment via Macaulay superposition ---
    # The moment diagram has a sharp corner (local extremum) exactly at each
    # point-load position, and V(x) jumps there. A naive uniform grid can
    # straddle that corner and undershoot the true peak, so the exact
    # load-application x-coordinates are merged into the sample grid.
    critical_xs = {0.0, length}
    for ld in loads:
        if ld["type"] == "point":
            critical_xs.add(ld["position"])
        else:
            critical_xs.add(ld["start"])
            critical_xs.add(ld["end"])
    base_xs = [length * i / (n_points - 1) for i in range(n_points)]
    xs = sorted(set(base_xs) | critical_xs)
    n = len(xs)

    shear, moment = [], []
    for x in xs:
        V = R_left
        M = R_left * x - M0
        for ld in loads:
            if ld["type"] == "point":
                P, a = ld["magnitude"], ld["position"]
                V -= P * (1.0 if x >= a - 1e-12 else 0.0)
                M -= P * _mac(x, a, 1)
            else:
                w, x1, x2 = ld["magnitude"], ld["start"], ld["end"]
                V -= w * _mac(x, x1, 1) - w * _mac(x, x2, 1)
                M -= w * _mac(x, x1, 2) / 2.0 - w * _mac(x, x2, 2) / 2.0
        shear.append(V)
        moment.append(M)

    max_moment_idx = max(range(n), key=lambda i: abs(moment[i]))
    max_moment = moment[max_moment_idx]
    max_moment_location = xs[max_moment_idx]

    deflection = None
    max_deflection = None
    max_deflection_location = None

    if want_deflection:
        EI = youngs_modulus * moment_of_inertia
        curvature = [m / EI for m in moment]

        def cum_trapz(y, x):
            out = [0.0] * len(x)
            for i in range(1, len(x)):
                out[i] = out[i - 1] + 0.5 * (y[i] + y[i - 1]) * (x[i] - x[i - 1])
            return out

        theta_raw = cum_trapz(curvature, xs)
        y_raw = cum_trapz(theta_raw, xs)

        if support_type == "simply_supported":
            c1 = -y_raw[-1] / length  # enforce y(L) = 0
            deflection = [y_raw[i] + c1 * xs[i] for i in range(n)]
        else:
            deflection = y_raw  # cantilever: y(0)=0, theta(0)=0 already satisfied

        max_defl_idx = max(range(n), key=lambda i: abs(deflection[i]))
        max_deflection = deflection[max_defl_idx]
        max_deflection_location = xs[max_defl_idx]

    return BeamResult(
        x=xs, shear=shear, moment=moment, deflection=deflection,
        reactions=reactions, max_moment=max_moment, max_moment_location=max_moment_location,
        max_deflection=max_deflection, max_deflection_location=max_deflection_location,
    )


def rectangular_I(width: float, height: float) -> float:
    """Second moment of area of a solid rectangular section: I = b h^3 / 12."""
    if width <= 0 or height <= 0:
        raise ValidationError("width/height", "Cross-section dimensions must be > 0.")
    return width * height ** 3 / 12.0


def circular_I(diameter: float) -> float:
    """Second moment of area of a solid circular section: I = pi d^4 / 64."""
    import math
    if diameter <= 0:
        raise ValidationError("diameter", "Diameter must be > 0.")
    return math.pi * diameter ** 4 / 64.0
