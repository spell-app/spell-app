# 2 · goals -- notes for agents

What we're aiming for in three months, next year and someday — and what "shippable" means.

- **Page for people:** [goals.html](goals.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **By December 31:**  spell is a shippable project:  a website, docs, a downloadable app, and a language that
  holds up for small real programs.
- **Today:**  everything runs from a git checkout.  Nothing is packaged, hosted, or published to npm.
- **A draft arc:**  October *solid ground*, November *first spell in five minutes*, December *public preview*
  (see the [contents page](../index.html#arc)).
- **The hard part:**  choosing what waits until 2027.

### Today

- **A big September:**  TypeScript, the language server, the VS Code extension, Monaco, the explorers,
  @spell-app/ui (53 component families), the monorepo, and this docs system.
- **Waiting to merge:**  `worktree-ui-component-creation` (ui release prep) and `worktree-cli-additions` (ten
  new `spell` commands).
- **Paused:**
  - the move from React to Solid (`/Users/owen/www/spell-app/outstanding/solid-migration.md`):  needs a call on
    Solid rc.11 or rc.13
  - precedence and types (`packages/docs/content/precedence/precedence.html`):  designed, nothing built, 14 decisions
    waiting on Owen
- **Unreviewed:**  much of the recent code says "not yet reviewed by a person".
- **Nothing ships yet:**  no npm packages, no website, no installer, no docs for people writing spells.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Write the shippable checklist

- **Status:** proposed
- **What:** as a section on this page, once Q1 is answered

### W2 · Review and merge the ui branch

- **Status:** proposed
- **What:** `worktree-ui-component-creation`;  see spell-ui

### W3 · Review and merge the cli branch

- **Status:** proposed
- **What:** `worktree-cli-additions`;  see cli

## Open questions (ask, don't decide)

- **Q1 · What does "shippable" mean to you?** -- public launch, or friends first?
- **Q2 · Who does December serve?** -- settled in audience
- **Q3 · Merge order for the work in flight** -- ui, cli, then Solid?
- **Q4 · React to Solid:  before or after the preview?** -- touches the app, the runtime and how spells draw
- **Q5 · How much time, and how many agents?** -- hours a week;  how many agents at once
- **Q6 · What waits until 2027?** -- Windows, AI, translation, drag-and-drop, Python...

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Public preview by December 31** -- website, docs, a Mac app to download, three polished examples
  - **G2 · First spell in five minutes** -- download to a running program you changed, no terminal
  - **G3 · A language that holds up** -- precedence and types fixed;  examples read naturally
  - **G4 · @spell-app/ui 0.1 on npm** -- the first thing we publish
  - **G5 · Reviewed before it ships** -- nothing in the preview is marked "not yet reviewed by a person"
- **2027:**
  - **G6 · Windows app** -- see native
  - **G7 · Spell in Spanish** -- see translation
  - **G8 · Drag-and-drop editing** -- see app
  - **G9 · A first thingverse** -- people, money, dates, calendars
- **Someday:**
  - **G10 · A community that shares** -- stacks, libraries, help
  - **G11 · Beyond JavaScript** -- Python and others;  see programmers

## Risks to keep in mind

- **R1 · Too many fronts** -- fifteen topics;  one person plus agents
- **R2 · Unreviewed code ships** -- agents wrote most of September;  review is the bottleneck
- **R3 · The Solid move is a cliff** -- rewriting the UI layer in the middle of the push
- **R4 · Language changes break docs** -- precedence and types change what valid spell looks like

## Pointers

- `/Users/owen/www/spell-app/outstanding/` -- paused plans:  solid migration, precedence and types, ui build,
  cli additions
- `agents/CODE-DEBT.md`, `agents/SUSPECTED-BUGS.md`, `agents/PAPERCUTS.md` at the repo root
- `packages/spell/thoughts/site-structure.md` -- 2020 notes on versions, guides, publishing
