/**
 * `<spell-editor>`'s texts in Spanish:  what its status line says when there's nothing to edit or run.
 * - Texts only:  its tag and attributes keep their English names.
 * - Gathered with the editor's Spanish into one chunk, `AppTexts.es.ts`, which only a Spanish page loads.
 */

import type { AppTagTexts } from "spell-app/app/ui/AppTexts"
import type { spellEditorVocabulary } from "./SpellEditor.en"

export const spellEditorEs = {
  lang: "es",
  tag: "spell-editor",
  texts: {
    noProject: "Dale a <spell-editor> un project que editar.",
    nothingCompiled: "No se compiló nada"
  }
} as const satisfies AppTagTexts<typeof spellEditorVocabulary>
