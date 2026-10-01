/**
 * Entry of `spell-app.js`, in the `<spell-app>` bundle (`yarn build:element`):  what a page loads to run spell.
 *
 *     <script type="module" src="/element/spell-app.js"></script>
 *     <spell-app project="@examples/Solitaire" toolbar></spell-app>
 *
 * - Defines `<spell-app>` -- see `SpellAppElement` -- unless something already has.
 * - NEVER imports `#spell-core`, even indirectly:  each app loads its own copy, `spell-runtime.js` -- see
 *   `spellRuntime.ts`, `element.build.test.ts`.
 */
import { SpellAppElement } from "./SpellAppElement"

if (!customElements.get("spell-app")) customElements.define("spell-app", SpellAppElement)

export { SpellAppElement }
