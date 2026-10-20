/**
 * The `spell-markdown` family:  defines `<spell-markdown>` and exports its component, `SpellMarkdown`.
 * - SIDE EFFECTS:  importing it defines the tag (nothing, if something already has), and with it:
 *   - `<ui-markdown>`, which it extends
 *   - the families spell's engine draws with (`ui-checkbox` tasks, `ui-divider`, `ui-list`, the parts' `ui-header`,
 *     `ui-segment`, `ui-table`)
 *   - `<spell-code>`, so its spell blocks are coloured (which registers spell with the page's `UI.code`)
 * - Also the entry of `spell-markdown.js` (`yarn build:element`, `vite.code.config.ts`),
 *   which a page loads by itself, or through the component pack, `spell.pack.js`:
 *
 *       <script type="module" src="/element/spell-markdown.js"></script>
 *       <spell-markdown editable source="README.md"></spell-markdown>
 *
 * - On a page with Spell UI of its own (a docs page), it extends the page's `UIMarkdown`, and draws with the page's
 *   families:  one Solid and one Spell UI (`spell-solid-shared.js`, `spell-ui-shared.js`).
 *   Such a page MUST share the markdown family (`SpellUI.packModules`), or this script stops with an error saying so.
 * - Spell's engine is NOT in this chunk:  `MDEngine` loads on the first render.
 */

import { SpellMarkdown } from "./SpellMarkdown"

import "$/app/components/spell-code"
import "$/ui/components/ui-checkbox"
import "$/ui/components/ui-divider"
import "$/ui/components/ui-list"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-table"

SpellMarkdown.define()

export { SpellMarkdown }
