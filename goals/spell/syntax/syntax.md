# 5 · syntax -- notes for agents

Goals for spell's syntax, the caveats, and what's likely to bite us.

- **Page for people:** [syntax.html](syntax.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **Spell reads as plain English, compiles to JavaScript, and learns new words:**  defining
  `to turn (a card) over` teaches the parser that phrase.
- **It works end to end:**  Solitaire (445 lines) runs, with types, aliases, events, animations and tests.
- **The weak spots are precedence and types:**  the examples are tuned to awkward syntax to dodge them.
- **The main language work for three months:**  the precedence and types plan (designed;  14 decisions open).

### Today

```spell
a card is a thing
cards have a suit as one of clubs, diamonds, hearts or spades
a card has a direction as either up or down
the color of a card is red if its suit is either diamonds or hearts otherwise it is black
a card "is face up" if its direction is up

to turn (a card) over:
	if its direction is up: turn it face down
	otherwise: turn it face up
```

- **How it's built:**  about 190 rules in TypeScript (`packages/spell/src/rules/`), on a general rule-based
  parser (`packages/parser`) whose rule syntax reads like regular expressions for words.
- **Spells grow the language:**  methods, quoted phrases and enumerations become new syntax, recorded in the
  compiled JavaScript so other projects can import them.
- **What's missing:**  while/until loops, text with values inside, dates, money, maps;  `alert` / `ask` /
  `confirm` compile but don't run;  nothing saves or loads data.
- **What bites today** (`agents/CODE-DEBT.md`):
  - phrases ending in an expression swallow what follows:  `the number of cards in the deck is 52` compiles to
    `itemCountOf(deck == 52)`
  - `is a` accepts any word;  methods with the same wording on different types collide
  - parameters need parentheses;  types are recorded but never used by the parser
- **Size:**  about 1,300 lines of real spell;  about 1,400 tests.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Precedence and types, phases 0-1

- **Status:** proposed
- **What:** as planned in outstanding/precedence-and-types
- **Notes:** Waiting on [Q1](syntax.html#q1) for the decisions phase 1 depends on.

### W2 · A phrase corpus as tests

- **Status:** proposed
- **What:** turn basic-syntax.md's phrases into expected parses

### W3 · Make alert / ask / confirm run

- **Status:** proposed
- **What:** they compile to `spellCore` methods that don't exist

## Open questions (ask, don't decide)

- **Q1 · Settle the 14 precedence and types decisions** -- a few short sessions
- **Q2 · How many ways to say one thing?** -- the talk says many;  the editor could still suggest one
- **Q3 · Indentation and colons** -- tabs plus optional colons today:  keep?
- **Q4 · How should spells draw?** -- JSX today;  `<ui-*>` tags after Solid;  or something more English?
- **Q5 · HyperCard's objects in the language?** -- stacks, cards, fields, buttons as built-in things — or keep it general
- **Q6 · When do we promise not to break spells?** -- 0.x churn now;  a promise at 1.0?

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Precedence that just works** -- plan phases 0-1:  a Pratt-style expression loop, bounded backtracking
  - **G2 · Types the parser reads** -- plan phases 2-3:  typed signatures, no parentheses on parameters
  - **G3 · Examples that read naturally** -- no workaround parentheses, no get-it dances
  - **G4 · The missing basics** -- while/until, text with values in it, dates, and alert/ask/confirm that run
  - **G5 · A phrase book** -- every phrase spell understands, generated from the rules and their tests;  see docs
- **2027:**
  - **G6 · Multi-word properties** -- `the short rank of a card` (plan phase 4)
  - **G7 · Built-in types, fully described** -- plan phase 5
  - **G8 · A versioning promise** -- when spells written today must keep working
- **Someday:**
  - **G9 · "Which did you mean?"** -- the editor shows the readings of an ambiguous line, and you pick
  - **G10 · Libraries that teach new words** -- see thingverse

## Risks to keep in mind

- **R1 · Ambiguity grows with vocabulary** -- every new phrase can collide with an old one
- **R2 · Speed on bigger programs** -- every alternative is parsed, nothing memoized;  Solitaire takes about 100 ms warm
- **R3 · Unhelpful errors** -- a line that doesn't parse becomes a comment;  beginners need more help
- **R4 · Syntax churn breaks the docs** -- write the reference after precedence lands, or generate it

## Pointers

- `packages/spell/PARSING.md`, `packages/spell/AGENTS.md`, `packages/parser/AGENTS.md`
- `packages/docs/content/precedence/precedence.html` and `/Users/owen/www/spell-app/outstanding/precedence-and-types/plan.md`
- `packages/spell/projects/system/examples/` -- the examples
- `agents/CODE-DEBT.md` (`## spell`) -- what bites, and why
