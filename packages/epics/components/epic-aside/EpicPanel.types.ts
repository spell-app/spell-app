/**
 * What every folded panel's vocabulary shares (`EpicPanel`:  `<epic-aside>`, `<epic-code>`).
 * - Data only:  vocabularies import it, so nothing here runs, and nothing is imported.
 */

/** The panel's parts, which every subclass's vocabulary lists. */
export const PANEL_PARTS = [
  { name: "base", description: "The panel." },
  { name: "toggle", description: "Its heading, a `<button>` that folds it:  the chevron, then `heading`." },
  { name: "heading", description: "The heading's words." },
  { name: "body", description: "What it folds;  hidden (`until-found`) while folded." }
] as const

/** The panel's states. */
export const PANEL_STATES = [
  { name: "open", description: "Unfolded:  the reader opened it, or it started so." }
] as const
