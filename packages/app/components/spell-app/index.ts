/**
 * The `spell-app` family:  defines `<spell-app>` and exports its component, `SpellApp`,
 * and its DOM element, `DOMSpellAppElement`.
 * - SIDE EFFECT:  importing it defines the tag (nothing, if something already has).
 * - Also the entry of `spell-app.js` (`yarn build:element`, `vite.element.config.ts`), which a page loads to run
 *   spell, by itself or through the component pack, `spell.pack.js`:
 *
 *       <script type="module" src="/element/spell-app.js"></script>
 *       <spell-app project="@examples/Solitaire" toolbar></spell-app>
 *
 * - NEVER imports `$/core`, even indirectly:
 *   each app loads its own copy, `spell-runtime.js` (`spellRuntime.ts`, `element.build.test.ts`).
 */

import { DOMSpellAppElement, SpellApp } from "./SpellApp"

SpellApp.define()

export { SpellApp, DOMSpellAppElement }
