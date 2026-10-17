# `@spell-app/ui` docs site -- the build

The site bundle every Spell UI docs page loads, and its entry.
- The PAGES are in [the docs folder](../docs/README.md):  Spell UI's component set, served at `/components/ui/`.
  - Since epic `people-and-orgs` P18;  from claude-design P6 until then, the shared `ui/`.
- The page server lays this folder's `_assets/` over every set's pages, at `/components/<set>/_assets/`.
  - `COMPONENT_SETS`, in the [page server](../../server/)

| Path | What |
| --- | --- |
| `_src/` | the bundle's entry (`site.ts`:  what's in it and why), the component sets' entry (`sets.ts`), its router, shell, sections, their shared constants (`site.types.ts`) and layout glue (`site.css`);  config `../vite.site.config.ts` |
| `_assets/` | GENERATED, NOT committed (git-ignored since 2026-10-07:  its hashed chunk names churned every diff):  the bundle (`yarn site:bundle`), which the page server builds when it starts, if stale (`spell dev bundles build --stale`);  `sets/` is the other sets' build;  `icon-packs` is a symlink to `../../src/icons/icon-packs`.  NEVER edit |
| *(the data)* | *`../docs/__data/`:  `yarn site:data`* |
