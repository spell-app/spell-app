/**
 * Entry of the PRE-COMPILED spell highlighter `@spell-app/ui` ships:  `yarn gen:spell` (in `packages/ui`) bundles
 * this file, the parser and the spell rules into `packages/ui/src/languages/spell.<lang>.js`, which `<ui-code
 * language="spell">` loads on first use.
 * - Why a bundle:  `ui` never imports spell's SOURCE (root `AGENTS.md`);  this file is the one, generated, exception.
 * - The default export is a `CodeLanguage` (`$/ui/runtime`):  a `highlight()` returning highlight.js-scoped spans.
 * - NOTE: English only today;  a translation will build its own bundle from its own parser.
 */

import { SP } from "$/spell"

export default {
  highlight: (code: string) => SP.SpellHighlighter.spans(code)
}
