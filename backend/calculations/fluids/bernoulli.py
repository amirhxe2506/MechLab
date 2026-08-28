"""
fluids/bernoulli.py
---------------------
Bernoulli's equation for steady, incompressible, inviscid flow along a
streamline between two points. Solves for whichever ONE of (p2, v2, z2)
is left unspecified (None), given the full state at point 1 and the
remaining two quantities at point 2.

Governing equation (pressure form)
------------------------------------
    p1 + 1/2 rho v1^2 + rho g z1  =  p2 + 1/2 rho v2^2 + rho g z2

Symbols
-------
    p     Static pressure     [Pa]
    v     Flow velocity        [m/s]
    z     Elevation            [m]
    rho   Fluid density        [kg/m^3]
    g     Gravitational accel. [m/s^2]  (= 9.80665)

Assumptions: steady, incompressible, inviscid flow with no shaft work or
heat transfer between points 1 and 2 (no pump/turbine, negligible losses).
"""
import math
from dataclasses import dataclass
from typing import Optional

from ..exceptions import ValidationError

G = 9.80665


@dataclass
class BernoulliResult:
    solved_for: str
    value: float
    head_total_m: float   # total head at either station, for reference [m]


def calculate_bernoulli(
    density: float,
    p1: float, v1: float, z1: float,
    p2: Optional[float], v2: Optional[float], z2: Optional[float],
) -> BernoulliResult:
    """
    Solve Bernoulli's equation for the single unspecified quantity among
    (p2, v2, z2) -- pass exactly one of them as None.
    """
    if density <= 0:
        raise ValidationError("density", "Density must be > 0.")

    unknowns = [name for name, val in (("p2", p2), ("v2", v2), ("z2", z2)) if val is None]
    if len(unknowns) != 1:
        raise ValidationError(
            "p2/v2/z2",
            f"Exactly one of p2, v2, z2 must be left unspecified (None); got {len(unknowns)}.",
        )

    energy1 = p1 + 0.5 * density * v1 ** 2 + density * G * z1

    if unknowns[0] == "p2":
        value = energy1 - 0.5 * density * v2 ** 2 - density * G * z2
    elif unknowns[0] == "v2":
        rhs = 2.0 * (energy1 - p2 - density * G * z2) / density
        if rhs < 0:
            raise ValidationError(
                "v2",
                "No physically real solution for v2 with these inputs "
                "(negative value under the square root). Check p2, z2, and z1/v1/p1.",
            )
        value = math.sqrt(rhs)
    else:  # z2
        value = (energy1 - p2 - 0.5 * density * v2 ** 2) / (density * G)

    return BernoulliResult(
        solved_for=unknowns[0],
        value=value,
        head_total_m=energy1 / (density * G),
    )
