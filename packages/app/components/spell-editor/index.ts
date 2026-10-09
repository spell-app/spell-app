/**
 * The `spell-editor` family:  defines `<spell-editor>` and exports its component, `SpellEditor`, and its DOM
 * element, `DOMSpellEditorElement`.
 * - SIDE EFFECT:  importing it defines the tag (nothing, if something already has).
 * - Also the entry of `spell-editor.js` (`yarn build:element`, `vite.editor.config.ts`), which a page loads to edit
 *   spell, by itself or through the component pack, `spell.pack.js`:
 *
 *       <script type="module" src="/element/spell-editor.js"></script>
 *       <spell-editor project="@examples/Solitaire" app="#game"></spell-editor>
 *
 * - Holds the parser, to compile in the page.  Monaco is a chunk of its own, loaded once there's a project to show.
 * - NEVER imports `$/core`, even indirectly:  apps run on their own copy (`spellRuntime.ts`).
 */

import { DOMSpellEditorElement, SpellEditor } from "./SpellEditor"

SpellEditor.define()

export { SpellEditor, DOMSpellEditorElement }
