"""The console:  node's lines, groups indented 2 spaces a level, dumps of things on stderr."""

import io

import pytest

from spell_core import SpellConsole, SpellCore


class Card:
    """A stand-in for a spell thing:  a value that isn't plain data."""

    def __repr__(self) -> str:
        return "Card(queen of spades)"


def test_values_print_as_node_prints_them(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.console.log("queen", 3.0, True, None, [1, "two"])
    assert capsys.readouterr().out == "queen 3 true undefined [ 1, 'two' ]\n"


def test_groups_indent_2_spaces_a_level(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    console = core.console
    console.group("G")
    console.log("a\nb")
    console.group()
    console.log([1, 2])
    console.group_end()
    console.group_end()
    console.group_end()  # one more than were open:  nothing changes
    console.log("out")
    assert capsys.readouterr().out == "G\n  a\n  b\n    [ 1, 2 ]\nout\n"


def test_a_collapsed_group_prints_as_any_group(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.console.group_collapsed("hand")
    core.console.info("ace")
    core.console.group_end()
    assert capsys.readouterr().out == "hand\n  ace\n"


def test_warnings_and_errors_go_to_stderr_indented(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.console.group("G")
    core.console.warn("careful", 1.0)
    core.console.error("oops")
    printed = capsys.readouterr()
    assert printed.out == "G\n"
    assert printed.err == "  careful 1\n  oops\n"


def test_a_dump_of_a_thing_goes_to_stderr(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.console.log("the card:", Card())
    core.console.log("plain data:", [1, 2, 3], {"rank": "queen"})
    printed = capsys.readouterr()
    assert printed.err == "the card: Card(queen of spades)\n"
    assert printed.out == "plain data: [ 1, 2, 3 ] { rank: 'queen' }\n"


def test_a_console_can_write_to_streams_of_its_own() -> None:
    out, err = io.StringIO(), io.StringIO()
    console = SpellConsole(stdout=out, stderr=err)
    console.log("to out")
    console.warn("to err")
    assert (out.getvalue(), err.getvalue()) == ("to out\n", "to err\n")
