# Plan: promote the Solid spike into the package

> NOTE (2026-10-09):  `packages/solid-element/` below is gone, folded into `src/elements/` (epic `spell-element`).

Owen chose Solid 2 (2026-09-30).  Everything built so far lives in two places:  the library-neutral foundation in `src/`, and the Solid layer in `spike/`.  This step merges them so new components are built in one place.

## Target layout

- `packages/solid-element/` -- `@spell-app/solid-element` (the fork), moved from `spike/solid-element/` unchanged apart from paths;  linked into the root with `link:` (its own yarn project, as in the spike)
- `src/elements/` -- the existing library-neutral classes (`ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`) PLUS the Solid element core from `spike/solid/src/` (`UIElement`, `ElementDefinition`, `UIHost`, `FormHost`, `FormElement`, `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `PartContext`, `ContentPart`, `IconGlyph`, `HotDefinitions`)
- `src/components/ui-<name>/` -- each family's element classes (`UI*.tsx`) and `index.ts` join its CSS, vocabulary, fallback and examples;  tests become `ui-<name>.test.tsx`
- `src/core.ts`, `src/forms.ts` -- the shared entries;  `src/index.ts` registers everything
- `tools/` -- the measure / smoke / perf / report tooling from `spike/shared/` (Lit-specific parts dropped), framework host pages, the HMR end-to-end test;  one generated status report, `docs/report.md`
- `site/` -- loads the real components (Solid + HMR plugins in the Astro config)
- `spike/` -- removed at the end;  history stays in git (tag `archive/spikes`)

## Folded in

- Icons:  one ES module per icon, per the recommendation in `docs/icons.md` ("Loading strategies");  the `Icons` public API stays the same
- `Vocabulary.replace()` in `src/vocabulary` for hot reload, replacing the dev-only workaround
- The Solid identity probe moves out of shipped code into the host page only, so import-map pages vendor only the Solid bindings components use

## Done when

- `yarn review` passes at the root with every spike test moved over (283 Solid spike tests + 802 foundation tests + fork tests)
- `yarn build`, `yarn measure`, `yarn smoke`, `yarn test:hmr`, `yarn report` pass at the root
- `site` builds and shows live `ui-button` / `ui-dropdown`
- `AGENTS.md` describes the new layout and the Solid authoring rules
