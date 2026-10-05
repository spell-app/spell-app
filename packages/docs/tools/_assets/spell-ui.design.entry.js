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
 * - Exports become `window.SpellUI` (`UI`);  the `spell` theme applies as soon as the bundle runs, like every doc page.
 */

import "spell-ui:icons"
import { ThemeSheets } from "@spell-app/ui"

export { UI } from "@spell-app/ui"

void ThemeSheets.apply("spell")
