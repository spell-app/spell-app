# 14 · programmers -- notes for agents

Spell for developers:  why they'd care, how they'll extend and embed it, and outputs beyond JavaScript, like Python.

- **Page for people:** [programmers.html](programmers.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **Programmers matter three ways:**  they extend spell (rules and libraries), embed it (as their app's scripting
  language), and judge it (credibility, contributions).
- **Today:**  JavaScript output only;  rules in TypeScript;  the cli, language server and VS Code extension work
  from a checkout.
- **Python** is an aspiration (the readme;  the 2017 talk named Java and Swift).  A second target would plug in
  where the syntax tree becomes JavaScript.

### Today

- **Output:**  `<Project>.compiled.js`, a readable ES module on the `spellCore` runtime.
- **"Show Compiled JavaScript":**  in VS Code, the spell beside its JavaScript.
- **The parser is general:**  `packages/parser` knows no language;  rulex rules read like regular expressions
  for words.
- **VS Code extension:**  needs the checkout (it runs the repo's `tsx` on the language server);  not on the
  Marketplace.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Package the VS Code extension

- **Status:** proposed
- **What:** bundle the language server;  no `tsx`, no repo path

### W2 · Python spike:  FizzBuzz

- **Status:** proposed
- **What:** a few node types to Python, to size the work

## Open questions (ask, don't decide)

- **Q1 · Why Python?** -- data people?  teaching?  servers?
- **Q2 · Which programmers first?** -- those who embed, extend, or contribute?
- **Q3 · Is the parser a product?** -- `@spell-app/parser` and rulex, on their own
- **Q4 · TypeScript output:  for the editor, or for people?** -- the plan uses it only for editor checks

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · A page for programmers** -- why spell, how it works, how to extend it
  - **G2 · VS Code extension, installable** -- from the Marketplace or Open VSX, no checkout
  - **G3 · Output a programmer would accept** -- readable JavaScript;  TypeScript later (precedence plan phase 7)
- **2027:**
  - **G4 · Python, a prototype** -- FizzBuzz and Todos' logic as Python
  - **G5 · Embed spell** -- an API to compile spell against your own things
  - **G6 · Rules in spell?** -- define new syntax without TypeScript
- **Someday:**
  - **G7 · More targets** -- Swift, Kotlin
  - **G8 · Spell in notebooks** -- spell cells in Jupyter

## Risks to keep in mind

- **R1 · "English-like" has a reputation** -- AppleScript's:  position spell as readable, not "easy"
- **R2 · A second target doubles the runtime** -- every feature, twice

## Pointers

- `packages/parser/AGENTS.md`, `packages/spell/PARSING.md`
- `packages/vscode/` -- the extension;  `spell dev vscode` at the root
- `packages/core/` -- the runtime a second target would mirror
