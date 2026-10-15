# `$/brand` -- Spell's brand, and its `<brand-*>` elements

Spell's brand in code:
- the colour math the Brand tab's pages use
- the bundle their Spell UI copies load
- the `<brand-*>` elements those copies are built from
- The elements are a COMPONENT PACK:  a page loads them on demand through `<ui-root>`, as it loads the epics pack's.
- Their docs pages, Brand UI, live here too (`docs/`), served at `/components/brand/`.
- The Brand tab's pages themselves are SHARED, in the repo root's `brand/`:  see [AGENTS.md](AGENTS.md).

```html
<ui-root>
  <ui-components source="/packages/brand/components/__pack/brand.pack.js"></ui-components>
  <brand-logo variant="lockup"></brand-logo>
</ui-root>
```

The page must load Spell UI's [docs bundle](../epics/tools/_assets/spell-ui.js), or a set's site bundle, first:
- the pack registers there (`SpellUI.registerPack()`)
- and takes Solid and Spell UI's shared code from it (`SpellUI.packModules`)

## The DRY rule (one of each)

If you find yourself writing a second copy of any of these, stop and reuse.

- the pack's build, catalog and staleness check:  the CLI's, `spell dev pack` ([packBuild.ts](../cli/src/dev/packBuild.ts))
- reading a vocabulary's tag and skeleton:  Spell UI's [`RootCatalog`](../ui/tools/RootCatalog.ts)
- the docs data, in [site-data.ts](scripts/site-data.ts):  Spell UI's builders
  - `SiteDataBuilder`, `SiteSearchBuilder`, `ElementManifests`
- the element authoring API:  `$/spell-solid`, and Spell UI's `$/ui/core`
- the brand's colour math:  [`Palette`](src/Palette.ts)

## Files

| Path | What |
| --- | --- |
| `components/<tag>/` | one element family:  component, vocabulary, sheet, barrel |
| `components/index.ts` | `$/brand/components`:  every family barrel (defines every tag:  SIDE EFFECT) |
| `components/__pack/` | GENERATED, committed:  `brand.catalog.ts`, `brand.entry.ts`, `brand.pack.js` |
| `docs/` | Brand UI:  `index.html` and one page per family, `<tag>.html` |
| `docs/__parts/` | every docs page's frame:  `layout.html` (loads the pack), `footer.html` |
| `docs/__data/` | `pages.json` (hand-kept);  `components.json`, `search.json`, the editor manifests (generated) |
| `src/index.ts` | `$/brand`:  `Palette`, the brand's types |
| `src/brand-ui.ts` | the Brand tab copies' bundle entry, `_assets/ui/brand-ui.js` (git-ignored) |
| `src/brand-design.ts` | the elements for the claude.ai design bundle |
| `src/hues.ts` | the brand's `accent` hue |
| `_assets/` | the Brand tab's own script and sheet (`brand-pages.*`);  `ui/`, the built bundle |
| `scripts/` | `build.ts`, `compare.ts`, `site-data.ts`, `rename-shared.ts` |
| `vitest.config.ts` | `node` (`src/`) and `browser` (`components/`) projects |
| `_data/` | *(none -- `docs/__data/`, since epic `people-and-orgs` P18)* |

## Adding a new element

1. `spell dev pack element brand brand-<name>`:
   - writes the family's folder, `components/brand-<name>/`, and its test
   - adds it to [the barrel](components/index.ts)
   - rebuilds `components/__pack/`
2. Fill in its vocabulary (description, `topics`, `aka`, attributes, parts, skeleton), its class and sheet
3. Copy a page in `docs/` to `brand-<name>.html`.
   File the tag in the `groups` of [the hand-kept facts](docs/__data/pages.json).
4. `yarn pack:build`, then `yarn review`
5. Commit the pack and the docs data (`components/__pack/`, `docs/__data/`) with the change

## Deferred

- The Theming tab's token tables:
  Spell UI's token readers find only `--ui-*` tokens, and the brand's are `--brand-*`.
- Generic elements (the field, the colour chips) move into Spell UI later (epic `design-system`, D2).
