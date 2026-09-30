---
name: solid-2
description: Solid 2 (rc.13) rules for this repo. Use BEFORE writing, reviewing or debugging Solid code or JSX in packages/spell/src/app, spellCore rendering (element(), draw, Thing/List/App components), ~/util reactivity (Observable, getProp/setProp, stores, spell cells), @spell/ui <ui-*> elements (packages/ui, packages/solid-element), or any React-to-Solid migration step. Also use when you see a Solid dev diagnostic code (REACTIVE_WRITE_IN_OWNED_SCOPE, REACTIVITY_HALTED, STRICT_READ_UNTRACKED...).
---

# Solid 2 in the spell monorepo

Solid 2 is neither React nor Solid 1.  Distrust patterns from both.

- FIRST, unless you already read it this session:  Read `packages/spell/docs/solid/SOLID-2.md` IN FULL
  (Read tool, no offset or limit).  Those are this repo's rules (every package) and spell's design decisions;
  follow them over anything you remember.

## Going deeper

- Why spell is built this way, the measurements and the rejected designs:
  `packages/spell/docs/solid/SOLID-2.html`, especially §2 "Read-after-write" and §3 "Gotchas".
- Every new API with an example:  `packages/spell/docs/solid/CHEATSHEET.html` (or Solid's own
  `node_modules/solid-js/CHEATSHEET.md` -- in `packages/ui/node_modules` until `spell` installs Solid;
  identical in rc.11 and rc.13).
- A dev diagnostic code:  `packages/ui/node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md`.
- Unsure how Solid behaves?  Test it, don't guess:  copy a script in `packages/spell/docs/solid/experiments/` and run
  `node docs/solid/experiments/<file> dev` from `packages/spell`.
- `@spell/ui` elements:  `packages/ui/AGENTS.md` and `packages/solid-element/README.md`.
