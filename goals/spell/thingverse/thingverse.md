# 11 · thingverse -- notes for agents

Standard libraries of everyday ideas (people, bank accounts, invoices, calendars) that teach spell new words.

- **Page for people:** [thingverse.html](thingverse.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **The idea** (2017 talk):  "concept libraries" like *Bank Account* that extend the language when you import
  them:  a person's vocabulary, not a programmer's API.
- **Today:**  one library, `@library/cards` (cards, decks, piles, jokers).  Imports work through compiled
  JavaScript that carries the phrases it declares.
- **Foundations first:**  dates and times, money, maps, saving data, and the type work in
  [syntax](../syntax/syntax.html).

### Today

- **Library:**  `packages/spell/projects/system/library/cards`;  used by `Solitaire-import`.
- **How imports work:**  compiled JavaScript with `/*! SPELL: DECLARES {...} */` comments, so a project learns
  another's phrases without its source.
- **Known bug:**  importing a project also runs its top-level code.
- **The runtime lacks:**  date and time, money, map and record types;  saving and loading;  networking.
- **Old sketches** (background only):  products, prices and discounts;  an invoice with "the current user", an
  address book and email;  dates like "30 days from now";  a *Registered* aspect that teaches
  `the person named Alice`.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Design dates, times and money

- **Status:** proposed
- **What:** phrases first, then runtime types

### W2 · Fix imports running top-level code

- **Status:** proposed
- **What:** importing Solitaire's cards also runs Solitaire

## Open questions (ask, don't decide)

- **Q1 · Which three things first?** -- follows from audience/Q1
- **Q2 · Where does data live?** -- files in the project?  a local database?  the cloud?
- **Q3 · How do libraries change over time?** -- versions, and what happens to spells that use an old one
- **Q4 · Is "thingverse" the right name?** -- Thingiverse (3D models) is one letter away

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Foundations** -- dates and times, money, percentages, maps, in the runtime
  - **G2 · Three starter things** -- chosen for the first person;  e.g. a person, an event, an amount of money
  - **G3 · Things that save** -- a project's things survive closing the app
- **2027:**
  - **G4 · A catalog** -- browse libraries and their phrase books
  - **G5 · Contacts, invoices, calendars** -- the small-business set
  - **G6 · Data in and out** -- CSV, JSON, maybe spreadsheets
- **Someday:**
  - **G7 · Libraries from the community** -- the talk's marketplace
  - **G8 · Services** -- email, maps, payments

## Risks to keep in mind

- **R1 · The Thingiverse name clash** -- confusing at best;  a trademark question at worst
- **R2 · More phrases, more ambiguity** -- every library adds words that can collide
- **R3 · Saving data is a big design** -- formats, changes to a thing's shape, sync

## Pointers

- `packages/spell/projects/system/library/cards`, `examples/Solitaire-import`
- `packages/core/src` -- the runtime's types and collections
- `/Users/owen/www/spell-app/_thoughts/aspects/Registered.md` -- keyed registries that add phrases
- `packages/spell/thoughts/non-working-examples/product/` -- older commerce sketches
