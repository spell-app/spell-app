from __future__ import annotations

from spell_core import core, Thing, List, prop


########################################################################
# ## Thing references:  one thing by its type and its name, or its place
########################################################################
# epic `drawable-thing` P19:  `tableau T1` is the tableau named T1;  `the first tableau` the first one made.


class Pile(List):
    item_type = Thing

    # a pile has a name as text
    name = prop(type="text")


class Tableau(Pile):
    pass


class Foundation(Pile):
    pass


class DiscardPile(Pile):
    pass


# two tableaus named T1:  a reference to T1 below warns, and finds the first
first_t1 = Tableau(name="T1")
second_t1 = Tableau(name="T1")
t2 = Tableau(name="T2")

# foundations, each its own name:  no warning
it = Foundation(name="clubs")
it_2 = Foundation(name="hearts")

# two discard piles named "spare", but nothing names one by its name:  no warning
spare = DiscardPile(name="spare")
other_spare = DiscardPile(name="spare")

# names worked out as the program runs are never counted
for number in range(3, 5):
    it_3 = Tableau(name=f"T{number}")

# by name
print(getattr(core.thing_named(Tableau, "T1"), "name", None))
print(getattr(core.thing_named(Tableau, "T2"), "name", None))
print(getattr(core.thing_named(Foundation, "hearts"), "name", None))
# a tableau is a pile:  `pile T2` finds it
print(getattr(core.thing_named(Pile, "T2"), "name", None))

# by place
print(getattr(core.thing_at_place(Tableau, 1), "name", None))
print(getattr(core.thing_at_place(Foundation, 2), "name", None))
print(getattr(core.thing_at_place(Tableau, -1), "name", None))
