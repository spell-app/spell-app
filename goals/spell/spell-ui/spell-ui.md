# 9 · spell/ui -- notes for agents

Fomantic UI reborn as ui-* web components on Solid 2:  the parts the app, the docs and the things people make are built from.

- **Page for people:** [spell-ui.html](spell-ui.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **The most finished piece of spell:**  53 component families, 92 `ui-*` tags, about 3,600 browser tests,
  accessibility checks, server rendering, themes, and a docs site of plain HTML pages (not deployed).
- **Release prep is on a branch:**  a changelog, a passing `npm publish --dry-run`, a kitchen-sink page.
- **Before it ships:**  a stale README, no `repository` field, Linux visual baselines blocked on Docker, four
  WebKit failures, and families over their size budget.
- **Its job in the plan:**  the look of everything (through the brand theme), and the pieces people place on cards.

### Today

- **Where:**  `packages/ui`;  status in `packages/ui/docs/status.md`;  plan in `packages/ui/docs/plan.md`
  (phases A-C done, D is site and release).
- **Built on:**  Solid 2 (rc.11) and our fork of Solid's custom-element layer (`packages/solid-element`).
- **Branch:**  `worktree-ui-component-creation`:  changelog, publish dry-run (2.5 MB), cross-browser run with
  four WebKit failures waiting on Owen.
- **Translation:**  a contract is designed (`<ie-tarjeta color="rojo">` ~== `<ui-card color="red">`), not built
  (`packages/ui/docs/translation.md`).
- **Docs:**  `packages/ui/site` (plain HTML pages, 58 component pages), not deployed.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Review the WebKit failures

- **Status:** proposed
- **What:** four, on the release branch

### W2 · Fix the README and package.json

- **Status:** proposed
- **What:** "eight component families" is stale;  add `repository`

### W3 · Linux visual baselines

- **Status:** proposed
- **What:** blocked on Docker

## Open questions (ask, don't decide)

- **Q1 · Publish as @spell-app/ui, or its own name?** -- standalone appeal vs. a tie to spell
- **Q2 · Version policy** -- 0.x until spell 1.0?
- **Q3 · Where does its docs site live?** -- ui.spell.app?  inside the main site?
- **Q4 · Move to Solid rc.13 now?** -- ui pins rc.11;  spell is moving to rc.13;  one Solid only
- **Q5 · Size budget:  enforce or relax?** -- families average 7.3 kB against 4 kB

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Merge the release branch** -- after you look at the four WebKit failures
  - **G2 · 0.1.0 on npm** -- README, repository field, changelog
  - **G3 · Docs site live** -- part of the spell website, or its own
  - **G4 · The spell theme** -- the brand as tokens;  see brand
  - **G5 · Spell draws with it** -- the app and the runtime use `ui-*`;  see app
- **2027:**
  - **G6 · Translated tags** -- build the vocabulary contract:  `<ie-tarjeta>`
  - **G7 · Within the size budget** -- 4 kB per family, or a new budget we believe in
  - **G8 · Ready for drag and drop** -- design-time metadata from the vocabulary files
- **Someday:**
  - **G9 · Loved on its own** -- used by people who never touch spell

## Risks to keep in mind

- **R1 · Solid 2 is still a release candidate** -- API churn between RCs
- **R2 · A lot to maintain** -- 53 families, for one person and agents
- **R3 · Fomantic's look can feel dated** -- the brand theme has to make it feel new

## Pointers

- `packages/ui/AGENTS.md`, `packages/ui/README.md`, `packages/ui/docs/`
- `packages/docs/solid/solid-2.md` -- Solid 2 rules:  read before touching ui
- `/Users/owen/www/spell-app/outstanding/ui-component-build.md`
