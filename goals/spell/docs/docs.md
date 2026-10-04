# 10 · docs -- notes for agents

Documentation for people who write spells, people who build spell, and agents, and how the pieces fit together.

- **Page for people:** [docs.html](docs.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **Today's docs are for developers and agents:**  `AGENTS.md` files, `PARSING.md`, and design pages in
  `packages/docs`.  Nothing is written for people writing spells.
- **The docs system is strong:**  pages on @spell-app/ui that open from disk, templates, plan docs, browser checks.
- **December needs:**  getting started, a tour, a phrase book, annotated examples, and how the pieces fit
  together.

### Today

- **Developer docs:**  `packages/docs/index.html`:  precedence, Solid 2, how the docs work, plan docs.
- **@spell-app/ui docs:**  plain HTML pages on `<ui-*>` widgets in `packages/ui/site` (66 pages, Fomantic's docs
  style), not deployed.
- **In the app:**  a `@system:guides` root is configured, with no folder behind it.
- **2020 vision** (`site-structure.md`):  guides are spell projects with inline playgrounds;  a "dictionary and
  phrase book" generated from rule descriptions and tests.
- **Elsewhere:**  a DeepWiki link in `packages/spell/readme.md`.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Phrase book spike

- **Status:** proposed
- **What:** pull rule syntax and tests into JSON;  render one cheat-sheet page

### W2 · Getting started, first draft

- **Status:** proposed
- **What:** after the app and native decisions

## Open questions (ask, don't decide)

- **Q1 · One site or several?** -- spell.app with /docs and /ui?
- **Q2 · What builds the site?** -- hand-written pages like these, Astro like ui's, or spell itself
- **Q3 · Reference before or after precedence?** -- the language is about to change
- **Q4 · Who writes the docs?** -- agents draft, you edit?
- **Q5 · What happens to the old notes?** -- `_thoughts` and `packages/spell/thoughts`:  archive, or mine and retire?

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Getting started** -- from download to your first changed spell
  - **G2 · A phrase book** -- everything spell understands, generated from the rules and their tests
  - **G3 · A tour** -- short, interactive, with live spells on the page
  - **G4 · How it fits together** -- language, app, ui, cli:  one page for contributors
  - **G5 · Annotated examples** -- the three December examples, explained line by line
- **2027:**
  - **G6 · Guides inside the app** -- guides as spell projects;  see app
  - **G7 · Docs in Spanish** -- see translation
  - **G8 · A cookbook** -- "how do I..." answers
- **Someday:**
  - **G9 · Docs people can improve** -- edit a page, send it back

## Risks to keep in mind

- **R1 · Docs drift as the syntax changes** -- a generated phrase book helps
- **R2 · Too many doc systems** -- AGENTS.md files, packages/docs, ui's Astro site, this master plan

## Pointers

- `packages/docs/AGENTS.md` -- how docs pages are written;  `packages/docs/templates/`
- `packages/ui/site/` -- ui's docs site (plain HTML pages)
- `packages/spell/thoughts/site-structure.md` -- 2020 notes on guides and the phrase book
