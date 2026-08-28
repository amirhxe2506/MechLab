"""
mechanics/mohr.py
-------------------
2D (plane) stress transformation: principal stresses, maximum in-plane
shear stress, and their orientations, from a given stress state
(sigma_x, sigma_y, tau_xy) via Mohr's Circle.

Governing equations
--------------------
    sigma_avg = (sigma_x + sigma_y) / 2
    R         = sqrt( ((sigma_x - sigma_y)/2)^2 + tau_xy^2 )   (circle radius)

    sigma_1   = sigma_avg + R          (max principal stress)
    sigma_2   = sigma_avg - R          (min principal stress)
    tau_max   = R                       (max in-plane shear stress)

    theta_p   = 0.5 * atan2(2 tau_xy, sigma_x - sigma_y)   (orientation of sigma_1, from +x axis)
    theta_s   = theta_p - 45 deg                             (orientation of the tau_max plane)

Stresses are expected in a single consistent unit (e.g. Pa or MPa);
angles are returned in degrees, measured counter-clockwise from +x.
"""
import math
from dataclasses import dataclass


@dataclass
class MohrResult:
    sigma_avg: float
    radius: float
    sigma_1: float
    sigma_2: float
    tau_max: float
    theta_p1_deg: float   # orientation of sigma_1
    theta_p2_deg: float   # orientation of sigma_2 (theta_p1 +/- 90 deg)
    theta_s_deg: float    # orientation of the tau_max plane


def _normalize_angle_deg(angle: float) -> float:
    """Wrap an angle into (-90, 90] deg (principal-plane angles repeat every 180 deg)."""
    while angle <= -90.0:
        angle += 180.0
    while angle > 90.0:
        angle -= 180.0
    return angle


def calculate_mohr(sigma_x: float, sigma_y: float, tau_xy: float) -> MohrResult:
    """Compute principal stresses, max in-plane shear, and their orientations."""
    sigma_avg = (sigma_x + sigma_y) / 2.0
    radius = math.hypot((sigma_x - sigma_y) / 2.0, tau_xy)

    sigma_1 = sigma_avg + radius
    sigma_2 = sigma_avg - radius
    tau_max = radius

    if radius == 0:
        theta_p1 = 0.0  # hydrostatic state -- principal directions undefined
    else:
        theta_p1 = math.degrees(0.5 * math.atan2(2 * tau_xy, sigma_x - sigma_y))

    theta_p1 = _normalize_angle_deg(theta_p1)
    theta_p2 = _normalize_angle_deg(theta_p1 + 90.0)
    theta_s = _normalize_angle_deg(theta_p1 - 45.0)

    return MohrResult(
        sigma_avg=sigma_avg, radius=radius, sigma_1=sigma_1, sigma_2=sigma_2,
        tau_max=tau_max, theta_p1_deg=theta_p1, theta_p2_deg=theta_p2, theta_s_deg=theta_s,
    )
