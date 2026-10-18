from __future__ import annotations

from spell_core import core, Thing, List, prop


#############################################################################
# ## People, and what they keep about each other (epic `people-and-orgs`, P1)
#############################################################################
# Every thing has an `id`, built in:  nobody declares it.
# A property or list of a kind holds that kind's things, each saved in its own file;
# `it is saved inline` keeps a small thing inside what holds it instead.


class Person(Thing):
    # - it has a name as text
    name = prop(type="text")

    # - it has a nickname as text
    nickname = prop(type="text")

    # - its "emails" is a list of text
    emails = prop(item_type="text", init=lambda: List(item_type="text"))

    # - its "dates" is a list of dated-events
    dates = prop(item_type="DatedEvent", init=lambda: List(item_type="DatedEvent"))


class DatedEvent(Thing):
    saved_inline = True

    # - it has a label as text
    label = prop(type="text")

    # - it has a day as a date
    day = prop(type="date")


class Note(Thing):
    # - it has a body as text
    body = prop(type="text")


class Relationship(Thing):
    # - it has a kind as text
    kind = prop(type="text")

    # - it has a person as a person
    person = prop(type="Person")

    # - its "notes" is a list of notes
    notes = prop(item_type="Note", init=lambda: List(item_type="Note"))


class FriendList(Thing):
    # - it has a name as text
    name = prop(type="text")

    # - its "relationships" is a list of relationships
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
