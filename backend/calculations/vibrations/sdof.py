"""
vibrations/sdof.py
--------------------
Free-vibration response of a single-degree-of-freedom (SDOF) mass-spring-
damper system:

    m x'' + c x' + k x = 0,      x(0) = x0,  x'(0) = v0

Governing quantities
----------------------
    omega_n  = sqrt(k / m)                    natural (undamped) frequency [rad/s]
    zeta     = c / (2 sqrt(k m))               damping ratio [-]
    omega_d  = omega_n * sqrt(1 - zeta^2)      damped natural frequency [rad/s]  (zeta < 1)

Classification
    zeta == 0        -> undamped
    0 < zeta < 1      -> underdamped
    zeta == 1         -> critically damped
    zeta > 1          -> overdamped

Closed-form response x(t), by regime
    underdamped (0 <= zeta < 1):
        x(t) = e^{-zeta wn t} [ x0 cos(wd t) + ((v0 + zeta wn x0)/wd) sin(wd t) ]
    critically damped (zeta = 1):
        x(t) = e^{-wn t} [ x0 + (v0 + wn x0) t ]
    overdamped (zeta > 1):
        w' = wn sqrt(zeta^2 - 1)
        x(t) = e^{-zeta wn t} [ x0 cosh(w' t) + ((v0 + zeta wn x0)/w') sinh(w' t) ]
"""
import math
from dataclasses import dataclass, field
from typing import List, Optional

from ..exceptions import ValidationError


@dataclass
class SDOFResult:
    natural_frequency_rad_s: float
    natural_frequency_hz: float
    damping_ratio: float
    damped_frequency_rad_s: Optional[float]
    classification: str
    time: List[float]
    displacement: List[float]
    warnings: list = field(default_factory=list)


def calculate_sdof(
    mass: float,
    stiffness: float,
    damping: float,
    initial_displacement: float = 0.0,
    initial_velocity: float = 0.0,
    duration: Optional[float] = None,
    n_points: int = 500,
) -> SDOFResult:
    """
    Compute the free-vibration response of a SDOF system.

    mass [kg] > 0, stiffness [N/m] > 0, damping [N*s/m] >= 0.
    duration [s]: simulation window; auto-selected from the system's
    dynamics if omitted.
    """
    if mass <= 0:
        raise ValidationError("mass", "Mass must be > 0.")
    if stiffness <= 0:
        raise ValidationError("stiffness", "Stiffness must be > 0.")
    if damping < 0:
        raise ValidationError("damping", "Damping coefficient cannot be negative.")

    wn = math.sqrt(stiffness / mass)
    zeta = damping / (2.0 * math.sqrt(stiffness * mass))

    if duration is None:
        if zeta < 1.0:
            period = 2 * math.pi / (wn * math.sqrt(max(1 - zeta ** 2, 1e-9)))
            duration = 6 * period if zeta > 1e-6 else 8 * period
        else:
            tau = 1.0 / (zeta * wn)
            duration = 6 * tau

    t = [duration * i / (n_points - 1) for i in range(n_points)]

    if zeta < 1.0 - 1e-9:
        classification = "undamped" if zeta == 0 else "underdamped"
        wd = wn * math.sqrt(1 - zeta ** 2)
        B = (initial_velocity + zeta * wn * initial_displacement) / wd
        x = [
            math.exp(-zeta * wn * ti) * (initial_displacement * math.cos(wd * ti) + B * math.sin(wd * ti))
            for ti in t
        ]
        wd_out = wd
    elif abs(zeta - 1.0) <= 1e-9:
        classification = "critically damped"
        C2 = initial_velocity + wn * initial_displacement
        x = [math.exp(-wn * ti) * (initial_displacement + C2 * ti) for ti in t]
        wd_out = None
    else:
        classification = "overdamped"
        wp = wn * math.sqrt(zeta ** 2 - 1)
        B = (initial_velocity + zeta * wn * initial_displacement) / wp
        x = [
            math.exp(-zeta * wn * ti) * (initial_displacement * math.cosh(wp * ti) + B * math.sinh(wp * ti))
            for ti in t
        ]
        wd_out = None

    return SDOFResult(
        natural_frequency_rad_s=wn,
        natural_frequency_hz=wn / (2 * math.pi),
        damping_ratio=zeta,
        damped_frequency_rad_s=wd_out,
        classification=classification,
        time=t,
        displacement=x,
    )
