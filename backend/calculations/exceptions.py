"""
exceptions.py
-------------
Exception hierarchy for the MechLab calculation engine.

All engine-level errors inherit from EngineeringError so the Django view
layer can catch a single type and translate it into a clean, user-facing
message instead of leaking a raw traceback (per the input-validation
requirements in spec Sec. 11).
"""


class EngineeringError(Exception):
    """Base class for all calculation-engine errors."""


class ValidationError(EngineeringError):
    """Raised when an input parameter fails a physical or numerical check."""

    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


class UnsupportedUnitError(EngineeringError):
    """Raised when a requested unit is not registered for a given dimension."""

    def __init__(self, dimension: str, unit: str, supported):
        self.dimension = dimension
        self.unit = unit
        self.supported = supported
        super().__init__(
            f"Unsupported unit '{unit}' for dimension '{dimension}'. "
            f"Supported: {', '.join(supported)}"
        )
