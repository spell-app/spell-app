"""Where a spell app finds its files:  the build folder (epic people-and-orgs J33)."""

from pathlib import Path

import pytest

import spell_quart
from spell_quart import built_folder


def test_built_folder_is_in_the_checkouts_build(monkeypatch: pytest.MonkeyPatch) -> None:
    """With no `$SPELL_BUILD_DIR`:  the `build/` of the checkout spell_quart is in, beside its `packages/`."""
    monkeypatch.delenv("SPELL_BUILD_DIR", raising=False)
    folder = built_folder("spaces/@spell/examples/solitaire")
    checkout = Path(spell_quart.__file__).resolve().parents[6]
    assert folder == checkout / "build" / "spaces" / "@spell" / "examples" / "solitaire"
    assert (checkout / "packages").is_dir()


def test_built_folder_follows_spell_build_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    """`$SPELL_BUILD_DIR`, the variable the node side reads too, points it elsewhere."""
    monkeypatch.setenv("SPELL_BUILD_DIR", str(tmp_path))
    assert built_folder("spaces/x") == tmp_path / "spaces" / "x"
