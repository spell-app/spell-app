/**
 * Entry of the DESIGN bundle:  `components/bundle.js` of a claude.ai Design System (epic `claude-design`, P8), ONE
 * classic script defining `window.SpellUI`.
 * - Built by `node tools/bundle-spell-ui.js --design [--out <dir>]`;  edit THIS, never the bundle.
 * - The docs entry (`spell-ui.entry.js`) minus what only docs pages need:
 *   - no page runtime (`spell-doc-runtime.js`), no site header (`$/server/site`), no saver (`spell-ui-sources.js`)
 *   - no `spell-ui:lazy` / `spell-ui:emoji`:  Claude Design refuses a relative `<script src>` (caveat C6), so the
 *     design build INLINES the code and markdown engines and spell's highlighter (their `import()`s stay in the
 *     bundle, as code), and emoji names simply never load (their chunks are empty stand-ins, `<ui-emoji name>`
 *     draws nothing, nothing throws)
 * - `spell-ui:icons` FIRST, as in the docs entry:  for this target it registers EVERY Font Awesome Free icon (solid,
 *   regular, brands) under the names `fa7-free` / `fa7-brands` give them, then the docs' `ICONS` names on top, so
 *   widgets' own names (`close`, `search` ...) work as in the docs.
 * - Then the brand's elements (P11, `@spell-app/brand/design`:  `packages/brand/src/brand-design.ts`, built by the
 *   brand):  its `accent` hue first, then every `<ui-brand-*>`.  BEFORE Spell UI's families, so `color="accent"` is a
 *   hue when they define (issue I17).
 * - Exports become `window.SpellUI` (`UI`);  the `spell-brand` theme applies as soon as the bundle runs, as on every
 *   doc page:  the design system IS the brand (P11;  `tokens.json` is that theme's).
 */

import "spell-ui:icons"
import "@spell-app/brand/design"
import { ThemeSheets } from "@spell-app/ui"

export { UI } from "@spell-app/ui"

void ThemeSheets.apply("spell-brand")
