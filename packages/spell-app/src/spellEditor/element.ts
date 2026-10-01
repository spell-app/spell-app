/**
 * Entry of `spell-editor.js`, in the `<spell-editor>` bundle (`yarn build:element`):  what a page loads to edit spell.
 *
 *     <script type="module" src="/element/spell-editor.js"></script>
 *     <spell-editor project="@examples/Solitaire" app="#game"></spell-editor>
 *
 * - Defines `<spell-editor>` -- see `SpellEditorElement` -- unless something already has.
 * - Holds the parser, to compile in the page.  Monaco is a chunk of its own, loaded once there's a project to show.
 * - NEVER imports `#spell-core`, even indirectly:  apps run on their own copy -- see `spellRuntime.ts`.
 */
import { SpellEditorElement } from "./SpellEditorElement"

if (!customElements.get("spell-editor")) customElements.define("spell-editor", SpellEditorElement)

export { SpellEditorElement }
