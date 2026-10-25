/**
 * `<spell-viewer>`'s texts in Spanish:  what it says while it has nothing to run.
 * - Texts only:  its tag and attributes keep their English names.
 * - Gathered with the editor's Spanish into one chunk, `AppTexts.es.ts`, which only a Spanish page loads.
 */

import type { AppTagTexts } from "spell-app/app/ui/AppTexts"
import type { spellViewerVocabulary } from "./SpellViewer.en"

export const spellViewerEs = {
  lang: "es",
  tag: "spell-viewer",
  texts: {
    nothingToRun: "Dale a <spell-viewer> un project o un src que ejecutar.",
    waitingForEditor: "Esperando a que su editor, {editor}, compile…"
  }
} as const satisfies AppTagTexts<typeof spellViewerVocabulary>
