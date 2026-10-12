"""Things saved by id (`saving.py`):  written by a `Saver`, read back by a `Loader`.

- `savedById.expected.json`, in the JavaScript core's package, holds the entries these tests write.
  The JavaScript core's `saving.test.ts` writes the same things and reads the same file, so the two cores agree.
- The classes are what spell compiles from:
  - `a person is a thing where:`, `- its "name" is text`, `- its "dates" is a list of dated-events`,
    `- its "friends" is a list of people`
  - `a dated-event is a thing where:`, `- its "label" is text`, `- its "day" is a date`, `- it is saved inline`
  - `a card is a thing`, `a card has a rank as text`, `a pile is a list of cards`
    - named `SavingCard` and `SavingPile` here:  other tests' `Card` and `Pile` are known by those names
"""

import io
import json
import re
from datetime import UTC, datetime, timedelta, timezone
from pathlib import Path

from spell_core import List, Loader, Saver, SpellConsole, SpellCore, Thing, prop
from spell_core.core import using_core
from spell_core.saving import Entry, iso_text
from spell_core.things import SpellObject

EXPECTED = json.loads((Path(__file__).parents[3] / "core" / "savedById.expected.json").read_text(encoding="utf-8"))


####################
# ## Classes under test
####################


class Person(Thing):
    """`a person is a thing where:` ... with a name, dates and friends."""

    name = prop(type="text")
    dates = prop(item_type="DatedEvent", init=lambda: List(item_type="DatedEvent"))
    friends = prop(item_type="Person", init=lambda: List(item_type="Person"))


class DatedEvent(Thing):
    """`a dated-event is a thing where:` ... `- it is saved inline`."""

    saved_inline = True
    label = prop(type="text")
    day = prop(type="date")


class SavingCard(Thing):
    """`a card is a thing`, `a card has a rank as text`."""

    rank = prop(type="text")


class SavingPile(List):
    """`a pile is a list of cards`."""

    item_type = SavingCard


# The classes by name, as `things` would know them once a program made them.
CLASSES: dict[str, type[SpellObject]] = {
    "Person": Person,
    "DatedEvent": DatedEvent,
    "SavingCard": SavingCard,
    "SavingPile": SavingPile,
    "List": List,
}


def owen_and_matt() -> Person:
    """Owen and Matt, friends of each other:  a reference each way."""
    owen = Person(id="owen", name="Owen")
    matt = Person(id="matt", name="Matt")
    owen.dates.append(DatedEvent(label="birthday", day=datetime(1970, 1, 1, tzinfo=UTC)))
    owen.friends.append(matt)
    matt.friends.append(owen)
    return owen


def loader_of(entries: dict[str, Entry]) -> Loader:
    """A loader reading `entries`, as the classes above."""
    return Loader(entry_for=entries.get, class_named=CLASSES.get)


####################
# ## Saver
####################


def test_each_thing_an_entry_of_its_own_by_id_and_what_holds_it_a_reference() -> None:
    saved = Saver().save(owen_and_matt())
    assert saved.root == "Person/owen"
    assert {"root": saved.root, "entries": saved.entries} == EXPECTED


def test_a_kind_saved_inline_is_written_whole_inside_what_holds_it() -> None:
    entries = Saver().save(owen_and_matt()).entries
    assert list(entries) == ["Person/owen", "Person/matt"]
    assert entries["Person/owen"]["dates"] == [
        {"@type": "DatedEvent", "label": "birthday", "day": "1970-01-01T00:00:00.000Z"}
    ]


def test_a_thing_with_no_id_is_given_one_as_its_saved_and_keeps_it() -> None:
    anon = Person(name="Anon")
    root = Saver().save(anon).root
    assert re.fullmatch(r"Person/person-[0-9a-z]{8}", root)
    assert root == f"Person/{anon.id}"


def test_ref_of_names_entries_and_references() -> None:
    saved = Saver(ref_of=lambda thing: f"{thing.id}@spell").save(owen_and_matt())
    assert saved.root == "owen@spell"
    assert saved.entries["owen@spell"]["friends"] == [{"@ref": "matt@spell"}]


def test_a_date_is_its_iso_text_in_utc_to_the_millisecond_as_javascripts() -> None:
    assert iso_text(datetime(2026, 10, 12, 9, 30, 5, 123456, tzinfo=UTC)) == "2026-10-12T09:30:05.123Z"
    assert iso_text(datetime(2026, 10, 12, 9, 30, tzinfo=timezone(timedelta(hours=-4)))) == "2026-10-12T13:30:00.000Z"
    assert iso_text(datetime(2026, 10, 12)) == "2026-10-12T00:00:00.000Z"


####################
# ## Loader
####################


def test_reads_the_entries_back_each_thing_once_however_many_hold_it() -> None:
    owen = loader_of(EXPECTED["entries"]).load(EXPECTED["root"])
    assert isinstance(owen, Person)
    assert owen.name == "Owen"
    assert owen.id == "owen"
    [birthday] = owen.dates
    assert isinstance(birthday, DatedEvent)
    assert birthday.day == datetime(1970, 1, 1, tzinfo=UTC)
    [matt] = owen.friends
    assert matt.name == "Matt"
    # a reference each way:  matt's friend IS owen, not a copy
    assert matt.friends[0] is owen


def test_a_card_in_two_piles_comes_back_as_one_card() -> None:
    ace = SavingCard(id="ace", rank="ace")
    stock, discards = SavingPile(id="stock"), SavingPile(id="discards")
    stock.append(ace)
    discards.append(ace)
    holder = List(id="piles")
    holder.append(stock)
    holder.append(discards)
    saved = Saver().save(holder)
    piles = loader_of(saved.entries).load(saved.root)
    first, second = piles
    assert isinstance(first[0], SavingCard)
    assert first[0] is second[0]


def test_saved_loaded_saved_again_gives_the_same_entries() -> None:
    saved = Saver().save(loader_of(EXPECTED["entries"]).load(EXPECTED["root"]))
    assert {"root": saved.root, "entries": saved.entries} == EXPECTED


def test_a_reference_to_nothing_saved_is_left_out_of_a_list_with_a_warning() -> None:
    warnings = io.StringIO()
    entries = {"Person/owen": {**EXPECTED["entries"]["Person/owen"], "friends": [{"@ref": "Person/nobody"}]}}
    with using_core(SpellCore(SpellConsole(stderr=warnings))):
        owen = loader_of(entries).load("Person/owen")
    assert list(owen.friends) == []
    assert warnings.getvalue() == 'Loader.load():  nothing is saved as "Person/nobody"\n'
