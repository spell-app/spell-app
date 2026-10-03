/**
 * Entry of `spell-editor.js`, in the `<spell-editor>` bundle (`yarn build:element`):  what a page loads to edit spell.
 *
 *     <script type="module" src="/element/spell-editor.js"></script>
 *     <spell-editor project="@examples/Solitaire" app="#game"></spell-editor>
 *
 * - Defines `<spell-editor>` -- see `SpellEditorElement` -- unless something already has.
 * - Holds the parser, to compile in the page.  Monaco is a chunk of its own, loaded once there's a project to show.
 * - NEVER imports `$/core`, even indirectly:  apps run on their own copy -- see `spellRuntime.ts`.
 */
import { defineSpellEditor, type SpellEditorElementClass } from "./SpellEditorElement"

/** The `<spell-editor>` class:  ours, or whoever defined it first. */
export const SpellEditorElement =
  (customElements.get("spell-editor") as SpellEditorElementClass | undefined) ?? defineSpellEditor()
