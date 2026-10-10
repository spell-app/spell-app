---
name: solid-2
description: Solid 2 (rc.13) rules for this repo. Use BEFORE writing, reviewing or debugging Solid code or JSX in packages/app/src, core rendering (packages/core/src: element(), draw, Thing/List/App components), `$/util` reactivity (Observable, getProp/setProp, stores, spell cells), @spell-app/ui <ui-*> elements (packages/ui), or any React-to-Solid migration step. Also use when you see a Solid dev diagnostic code (REACTIVE_WRITE_IN_OWNED_SCOPE, REACTIVITY_HALTED, STRICT_READ_UNTRACKED...).
---

# Solid 2 in the spell monorepo

Solid 2 is neither React nor Solid 1.
Distrust patterns from both.

- FIRST, unless you already read it this session:
  Read [the Solid 2 rules](guides/solid/solid-2.md) IN FULL (Read tool, no offset or limit).
  - Those are this repo's rules (every package), and spell's design decisions.
  - Follow them over anything you remember.
- Writing app components:  ALSO read WWOD §17, [solid.md](agents/wwod/solid.md).
  - It's the house style on top of those mechanics:
    props, spell state vs signals, load states, error boundaries, dialogs.

## Going deeper

- Why spell is built this way, the measurements and the rejected designs:
  [the Solid 2 guide](guides/solid/solid-2.html), especially §2 "Read-after-write" and §3 "Gotchas".
- Every new API, with an example:  [the Solid 2 cheatsheet](guides/solid/cheatsheet.html).
  - Or Solid's own, `node_modules/solid-js/CHEATSHEET.md`, hoisted to the repo root.
    Identical in rc.11 and rc.13.
- A dev diagnostic code:
  `node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md` (repo root).
- Unsure how Solid behaves?  Test it, don't guess:
  - copy a script in `guides/solid/experiments/`
  - run `node solid/experiments/<file> dev` from `packages/docs`
- `@spell-app/ui` elements:  [ui's AGENTS.md](packages/ui/AGENTS.md) ("Solid authoring").
