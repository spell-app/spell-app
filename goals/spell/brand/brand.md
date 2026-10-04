# 4 · brand -- notes for agents

How spell looks and sounds everywhere:  a visual language made with Claude Design, carried through the app, the website and the docs.

- **Page for people:** [brand.html](brand.html) -- the source of truth for goals, questions and decisions.
- **Status:** draft -- a first pass, not yet talked through.  Updated 2026-10-01.
- **Rules for this folder:** [../AGENTS.md](../../AGENTS.md)

> **Draft.**  Nothing here is decided yet.  Goals and work items are proposals:  don't start a `W` item until
> the page marks it agreed (a `D` decision, or the topic's status `agreed`).

## Context

- **No brand yet:**  no logo, palette, type, or voice guide.  The app and docs wear @spell-app/ui's default
  Fomantic look.
- **The plan:**  make a visual language with Claude Design (logo, color, type, components, illustration, voice),
  then ship it as an @spell-app/ui theme, so the app, website, docs and spells share one look.
- **Ready for it:**  @spell-app/ui is themed through `--ui-*` tokens, with light and dark built in.

### Today

- **Theming:**  `packages/ui/docs/theming.md`;  tokens in `packages/ui/src/styles/tokens.css` and
  `colors.css` (OKLCH, `light-dark()`).
- **Docs pages:**  system fonts and UI tokens (`packages/docs/tools/_assets/spell-doc.css`);  this master plan adds a
  stacked-card look (`packages/docs/tools/_assets/goals.css`).
- **Names we hold:**  the GitHub org `spell-app`, the npm scope `@spell-app` (nothing published).  Old notes
  imagine `spell.app`.

## Decisions (settled -- don't relitigate)

_None yet._

## Work (proposed)

### W1 · Gather references for Claude Design

- **Status:** proposed
- **What:** moods, colors, type, things you like and don't

## Open questions (ask, don't decide)

- **Q1 · What should it feel like?** -- warm and handmade?  crisp?  playful?  a little nostalgic?
- **Q2 · The magic metaphor:  lean in or play down?** -- spells, incantations, wands... or just the name
- **Q3 · Name and domain** -- do we own spell.app?  is "spell" findable?
- **Q4 · Spell code in a proportional font?** -- see I3
- **Q5 · Keep Fomantic's look underneath?** -- restyle through tokens, or a deeper redesign
- **Q6 · References you love** -- sites, apps or brands to learn from

## Goals (direction, not orders)

- **Now → December 2026:**
  - **G1 · A visual language** -- made with Claude Design:  wordmark, palette, type, icons, illustration, voice
  - **G2 · A spell theme for @spell-app/ui** -- the brand as tokens;  app, website and docs all use it
  - **G3 · A voice guide** -- friendly, concise, professional;  "people", never "users"
  - **G4 · A home page design** -- the first thing people see;  see docs and website
- **2027:**
  - **G5 · App icon and installer art** -- see native
  - **G6 · A default look for what people make** -- related to spell's brand, but theirs to change
- **Someday:**
  - **G7 · Stickers** -- every good tool needs stickers

## Risks to keep in mind

- **R1 · Bikeshedding** -- brand work expands to fill any time given:  time-box it
- **R2 · A name people can't find** -- "spell" collides with the word, and with other products
- **R3 · Brand on the website, not in the app** -- the theme must live in @spell-app/ui, not in a stylesheet

## Pointers

- `packages/ui/docs/theming.md`, `packages/ui/src/styles/` -- how a theme plugs in
- `packages/docs/tools/_assets/goals.css` -- this site's look:  a first sketch, not the brand
- Related:  [spell-ui](../spell-ui/spell-ui.md), [docs](../docs/docs.md), [native](../native/native.md)
