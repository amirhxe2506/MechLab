"""
calculators/exceptions.py
---------------------------
DRF exception-handling glue for the calculator API. NOT to be confused
with `calculations.exceptions` (the engine's own exception hierarchy,
imported below) -- this module only translates those engine exceptions
into HTTP responses; it defines no new exception types of its own.

Registered as REST_FRAMEWORK["EXCEPTION_HANDLER"] in config/settings.py.
Because it's a single shared handler rather than a try/except block
repeated in every view, calculator views never need to catch engine
exceptions themselves (per Phase 2 instructions Sec. 20.5.3) -- an
uncaught ValidationError/UnsupportedUnitError/EngineeringError raised
anywhere during a view's execution (typically from
`calculations.<module>.calculate_*()` or from the SI-conversion helpers
in serializers/common.py) propagates up through DRF's dispatch machinery
to here automatically.

Response shape (consistent across all calculator endpoints):

    calculations.exceptions.ValidationError(field, message)
        -> 400 {"<field>": ["<message>"]}
           This is the SAME shape DRF's own built-in serializer
           validation errors already use (e.g. a missing required
           field), so field-level errors are uniform everywhere,
           regardless of whether they originated in DRF's own
           structural validation or in the engine's physics/unit
           validation. Directly consumable by React Hook Form's
           setError(field, {message}).

    calculations.exceptions.EngineeringError (any other subclass,
    or the base class itself, without a specific request field)
        -> 400 {"non_field_errors": ["<message>"]}

    Anything else (a genuine bug, an unhandled exception type, etc.)
        -> falls through to DRF's default exception_handler, which
           returns None for exception types it doesn't recognise,
           and Django's normal machinery turns that into HTTP 500.
           This is deliberate: unexpected server errors must NOT be
           silently reclassified as 400 validation errors.
"""
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_exception_handler

from calculations.exceptions import EngineeringError, ValidationError as EngineValidationError


def custom_exception_handler(exc, context):
    if isinstance(exc, EngineValidationError):
        return Response({exc.field: [exc.message]}, status=400)

    if isinstance(exc, EngineeringError):
        # UnsupportedUnitError not routed through convert_to_si() (should
        # not happen in practice, since every call site uses it) and any
        # other future EngineeringError subclass without a specific
        # field both land here.
        return Response({"non_field_errors": [str(exc)]}, status=400)

    # Not an engine exception -- defer to DRF's normal handling
    # (DRF's own ValidationError, Http404, PermissionDenied, etc. -- or
    # None, letting an unrecognised exception become a real HTTP 500).
    return drf_default_exception_handler(exc, context)
