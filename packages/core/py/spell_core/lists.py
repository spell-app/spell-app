"""Spell's lists:  what `a deck is a list of cards` compiles to, `class Deck(List)`, a real Python sequence.

```python
from spell_core import List, Thing

class Deck(List):
    item_type = Card

deck = Deck()
deck.append(card)
len(deck), deck[0], card in deck   # Python's own words work
deck.first_item, deck.position_of(card)   # and spell's
```

- Imports `core` only inside functions:  `core.py` imports this module, to build `core`.
- The twin of the JavaScript core's `List` (`classes/List.ts`).
"""

import weakref
from collections.abc import Callable, Iterable, Iterator, MutableSequence
from reprlib import recursive_repr
from typing import Any, ClassVar, Self, SupportsIndex, overload

from spell_core.js_text import is_plain_number, js_string
from spell_core.kinds import is_same
from spell_core.positions import StartAt, from_start_at, to_start_at, zero_index_of
from spell_core.things import ITEMS_KEY, SpellObject, program_core, to_json_value

# What a list method calls for each item, e.g. `filter()`'s condition:  `(value, position, list)`.
# - It may take fewer:  `lambda card: card.rank == "queen"` is called with the card alone.
ListCallback = Callable[..., Any]


class List(SpellObject, MutableSequence[Any]):
    """A spell list:  what `a deck is a list of cards` compiles to, `class Deck(List)`.

    It's a real Python sequence (a `MutableSequence`), so Python's own words work on it:
    `len(deck)`, `for card in deck`, `card in deck`, `deck[0]`, `deck.append(card)`,
    `deck.insert(0, card)`, `del deck[0]`, `if not deck:`.

    Where it differs from a Python `list`:
    - `deck[n]` past the end, or before the start, is `None`, NOT an `IndexError`:
      spell reads a missing item as nothing (plan doc python-target, Q15).
      - `deck.pop()` on an empty deck is `None` too.
    - `deck[n] = card` past the end grows the list, the gap filled with `None`, as JavaScript's arrays do.
    - `deck[2:5]` is a SCRATCH list of the same class, owning nothing (see "Exclusive lists" below):
      a `Pile` sliced is a `Pile`, and its cards stay in their pile.
    - `deck.remove(card)` takes out EVERY copy of each of the cards it's given,
      and does nothing for one it doesn't hold:  Python's raises `ValueError`.
    - `card in deck`, `deck.index(card)`, `deck.remove(card)` look for the SAME item (`is_same()`):
      text and numbers by value, anything else only as itself;  `True` is never `1`.
    - A change made by spell's words returns the list, so calls chain:  `pile.append(card).reverse()`.
    - Equality is identity:  two decks are two decks, however alike.

    Spell's own words, the twins of the JavaScript core's `List` methods, in snake_case:
    - positions count from 1, as in spell, or from `start_at=0` for a project that counts from 0
      (`get_item()`, `position_of()` ...);  negative ones count from the end
    - a list result (`filter()`, `between()` ...) is SCRATCH, of our class, and owns nothing
    - a callback gets `(value, position, list)`, or as many of those as it takes

    Exclusive lists (`exclusive = True`, from `a card belongs to one pile`):
    - an item is in at most ONE list of a FAMILY:  the exclusive class and its sub-classes, every `Pile`
    - adding an item takes it out of the list of its family holding it;  adding one we hold moves it
    - removing it leaves it with no owner
    - `Pile.owner_of(card)` is the pile holding it:  what `the pile of a card` compiles to
    - only things can be owned:  a number or text is just held
    - every change to the items goes through `_write_items()`, which keeps the owners

    Guards, what a list takes and gives up when something MOVES:
    - `can_take()` / `can_give_up()`, yes unless a sub-class says otherwise
      (`a tableau can take a card if: ...` compiles to `def can_take(self, card)`)
    - only a move asks (`move_here()`):  `append`, `remove` and `clear` never do,
      e.g. dealing, or gathering every card back

    Properties and set-up as a thing's (see `SpellObject`):  `Deck(cards, name="spare")`.
    A name it doesn't declare reads as `None`, as spell reads a missing property.
    """

    # `True` on an exclusive list class, e.g. `Pile`:  the root of its family.  Sub-classes inherit it.
    # - Set it before making a list of the family:  what a list holds already has no owner.
    exclusive: ClassVar[bool] = False
    # The class of what it holds, e.g. `Card` for `a deck is a list of cards`:  for a reader, nothing checks it.
    item_type: ClassVar[type | None] = None

    @classmethod
    def owner_of(cls, item: object) -> Self | None:
        """The list of our family holding `item`:  `Pile.owner_of(card)`, what `the pile of a card` compiles to.

        - `None` if we're not exclusive, nothing holds it, or it can't be owned (a number, text).
        """
        family = ListFamily.of(cls)
        return family.owner_of(item) if family else None  # type: ignore[return-value]

    def __init__(self, items: Iterable[object] | None = None, /, **props: object) -> None:
        """A list holding `items`, if any, with keyword `props`, then its `create()`:  `Deck()`, `Deck(cards)`."""
        self._items: list[object] = []
        self._scratch = False
        if items is not None:
            self._write_items(list(items))
        super().__init__(**props)

    @property
    def items(self) -> list[object]:
        """Our items, as a new plain list:  changing it doesn't change us."""
        return list(self._items)

    @items.setter
    def items(self, items: Iterable[object]) -> None:
        """SIDE EFFECT:  hold `items` instead of what we hold now, keeping the owners (`_write_items()`)."""
        self._write_items(list(items))

    def as_scratch(self) -> Self:
        """SIDE EFFECT:  we own nothing, even if we're exclusive.  Returns us.

        - For a SCRATCH result, e.g. what `filter()`, `map()` or a copy make:  filtering a pile mustn't take its cards.
        - Call it before adding anything:  what we hold already stays owned.
        """
        self._scratch = True
        return self

    ################
    # ## Python's own words
    ################

    def __len__(self) -> int:
        """How many items we hold:  `len(deck)`."""
        return len(self._items)

    def __iter__(self) -> Iterator[Any]:
        """Our items, in order:  `for card in deck`.

        - As they were when the loop started:  a loop moving cards out of the pile still sees each one.
          (Every change writes a new list of items, so the loop's stays as it was.)
        """
        return iter(self._items)

    def __reversed__(self) -> Iterator[Any]:
        """Our items, last first:  `reversed(deck)`."""
        return reversed(self._items)

    def __contains__(self, item: object) -> bool:
        """Do we hold `item`?  `card in deck`, by `is_same()`."""
        return any(is_same(it, item) for it in self._items)

    @overload
    def __getitem__(self, index: int) -> Any: ...
    @overload
    def __getitem__(self, index: slice) -> Self: ...
    def __getitem__(self, index: int | slice) -> Any:
        """`deck[0]`:  Python's index, from 0, negatives from the end.

        - Out of range:  `None`, never `IndexError`.
        - `deck[2:5]`:  a scratch list of our class, owning nothing.
        - throws `TypeError` for an index that's not a whole number or a slice, as Python's lists do.
        """
        if isinstance(index, slice):
            return self._scratch_of(self._items[index])
        return self.get_item(_index_number(index, type(self)), start_at=0)

    def __setitem__(self, index: int | slice, value: Any) -> None:
        """`deck[0] = card`:  replace the item at Python's index.

        - Before the start:  nothing changes.
        - Past the end grows the list, the gap filled with `None`.
        - `deck[1:3] = cards`:  as a Python list's slice, its items kept by their owners' rules.
        """
        if isinstance(index, slice):
            items = list(self._items)
            items[index] = list(value)
            self._write_items(items)
            return
        self.set_item(_index_number(index, type(self)), value, start_at=0)

    def __delitem__(self, index: int | slice) -> None:
        """`del deck[0]`:  take out the item at Python's index.  No such item:  nothing changes."""
        if isinstance(index, slice):
            items = list(self._items)
            del items[index]
            self._write_items(items)
            return
        self.remove_item(_index_number(index, type(self)), start_at=0)

    def insert(self, index: int, value: Any) -> None:
        """`deck.insert(0, card)`:  add `value` before Python's index `index`, as a Python list's `insert()`.

        - Past the end:  at the end.  Before the start:  at the start.
        - Exclusive:  one we hold already MOVES there.
        """
        count = len(self._items)
        at = max(count + index, 0) if index < 0 else min(index, count)
        self._insert_at_index(at, (value,))

    def index(self, value: Any, start: int = 0, stop: int | None = None) -> int:
        """Python's index of the first `value` (`is_same()`), from 0.

        - throws `ValueError` if we don't hold it, as Python's lists do.
          Spell's `position_of()` gives `None` instead.
        """
        for index in range(*slice(start, stop).indices(len(self._items))):
            if is_same(self._items[index], value):
                return index
        raise ValueError(f"{js_string(value)} is not in the {type(self).__name__}")

    def count(self, value: Any) -> int:
        """How many times we hold `value` (`is_same()`)."""
        return sum(1 for it in self._items if is_same(it, value))

    def append(self, *things: Any) -> Self:  # type: ignore[override]
        """SIDE EFFECT:  add `things` at the end.  Returns us, so calls chain.

        - `deck.append(card)`, as Python's;  or several at once, `deck.append(card, other)`.
        - Exclusive:  one we hold already MOVES to the end.
        """
        return self.add_at(len(self._items) + 1, *things)

    def remove(self, *things: Any) -> Self:  # type: ignore[override]
        """SIDE EFFECT:  take out EVERY copy of each of `things`.  Returns us.

        - NOTE:  one we don't hold does nothing, where a Python list's `remove()` raises `ValueError`:
          spell's `remove the card from the pile`.
        - See `core.remove()`.
        """
        program_core().remove(self, *things)
        return self

    def reverse(self) -> Self:
        """SIDE EFFECT:  reverse our order, in place.  Returns us, where Python's returns `None`."""
        program_core().reverse(self)
        return self

    def clear(self) -> None:
        """SIDE EFFECT:  hold nothing.  What we held has no owner now."""
        self._write_items([])

    @recursive_repr("")
    def __repr__(self) -> str:
        """Our items, joined by `", "`, as JavaScript's `toString()`:  `A♣️, A♦️, A♥️`.

        - `None` items are left empty.  So `f"deck: {card_names}"` reads as spell's.
        """
        return ", ".join("" if item is None else js_string(item) for item in self._items)

    __str__ = __repr__

    ################
    # ## Positions
    ################

    def get_item(self, position: float, start_at: StartAt = 1) -> Any:
        """The item at `position`, from 1 (or `start_at`);  negative from the end.  `None` for none.

        - `item 2 of the deck`, `the last card of the deck`.
        """
        if not is_plain_number(position):
            return None
        index = zero_index_of(from_start_at(position, start_at), len(self._items))
        if index is None or index >= len(self._items):
            return None
        return self._items[index]

    def set_item(self, position: float, value: Any, start_at: StartAt = 1) -> None:
        """SIDE EFFECT:  replace the item at `position`, from 1 (or `start_at`);  negative from the end.

        - No such position (`0`, before the start):  nothing changes.
        - Past the end grows the list, the gap filled with `None`.
        - NOTE:  an exclusive list may hold an item twice for a moment, e.g. while setting each position in turn.
        """
        if not is_plain_number(position):
            return
        index = zero_index_of(from_start_at(position, start_at), len(self._items))
        if index is None:
            return
        items = list(self._items)
        items.extend([None] * (index + 1 - len(items)))
        items[index] = value
        self._write_items(items)

    def remove_item(self, position: float, start_at: StartAt = 1) -> None:
        """SIDE EFFECT:  take out the item at `position`, from 1 (or `start_at`).  No such item:  nothing changes."""
        if not is_plain_number(position):
            return
        index = zero_index_of(from_start_at(position, start_at), len(self._items))
        if index is None or index >= len(self._items):
            return
        self._write_items(self._items[:index] + self._items[index + 1 :])

    def position_of(self, thing: object, start_at: StartAt = 1) -> int | None:
        """Where our first `thing` is (`is_same()`), from 1 (or `start_at`).

        - `None` if we don't hold it, never `-1`.
        """
        for index, item in enumerate(self._items):
            if is_same(item, thing):
                return to_start_at(index + 1, start_at)
        return None

    def add_at(self, position: float, *things: Any) -> Self:
        """SIDE EFFECT:  add `things` at `position`, from 1, pushing what was there down.  Returns us.

        - `add the card to the pile at position 2`.
        - `0` is the front, as is anything before the start;  past the end is the end.
        - Exclusive:  one we hold already MOVES there -- we hold each item once.
        """
        at = 0 if position == 0 else zero_index_of(position, len(self._items))
        self._insert_at_index(at or 0, things)
        return self

    def set_items(self, position: float, *values: Any) -> Self:
        """SIDE EFFECT:  set the items from `position` on to `values`, replacing what's there.  Returns us.

        - Each as `set_item()` would, in turn, then written once.
        """
        items = list(self._items)
        for offset, value in enumerate(values):
            index = zero_index_of(position + offset, len(items))
            if index is None:
                continue
            items.extend([None] * (index + 1 - len(items)))
            items[index] = value
        self._write_items(items)
        return self

    ################
    # ## Spell's list words:  each calls its `core` twin, so there's one copy of what it does
    ################

    @property
    def first_item(self) -> Any:
        """Our first item, `None` if we're empty:  `the first card of the deck`."""
        return self.get_item(1)

    @property
    def last_item(self) -> Any:
        """Our last item, `None` if we're empty:  `the last card of the deck`."""
        return self.get_item(-1)

    @property
    def is_empty(self) -> bool:
        """Do we hold nothing?  `the deck is empty`."""
        return not self._items

    @property
    def largest(self) -> Any:
        """Our largest item, by `>`;  `None` if we're empty.  `the largest of the scores`."""
        return program_core().largest_of(self)

    @property
    def smallest(self) -> Any:
        """Our smallest item, by `<`;  `None` if we're empty.  `the smallest of the scores`."""
        return program_core().smallest_of(self)

    def random_item(self) -> Any:
        """One of our items, picked at random from core's seeded numbers;  `None` if we're empty."""
        return program_core().random_item_of(self)

    def random_items(self, count: float | None = None) -> Self:
        """Up to `count` of our items, picked at random, each at most once:  `3 random cards from the deck`.

        - A scratch list of our class.
        - No `count`:  all of them, shuffled.
        """
        return program_core().random_items_of(self, count)  # type: ignore[no-any-return]

    def randomize(self) -> Self:
        """SIDE EFFECT:  shuffle our items, in place, from core's seeded numbers:  `shuffle the deck`.

        - Returns us.
        """
        program_core().randomize(self)
        return self

    def includes(self, *values: object) -> bool:
        """Do we hold EVERY one of `values`?  `the hand includes the queen`.

        - `False` for none.
        """
        return program_core().includes(self, *values)

    def includes_any(self, *values: object) -> bool:
        """Do we hold ANY of `values`?"""
        return program_core().includes_any(self, *values)

    def all(self, condition: ListCallback | None = None) -> bool:
        """Does `condition` say yes for every item?  No `condition`:  is every item yes?

        - NOTE:  `False` if we're empty.
        """
        return program_core().all(self, condition)

    def any(self, condition: ListCallback | None = None) -> bool:
        """Does `condition` say yes for any item?  No `condition`:  is any item yes?"""
        return program_core().any(self, condition)

    def filter(self, condition: ListCallback | None = None) -> Self:
        """The items `condition` says yes to, in a scratch list of our class.

        - No `condition`:  the ones that are yes.
        - `the cards in the deck where the rank of the card is queen`.
        """
        return program_core().filter(self, condition)  # type: ignore[no-any-return]

    def map(self, callback: ListCallback, start_at: StartAt = 1) -> "List":
        """What `callback` answers for each item, in a scratch list of our class.

        - `start_at`:  where the position `callback` gets counts from, 1 or 0.
        """
        return program_core().map(self, callback, start_at)  # type: ignore[no-any-return]

    def for_each(self, callback: ListCallback, start_at: StartAt = 1) -> None:
        """Call `callback` for each item, in order.  `for card in deck:` is Python's own, and better."""
        program_core().for_each(self, callback, start_at)

    def remove_where(self, condition: ListCallback) -> Self:
        """SIDE EFFECT:  take out each item `condition` says yes to.  Returns us."""
        program_core().remove_where(self, condition)
        return self

    def remove_between(self, start: float, end: float, start_at: StartAt = 1) -> Self:
        """SIDE EFFECT:  take out the items from position `start` to `end`, both included.  Returns us."""
        program_core().remove_range_between(self, start, end, start_at)
        return self

    def prepend(self, *things: Any) -> Self:
        """SIDE EFFECT:  add `things` at the start, pushing the rest down.  Returns us."""
        program_core().prepend(self, *things)
        return self

    def add_before(self, item: object, *things: Any) -> Self:
        """SIDE EFFECT:  add `things` just before `item`.  Returns us.

        - `item` isn't here:  at the START.
        """
        program_core().add_before(self, item, *things)
        return self

    def add_after(self, item: object, *things: Any) -> Self:
        """SIDE EFFECT:  add `things` just after `item`.  Returns us.

        - `item` isn't here:  at the END.
        """
        program_core().add_after(self, item, *things)
        return self

    def append_all(self, *lists: Iterable[Any]) -> Self:
        """SIDE EFFECT:  add every item of each of `lists`, in turn.  Returns us."""
        program_core().merge_lists_into(self, *lists)
        return self

    def starting_from(self, position: float, start_at: StartAt = 1) -> Self:
        """The items from `position` to the end, in a scratch list of our class.  `-2`:  the last two."""
        return program_core().range_starting_at(self, position, None, start_at)  # type: ignore[no-any-return]

    def starting_with(self, item: object) -> Self:
        """The items from `item` to the end, in a scratch list of our class.

        - NOTE:  `item` isn't here:  ALL of them, as compiled spell does it.
        """
        core = program_core()
        return core.range_starting_at(self, core.position_of(self, item))  # type: ignore[no-any-return]

    def between(self, start: float, end: float, start_at: StartAt = 1) -> Self:
        """The items from position `start` to `end`, both included:  `items 1 to 2 of the deck`.

        - A scratch list of our class.
        - Out of range:  an empty one.
        """
        return program_core().range_between(self, start, end, start_at)  # type: ignore[no-any-return]

    def starts_with(self, thing: object) -> bool:
        """Is `thing` our first item?  `False` for `None`."""
        return program_core().starts_with(self, thing)

    def ends_with(self, thing: object) -> bool:
        """Is `thing` our last item?  `False` for `None`."""
        return program_core().ends_with(self, thing)

    def clone(self) -> Self:
        """A scratch copy of us, of our class:  `a copy of the discards`."""
        return program_core().duplicate_list(self)  # type: ignore[no-any-return]

    def clone_as[Other: "List"](self, cls: type[Other]) -> Other:
        """A scratch copy of us, as `cls`:  `a copy of the discards as a hand`."""
        return program_core().duplicate_list(self, cls)  # type: ignore[no-any-return]

    def merged(self, cls: "type[List] | None" = None) -> Any:
        """We're a list of lists:  all their items, in one scratch list, `merge the piles`.

        - Of class `cls`:  `merge the piles as a pile`.
        - No `cls`:  of our first list's class;  `None` if we're empty.
        """
        return program_core().merge_lists(self, cls)

    ################
    # ## Guards
    ################

    def can_take(self, item: object) -> bool:
        """Will we take `item`, moved here?  Yes, unless a sub-class says otherwise.

        - `a tableau can take a card if: ...` compiles to `def can_take(self, card)` in `Tableau`.
        - Only a move asks (`move_here()`):  `append()` never does, e.g. dealing.
        """
        return True

    def can_give_up(self, item: object) -> bool:
        """Will we give up `item`, moved to another list of our family?  Yes, unless a sub-class says otherwise.

        - `a foundation can never let go of a card` compiles to `def can_give_up(self, card): return False`.
        - Only a move asks (`move_here()`):  `remove()` and `clear()` never do, e.g. gathering every card back.
        """
        return True

    def move_here(self, item: Any) -> bool:
        """Move `item` here, if the list holding it lets it go and we take it:  `move the card to the tableau`.

        - Returns whether it moved.  Refused:  nothing changes.
        - The list holding it:  the one of our family, if we're exclusive.  Else none is asked:  just `can_take()`.
        - Then added, as `append()`:  its owner changes ONCE.
        """
        family = self._family
        owner = family.owner_of(item) if family else None
        if owner is not None and not owner.can_give_up(item):
            return False
        if not self.can_take(item):
            return False
        self.append(item)
        return True

    def to_json(self) -> dict[str, object]:
        """Our JSON:  our class's name as `"@type"`, our own properties, then our items under `"@items"`.

        ```python
        {"@type": "Pile", "name": "stock", "@items": [{"@type": "Card", "rank": "ace"}]}
        ```

        - Each item as its own JSON.  Reads back as what it was:  `core.from_json()`.
        """
        return {**super().to_json(), ITEMS_KEY: [to_json_value(item) for item in self._items]}

    ################
    # ## Exclusive lists
    ################

    @property
    def _family(self) -> "ListFamily | None":
        """Our family's owners, if we're an exclusive list that isn't scratch."""
        if self._scratch:
            return None
        return ListFamily.of(type(self))

    def _scratch_of(self, items: list[object]) -> Self:
        """A new scratch list of our class, holding `items`:  what a slice gives."""
        scratch: Self = program_core().new_scratch(type(self))
        scratch._write_items(items)
        return scratch

    def _insert_at_index(self, index: int, things: Iterable[object]) -> None:
        """SIDE EFFECT:  put `things` before Python's index `index`.

        - Exclusive:  one we hold already MOVES there.
        """
        things = list(things)
        items = list(self._items)
        if self._family:
            moving = {id(thing) for thing in things if is_ownable(thing)}
            index -= sum(1 for item in items[:index] if id(item) in moving)
            items = [item for item in items if id(item) not in moving]
        items[index:index] = things
        self._write_items(items)

    def _write_items(self, next_items: list[object]) -> None:
        """Make `next_items` our items:  EVERY change to them comes here, so an exclusive list keeps its owners.

        - NEVER changes a list of items in place:  each change writes a new one,
          so a loop over the old one (`__iter__()`) sees what it started with.
        - An item going out, no longer anywhere in `next_items`, has no owner.
        - An item coming in is ours, THEN leaves the list of our family that held it.
        - SIDE EFFECT:  the list it left changes too.
        """
        family = self._family
        previous = self._items
        self._items = next_items
        if family is None:
            return
        kept = {id(item) for item in next_items}
        for item in previous:
            if id(item) not in kept and family.owner_of(item) is self:
                family.set_owner(item, None)
        for item in next_items:
            owner = family.owner_of(item)
            if owner is self:
                continue
            family.set_owner(item, self)
            if owner is not None:
                owner._release(item)

    def _release(self, item: object) -> None:
        """SIDE EFFECT:  `item` leaves us, wherever it is:  it's joining another list of our family."""
        self._write_items([it for it in self._items if it is not item])


class ListFamily:
    """Who holds each item, for ONE family of exclusive lists, e.g. every `Pile`:  see `List`.

    - Each item is found by its identity, so a thing with an `==` of its own is still one item.
    - Item and list are both held WEAKLY:  this record never keeps either alive.
      - An item that's gone is forgotten.
      - NOTE:  a list nothing else holds is gone too, and its items have no owner then,
        where JavaScript keeps a pile alive while one of its cards is.
        Holding them strongly would keep every pile, and every card in it, for as long as the program runs.
    """

    def __init__(self) -> None:
        """A family where nothing holds anything yet."""
        # each item's list, by the item's `id()`:  weak links to the item, so a gone one is dropped, and to its list
        self._owners: dict[int, tuple[weakref.ref[object], weakref.ref[List]]] = {}

    @staticmethod
    def of(list_class: type[List]) -> "ListFamily | None":
        """The family of `list_class`, if it's exclusive:  rooted at the HIGHEST class up its chain that says so."""
        if not list_class.exclusive:
            return None
        root: type[List] = list_class
        for ancestor in list_class.__mro__:
            if ancestor is List:
                break
            if vars(ancestor).get("exclusive"):
                root = ancestor
        family = _FAMILIES.get(root)
        if family is None:
            family = _FAMILIES[root] = ListFamily()
        return family

    def owner_of(self, item: object) -> List | None:
        """The list holding `item`, if any."""
        entry = self._owners.get(id(item))
        if entry is None or entry[0]() is not item:
            return None
        return entry[1]()

    def set_owner(self, item: object, owner: List | None) -> None:
        """SIDE EFFECT:  `owner` holds `item` now;  `None`:  nothing does.

        - An item that can't be owned is skipped.
        """
        if not is_ownable(item):
            return
        key = id(item)
        if owner is None:
            self._owners.pop(key, None)
            return
        entry = self._owners.get(key)
        if entry is not None and entry[0]() is item:
            self._owners[key] = (entry[0], weakref.ref(owner))
            return
        self._owners[key] = (weakref.ref(item, lambda link: self._forget(key, link)), weakref.ref(owner))

    def _forget(self, key: int, link: "weakref.ref[object]") -> None:
        """An item we held is gone:  drop it, unless its `id()` belongs to a newer item already."""
        entry = self._owners.get(key)
        if entry is not None and entry[0] is link:
            del self._owners[key]


# Each exclusive family's owners, by its root class.
_FAMILIES: "weakref.WeakKeyDictionary[type[List], ListFamily]" = weakref.WeakKeyDictionary()


def is_ownable(item: object) -> bool:
    """Can a list own `item`:  a thing, or another object Python can link to weakly?  A number or text can't be."""
    try:
        weakref.ref(item)
    except TypeError:
        return False
    return True


def _index_number(index: object, list_class: type) -> int | float:
    """`index` as a number for `deck[index]`:  an int, or a float (`2.0` is `2`).

    - throws `TypeError` for anything else, as Python's lists do.
    """
    if is_plain_number(index):
        return index  # type: ignore[return-value]
    if isinstance(index, SupportsIndex):
        return index.__index__()
    raise TypeError(f"{list_class.__name__} indices must be integers or slices, not {type(index).__name__}")
