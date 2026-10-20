"""Spell's list words for any collection:  what compiled Python calls when Python has no word of its own.

```python
core.get_item_at(rank, 0)                 # "q", the first character of "queen"
core.position_of(Card.RANKS, card.rank)   # 11 for "queen", None if it isn't there
core.filter(words, lambda word: len(word) > 3)
```

- For a plain list, a tuple, text, a dict, or a value nobody knows the kind of:
  where the Python writer knows it has a spell list, it calls the list's own method, or Python's own word.
- A list's positions are its indexes, counted from 0, as Python counts (epic page python-target, P23);
  negative ones count from the end.
  - Spell code counting from 1 is turned into indexes as it compiles:  see `positions.py`.
- A dict is a collection too:  its keys are its positions.
- A result that's a list (`filter()`, `range_between()` ...) is of the collection's kind:
  a spell list's is a SCRATCH list of its class, owning nothing;  a plain list's, a plain list.
- A callback gets `(value, position, collection)`, the position an index, or as many of those as it takes:
  `lambda card: card.rank == "queen"` is called with the card alone.
- A collection that's `None` warns on `core.console`, and gives nothing, `False` or `0`, as the JavaScript core does.
- The twins of the JavaScript core's `collection-core.ts` and `collection-other.ts`, in snake_case:
  `core.getItemAt()` is `core.get_item_at()`.
"""

import inspect
import math
from collections.abc import Callable, Iterator, Mapping, MutableMapping, MutableSequence, Sequence, Sized
from typing import TYPE_CHECKING, Any

from spell_core.js_text import is_plain_number
from spell_core.kinds import is_a_number, is_js_truthy, is_same
from spell_core.lists import List
from spell_core.positions import zero_index_of
from spell_core.things import without_create

if TYPE_CHECKING:
    from spell_core.console import SpellConsole

# What a helper calls for each item:  `(value, position, collection)`, or as many of those as it takes.
Callback = Callable[..., Any]
# A position in a collection:  a number for a list, a key for a dict.
Key = Any


class CollectionMethods:
    """`core`'s list words:  `get_item_at()`, `filter()`, `range_between()`, `randomize()` ..."""

    # where a bad call warns:  `Core` sets it
    console: "SpellConsole"

    ################
    # ## Reading and writing one item
    ################

    def item_count_of(self, collection: object = None) -> int:
        """How many items `collection` holds:  a dict's, how many keys.  Anything else:  `0`."""
        if not self._is_defined(collection, "item_count_of"):
            return 0
        return len(collection) if isinstance(collection, Sized) else 0

    def is_empty(self, collection: object = None) -> bool:
        """Does `collection` hold nothing?  `the deck is empty`.

        - A number is empty when it's not-a-number.  `None` warns, and is empty.
        """
        if not self._is_defined(collection, "is_empty"):
            return True
        if is_plain_number(collection):
            return math.isnan(collection)  # type: ignore[arg-type]
        return self.item_count_of(collection) == 0

    def keys_of(self, collection: object = None) -> list[Key]:
        """`collection`'s indexes, from 0:  `[0, 1, 2]`.  A dict's keys, in order."""
        if not self._is_defined(collection, "keys_of"):
            return []
        if isinstance(collection, Mapping):
            return list(collection.keys())
        if isinstance(collection, Sequence):
            return list(range(len(collection)))
        return []

    def values_of(self, collection: object = None) -> list[Any]:
        """`collection`'s items, as a new plain list.  A dict's values, in order."""
        if not self._is_defined(collection, "values_of"):
            return []
        if isinstance(collection, Mapping):
            return list(collection.values())
        if isinstance(collection, Sequence):
            return list(collection)
        return []

    def get_item_at(self, collection: object = None, position: Key = None) -> Any:
        """The item at `position` of `collection`:  `item 1 of the list`, `the first character of the rank`.

        - A list, a tuple or text:  `position` is an index, from 0, negative from the end;  no item there:  `None`.
        - A dict:  `position` is its key.
        - A thing:  `position` is a property's name.
        """
        if not self._is_defined(collection, "get_item_at"):
            return None
        if isinstance(collection, List):
            return collection.get_item(position)
        if isinstance(collection, Mapping):
            return collection.get(position)
        if isinstance(collection, Sequence):
            if not is_plain_number(position):
                return None
            index = zero_index_of(position, len(collection))
            return collection[index] if index is not None and index < len(collection) else None
        return getattr(collection, position, None) if isinstance(position, str) else None

    def set_item_at(self, collection: object = None, position: Key = None, value: Any = None) -> Any:
        """SIDE EFFECT:  set the item at `position` of `collection` to `value`.  Returns `value`.

        - A list:  `position` is an index, from 0, negative from the end.
          - before the start:  nothing changes
          - past the end:  the list grows, the gap filled with `None`
        - A dict:  `position` is its key.
        - A thing:  `position` is a property's name.
        """
        if not self._is_defined(collection, "set_item_at"):
            return None
        if isinstance(collection, List):
            collection.set_item(position, value)
        elif isinstance(collection, MutableMapping):
            collection[position] = value
        elif isinstance(collection, MutableSequence):
            index = zero_index_of(position, len(collection)) if is_plain_number(position) else None
            if index is not None:
                collection.extend([None] * (index + 1 - len(collection)))
                collection[index] = value
        elif isinstance(position, str):
            setattr(collection, position, value)
        return value

    def add_at_position(self, collection: object = None, start: float | None = None, *things: Any) -> None:
        """SIDE EFFECT:  add `things` at index `start` (from 0) of a list, pushing what was there down, as `insert()`.

        - Negative counts from the end, as a Python slice does;  past the end is the end.
        - `add the card to the pile at position 2` is `core.add_at_position(pile, 1, card)`.
        """
        if not self._is_array_like(collection, "add_at_position"):
            return
        at = start if is_a_number(start) else 0
        if isinstance(collection, List):
            collection.add_at(at, *things)
            return
        index = int(at)  # type: ignore[arg-type]
        collection[index:index] = things  # type: ignore[index]

    def remove_item_at(self, collection: object = None, position: Key = None) -> None:
        """SIDE EFFECT:  take out the item at `position` of `collection`.  No such item:  nothing changes.

        - A list:  `position` is an index, from 0, negative from the end;  the items after it move up.
        - A dict:  `position` is the key taken out.
        - `remove the last card of the deck`.
        """
        if not self._is_defined(collection, "remove_item_at"):
            return
        if isinstance(collection, List):
            collection.remove_item(position)
        elif isinstance(collection, MutableMapping):
            collection.pop(position, None)
        elif isinstance(collection, MutableSequence) and is_plain_number(position):
            index = zero_index_of(position, len(collection))
            if index is not None and index < len(collection):
                del collection[index]

    def clear(self, collection: object = None) -> None:
        """SIDE EFFECT:  take every item out of `collection`.  `empty the list`."""
        if not self._is_defined(collection, "clear"):
            return
        if isinstance(collection, MutableSequence | MutableMapping):
            collection.clear()

    def get_iterator_for(self, collection: object = None) -> Iterator[tuple[Any, Key, object]]:
        """`(value, position, collection)` for each item of `collection`, positions from 0:  a dict's are its keys.

        - Reads each item as it gets to it, from the count when it started:
          a callback that changes the list sees the change.
        """
        if not self._is_defined(collection, "get_iterator_for"):
            return
        if isinstance(collection, Mapping):
            for key in list(collection.keys()):
                yield collection.get(key), key, collection
            return
        for position in range(self.item_count_of(collection)):
            yield self.get_item_at(collection, position), position, collection

    def position_of(self, collection: object = None, thing: object = None) -> Key:
        """The index of the first `thing` in `collection` (`is_same()`), from 0:  a dict's, its key.

        - `None` if it isn't there, never `-1`.
        - `the position of the card in the pile`;  `core.position_of(Card.RANKS, rank)`.
        """
        if not self._is_defined(collection, "position_of"):
            return None
        if isinstance(collection, List):
            return collection.position_of(thing)
        for value, position, _ in self.get_iterator_for(collection):
            if is_same(value, thing):
                return position
        return None

    ################
    # ## Looking inside
    ################

    def includes(self, collection: object = None, *values: object) -> bool:
        """Does `collection` hold EVERY one of `values`?  `the hand includes the queen`.

        - `False` for none.
        """
        if not self._is_defined(collection, "includes"):
            return False
        if not values:
            return False
        return all(self.position_of(collection, value) is not None for value in values)

    def includes_any(self, collection: object = None, *values: object) -> bool:
        """Does `collection` hold ANY of `values`?  `the rank is either jack or queen`."""
        if not self._is_defined(collection, "includes_any"):
            return False
        return any(self.position_of(collection, value) is not None for value in values)

    def starts_with(self, collection: object = None, thing: object = None) -> bool:
        """Is `thing` the first item of a list?  `False` for `None`."""
        if not self._is_array_like(collection, "starts_with"):
            return False
        return thing is not None and is_same(self.get_item_at(collection, 0), thing)

    def ends_with(self, collection: object = None, thing: object = None) -> bool:
        """Is `thing` the last item of a list?  `False` for `None`."""
        if not self._is_array_like(collection, "ends_with"):
            return False
        return thing is not None and is_same(self.get_item_at(collection, self.item_count_of(collection) - 1), thing)

    def all(self, collection: object = None, condition: Callback | None = None) -> bool:
        """Does `condition` say yes for every item?  No `condition`:  is every item yes (JavaScript's yes)?

        - NOTE:  `False` for an empty collection.
        """
        if not self._is_defined(collection, "all"):
            return False
        call = _callback(condition)
        found = False
        for value, position, coll in self.get_iterator_for(collection):
            found = True
            if not is_js_truthy(call(value, position, coll)):
                return False
        return found

    def any(self, collection: object = None, condition: Callback | None = None) -> bool:
        """Does `condition` say yes for any item?  `the deck has cards where ...`.

        - No `condition`:  is any item yes?
        """
        if not self._is_defined(collection, "any"):
            return False
        call = _callback(condition)
        return any(is_js_truthy(call(*entry)) for entry in self.get_iterator_for(collection))

    def smallest_of(self, collection: object = None) -> Any:
        """The smallest item, by `<`;  `None` for none.

        - Two items `<` can't compare:  the first stays.
        """
        return self._extreme_of(collection, "smallest_of", lambda next_value, best: next_value < best)

    def largest_of(self, collection: object = None) -> Any:
        """The largest item, by `>`;  `None` for none.

        - Two items `>` can't compare:  the first stays.
        """
        return self._extreme_of(collection, "largest_of", lambda next_value, best: next_value > best)

    ################
    # ## Adding and taking out
    ################

    def prepend(self, collection: object = None, *things: Any) -> None:
        """SIDE EFFECT:  add `things` at the front of a list, pushing the rest down."""
        self.add_at_position(collection, 0, *things)

    def append(self, collection: object = None, *things: Any) -> None:
        """SIDE EFFECT:  add `things` at the end of a list.

        - Exclusive:  one it holds already moves to the end.
        """
        self.add_at_position(collection, self.item_count_of(collection), *things)

    def add_before(self, collection: object = None, item: object = None, *things: Any) -> None:
        """SIDE EFFECT:  add `things` just before `item`, pushing it down.  `item` isn't there:  at the START."""
        if not self._is_array_like(collection, "add_before"):
            return
        position = self.position_of(collection, item)
        self.add_at_position(collection, 0 if position is None else position, *things)

    def add_after(self, collection: object = None, item: object = None, *things: Any) -> None:
        """SIDE EFFECT:  add `things` just after `item`.  `item` isn't there:  at the END."""
        if not self._is_array_like(collection, "add_after"):
            return
        position = self.position_of(collection, item)
        if position is None:
            self.append(collection, *things)
        else:
            self.add_at_position(collection, position + 1, *things)

    def set_items_of(self, collection: object = None, start: float | None = None, *values: Any) -> None:
        """SIDE EFFECT:  set the items from index `start` (from 0) on to `values`, replacing what's there."""
        if not self._is_array_like(collection, "set_items_of"):
            return
        if isinstance(collection, List):
            collection.set_items(start or 0, *values)
            return
        for offset, value in enumerate(values):
            self.set_item_at(collection, (start or 0) + offset, value)

    def reverse(self, collection: object = None) -> None:
        """SIDE EFFECT:  reverse a list's order, in place."""
        if not self._is_array_like(collection, "reverse"):
            return
        self.set_items_of(collection, 0, *reversed(self.values_of(collection)))

    def remove(self, collection: object = None, *things: object) -> None:
        """SIDE EFFECT:  take EVERY copy of each of `things` out of `collection`:  `remove the card from the pile`.

        - One it doesn't hold:  nothing.
        - A dict:  each key whose value it is.
        """
        if not self._is_defined(collection, "remove"):
            return
        for thing in things:
            position = self.position_of(collection, thing)
            while position is not None:
                self.remove_item_at(collection, position)
                position = self.position_of(collection, thing)

    def remove_items_at(self, collection: object = None, *positions: Key) -> None:
        """SIDE EFFECT:  take out the items at `positions` (indexes, from 0;  a dict's keys), last first."""
        if not self._is_defined(collection, "remove_items_at"):
            return
        if self.is_array_like(collection):
            positions = tuple(sorted(positions, reverse=True))
        for position in positions:
            self.remove_item_at(collection, position)

    def remove_where(self, collection: object = None, condition: Callback | None = None) -> None:
        """SIDE EFFECT:  take out each item `condition` says yes to.  `remove the cards from the deck where ...`."""
        if not self._is_defined(collection, "remove_where"):
            return
        to_remove = self.filter(collection, condition)
        if self.is_array_like(collection):
            self.remove(collection, *to_remove)
        else:
            self.remove_items_at(collection, *to_remove)

    ################
    # ## Ranges
    ################

    def range_between(self, collection: object = None, start: float | None = None, end: float | None = None) -> Any:
        """The items from index `start` up to, NOT including, `end`, of the collection's kind:  a slice's range.

        - Negative counts from the end;  no `start`:  from the first;  no `end`:  to the end.
        - A `start` further back than the first:  nothing.
        - Nothing in range:  an empty one.
        - `items 2 to 4 of my-list` is `range_between(my_list, 1, 4)`;  a spell list's own is `my_list[1:4]`.
        """
        if not self._is_array_like(collection, "range_between"):
            return []
        found = _range_between(start, end, self.item_count_of(collection))
        if not found:
            return self._empty_range_of(collection)
        results = self.new_thing_like(collection)
        for index in range(*found):
            self.append(results, self.get_item_at(collection, index))
        return results

    def remove_range_between(
        self, collection: object = None, start: float | None = None, end: float | None = None
    ) -> None:
        """SIDE EFFECT:  take out the items from index `start` up to, not including, `end`, as `range_between()`.

        - `remove items 2 to 4 of my-list` is `remove_range_between(my_list, 1, 4)`.
        - A spell list takes out each, last first, so it keeps its owners.
        """
        if not self._is_array_like(collection, "remove_range_between"):
            return
        found = _range_between(start, end, self.item_count_of(collection))
        if not found:
            return
        if isinstance(collection, List):
            for index in range(found[1] - 1, found[0] - 1, -1):
                collection.remove_item(index)
            return
        del collection[found[0] : found[1]]  # type: ignore[attr-defined]

    def range_starting_at(
        self, collection: object = None, start: float | None = None, count: float | None = None
    ) -> Any:
        """`count` items from index `start`, of the collection's kind:  `the top 2 cards of the deck`.

        - No `count`:  to the end.
        - A negative `start` counts from the end, the items still in order;  further back than the first:  nothing.
        """
        if not self._is_array_like(collection, "range_starting_at"):
            return []
        found = _range_starting_at(start, count, self.item_count_of(collection))
        if not found:
            return self._empty_range_of(collection)
        return self.range_between(collection, found[0], found[1])

    ################
    # ## Going through each item
    ################

    def for_each(self, collection: object = None, method: Callback | None = None) -> None:
        """Call `method` for each item:  `(value, position, collection)`, the position an index, from 0.

        - Spell code counting from 1 whose `method` takes the position:  see `with_spell_positions()`.
        """
        if not self._is_defined(collection, "for_each") or method is None:
            return
        call = _callback(method)
        for value, position, coll in self.get_iterator_for(collection):
            call(value, position, coll)

    def map(self, collection: object = None, method: Callback | None = None) -> Any:
        """What `method` answers for each item, in a new collection of the same kind, at the same positions."""
        if not self._is_defined(collection, "map"):
            return None
        results = self.new_thing_like(collection)
        if method is None:
            return results
        call = _callback(method)
        for value, position, coll in self.get_iterator_for(collection):
            self.set_item_at(results, position, call(value, position, coll))
        return results

    def filter(self, collection: object = None, condition: Callback | None = None) -> Any:
        """The items `condition` says yes to, in a new collection of the same kind.

        - No `condition`:  the yes ones.
        - A spell list's:  a scratch list of its class.
        - A dict's:  a dict of the keys kept.
        - `the words in the list where ...`.
        """
        if not self._is_defined(collection, "filter"):
            return None
        call = _callback(condition)
        results = self.new_thing_like(collection)
        is_list = self.is_array_like(collection)
        for value, position, coll in self.get_iterator_for(collection):
            if is_js_truthy(call(value, position, coll)):
                if is_list:
                    self.append(results, value)
                else:
                    self.set_item_at(results, position, value)
        return results

    ################
    # ## Copies and merges
    ################

    def new_thing_like(self, thing: object = None) -> Any:
        """A new, empty collection of `thing`'s kind, for a helper's result:  never one of the program's things.

        - A spell list:  a SCRATCH one of its class (`new_scratch()`).
        - A list, a tuple, text:  a plain list.
        - A dict:  a dict.
        """
        if not self._is_defined(thing, "new_thing_like"):
            return None
        if isinstance(thing, List):
            return self.new_scratch(type(thing))
        if isinstance(thing, Mapping):
            return {}
        if isinstance(thing, Sequence):
            return []
        try:
            return type(thing)()
        except TypeError:
            return {}

    def new_scratch(self, cls: Callable[[], Any]) -> Any:
        """A new `cls()`, for a helper's result:  a spell list owns nothing, even an exclusive one (`as_scratch()`).

        - A copy, not a new one:  its `create()` doesn't run (`without_create()`).
        """
        # never one of the program's things:  a place counts only those (`core.things_made()`)
        with self.quietly(), without_create():  # type: ignore[attr-defined]
            made = cls()
        if isinstance(made, List):
            made.as_scratch()
        return made

    def duplicate_list(self, collection: object = None, cls: Callable[[], Any] | None = None) -> Any:
        """A copy of a list, of its kind, or as `cls`:  `a copy of the piles`, `a copy of the pile as a hand`.

        - A spell list's copy is scratch, and owns nothing.
        - Not a list:  a warning, and `None`.
        """
        if not self._is_array_like(collection, "duplicate_list"):
            return None
        result = self.new_scratch(cls) if cls else self.new_thing_like(collection)
        return self.merge_lists_into(result, collection)

    def merge_lists_into(self, destination: object = None, *sources: object) -> Any:
        """SIDE EFFECT:  add every item of each of `sources` to the list `destination`, in turn.  Returns it."""
        if not self._is_array_like(destination, "merge_lists_into"):
            return None
        for source in sources:
            if source is not None:
                for value, _, _ in list(self.get_iterator_for(source)):
                    self.append(destination, value)
        return destination

    def merge_lists(self, collections: object = None, cls: Callable[[], Any] | None = None) -> Any:
        """All the items of a list of lists, in one new list:  `merge the piles`, `merge the piles as a pile`.

        - No `cls`:  of the first list's kind.
        - No first list:  a warning, and `None`.
        """
        if not self._is_array_like(collections, "merge_lists"):
            return None
        if cls:
            merged = self.new_scratch(cls)
        else:
            first = self.get_item_at(collections, 0)
            if not self._is_array_like(first, "merge_lists"):
                return None
            merged = self.new_thing_like(first)
        for value, _, _ in list(self.get_iterator_for(collections)):
            self.merge_lists_into(merged, value)
        return merged

    ################
    # ## Moving:  a list's guards
    ################

    def move(self, thing: object = None, collection: object = None) -> bool:
        """Move `thing` to `collection`, if the list holding it lets it go and `collection` takes it.

        - `move the card to the tableau`;  see `List.move_here()`.
        - Returns whether it moved.  Refused:  nothing changes.
        - A plain list has no guards:  `thing` is just added.
        """
        if not self._is_array_like(collection, "move"):
            return False
        move_here = getattr(collection, "move_here", None)
        if callable(move_here):
            return bool(move_here(thing))
        self.append(collection, thing)
        return True

    def can_take(self, collection: object = None, thing: object = None) -> bool:
        """Would `collection` take `thing`, moved there?  `the tableau can take it`.

        - A plain list takes anything.
        """
        if not self._is_array_like(collection, "can_take"):
            return False
        can_take = getattr(collection, "can_take", None)
        return bool(can_take(thing)) if callable(can_take) else True

    def can_give_up(self, collection: object = None, thing: object = None) -> bool:
        """Would `collection` give up `thing`, moved elsewhere?  A plain list gives up anything."""
        if not self._is_array_like(collection, "can_give_up"):
            return False
        can_give_up = getattr(collection, "can_give_up", None)
        return bool(can_give_up(thing)) if callable(can_give_up) else True

    ################
    # ## Random:  each from core's seeded numbers, so a seed deals the same cards as the JavaScript core
    ################

    def random_items_of(self, collection: object = None, count: float | None = None) -> Any:
        """Up to `count` items, picked at random, each at most once, of the collection's kind.

        - `3 random cards from the deck`.
        - No `count`:  all of them, shuffled.
        - Shuffles the POSITIONS, then reads the items:  the same random numbers as the JavaScript core.
        """
        if not self._is_defined(collection, "random_items_of"):
            return None
        if not is_a_number(count):
            count = self.item_count_of(collection)
        results = self.new_thing_like(collection)
        if count == 0:
            return results
        keys = self.shuffled(self.keys_of(collection))[: int(count)]  # type: ignore[attr-defined, arg-type]
        for key in keys:
            if self.is_array_like(collection):
                self.append(results, self.get_item_at(collection, key))
            else:
                self.set_item_at(results, key, self.get_item_at(collection, key))
        return results

    def randomize(self, collection: object = None) -> None:
        """SIDE EFFECT:  shuffle a list's items, in place:  `shuffle the deck`.

        - A dict:  nothing.
        """
        if not self._is_defined(collection, "randomize") or not self.is_array_like(collection):
            return
        self.set_items_of(collection, 0, *self.random_items_of(collection))

    ################
    # ## Checks, as the JavaScript core's `assert`
    ################

    def _is_defined(self, value: object, method: str) -> bool:
        """Is `value` something?  `None` or not-a-number:  a warning naming `method`, and `False`."""
        if value is None or (isinstance(value, float) and math.isnan(value)):
            self.console.warn(f"core.{method}():  expected a value, got", value)
            return False
        return True

    def _is_array_like(self, value: object, method: str) -> bool:
        """Is `value` a list or a tuple, not text or a dict?  Else a warning naming `method`, and `False`."""
        if isinstance(value, Sequence) and not isinstance(value, str | bytes):
            return True
        self.console.warn(f"core.{method}():  expected a list, got", value)
        return False

    def _empty_range_of(self, collection: object) -> Any:
        """A range holding nothing:  an empty scratch list of a spell list's class, else `[]`."""
        return self.new_thing_like(collection) if isinstance(collection, List) else []

    def _extreme_of(self, collection: object, method: str, beats: Callable[[Any, Any], bool]) -> Any:
        """The item every other doesn't `beat`:  `smallest_of()`, `largest_of()`."""
        if not self._is_defined(collection, method):
            return None
        values = self.values_of(collection)
        if not values:
            return None
        best = values[0]
        for value in values[1:]:
            try:
                if beats(value, best):
                    best = value
            except TypeError:  # JavaScript compares anything:  a pair Python can't is no change
                continue
        return best

    # from `TypeMethods` and `RandomMethods`, which `Core` mixes in beside us
    if TYPE_CHECKING:

        def is_array_like(self, thing: object) -> bool: ...
        def shuffled(self, items: Sequence[Any]) -> list[Any]: ...


def _callback(method: Callback | None) -> Callable[[Any, Key, object], Any]:
    """`method` as a callback taking `(value, position, collection)`, passing it only as many as it takes.

    - No `method`:  the value itself, for "is it yes?".
    - One Python can't read the signature of, e.g. `str`, gets the value alone.
    """
    if method is None:
        return lambda value, _position, _collection: value
    count = _positional_count(method)
    return lambda *entry: method(*entry[:count])


def _positional_count(method: Callback) -> int:
    """How many of `(value, position, collection)` `method` takes:  0 to 3."""
    try:
        parameters = inspect.signature(method).parameters.values()
    except (TypeError, ValueError):
        return 1
    count = 0
    for parameter in parameters:
        if parameter.kind is inspect.Parameter.VAR_POSITIONAL:
            return 3
        if parameter.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD):
            count += 1
    return min(count, 3)


def _range_between(start: object, end: object, item_count: int) -> tuple[int, int] | None:
    """`(start, end)` of a range of indexes, as a slice reads them, `end` not included:  `None` when it holds nothing.

    - `start`:
      - none:  the first
      - negative:  from the end;  further back than the first, e.g. -7 of 6 items:  `None`
    - `end`:  none, or past the end:  the end;  negative:  from the end.
    - Not a whole number:  its whole part.
    """
    if item_count == 0:
        return None
    if is_a_number(start) and start < -item_count:  # type: ignore[operator]
        return None
    first = int(_from_end(start, item_count)) if is_a_number(start) else 0
    last = int(min(max(_from_end(end, item_count), 0), item_count)) if is_a_number(end) else item_count
    return (first, last) if first < last else None


def _range_starting_at(start: object, count: object, item_count: int) -> tuple[int, int] | None:
    """`(start, end)` of `count` items from index `start`, `end` not included:  `None` when it holds nothing.

    - A negative `start` counts from the end;  further back than the first, or past the end:  `None`.
    """
    if is_a_number(start) and (start < -item_count or start >= item_count):  # type: ignore[operator]
        return None
    first = _from_end(start, item_count) if is_a_number(start) else 0
    last = first + count if is_a_number(count) else item_count  # type: ignore[operator]
    return _range_between(first, last, item_count)


def _from_end(index: Any, item_count: int) -> Any:
    """`index` counted from the front:  a negative one counts from the end of `item_count` items, `-1` the last."""
    return item_count + index if index < 0 else index
