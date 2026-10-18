/**
 * What every folded panel's vocabulary shares (`EpicPanel`:  `<epic-aside>`, `<epic-code>`).
 * - Data only:  vocabularies import it, so nothing here runs;  it imports only data (`Fold.types.ts`).
 */

import { ACTIONS_PART_SPEC } from "$/epics/components/epic-item/Fold.types"

/** The panel's parts, which every subclass's vocabulary lists. */
export const PANEL_PARTS = [
  { name: "base", description: "The panel." },
  { name: "head", description: "Its title row:  `toggle`, then `actions`." },
  { name: "toggle", description: "Its heading, a `<button>` that folds it:  the chevron, then `heading`." },
  { name: "heading", description: "The heading's words." },
  { name: "body", description: "What it folds;  hidden (`until-found`) while folded." },
  ACTIONS_PART_SPEC
] as const

/** The panel's states. */
export const PANEL_STATES = [
  { name: "open", description: "Unfolded:  the reader opened it, or it started so." }
] as const
