# 1 · motivation -- notes for agents

Why spell exists, and how it could change who gets to make software.

- **Page for people:** [motivation.html](motivation.html) -- the source of truth for goals, questions and decisions.
- **Status:** in dialog -- being talked through with Owen.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- Spell picks up HyperCard's promise for the web: people who don't call themselves programmers can **read**, change
  and make real software, in plain English.
- Owen's 2017 talk says it best: a "non-programmer programming environment" where a layperson can write an app, or
  customize and mash up apps for their own use.
- What's new since 2017: AI writes code now.  That makes code a person can *read and check* worth more, not less
  (decided:  [D1](motivation.html#d1)).
- Everything below is pieced together from the talk and old notes.  This page needs Owen's words.

### Today

> Every lay person I've talked about "english as a programming language" to has said "Why doesn't it do that already???"
> -- Owen's 2017 Future of Programming talk

- **The talk** (`packages/spell/thoughts/FOP presentation.txt`), "Why English?":
  - people can READ programs, even before they can write one
  - "it's just English" invites experimentation
  - code documents itself:  literate programming
  - talking interfaces are coming, and semicolons won't cut it
- **What spell fixes about HyperCard** (the talk's slide):  Mac only, no network, an impenetrable binary format,
  only seven kinds of data, and hard for a layperson to extend.
- **What is spell** (`packages/spell/thoughts/WhatIsSpell.md`):  drag-and-drop layout plus an English language;
  runs anywhere JavaScript runs;  open source and "always free for personal use".
- **The lineage:**  HyperCard ("programming for the rest of us"), SuperCard, Oracle Media Objects (which Owen worked on), Inform, literate programming, Bret Victor.

## Decisions (settled -- don't relitigate)

- **D1 · AI: partner, then teacher** -- AI writes spell;  reading what it wrote is how people learn to write their
  own.  Answers R2:  spell is how you check and change what the AI made (I1);  reading is the first rung of I2.

## Work (proposed)

### W1 · Write the website's "why" section

- **Status:** proposed
- **What:** after this dialog;  feeds brand and docs

## Open questions (ask, don't decide)

- **Q1 · Who is spell for, first?** -- settled in audience
- **Q2 · What does "change the world" look like?** -- a concrete picture, five years out
- **Q4 · Open source, and how it keeps going** -- still "free for personal use"?  SpellCo as a B-Corp?
- **Q5 · Which HyperCard ideas are sacred?** -- and which are not coming back
- **Q6 · The one-sentence pitch** -- to react to, not to keep

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · The why, in Owen's words** -- one paragraph for the website's front page
  - **G2 · Three stories** -- three people whose lives spell changes, told in a few sentences each
  - **G3 · Principles that settle arguments** -- five to seven, e.g. "everything is grammatical English"
- **2027:**
  - **G4 · Say it in public** -- a talk or essay:  the 2017 talk, retold for the age of AI
- **Someday:**
  - **G5 · A new HyperCard moment** -- a generation of people who make their own tools

## Risks to keep in mind

- **R1 · English-like languages have a long graveyard** -- COBOL, AppleScript:  easy to read, hard to write
- **R2 · "Just ask the AI" is the competitor** -- people may skip code entirely
- **R3 · A vision too wide to ship** -- language, editor, UI library, native, AI, translation — in three months

## Pointers

- `packages/spell/thoughts/FOP presentation.txt` -- the 2017 talk's outline
- `packages/spell/thoughts/WhatIsSpell.md` -- what spell is, what people might make, SpellCo
- `/Users/owen/www/spell-app/_thoughts/` -- older notes (2009-2019):  background, not canonical
- Related:  [audience](../audience/audience.md), [goals](../goals/goals.md), [brand](../brand/brand.md)
