"""Things:  declared properties, their checks, set-up, type, JSON and `repr()`.

- The classes here are what spell compiles `a card is a thing` and its `has` lines to.
- Their names are this file's own (`ThingCard` ...):  every class is known by name (`core.things`),
  and another test file's `Card` mustn't stand in for one of these.
"""

import copy
import json
import re

import pytest

from spell_core import List, Thing, core, prop
from spell_core.things import new_thing_id, things

RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]


class ThingCard(Thing):
    """`a card is a thing`, its rank, suit and direction declared as one of a list."""

    RANKS = RANKS
    rank = prop(one_of=RANKS)
    suit = prop(one_of=["clubs", "diamonds", "hearts", "spades"])
    direction = prop(one_of=lambda: ThingCard.DIRECTIONS)
    name = prop(type="text", default="")
    DIRECTIONS = ("up", "down")

    def create(self) -> None:
        """Spell's set-up:  counts the times it runs, and sees the keyword properties already set."""
        self.created = (self.created or 0) + 1  # unset reads as None
        self.rank_when_created = self.rank


class Player(Thing):
    """`a player is a thing` with a score, a hand made on first read, and a card."""

    score = prop(type="number", default=0)
    hand = prop(init=list)
    card = prop(type="ThingCard")


class Joker(ThingCard):
    """`a joker is a card`."""


####################
# ## Properties
####################


def test_keyword_properties_then_create_once() -> None:
    card = ThingCard(rank="queen", suit="spades", direction="up")
    assert (card.rank, card.suit, card.direction) == ("queen", "spades", "up")
    assert card.created == 1
    assert card.rank_when_created == "queen"
    assert ThingCard().rank is None


def test_a_default_is_read_but_not_stored() -> None:
    card = ThingCard()
    assert card.name == ""
    assert card.to_json() == {"$type": "ThingCard"}
    assert Player().score == 0


def test_init_makes_a_value_once_per_thing_and_stores_it() -> None:
    one, other = Player(), Player()
    assert one.hand == []
    one.hand.append("ace")
    assert one.hand == ["ace"]
    assert other.hand == []
    assert one.to_json() == {"$type": "Player", "hand": ["ace"]}


def test_an_early_starting_value_is_made_with_the_thing_unless_given() -> None:
    made: list[str] = []

    class EarlyPile(Thing):
        pass

    class EarlyGame(Thing):
        clubs = prop(init=lambda: made.append("clubs") or EarlyPile(), early=True)
        later = prop(init=lambda: made.append("later") or EarlyPile())

    game = EarlyGame()
    assert made == ["clubs"]
    assert isinstance(game.clubs, EarlyPile)
    given = EarlyPile()
    assert EarlyGame(clubs=given).clubs is given
    assert made == ["clubs"]


def test_a_shared_list_default_is_refused() -> None:
    with pytest.raises(TypeError, match="pass init=list instead"):
        prop(default=[])


def test_setting_none_unsets_it() -> None:
    card = ThingCard(rank="ace", name="Ace")
    card.name = None
    assert card.name == ""
    assert card.to_json() == {"$type": "ThingCard", "rank": "ace"}


def test_on_the_class_a_property_is_its_declaration() -> None:
    assert ThingCard.rank.name == "rank"
    assert ThingCard.rank.one_of == RANKS
    assert ThingCard.direction.one_of == ("up", "down")
    assert repr(Player.score) == "prop(type='number', default=0)"


####################
# ## Checks:  a warning on core's console, and set anyway
####################


def test_a_value_outside_one_of_warns_with_the_javascript_wording_and_is_set(
    capsys: pytest.CaptureFixture[str],
) -> None:
    card = ThingCard(rank="joker")
    assert card.rank == "joker"
    assert capsys.readouterr().err == (
        "Expected rank to be one of 'ace,2,3,4,5,6,7,8,9,10,jack,queen,king', got: joker\n"
    )


def test_one_of_compares_as_javascript_does(capsys: pytest.CaptureFixture[str]) -> None:
    ThingCard(rank=2.0)
    assert capsys.readouterr().err == ""
    ThingCard(rank=True)
    assert "got: true" in capsys.readouterr().err


def test_a_value_of_the_wrong_type_warns(capsys: pytest.CaptureFixture[str]) -> None:
    player = Player(score="ten")
    assert player.score == "ten"
    assert capsys.readouterr().err == "Expected score to be type 'number', got: ten\n"
    player.card = ThingCard()
    player.card = Joker()
    assert capsys.readouterr().err == ""
    player.card = Player()
    assert "Expected card to be type 'ThingCard', got:" in capsys.readouterr().err


def test_setting_the_same_value_again_is_not_checked_again(capsys: pytest.CaptureFixture[str]) -> None:
    card = ThingCard(rank="joker")
    capsys.readouterr()
    card.rank = "joker"
    assert capsys.readouterr().err == ""


def test_check_prop_takes_a_dict_too(capsys: pytest.CaptureFixture[str]) -> None:
    assert core.check_prop("size", 3, {"type": "number"}) is True
    assert core.check_prop("size", "big", {"oneOf": ["small"]}) is False
    assert capsys.readouterr().err == "Expected size to be one of 'small', got: big\n"


####################
# ## What it is
####################


def test_type_is_its_class_name_unless_set() -> None:
    card = Joker()
    assert card.type == "Joker"
    card.type = "Wild"
    assert card.type == "Wild"
    assert card.to_json()["$type"] == "Joker"


def test_is_of_type_its_class_and_each_it_extends() -> None:
    joker = Joker()
    assert [joker.is_of_type(name) for name in ["joker", "ThingCard", "thing", "player"]] == [True, True, True, False]


def test_equality_is_identity() -> None:
    one, other = ThingCard(rank="ace"), ThingCard(rank="ace")
    assert one != other
    assert one == one
    assert len({one, other}) == 2
    assert core.equals(one, other)


def test_equals_leaves_out_a_things_id() -> None:
    one, other = ThingCard(rank="ace"), ThingCard(rank="ace")
    assert one.id != other.id
    assert core.equals(one, other)
    assert core.equals(ThingCard(id="a", rank="ace"), ThingCard(id="b", rank="ace"))
    assert not core.equals(ThingCard(id="a", rank="ace"), ThingCard(id="a", rank="king"))


def test_an_undeclared_name_reads_as_none_but_a_private_one_raises() -> None:
    card = ThingCard()
    assert card.colour is None
    with pytest.raises(AttributeError):
        _ = card._colour
    with pytest.raises(AttributeError):
        _ = card.__colour__
    assert copy.copy(card) is not card


def test_an_undeclared_keyword_is_a_plain_attribute_not_a_property() -> None:
    card = ThingCard(rank="ace", owner="Ann")
    assert card.owner == "Ann"
    assert card.to_json() == {"$type": "ThingCard", "rank": "ace"}


def test_each_class_is_known_by_name_as_it_is_defined() -> None:
    assert things.class_named("ThingCard") is ThingCard
    assert things.class_named("Joker") is Joker
    assert things.class_named("Thing") is Thing
    assert core.things is things


####################
# ## JSON and repr()
####################


def test_json_is_its_type_then_its_properties_in_the_order_first_set() -> None:
    card = ThingCard(suit="hearts", rank="king")
    card.suit = "spades"
    assert list(card.to_json()) == ["$type", "suit", "rank"]
    player = Player(card=card)
    assert json.dumps(player.to_json()) == (
        '{"$type": "Player", "card": {"$type": "ThingCard", "suit": "spades", "rank": "king"}}'
    )


def test_repr_is_its_class_and_properties() -> None:
    assert repr(ThingCard(rank="queen", suit="spades", direction="up")) == (
        "ThingCard(rank='queen', suit='spades', direction='up')"
    )
    player = Player()
    player.card = player  # type: ignore[assignment]
    assert repr(player) == "Player(card=...)"


def test_a_method_or_getter_added_from_outside_its_class() -> None:
    class Gem(Thing):
        shine = prop(type="number", default=1)

    @Gem.add_method("polish")
    def _gem_polish(self: Gem) -> None:
        self.shine = self.shine + 1

    @Gem.add_property("is_bright")
    def _gem_is_bright(self: Gem) -> bool:
        return self.shine > 1

    gem = Gem()
    gem.polish()
    assert gem.is_bright is True


####################
# ## Ids (epic people-and-orgs P1)
####################


class DatedEvent(Thing):
    """`a dated-event is a thing`:  its kind, in its made-up id, is `dated-event`."""


def test_an_id_is_made_on_first_read_then_kept() -> None:
    event = DatedEvent()
    assert event.to_json() == {"$type": "DatedEvent"}
    assert re.fullmatch(r"dated-event-[0-9a-z]{8}", event.id)
    assert event.id == event.id
    assert event.to_json() == {"$type": "DatedEvent", "id": event.id}


def test_its_kind_is_its_class_name_in_lower_kebab_case_as_javascripts() -> None:
    class HTTPServer(Thing):
        """Capitals together are one word, as lodash's `kebabCase()` reads them."""

    class Player2(Thing):
        """A number is a word of its own."""

    assert new_thing_id(HTTPServer()).startswith("http-server-")
    assert new_thing_id(Player2()).startswith("player-2-")


def test_a_set_id_wins_by_keyword_or_set_later() -> None:
    assert ThingCard(id="owen").id == "owen"
    assert ThingCard(id="owen").to_json() == {"$type": "ThingCard", "id": "owen"}
    card = ThingCard(rank="ace")
    made_up = card.id
    card.id = "ace-of-spades"
    assert card.id == "ace-of-spades" != made_up


def test_two_things_never_share_a_made_up_id_even_in_runs_seeded_the_same() -> None:
    core.seed_random(7)
    first = ThingCard().id
    core.seed_random(7)
    second = ThingCard().id
    core.seed_random(1)
    assert first != second
    assert len({ThingCard().id for _ in range(1000)}) == 1000


def test_an_id_that_is_not_text_warns_and_is_set(capsys: pytest.CaptureFixture[str]) -> None:
    card = ThingCard(id=42)
    assert capsys.readouterr().err == "Expected id to be type 'text', got: 42\n"
    assert card.id == 42


def test_saved_inline_is_no_by_default_set_per_class_and_inherited() -> None:
    class Note(DatedEvent):
        """`a note is a dated-event`."""

    assert (Thing.saved_inline, List.saved_inline, DatedEvent.saved_inline) == (False, False, False)
    DatedEvent.saved_inline = True
    assert (Thing.saved_inline, DatedEvent.saved_inline, Note.saved_inline) == (False, True, True)
    DatedEvent.saved_inline = False


def test_item_type_is_kept_on_the_prop_by_name() -> None:
    class Project(Thing):
        """`a project has tasks as a new list of tasks`."""

        tasks = prop(item_type="Task", init=List)
        cards = prop(item_type=ThingCard, init=List)

    assert (Project.tasks.item_type, Project.cards.item_type) == ("Task", "ThingCard")
    assert repr(Project.tasks).startswith("prop(") and "item_type='Task'" in repr(Project.tasks)
