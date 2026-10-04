/**
 * Entry of the brand DOCS pages' bundle, `_assets/ui/brand-docs.js`:  `brand-ui.js` plus Spell UI's docs widgets, for
 * the `<ui-brand-*>` elements' pages (`components/<tag>.html`), written in Spell UI's docs format
 * (`packages/docs/templates/spell-ui-docs.html`).
 * - Built with `brand-ui.js` (`vite.config.ts`, two entries):  they share their chunks, so a page loads ONE of them.
 * - A page loads it as (from `components/`):
 *     <link rel="stylesheet" href="../_assets/ui/brand-ui.css">
 *     <link rel="stylesheet" href="../_assets/brand-docs.css">
 *     <script type="module" src="../_assets/ui/brand-docs.js"></script>
 * - In order, each step AFTER the one before (dynamic imports:  a chunked build may move a static import's code, and
 *   with it, when it runs):
 *   1. snapshot every `<ui-docs-example>`'s markup, before anything upgrades (`ExampleSource.snapshot()`, as Spell UI's
 *      site does)
 *   2. `./brand-ui`:  Spell UI, the brand elements, the theme, the site header
 *   3. `UI.load()`:  the runtime, which the docs widgets read their texts from as they first draw
 *   4. the docs widgets:  `<ui-docs-example>` (live example + its code), `<ui-docs-api>` (attributes, slots, parts,
 *      events from the data), `<ui-docs-tokens>` (the family's tokens, editable)
 * - `SiteData.url`:  the brand's own data, `_data/components.json` (`yarn site:data`), from THIS file's URL.
 * - NOT Spell UI's site shell (nav, router, search):  a brand page is one page, with the site header on top.
 */
import { ExampleSource } from "$/ui/docs-components/ui-docs-example/ExampleSource"
import { SiteData } from "$/ui/docs-components/SiteData"

/** This bundle's folder, `.../_assets/ui/`:  a string slice, NOT `new URL(".", import.meta.url)` (Vite would inline it). */
const ASSETS = import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1)

ExampleSource.snapshot(document)
SiteData.url ??= `${ASSETS}../../_data/components.json`

await import("./brand-ui")
const { UI } = await import("$/ui/runtime")
await UI.load()
await Promise.all([
  import("$/ui/docs-components/ui-docs-example"),
  import("$/ui/docs-components/ui-docs-api"),
  import("$/ui/docs-components/ui-docs-tokens")
])
