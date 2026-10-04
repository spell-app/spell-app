# 12 · web-components -- notes for agents

Spell on any web page:  <spell-app> runs a spell, <spell-editor> edits one, for docs, blogs and teaching.

- **Page for people:** [web-components.html](web-components.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **Both exist and work on demo pages:**  `<spell-app>` runs a project in a shadow root (several per page, with
  explorers and a console);  `<spell-editor>` is Monaco with tabs and live compile, feeding linked apps.
- **Gaps:**  `<spell-editor>` saves to the server without asking and needs `/api`;  each runtime is never
  freed;  it brings its own React;  Semantic UI popups escape the shadow root.
- **Why they matter:**  the docs' live examples, the website's playground, and spell on anyone's page.

### Today

- **Code:**  `packages/app/src/runner/SpellAppElement.tsx`, `packages/app/src/spellEditor/SpellEditorElement.tsx`;
  built with `yarn build:element` in `packages/app`.
- **Demos:**  `demo/spell-app.html`, `demo/spell-editor.html` in `packages/app`.
- **Static-friendly:**  `<spell-app src>` can run compiled JavaScript with no server.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Ask before saving

- **Status:** proposed
- **What:** `<spell-editor>` saves without asking

### W2 · Free each runtime

- **Status:** proposed
- **What:** every `<spell-app>` runtime lives forever

### W3 · Static smoke test

- **Status:** proposed
- **What:** a page with `<spell-app src>` and no server, in CI

## Open questions (ask, don't decide)

- **Q1 · Package name and CDN** -- @spell-app/elements?  jsDelivr?
- **Q2 · A lighter editor for embeds?** -- Monaco is heavy;  CodeMirror 6 for embeds?
- **Q3 · Running other people's spells safely** -- share links mean untrusted code:  sandbox in an iframe?

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · Embed with no server** -- `<spell-app src>` from a CDN
  - **G2 · Edit with no server** -- `<spell-editor>` keeps changes in the page or the browser
  - **G3 · The docs' playground** -- live, editable examples on the website
  - **G4 · A one-line embed** -- one script tag, one element
- **2027:**
  - **G5 · Published** -- on npm and a CDN
  - **G6 · Smaller** -- on Solid and @spell-app/ui, without React
  - **G7 · Share links** -- a spell in a URL, like other languages' playgrounds
- **Someday:**
  - **G8 · Embeds everywhere** -- blogs, Notion, WordPress, slides

## Risks to keep in mind

- **R1 · Security** -- running someone else's spell on your page
- **R2 · Size** -- Monaco, React and the parser, in one embed

## Pointers

- `packages/app/AGENTS.md` -- the elements, the runner, `build:element`
- `agents/CODE-DEBT.md` (`## spell`) -- popups escaping the shadow root, runtimes never freed
