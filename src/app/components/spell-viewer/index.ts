/**
 * The `spell-viewer` family:  defines `<spell-viewer>` and exports its component, `SpellViewer`,
 * and its DOM element, `DOMSpellViewerElement`.
 * - SIDE EFFECT:  importing it defines the tag (nothing, if something already has).
 * - Also the entry of `spell-viewer.js` (`yarn build:element`, `vite.element.config.ts`),
 *   which a page loads to run spell, with nothing around it (`<spell-viewer>` is a root),
 *   or through the component pack, `spell.pack.js`:
 *
 *       <script type="module" src="/element/spell-viewer.js"></script>
 *       <spell-viewer project="@spell/examples/Solitaire" toolbar></spell-viewer>
 *
 * - On a page with Spell UI of its own (a docs page), it uses the page's Solid and Spell UI (`spell-solid-shared.js`).
 *
 * - NEVER imports `spell-parser/core`, even indirectly:
 *   each app loads its own copy, `spell-runtime.js` (`spellRuntime.ts`, `element.build.test.ts`).
 */

import { DOMSpellViewerElement, SpellViewer } from "./SpellViewer"

SpellViewer.define()

export { SpellViewer, DOMSpellViewerElement }
