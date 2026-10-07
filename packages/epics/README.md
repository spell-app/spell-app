# `$/epics` -- a component pack of `<epic-*>` elements

Custom elements a page loads ON DEMAND:  `<ui-root>` reads the pack's script (`pack/epics.pack.js`, a classic
script, so it works from `file://` too) when the page names it, shows each tag's skeleton until it's defined, then
defines them all.  Written exactly like Spell UI's own element families, on its `$/ui/core`.

```html
<ui-root>
  <ui-components source="../../packages/epics/pack/epics.pack.js"></ui-components>
  <epic-...> ... </epic-...>
</ui-root>
```

The page must load Spell UI's docs bundle (`packages/docs/tools/_assets/spell-ui.js`) first:  the pack registers
there (`SpellUI.registerPack()`) and takes Solid and Spell UI's shared code from it (`SpellUI.packModules`).

## The DRY rule (one of each)

If you find yourself writing a second copy of any of these, stop and reuse.

- the pack's build, catalog and staleness check:  the CLI's, `spell dev pack` (`packages/cli/src/dev/packBuild.ts`)
- reading a vocabulary's tag and skeleton:  Spell UI's `RootCatalog` (`packages/ui/tools/RootCatalog.ts`)
- the element authoring API:  `$/ui/core`

## Files

| Path | What |
| --- | --- |
| `components/<tag>/` | one element family:  class, vocabulary, types, sheet, native fallback, test, barrel |
| `components/index.ts` | `$/epics/components`:  every family barrel (defines every tag:  SIDE EFFECT) |
| `src/index.ts` | `$/epics`:  code the elements share |
| `src/pack.test.ts` | runs `spell dev pack check epics`:  `pack/` is current |
| `pack/` | GENERATED, committed:  `epics.catalog.ts`, `epics.entry.ts`, `epics.pack.js` |
| `vite.config.ts` | lint and format only:  the build is the CLI's |
| `vitest.config.ts` | `node` (`src/`) and `browser` (`components/`) projects |

## Adding a new element

1. `spell dev pack element epics epic-<name>`:  writes `components/epic-<name>/`, adds it to
   `components/index.ts`, and rebuilds `pack/`
2. Fill in its vocabulary (description, `topics`, `aka`, attributes, parts, skeleton), its class and sheet
3. `yarn pack:build`, then `yarn review`;  commit `pack/` with the change

## Deferred

- Docs pages for the elements (Spell UI's site data reads only Spell UI's own families)
