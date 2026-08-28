"""
mechanics/stress.py
--------------------
Axial (normal) stress-strain calculations for a prismatic bar under axial
load, per Hooke's Law (linear-elastic range).

Governing equations
--------------------
    sigma   = F / A                  (normal stress)
    epsilon = sigma / E = F / (A E)  (axial strain, Hooke's law)
    delta   = epsilon * L0           (axial deformation)

    epsilon_lateral = -nu * epsilon  (optional, if Poisson's ratio given)

Symbols
-------
    F        Applied axial force              [N]      (+tension, -compression)
    A        Cross-sectional area              [m^2]
    E        Young's modulus                   [Pa]
    L0       Original (undeformed) length      [m]
    nu       Poisson's ratio (dimensionless)
"""

from dataclasses import dataclass, field
from typing import Optional

from ..exceptions import ValidationError


@dataclass
class StressResult:
    stress: float          # Pa
    strain: float          # dimensionless
    deformation: float     # m
    lateral_strain: Optional[float] = None
    warnings: list = field(default_factory=list)


def calculate_stress(
    force: float,
    area: float,
    youngs_modulus: float,
    original_length: float,
    poisson_ratio: Optional[float] = None,
) -> StressResult:
    """
    Compute normal stress, strain and axial deformation for a bar under
    axial load F. All arguments are expected in SI base units.

    Raises
    ------
    ValidationError
        If area, Young's modulus or original length are non-positive, or
        if poisson_ratio is outside the physically admissible range
        (-1, 0.5) for an isotropic material.
    """
    if area <= 0:
        raise ValidationError("area", "Cross-sectional area must be > 0.")
    if youngs_modulus <= 0:
        raise ValidationError("youngs_modulus", "Young's modulus must be > 0.")
    if original_length <= 0:
        raise ValidationError("original_length", "Original length must be > 0.")
    if poisson_ratio is not None and not (-1.0 < poisson_ratio < 0.5):
        raise ValidationError(
            "poisson_ratio",
            "Poisson's ratio must lie in (-1, 0.5) for an isotropic material.",
        )

    stress = force / area
    strain = stress / youngs_modulus
    deformation = strain * original_length

    warnings = []
    # Soft sanity check: strains above ~0.5% are typically outside the
    # linear-elastic range for common engineering metals. This does not
    # invalidate the (purely elastic) calculation -- it flags the
    # assumption to the user.
    if abs(strain) > 0.005:
        warnings.append(
            "Computed strain exceeds ~0.5%, outside the typical linear-elastic "
            "range for common engineering metals. Hooke's law may no longer "
            "be a valid assumption here."
        )

    lateral_strain = -poisson_ratio * strain if poisson_ratio is not None else None

    return StressResult(
        stress=stress,
        strain=strain,
        deformation=deformation,
        lateral_strain=lateral_strain,
        warnings=warnings,
    )
