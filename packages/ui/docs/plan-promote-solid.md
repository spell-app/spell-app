# Plan: promote the Solid spike into the package

> NOTE (2026-10-09):  `packages/solid-element/` below is gone, folded into `src/elements/` (epic `spell-element`).

Owen chose Solid 2 (2026-09-30).
- Everything built so far lives in two places:
  - the library-neutral foundation, in `src/`
  - the Solid layer, in `spike/`
- This step merges them, so new components are built in one place.

## Target layout

- `packages/solid-element/` -- `@spell-app/solid-element` ("the fork"):
  our fork of `@solidjs/element` and `component-register`.
  - Moved from `spike/solid-element/`, unchanged apart from paths.
  - Linked into the root with `link:` (its own yarn project, as in the spike).
- `src/elements/` -- the existing library-neutral classes, PLUS the Solid element core from `spike/solid/src/`:
  - library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
  - Solid:  `UIElement`, `ElementDefinition`, `UIHost`, `FormHost`, `FormElement`, `Controlled`, `Cell`,
    `SlotContent`, `HostAttribute`, `PartContext`, `ContentPart`, `IconGlyph`, `HotDefinitions`
- `src/components/ui-<name>/` -- each family's element classes (`UI*.tsx`) and `index.ts`
  join its CSS, vocabulary, fallback and examples.
  - Tests become `ui-<name>.test.tsx`.
- `src/core.ts`, `src/forms.ts` -- the shared entries;  `src/index.ts` registers everything.
- `tools/` -- the tooling, from `spike/shared/`:
  - measure / smoke / perf / report, with the Lit-specific parts dropped
  - framework host pages
  - the HMR end-to-end test
  - one generated status report, `docs/report.md`
- `site/` -- loads the real components (Solid + HMR plugins in the Astro config).
- `spike/` -- removed at the end;  history stays in git (tag `archive/spikes`).

## Folded in

- Icons:  one ES module per icon, as [the icons doc](icons.md) recommends ("Loading strategies").
  - The `Icons` public API stays the same.
- `Vocabulary.replace()` in `src/vocabulary`, for hot reload, replacing the dev-only workaround.
- The Solid identity probe moves out of shipped code, into the host page only,
  so import-map pages vendor only the Solid bindings components use.

## Done when

- `yarn review` passes at the root, with every spike test moved over:
  283 Solid spike tests + 802 foundation tests + the fork's tests.
- These pass at the root:

  ```sh
  yarn build
  yarn measure
  yarn smoke
  yarn test:hmr
  yarn report
  ```

- `site` builds, and shows live `ui-button` / `ui-dropdown`.
- `AGENTS.md` describes the new layout and the Solid authoring rules.
