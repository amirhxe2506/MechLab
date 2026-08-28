"""
fluids/reynolds.py
--------------------
Reynolds number for internal (pipe) flow and standard laminar /
transitional / turbulent flow-regime classification.

Governing equation
-------------------
    Re = (rho * v * D) / mu  =  (v * D) / nu

Symbols
-------
    rho   Fluid density                [kg/m^3]
    v     Mean flow velocity            [m/s]
    D     Characteristic length
          (pipe internal diameter)      [m]
    mu    Dynamic viscosity             [Pa*s]
    nu    Kinematic viscosity           [m^2/s]  (nu = mu / rho)

Flow-regime thresholds (internal pipe flow, standard convention)
    Re < 2300               -> laminar
    2300 <= Re <= 4000        -> transitional
    Re > 4000                 -> turbulent
"""
from dataclasses import dataclass
from typing import Optional

from ..exceptions import ValidationError

LAMINAR_LIMIT = 2300.0
TURBULENT_LIMIT = 4000.0


@dataclass
class ReynoldsResult:
    reynolds_number: float
    regime: str


def calculate_reynolds(
    velocity: float,
    diameter: float,
    density: Optional[float] = None,
    dynamic_viscosity: Optional[float] = None,
    kinematic_viscosity: Optional[float] = None,
) -> ReynoldsResult:
    """
    Compute the Reynolds number for internal pipe flow.

    Provide EITHER (density AND dynamic_viscosity) OR kinematic_viscosity.
    """
    if diameter <= 0:
        raise ValidationError("diameter", "Characteristic length/diameter must be > 0.")
    if velocity == 0:
        raise ValidationError("velocity", "Velocity must be nonzero.")

    have_mu_path = density is not None and dynamic_viscosity is not None
    have_nu_path = kinematic_viscosity is not None

    if have_mu_path == have_nu_path:
        raise ValidationError(
            "viscosity",
            "Provide EITHER (density and dynamic_viscosity) OR kinematic_viscosity, not both/neither.",
        )

    if have_mu_path:
        if density <= 0:
            raise ValidationError("density", "Density must be > 0.")
        if dynamic_viscosity <= 0:
            raise ValidationError("dynamic_viscosity", "Dynamic viscosity must be > 0.")
        nu = dynamic_viscosity / density
    else:
        if kinematic_viscosity <= 0:
            raise ValidationError("kinematic_viscosity", "Kinematic viscosity must be > 0.")
        nu = kinematic_viscosity

    re = abs(velocity) * diameter / nu

    if re < LAMINAR_LIMIT:
        regime = "laminar"
    elif re <= TURBULENT_LIMIT:
        regime = "transitional"
    else:
        regime = "turbulent"

    return ReynoldsResult(reynolds_number=re, regime=regime)
