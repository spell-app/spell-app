# spell-ui-pages -- brief for agents

Every agent working on epic `spell-ui-pages` reads this first.  Owen is ASLEEP (`/bedtime`):  never ask him anything;
decide, record, go on.

## Where

- Worktree `/Users/owen/www/spell-app/spell-app/.claude/worktrees/spell-ui-pages` (branch `spell-ui-pages`).  Run
  everything from inside it.  NEVER `cd` / `git -C` to the main checkout, never merge, push, or `git add -A`.
- Do NOT commit unless your task says so:  the lead commits per phase.  Never `git stash`.
- Plan doc:  `packages/docs/content/epics/spell-ui-pages/spell-ui-pages.plan.html` (read "1. Overview" and "3. Questions &
  Decisions").

## What we're building

Spell UI's docs site (`packages/ui/site`, today Astro + MDX) is being REPLACED by hand-authored, plain `.html`
pages in Fomantic UI's docs style (fomantic-ui.com), built ONLY from `<ui-*>` widgets, to show where the widgets
have gaps.

- Pages:  `packages/ui/site/*.html` and `packages/ui/site/components/ui-<name>.html`, served by the page server
  at `/ui/` (`/ui/components/ui-button.html`).  Static files;  no build step to VIEW a page.
- Template:  `packages/docs/content/templates/spell-ui-docs.html`.
- Script:  ONE committed ESM bundle in `packages/ui/site/_assets/` (built from `packages/ui` source by
  `yarn site:build` in `packages/ui`, committed like docs' `spell-ui.js`), loaded by every page as
  `<script type="module" src="<rel>/_assets/site.js">`.  It defines `<ui-root>` (which lazy-loads every other
  family on first use), the doc-only elements' catalog, `<spell-site-header>`, every icon pack.
- Shared header / footer:  `packages/ui/site/_parts/*.html`, pulled in with `<ui-include>`.
- Data:  `packages/ui/site/_data/components.json`, GENERATED from the vocabularies (`ComponentDefinitions`) and the
  family sheets by `yarn site:data` (part of `yarn site:build`), committed.  The doc-only elements fetch it;  they
  NEVER import vocabularies (that would drag ~325 KB of source into every bundle).
- Doc-only elements:  `packages/ui/src/docs-components/ui-docs-<name>/`, written exactly like a component family
  (`packages/ui/AGENTS.md` "Solid authoring":  controller class, vocabulary with `topics` + `aka`, fallback, css,
  tests, examples), but NOT listed in the normal component docs.  `<ui-root>` knows them (its catalog + loader).
  - `<ui-docs-example>`:  Fomantic's example block:  header + description, the live children, and their SOURCE
    (read from its own light-DOM markup, normalised + indented) in a `<ui-code language="html">`, shown / hidden by a
    `<ui-button circular basic icon="code">`.
  - `<ui-docs-api tag="ui-button">`:  attributes (kind, values, default, description) / slots / events / parts /
    states tables for a tag, from `components.json`.
  - `<ui-docs-tokens tag="ui-button">`:  CSS token table with live colour swatches;  optional playground.
  - `<ui-docs-nav current="ui-button">`:  the left sidebar:  EVERY component listed together, grouped by topic
    (Owen prefers this to Fomantic's per-group menus), A-Z / Topics switch, search `<ui-input>`, favourites;  built
    from `<ui-menu vertical>` / `<ui-item>` etc.
  - `<ui-docs-themes>`:  theme `<ui-dropdown>` (every sheet in `src/styles/themes/`) + light / dark / system.
- Themes:  each Fomantic theme becomes `packages/ui/src/styles/themes/<name>.css`, a token sheet in
  `@layer ui.theme` (`packages/ui/docs/theming.md`).

## Fomantic sources (read-only, git-ignored)

- `packages/ui/reference/Fomantic-UI/` -- 2.9.4:  `src/definitions/**`, `src/themes/<theme>/**`
- `packages/ui/reference/Fomantic-UI-Docs/server/documents/<group>/<name>.html.eco` -- the docs pages:  text,
  examples, structure.  Page map:  plan doc section "1.3 Fomantic page map".
- Images:  `packages/ui/site/images/...` (same paths as fomantic-ui.com's `/images/...`).

## Rules that bite

- `<ui-*>` for EVERYTHING visible:  no hand `<div class>` chrome, no `<button>`, no `<nav>`, no hand CSS for looks.
  A page's own CSS (`_assets/site.css`) is layout glue only (grid areas, widths).  Every rule you need there is a
  GAP:  record it.
- A widget can't do what a Fomantic example / the chrome needs:  that's a GAP.  Record it as a plan-doc issue
  (below), title `Gap:  <ui-tag> <what's missing>`, details:  the Fomantic example, what you did instead.  Fix it in
  the widget ONLY if < ~15 min and local to that one widget (then also note it in the issue and close it).
- Root `AGENTS.md`, `packages/ui/AGENTS.md`, `packages/docs/content/solid/solid-2.md` (Solid 2 is neither React nor
  Solid 1) apply.  Docstrings per the root's "Documentation".
- Suspected bugs:  `agents/SUSPECTED-BUGS.md` (repo root, `## ui`);  tooling papercuts:  `agents/PAPERCUTS.md`.

## Plan doc commands (run from the WORKTREE ROOT:  `packages/ui` has no `plan-doc` script)

```
yarn plan-doc add spell-ui-pages issue|caveat|decision|todo "title" --details "<p>html</p>"   prints the id
yarn plan-doc close spell-ui-pages <id>
yarn plan-doc log spell-ui-pages "text"
```

Record caveats, issues and decisions in the plan doc as you find them.  The script locks the file, so parallel
agents are safe.  NEVER hand-edit the plan doc's items;  don't touch its phases.
