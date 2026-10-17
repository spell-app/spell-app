"""What every test of spell_core shares:  a core of its own, so nothing one test does leaks into the next."""

import pytest

from spell_core import Core


@pytest.fixture
def core() -> Core:
    """A new core:  its own console (writing to pytest's captured stdout / stderr), random seeded with 1."""
    return Core()
