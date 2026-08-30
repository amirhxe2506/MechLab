# MechLab — Calculation Engine (Phase 0)

Framework-agnostic Python package implementing the core engineering
computations for MechLab (spec §12). No Django/DRF dependency — designed
to be imported directly by Django views later (the `calculators` app)
and unit-tested in isolation.

## Structure

    calculations/
    ├── exceptions.py      EngineeringError / ValidationError hierarchy
    ├── units.py             SI <-> Imperial unit conversion (§10)
    ├── mechanics/
    │   ├── stress.py         Axial stress-strain-deformation
    │   ├── beam.py            Reactions, V(x), M(x), deflection y(x)
    │   └── mohr.py             Principal stresses, Mohr's circle
    ├── fluids/
    │   ├── reynolds.py         Reynolds number + flow regime
    │   └── bernoulli.py        Bernoulli equation, solve for p2/v2/z2
    └── vibrations/
        └── sdof.py              SDOF free-vibration response

## Usage

    from calculations.mechanics import stress

    result = stress.calculate_stress(
        force=10_000, area=5e-4, youngs_modulus=200e9, original_length=1.0
    )
    print(result.stress, result.strain, result.deformation)

All functions take SI base units (N, m, Pa, m^2, m^4, kg, s) and return
a dataclass. Convert user-facing units (mm, MPa, in, psi, ...) at the
Django view / serializer boundary using `calculations.units`.

## Running the tests

    python3 run_tests.py
    # or, once pytest is installed in the real project:
    pytest tests/ -v

Every module is checked against closed-form textbook solutions
(simply-supported/cantilever beams, pure-shear Mohr's circle, the SDOF
governing ODE via finite differences, Bernoulli round-trips) — see the
corresponding tests/test_*.py for the reference values and reasoning.

## Design notes

- No third-party dependencies at this stage (pure standard library) —
  keeps the engine trivially portable and testable. NumPy/SciPy earn
  their place once V2/V3 introduces multi-DOF systems or FEM-adjacent
  tools (§28), not for these closed-form/superposition calculations.
- Every public function raises `calculations.exceptions.ValidationError`
  on physically invalid input (§11) — the Django view layer should catch
  this and render a clean form error, never a raw traceback.
- `beam.py` uses Macaulay-bracket superposition for V(x)/M(x) (exact,
  closed-form — no discretisation error there) and numerical
  double-integration of curvature for deflection y(x), with the support
  boundary conditions enforced per the support type.
- Results are dataclasses; use `dataclasses.asdict()` to serialize to
  JSON at the API/history-storage boundary.
