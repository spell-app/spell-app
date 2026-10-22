/**
 * `<spell-app>`'s texts in Spanish:  what it says while it has nothing to run.
 * - Texts only:  its tag and attributes keep their English names.
 * - Gathered with the editor's Spanish into one chunk, `AppTexts.es.ts`, which only a Spanish page loads.
 */

import type { AppTagTexts } from "spell-app/app/ui/AppTexts"
import type { spellAppVocabulary } from "./SpellApp.en"

export const spellAppEs = {
  lang: "es",
  tag: "spell-app",
  texts: {
    nothingToRun: "Dale a <spell-app> un project o un src que ejecutar.",
    waitingForEditor: "Esperando a que su editor, {editor}, compile…"
  }
} as const satisfies AppTagTexts<typeof spellAppVocabulary>
