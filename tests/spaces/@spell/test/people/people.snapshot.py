from __future__ import annotations

from spell_core import core, Thing, List, prop


#############################################################################
# ## People, and what they keep about each other (epic `people-and-orgs`, P1)
#############################################################################
# Every thing has an `id`, built in:  nobody declares it.
# A property or list of a kind holds that kind's things, each saved in its own file;
# `it is saved inline` keeps a small thing inside what holds it instead.


class Person(Thing):
    name = prop(type="text")

    nickname = prop(type="text")

    emails = prop(item_type="text", init=lambda: List(item_type="text"))

    dates = prop(item_type="DatedEvent", init=lambda: List(item_type="DatedEvent"))


class DatedEvent(Thing):
    label = prop(type="text")

    day = prop(type="date")

    saved_inline = True


class Note(Thing):
    body = prop(type="text")


class Relationship(Thing):
    kind = prop(type="text")

    person = prop(type="Person")

    notes = prop(item_type="Note", init=lambda: List(item_type="Note"))


class FriendList(Thing):
    name = prop(type="text")

    relationships = prop(item_type="Relationship", init=lambda: List(item_type="Relationship"))


# Using them
owen = Person(id="owen", name="Owen")
matt = Person(id="matt", name="Matt")
matt.nickname = "Matty"

family = FriendList(name="family")
core.append(family.relationships, Relationship(kind="brother", person=matt))

print(owen.id)
for relationship in family.relationships:
    print(relationship.person.id)
