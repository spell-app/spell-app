# 8 · native -- notes for agents

Spell as an app you download and double-click:  Mac first, then Windows.

- **Page for people:** [native.html](native.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **Nothing exists yet:**  no Electron or Tauri, no installer, no signing.  Running spell needs Node, a clone and
  `yarn start`.
- **Good news:**  the compiler runs in the browser and the server only does file I/O, so a desktop shell mostly
  swaps the `/api` for local files.
- **The choice:**  Tauri (small, the system's web view) or Electron (large, the same Chromium everywhere, Node
  built in).
- **Target:**  a signed, notarized Mac app in December;  Windows next.

### Today

- **2020 plan:**  "Install as local app via Electron" (`packages/spell/thoughts/site-structure.md`).
- **The server:**  express `/api` over `packages/spell/src/node/project-utils.ts`.
- **Projects:**  `environment.ts` puts them inside the source tree (`packages/spell/projects`).
- **Docker:**  removed on 2026-09-30.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · A storage adapter

- **Status:** proposed
- **What:** put the app's `/api` calls behind one interface, with a file-system version

### W2 · Shell spikes

- **Status:** proposed
- **What:** a day each for Tauri and Electron:  open, edit, run, sign

## Open questions (ask, don't decide)

- **Q1 · Tauri or Electron?** -- size and memory, or Node in-process
- **Q2 · Where do people's projects live?** -- ~/Documents/Spell?  iCloud Drive?
- **Q3 · Apple and Windows signing** -- do you have an Apple Developer account?  a Windows certificate?
- **Q4 · Everything works offline?** -- except AI
- **Q5 · Does the app include the cli and VS Code bits?** -- e.g. "Install the spell command" from a menu

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Pick the shell** -- Tauri or Electron, decided by a one-day spike of each
  - **G2 · Mac app alpha** -- opens, lists projects, edits, runs;  projects in a folder you can find
  - **G3 · Signed and notarized** -- an Apple Developer ID, so it opens without warnings
  - **G4 · Tells you about updates** -- at least "a new version is available"
- **2027:**
  - **G5 · Windows app** -- with a code-signing certificate
  - **G6 · A spell as its own app** -- export a project as a small app of its own, like HyperCard's standalones
- **Someday:**
  - **G7 · iPad** -- touch-first editing
  - **G8 · Linux** -- if people ask

## Risks to keep in mind

- **R1 · Signing rabbit holes** -- notarization, entitlements, certificates:  start early
- **R2 · Two storage worlds drift apart** -- browser storage and files behaving differently
- **R3 · Download size** -- Monaco, the parser and the runtime, on top of the shell

## Pointers

- `packages/app/src/server/` -- the file API the shell replaces
- `packages/spell/src/node/project-utils.ts`, `environment.ts` -- where projects live
- `packages/spell/thoughts/site-structure.md` -- 2020 notes on local installs and versions
