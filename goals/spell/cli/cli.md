# 15 · cli -- notes for agents

The spell command:  compile, check, run and test spells from a terminal, and a home for automation and agents.

- **Page for people:** [cli.html](cli.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **On main:**  `compile`, `check`, `describe`, `explore` (a full-screen Type Explorer), `watch`, `run`
  (in Node;  UI does nothing) and `test`.
- **On the cli branch:**  `help`, `serve`, `icons`, `format`, `projects`, `speed`, `parse`, `repl`,
  `explain`, `new`, and `run` opening UI projects in a browser.
- **Not shippable yet:**  it runs source through `tsx` from a checkout;  needs a bundle and an npm release;
  `spell lsp` is a TODO;  not yet reviewed by a person.

### Today

- **Where:**  `packages/cli` (Ink and commander);  installed by `yarn cli:install` as a link into the checkout.
- **Branch:**  `worktree-cli-additions`:  phases P1-P10 done (`/Users/owen/www/spell-app/outstanding/cli-additions.md`).
- **Still TODO** (`packages/cli/README.md`):  `spell lsp`, a single-file bundle, npm publishing.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Review and merge the cli branch

- **Status:** proposed
- **What:** `worktree-cli-additions`

### W2 · A single-file bundle

- **Status:** proposed
- **What:** the first step to publishing

## Open questions (ask, don't decide)

- **Q1 · Who is the cli for in December?** -- programmers, docs tooling, agents?
- **Q2 · A single binary?** -- a Node bundle, or a compiled executable
- **Q3 · One version for everything?** -- cli, app and language released together (a changesets "fixed" group)

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Merge the cli branch** -- after a review
  - **G2 · Install with npm** -- `npm i -g @spell-app/cli`:  a real bundle
  - **G3 · `spell new` and `spell serve`** -- a programmer's getting started
  - **G4 · `spell lsp`** -- for editors other than VS Code
- **2027:**
  - **G5 · Made for agents** -- JSON output everywhere;  an MCP server (see ai)
  - **G6 · `spell build`** -- a spell as a static site
- **Someday:**
  - **G7 · Spells that draw in the terminal** -- "CLI components are the bomb!" (2019 notes)

## Risks to keep in mind

- **R1 · Bundling pain** -- decorators, aliases and paths that assume a checkout

## Pointers

- `packages/cli/AGENTS.md`, `packages/cli/README.md`
- `/Users/owen/www/spell-app/outstanding/cli-additions.md`
