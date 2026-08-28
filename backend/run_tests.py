"""
run_tests.py
-------------
Self-contained test runner for the calculations engine (no external test
framework required). Each tests/test_*.py module exposes plain
test_*() functions using assert statements; this script discovers and
runs all of them and reports PASS/FAIL.

These same files are fully pytest-compatible: once the Django project
is scaffolded and pytest is installed, `pytest tests/ -v` works
unchanged with no modification to the test files.
"""
import importlib
import os
import pkgutil
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import tests as tests_pkg  # noqa: E402


def main():
    total, failed = 0, 0
    for _, modname, _ in pkgutil.iter_modules(tests_pkg.__path__, tests_pkg.__name__ + "."):
        module = importlib.import_module(modname)
        test_funcs = [
            getattr(module, name) for name in dir(module)
            if name.startswith("test_") and callable(getattr(module, name))
        ]
        for fn in test_funcs:
            total += 1
            try:
                fn()
                print(f"PASS   {modname}.{fn.__name__}")
            except AssertionError as e:
                failed += 1
                print(f"FAIL   {modname}.{fn.__name__}: {e}")
            except Exception:
                failed += 1
                print(f"ERROR  {modname}.{fn.__name__}")
                traceback.print_exc()

    print(f"\n{total - failed}/{total} tests passed.")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
