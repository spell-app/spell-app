# 7 · AI -- notes for agents

AI inside the spell app, and AI that helps people write spells.

- **Page for people:** [ai.html](ai.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **No AI features yet.**
- **Spell suits AI unusually well:**  the source is English, so the person who asked can read and check what an AI
  wrote.
- **Two jobs:**  AI *in* the app (explain, write, fix, translate), and AI *building* spell (agents already write
  most of the code).
- **The big question:**  is spell "the language AI writes for you, so you can read it"?

### Today

- **In the app:**  nothing.  The language server offers parser-driven completion and a "Define `to <phrase>`"
  quick fix.
- **Hooks we have:**  the parser's "expecting" mode knows what may come next;  `spell explain <word>` (cli
  branch) shows a rule's syntax and an example.
- **Building spell:**  mostly Claude agents, guided by `AGENTS.md`, skills (`.claude/skills/`) and plan docs.

## Decisions (settled -- don't relitigate)

- **D1 · People pick how much AI teaches** -- three modes:  "do it all for me", show the spell and explain on ask,
  walk me through every change.  The teacher half of [motivation/D1](../motivation/motivation.md) (AI:  partner, then
  teacher).

## Work (proposed)

### W1 · A spell guide for models

- **Status:** proposed
- **What:** generated from the rules, like the phrase book;  feeds the skill

## Open questions (ask, don't decide)

- **Q1 · Which models, and who pays?** -- Claude by default?  pluggable?  people's own keys?
- **Q2 · AI in the December preview?** -- or after
- **Q4 · Privacy** -- people's spells sent to a model:  opt-in, always visible
- **Q5 · Should AI pick between readings?** -- or keep ambiguity deterministic
- **Q6 · Is spell hidden in "do it all"?** -- or still there to read, just not pushed at people

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Decide the AI story** -- where AI fits the why;  motivation/D1 answers the why (partner, then teacher);  the ai topic still tells it
  - **G2 · Teach Claude to write spell** -- a skill:  the phrase book and examples, checked by the real parser
  - **G3 · "Explain this line"** -- a prototype:  select spell, get plain words, and how spell read it
- **2027:**
  - **G4 · Describe it, get a spell** -- ask in English, get a runnable spell you can read and change
  - **G5 · Fix my spell** -- for a line spell doesn't understand, suggest rewrites it does
  - **G6 · Translate a spell** -- between human languages;  see translation
- **Someday:**
  - **G7 · Talk to build** -- say it, see it built:  the cards-3d-movie.md scenario

## Risks to keep in mind

- **R1 · AI makes the language unnecessary** -- people ask for apps and never look at code
- **R2 · English that looks right but isn't spell** -- models will invent phrases;  the parser must check every one
- **R3 · Cost and keys** -- hosted AI costs money;  people's own keys add friction

## Pointers

- `packages/lsp` -- completion, quick fixes, the expecting mode
- `packages/cli/README.md` -- `explain`, `parse`, `check` (some on the cli branch)
- `AGENTS.md` and `.claude/skills/` -- how agents build spell today
