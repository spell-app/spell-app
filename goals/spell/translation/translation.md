# 13 · translation -- notes for agents

Spell in a second human language:  Spanish first, then Norwegian and Portuguese with help from friends.

- **Page for people:** [translation.html](translation.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **A start:**  a full Spanish translation of `Card.spell` exists (`Card.spell-es`, 118 lines), but nothing
  reads it:  no Spanish rules, and it isn't in the project.
- **@spell-app/ui** has a translation contract designed (localized tags like `<ie-tarjeta color="rojo">`), not
  built.
- **The hard part is grammar, not words:**  gender, articles, word order, plurals, verb forms.  A language must be
  a set of rules, not a fork of the parser.

### Today

```spell
una carta es una cosa
las cartas tienen un palo como uno de tréboles, diamantes, corazones o espadas
el color de una carta es rojo si su palo es diamantes o corazones de lo contrario es negro
una carta "está boca arriba" si su dirección es arriba
```

- **The sample:**  `packages/spell/projects/system/examples/Solitaire/Card.spell-es`.
- **Hooks:**  "negatable" words (`is` / `is not`) can be registered per language;  names are never used as ids.
- **@spell-app/ui:**  `packages/ui/docs/translation.md` (tags, attributes and values);  `UI.i18n` for text.
- **Where English is baked in:**  the rules are TypeScript classes with English keywords in their syntax strings.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · List where English is baked in

- **Status:** proposed
- **What:** keywords in rule syntax strings, messages, runtime names

### W2 · Spike:  ten core rules in Spanish

- **Status:** proposed
- **What:** enough for the first lines of Card.spell-es

## Open questions (ask, don't decide)

- **Q1 · One project, one language?** -- or mixed files
- **Q2 · Do people's own phrases translate?** -- `to turn (a card) over` in Spanish?
- **Q3 · Which comes first?** -- the language, or the app and docs in Spanish
- **Q4 · Who helps, and when?** -- your Norwegian and Portuguese friends:  what can they give, and how?
- **Q5 · How strict about grammar?** -- accept "el carta"?  correct it?  warn?

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Design a language pack** -- rules, words and grammar:  how English phrases map to Spanish ones
  - **G2 · Card.spell-es parses** -- a prototype, on Solitaire's cards
  - **G3 · Decide on mixed projects** -- can one project mix languages?
- **2027:**
  - **G4 · Spanish, all the way** -- language, app and docs
  - **G5 · Norwegian and Portuguese** -- with friends who speak them
  - **G6 · Read any spell in your language** -- show a spell in another language
- **Someday:**
  - **G7 · Any language** -- language packs from the community

## Risks to keep in mind

- **R1 · English-shaped rules** -- Spanish agreement and word order don't fit rules written for English
- **R2 · Twice the tests** -- every rule, in every language
- **R3 · A refactor before a feature** -- keywords live inside TypeScript rule classes

## Pointers

- `packages/spell/projects/system/examples/Solitaire/Card.spell-es`
- `packages/spell/src/rules/` -- where keywords live
- `packages/ui/docs/translation.md` -- ui's translation contract
