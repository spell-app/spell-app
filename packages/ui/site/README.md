# `@spell-app/ui` docs site -- the built half

The site's PAGES left this folder on 2026-10-05 (epic `claude-design` P6):  they're shared content now, `ui/` at the
checkout's root (a link into `../spell-app-dev/ui/`), where their README says how the site works and how pages are
made.  What stays here is what each branch builds from its own code, and commits:

| Path | What |
| --- | --- |
| `_src/` | the site bundle's entry (`site.ts`:  what's in it and why), its router, shell, sections and layout glue (`site.css`);  config `../vite.site.config.ts` |
| `_assets/` | GENERATED, committed:  the bundle (`yarn site:bundle`);  `icon-packs` is a symlink to `../../src/icons/icon-packs`.  NEVER edit |
| `_data/` | GENERATED, committed (`yarn site:data`):  `components.json`, `icons.json`, `custom-elements.json`, `html-custom-data.json`;  and `pages.json`, the hand-kept per-family facts they're built from |
| *(the pages, `_parts/`, `examples/`, `images/`)* | *the shared `ui/`* |
| *(`_data/search.json`)* | *the shared `ui/_data/search.json`:  built from the shared pages, so it lives beside them* |

The page server serves both halves at `/ui/`:  the shared pages, with `_assets/` and `_data/` laid over them from
here (`packages/server`, `UI_SITE`).
