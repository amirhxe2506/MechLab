"""
calculators/urls.py
-----------------------
Included from api/urls.py with no extra prefix, so these resolve as:

    /api/calculators/stress-strain/
    /api/calculators/beam/
    /api/calculators/mohr/
    /api/calculators/reynolds/
    /api/calculators/bernoulli/
    /api/calculators/vibration/
    /api/units/
    /api/units/<dimension>/
"""
from django.urls import path

from .views.beam import BeamView
from .views.bernoulli import BernoulliView
from .views.mohr import MohrView
from .views.reynolds import ReynoldsView
from .views.stress import StressStrainView
from .views.units import UnitDimensionView, UnitsListView
from .views.vibration import VibrationView

urlpatterns = [
    path("calculators/stress-strain/", StressStrainView.as_view(), name="calculator-stress-strain"),
    path("calculators/beam/", BeamView.as_view(), name="calculator-beam"),
    path("calculators/mohr/", MohrView.as_view(), name="calculator-mohr"),
    path("calculators/reynolds/", ReynoldsView.as_view(), name="calculator-reynolds"),
    path("calculators/bernoulli/", BernoulliView.as_view(), name="calculator-bernoulli"),
    path("calculators/vibration/", VibrationView.as_view(), name="calculator-vibration"),
    path("units/", UnitsListView.as_view(), name="units-list"),
    path("units/<str:dimension>/", UnitDimensionView.as_view(), name="units-detail"),
]
