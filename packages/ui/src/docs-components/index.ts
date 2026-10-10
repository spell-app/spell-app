/**
 * Barrel for `$/ui/docs-components` -- the DOC-ONLY elements:
 * `<ui-docs-*>` widgets the Spell UI docs site (its pages:  the shared `ui/*.html`) is built from,
 * on top of the real components.
 * - What they are:  element families written EXACTLY like a component family,
 *   but for documenting the library, not for apps.
 *   Same files in `ui-docs-<name>/`:  a component class, a vocabulary with `topics` + `aka`, css, tests,
 *   `examples/elements/*.html` (`packages/ui/AGENTS.md` "Solid authoring").
 *   - `<ui-docs-example>` -- a live example plus its source (Fomantic's `.example`)
 *   - `<ui-docs-api>`, `<ui-docs-tokens>`, `<ui-docs-nav>`, `<ui-docs-themes>` --
 *     a tag's API / token tables, the sidebar, the theme picker:
 *     built from the site's generated data, `site/_data/components.json`
 *     (`SiteData`;  its shape is `docs-components.types.ts`)
 *   - `<ui-docs-search>` -- the site search (in the nav's header band):
 *     the page shown's sections, components, attributes and every page's sections
 *     (`_data/search.json`, its own `SearchData`)
 *   - `<ui-docs-inspector for>` -- a live view of another element's attributes, properties and `:state()`s
 *     (the custom elements guide, `guides/custom-elements/`, loads it in its own script)
 * - NOT components:  `ComponentDefinitions.all`, the component list and the lib build's entries leave them out
 *   (`ComponentDefinitions.docs` lists them);  every vocabulary's topics include `documentation`.
 * - `<ui-root>` KNOWS them:
 *   - `yarn gen:root` puts their tags in its catalog
 *   - `RootLoader` imports a family from here on first use, like any component's,
 *     once the page's bundle has called `DocsFamilies.add()` (the docs site's does)
 *   - never in the library's own `<ui-root>` (`DocsFamilies` says why)
 * - Adding one:  make `ui-docs-<name>/` (copy `ui-docs-example/`), `yarn gen:root`, `yarn site:data`;
 *   add the tags its JSX renders to `DocsJSXTags`,
 *   and import their families in its barrel (a root only loads the light DOM's).
 * - `package.json` `sideEffects` lists every `./src/docs-components/<family>/index.ts`:
 *   without it a bundler drops each barrel's `define()` (the family chunk loads, the tag stays undefined, no error).
 * - Imports:  shared code from `$/ui/core` as any family;
 *   docs-only shared code (`SiteData`) from `$/ui/docs-components/<file>`.
 * - `ThemePreference`:  the viewer's theme + colour scheme, remembered and re-applied per page
 *   (`<ui-docs-themes>` sets it, the site entry restores it).
 * - NOTE:  this barrel defines NOTHING:  types, `SiteData` and `ThemePreference` only.
 *   Import a family (`$/ui/docs-components/ui-docs-example`) to define its tags.
 */

export * from "./docs-components.types"

export * from "./SiteData"
export * from "./ThemePreference"
