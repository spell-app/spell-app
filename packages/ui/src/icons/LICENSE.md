# Icon attribution

The SVG files under `src/icons/icon-packs/fa7-free/` and `src/icons/icon-packs/fa7-brands/` (shipped as `dist/icon-packs/`) are
[Font Awesome 7 Free](https://fontawesome.com) 7.3.1, by Fonticons, Inc., copied unchanged from its npm package
(`@fortawesome/fontawesome-free`).  Each file keeps Font Awesome's own licence comment.  The names, aliases and
search terms in the pack indexes and `src/icons/data/search.json` come from the same package's metadata.

- Icons: [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/)
- Fonts: [SIL OFL 1.1 License](https://scripts.sil.org/OFL) -- not applicable here:  `@spell-app/ui` ships SVG files,
  not font files, so no font is redistributed.
- Code: [MIT License](https://opensource.org/license/mit/) -- covers Font Awesome's own metadata format and
  tooling, which `scripts/gen-icons.ts` reads but doesn't redistribute (the package is downloaded at generation
  time into a temp cache, never committed).

Font Awesome's upstream attribution (required by CC BY 4.0), also in every SVG:

> Font Awesome Free by @fontawesome — https://fontawesome.com
> License — https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)

## Fomantic names

The names in `src/icons/icon-packs/fomantic/pack.js` are derived from
[Fomantic-UI](https://github.com/fomantic/Fomantic-UI)'s icon class-name vocabulary
(`src/themes/default/elements/icon.variables`), MIT licensed:

> Copyright (c) Fomantic-UI (https://github.com/fomantic/Fomantic-UI)

Only the NAME MAPPING (Fomantic class name -> Font Awesome 7 icon) is derived from that file -- no Fomantic code,
CSS or font is copied into this package.  See `docs/icons.md` for how the mapping is built.

## Full attribution requirement

Anything in this package that renders one of these icons satisfies Font Awesome's CC BY 4.0 attribution requirement
via this file, the licence comment in each SVG, and `docs/icons.md`.  No per-icon attribution is needed in consuming
apps -- Font Awesome's own FAQ treats a single project-level notice as sufficient.

Other packs a page adds (`<ui-root icons>`, `UI.icons.use()`) carry their own licences;  a pack index has a `license` field for it.
