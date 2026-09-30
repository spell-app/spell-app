# Code debt

Long-term structural debt -- things we know are wrong, have decided NOT to fix right now,
and do not want to rediscover from scratch every few months.

This is durable project documentation.  Unlike `SUSPECTED-BUGS.md` (a disposable scratch list
of possible bugs), entries here are verified and stay until the underlying work is actually done.

## What goes here

Add an entry when ALL of these are true:

- it is **structural** -- spans several files, or is a shape/convention problem rather than a
  local mistake
- it is **too big to fix in passing** -- fixing it is its own task, not a detour inside another one
- it is **known and tolerated** -- we understand the cause and have chosen to live with it,
  so the next person needs the reasoning, not a rediscovery

Typical triggers:

- a refactor exposes a fragility we decide not to chase
- a test or lint rule gets **pinned, skipped or widened** to accommodate a known problem --
  pinning records the damage, this file records the intent to undo it
- a convention in `AGENTS.md` is knowingly violated, and the violation is too wide to fix now

## What does NOT go here

- **local** cleanups -- use an inline `REFACTOR:` marker at the code, where it will be seen
- **suspected bugs** -- `SUSPECTED-BUGS.md`
- **tooling papercuts** -- `PAPERCUTS.md`
- anything you are about to fix anyway

## Entry format

One `##` heading per item, `---` between items, then:

- **Cost** -- what we pay for leaving it
- **Cause** -- the actual mechanism, not a guess
- **Fix** -- the shape of the real solution
- **Pinned at** -- where the problem is currently recorded or worked around

---

## `popup.anchored.css` skips the CSS pipeline

- **Cost** -- one popup sheet ships unminified and unchecked by Lightning CSS (no `@custom-media`, no `@import`, no
  lowering);  the popup has TWO registered sheets (`popup`, `popup-anchored`), and anything that lists a family's
  sheets (`tools/demo/index.ts`) must name both.
- **Cause** -- Lightning CSS 1.30 fails the whole file on `@container anchored(fallback: flip-block)` (anchored
  container queries, which move the arrow when `position-try-fallbacks` flips a popup), so those rules live in a
  separate file imported `?raw`.
- **Fix** -- fold the rules back into `popup.css` once Lightning CSS parses anchored queries (or passes unknown
  `@container` preludes through).
- **Pinned at** -- `src/components/popup/popup.anchored.css` (header), `UIPopup.styles`, `popup.css.test.ts` ("the
  anchored sheet parses in the browser"), `PAPERCUTS.md` 2026-09-29.

## `<ui-flyout>` builds on the modal family, not on the element core

- **Cost** -- the flyout family imports `$/components/modal` (a cross-family barrel import:  loading a flyout defines
  `<ui-modal>`, the content parts and `<ui-button>`, and the `flyout` lib entry depends on the `modal` one);
  `DialogElement` is generic over its vocabulary but reads its attributes, events, parts and texts through casts
  (`dialogAttrs`, `fire()`), so a subclass vocabulary missing one of them fails at run time, not in `tsc`.
- **Cause** -- the brief (2026-09-30) put the shared modal logic IN the modal family ("a shared base or helper in the
  modal family, NOT a copy");  the plan's home for it is `src/elements/OverlayElement.ts` (via `$/core`).  Typing
  "this vocabulary has at least these names" isn't expressible with the vocabulary types as they are.
- **Fix** -- move `DialogElement` (and `ModalFallback`'s dialog logic) to `src/elements/` as the plan's
  `OverlayElement`, exported through `$/core`, once a third dialog element (a page `<ui-dimmer>` could be one) wants
  it;  give it a `DialogVocabulary` constraint type checked with a conditional type.
- **Pinned at** -- `src/components/modal/DialogElement.tsx` (class docs), `src/components/flyout/UIFlyout.tsx`,
  `flyout.fallback.ts` (the `vocabulary` cast), `docs/grammar.md` "Flyouts".
